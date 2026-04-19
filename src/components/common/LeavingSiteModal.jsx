import { useState, useCallback } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import useAuditLog from '../../hooks/useAuditLog.js';
import useGlassbox from '../../hooks/useGlassbox.js';
import getCareContent from '../../data/getCareContent.json';

/**
 * LeavingSiteModal - External link leaving-site disclaimer modal
 * Implements the external link disclaimer pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169, SCRUM-7166
 *
 * Shows a warning that the user is leaving the Horizon Member Portal, displays
 * the destination URL, and provides Continue and Cancel buttons. Uses the Modal
 * component for consistent styling and accessibility. Logs external link clicks
 * via useAuditLog and useGlassbox hooks for compliance and analytics.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Callback when the modal is closed (Cancel)
 * @param {string} props.url - The external destination URL
 * @param {string} [props.linkLabel] - Optional label describing the link
 * @param {string} [props.title] - Custom modal title (defaults to getCareContent disclaimer title)
 * @param {string} [props.message] - Custom disclaimer message (defaults to getCareContent disclaimer message)
 * @param {string} [props.confirmButtonLabel] - Custom confirm button label
 * @param {string} [props.cancelButtonLabel] - Custom cancel button label
 * @returns {JSX.Element|null}
 */
const LeavingSiteModal = ({
  isOpen,
  onClose,
  url,
  linkLabel,
  title,
  message,
  confirmButtonLabel,
  cancelButtonLabel,
}) => {
  const { logExternalLink } = useAuditLog();
  const { tagAction, isEnabled: isGlassboxEnabled, TAG_EVENTS } = useGlassbox();

  const [isNavigating, setIsNavigating] = useState(false);

  // Use getCareContent disclaimer defaults if not provided
  const disclaimer = getCareContent.leavingSiteDisclaimer || {};
  const modalTitle = title || disclaimer.title || 'You are leaving the Horizon Member Portal';
  const modalMessage = message || disclaimer.message || 'You are now leaving the Horizon Blue Cross Blue Shield of New Jersey website. The website you are about to visit is operated by a third party. Horizon BCBSNJ does not control or guarantee the accuracy, relevance, or completeness of information on third-party websites.';
  const confirmLabel = confirmButtonLabel || disclaimer.confirmButtonLabel || 'Continue';
  const cancelLabel = cancelButtonLabel || disclaimer.cancelButtonLabel || 'Stay on this site';

  /**
   * Handle the Continue button click.
   * Logs the external link click for audit and Glassbox, then opens the URL.
   */
  const handleContinue = useCallback(() => {
    if (isNavigating || !url) {
      return;
    }

    setIsNavigating(true);

    // Log external link click for audit compliance
    logExternalLink(url, {
      route: window.location.pathname,
      linkLabel: linkLabel || url,
    });

    // Tag Glassbox event if enabled
    if (isGlassboxEnabled) {
      tagAction('external_link_click', {
        resourceId: url,
        route: window.location.pathname,
        linkLabel: linkLabel || url,
      });
    }

    // Open the external URL in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');

    setIsNavigating(false);

    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  }, [isNavigating, url, logExternalLink, linkLabel, isGlassboxEnabled, tagAction, onClose]);

  /**
   * Handle the Cancel button click.
   * Closes the modal without navigating.
   */
  const handleCancel = useCallback(() => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  /**
   * Truncate a URL for display purposes.
   *
   * @param {string} displayUrl - The URL to truncate
   * @param {number} [maxLength=80] - Maximum display length
   * @returns {string} The truncated URL
   */
  const getTruncatedUrl = useCallback((displayUrl, maxLength = 80) => {
    if (!displayUrl || typeof displayUrl !== 'string') {
      return '';
    }

    if (displayUrl.length <= maxLength) {
      return displayUrl;
    }

    return displayUrl.substring(0, maxLength).trimEnd() + '...';
  }, []);

  const footerContent = (
    <>
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={isNavigating}
      >
        {cancelLabel}
      </Button>
      <Button
        variant="primary"
        onClick={handleContinue}
        loading={isNavigating}
        loadingText="Redirecting..."
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={modalTitle}
      size="md"
      centered={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      showCloseButton={true}
      footer={footerContent}
      ariaLabel="Leaving site disclaimer"
    >
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

        {/* Disclaimer Message */}
        <p className="hb-text-body text-horizon-gray-700 mb-4">
          {modalMessage}
        </p>

        {/* Destination URL Display */}
        {url && (
          <div className="bg-horizon-gray-50 rounded-lg border border-horizon-gray-200 px-4 py-3 mb-2">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">
              You will be redirected to:
            </p>
            <p
              className="text-sm font-medium text-horizon-blue break-all mb-0"
              title={url}
            >
              {getTruncatedUrl(url)}
            </p>
            {linkLabel && (
              <p className="hb-text-caption text-horizon-gray-400 mt-1 mb-0">
                {linkLabel}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LeavingSiteModal;