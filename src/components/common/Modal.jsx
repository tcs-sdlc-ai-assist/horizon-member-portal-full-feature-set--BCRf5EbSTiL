import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Modal - Reusable accessible modal component
 * Implements the modal dialog pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7164, SCRUM-7170
 *
 * Renders a modal overlay with HB modal classes (hb-modal-overlay, hb-modal,
 * hb-modal-header, hb-modal-body, hb-modal-footer). Supports configurable size,
 * centering, scrollable body, focus trap, escape key handler, backdrop click
 * handler, and full ARIA attributes for accessibility.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Callback when the modal is closed
 * @param {string} [props.title] - Modal title displayed in the header
 * @param {string} [props.size='md'] - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} [props.centered=true] - Whether the modal is vertically centered
 * @param {boolean} [props.scrollable=true] - Whether the modal body is scrollable
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button in the header
 * @param {boolean} [props.closeOnBackdrop=true] - Whether clicking the backdrop closes the modal
 * @param {boolean} [props.closeOnEscape=true] - Whether pressing Escape closes the modal
 * @param {React.ReactNode} [props.footer] - Optional footer content
 * @param {string} [props.ariaLabel] - Custom aria-label for the modal
 * @param {string} [props.ariaDescribedBy] - Custom aria-describedby ID
 * @param {string} [props.className] - Additional CSS classes for the modal container
 * @param {React.ReactNode} props.children - Modal body content
 * @returns {JSX.Element|null}
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  centered = true,
  scrollable = true,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  children,
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const closeButtonRef = useRef(null);

  /**
   * Get the size class for the modal based on the size prop.
   *
   * @returns {string} The HB modal size class
   */
  const getSizeClass = useCallback(() => {
    const sizeMap = {
      sm: 'hb-modal-sm',
      md: 'hb-modal-md',
      lg: 'hb-modal-lg',
      xl: 'hb-modal-xl',
      full: 'hb-modal-full',
    };

    return sizeMap[size] || 'hb-modal-md';
  }, [size]);

  /**
   * Handle closing the modal.
   * Calls the onClose callback if provided.
   */
  const handleClose = useCallback(() => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  /**
   * Handle backdrop click to close the modal.
   *
   * @param {React.MouseEvent} e - The click event
   */
  const handleBackdropClick = useCallback((e) => {
    if (!closeOnBackdrop) {
      return;
    }

    // Only close if the click target is the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [closeOnBackdrop, handleClose]);

  /**
   * Handle keyboard events for focus trap and accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      return;
    }

    // Close on Escape
    if (e.key === 'Escape' && closeOnEscape) {
      e.preventDefault();
      handleClose();
      return;
    }

    // Focus trap: Tab and Shift+Tab
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen, closeOnEscape, handleClose]);

  /**
   * Store the previously focused element and focus the modal
   * when it opens. Restore focus when it closes.
   */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      // Focus the close button or the first focusable element after a short delay for animation
      const timer = setTimeout(() => {
        if (closeButtonRef.current && showCloseButton) {
          closeButtonRef.current.focus();
        } else if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Restore focus to previously focused element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen, showCloseButton]);

  /**
   * Prevent body scroll when modal is open.
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const modalTitleId = title ? 'modal-title-' + (title.replace(/\s+/g, '-').toLowerCase()) : undefined;
  const modalBodyId = ariaDescribedBy || (title ? 'modal-body-' + (title.replace(/\s+/g, '-').toLowerCase()) : undefined);

  return (
    <div
      className={`hb-modal-overlay ${centered ? '' : 'items-start pt-16'}`}
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className={`hb-modal ${getSizeClass()} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? modalTitleId : undefined}
        aria-label={!title ? (ariaLabel || 'Modal dialog') : ariaLabel}
        aria-describedby={modalBodyId}
        tabIndex={-1}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="hb-modal-header">
            {title && (
              <h2 id={modalTitleId} className="hb-modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="hb-modal-close"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div
          id={modalBodyId}
          className={`hb-modal-body ${scrollable ? 'overflow-y-auto hb-scrollbar' : ''}`}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="hb-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;