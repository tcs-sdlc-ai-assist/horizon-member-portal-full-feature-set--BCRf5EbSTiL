import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import useGlassbox from '../../hooks/useGlassbox.js';
import { ROUTES } from '../../utils/constants.js';

/**
 * SessionTimeoutModal - Session timeout warning modal component
 * Implements the session timeout warning UI from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164
 *
 * Displayed when session timeout warning triggers. Shows countdown timer,
 * 'Stay Logged In' button (extends session/resets timer), and 'Log Out' button.
 * Uses HB modal classes (hb-modal-overlay, hb-modal, hb-modal-header, etc.).
 * Accessible with focus trap, ARIA attributes, and keyboard navigation.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {number} props.timeRemaining - Time remaining in milliseconds
 * @param {function} [props.onExtendSession] - Callback to extend the session
 * @param {function} [props.onLogout] - Callback to log out the user
 * @param {function} [props.onClose] - Callback when modal is closed (same as extend)
 * @returns {JSX.Element|null}
 */
const SessionTimeoutModal = ({ isOpen, timeRemaining, onExtendSession, onLogout, onClose }) => {
  const { extendSession, logout } = useAuth();
  const { tagExtended, tagUserLogout, isEnabled: isGlassboxEnabled } = useGlassbox();
  const navigate = useNavigate();

  const [isExtending, setIsExtending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const modalRef = useRef(null);
  const stayLoggedInRef = useRef(null);
  const previousFocusRef = useRef(null);

  /**
   * Format milliseconds into MM:SS display string.
   *
   * @param {number} ms - Time in milliseconds
   * @returns {string} Formatted time string (e.g., "1:45")
   */
  const formatTimeRemaining = useCallback((ms) => {
    if (!ms || ms <= 0) {
      return '0:00';
    }

    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, []);

  /**
   * Handle extending the session (Stay Logged In).
   */
  const handleExtendSession = useCallback(async () => {
    if (isExtending || isLoggingOut) {
      return;
    }

    setIsExtending(true);

    try {
      const result = extendSession();

      if (result && result.status === 'success') {
        if (isGlassboxEnabled) {
          tagExtended({ route: window.location.pathname });
        }
      }

      if (onExtendSession) {
        onExtendSession();
      }

      if (onClose) {
        onClose();
      }
    } catch (_error) {
      // Silently handle - session may have already expired
    } finally {
      setIsExtending(false);
    }
  }, [isExtending, isLoggingOut, extendSession, isGlassboxEnabled, tagExtended, onExtendSession, onClose]);

  /**
   * Handle logging out the user.
   */
  const handleLogout = useCallback(() => {
    if (isLoggingOut || isExtending) {
      return;
    }

    setIsLoggingOut(true);

    try {
      if (isGlassboxEnabled) {
        tagUserLogout({ route: window.location.pathname });
      }

      if (onLogout) {
        onLogout();
      }

      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (_error) {
      // Navigate to login regardless
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, isExtending, isGlassboxEnabled, tagUserLogout, onLogout, logout, navigate]);

  /**
   * Store the previously focused element and focus the Stay Logged In button
   * when the modal opens. Restore focus when it closes.
   */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      // Focus the Stay Logged In button after a short delay for animation
      const timer = setTimeout(() => {
        if (stayLoggedInRef.current) {
          stayLoggedInRef.current.focus();
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
  }, [isOpen]);

  /**
   * Handle keyboard events for focus trap and accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      return;
    }

    // Close on Escape (extend session)
    if (e.key === 'Escape') {
      e.preventDefault();
      handleExtendSession();
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
  }, [isOpen, handleExtendSession]);

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

  const formattedTime = formatTimeRemaining(timeRemaining);
  const isExpired = !timeRemaining || timeRemaining <= 0;

  return (
    <div
      className="hb-modal-overlay"
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="hb-modal hb-modal-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        aria-describedby="session-timeout-description"
      >
        {/* Modal Header */}
        <div className="hb-modal-header">
          <h2 id="session-timeout-title" className="hb-modal-title">
            Session Timeout Warning
          </h2>
        </div>

        {/* Modal Body */}
        <div className="hb-modal-body">
          <div className="text-center">
            {/* Warning Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 mb-4">
              <svg
                className="w-7 h-7 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Description */}
            <p
              id="session-timeout-description"
              className="hb-text-body text-horizon-gray-700 mb-4"
            >
              {isExpired
                ? 'Your session has expired due to inactivity. Please log in again to continue.'
                : 'Your session is about to expire due to inactivity. Would you like to stay logged in?'
              }
            </p>

            {/* Countdown Timer */}
            {!isExpired && (
              <div
                className="mb-4"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="hb-text-caption text-horizon-gray-500 mb-1">
                  Time remaining
                </p>
                <p
                  className="text-3xl font-bold text-horizon-primary"
                  aria-label={`${formattedTime} remaining before session expires`}
                >
                  {formattedTime}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="hb-modal-footer">
          {isExpired ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hb-btn-primary hb-btn-block"
              aria-busy={isLoggingOut ? 'true' : 'false'}
            >
              {isLoggingOut ? (
                <span className="hb-inline-sm">
                  <span className="hb-spinner hb-spinner-sm hb-spinner-white" aria-hidden="true" />
                  <span>Logging out...</span>
                </span>
              ) : (
                'Log In Again'
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut || isExtending}
                className="hb-btn-outline"
                aria-busy={isLoggingOut ? 'true' : 'false'}
              >
                {isLoggingOut ? (
                  <span className="hb-inline-sm">
                    <span className="hb-spinner hb-spinner-sm" aria-hidden="true" />
                    <span>Logging out...</span>
                  </span>
                ) : (
                  'Log Out'
                )}
              </button>
              <button
                ref={stayLoggedInRef}
                type="button"
                onClick={handleExtendSession}
                disabled={isExtending || isLoggingOut}
                className="hb-btn-primary"
                aria-busy={isExtending ? 'true' : 'false'}
              >
                {isExtending ? (
                  <span className="hb-inline-sm">
                    <span className="hb-spinner hb-spinner-sm hb-spinner-white" aria-hidden="true" />
                    <span>Extending...</span>
                  </span>
                ) : (
                  'Stay Logged In'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;