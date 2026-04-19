import { useState, useCallback } from 'react';

/**
 * Alert - Reusable alert/notification banner component
 * Implements the alert pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders an alert banner using HB alert classes (hb-alert, hb-alert-info,
 * hb-alert-success, hb-alert-warning, hb-alert-error, hb-alert-neutral).
 * Supports configurable type, message, title, icon, and dismissible variant
 * with close button. Accessible with ARIA role="alert" and aria-live.
 *
 * @param {object} props
 * @param {string} [props.type='info'] - Alert type: 'info', 'success', 'warning', 'error', 'neutral', 'promotional', 'system', 'critical', 'standard'
 * @param {string} [props.title] - Optional bold title displayed above the message
 * @param {string|React.ReactNode} props.message - The alert message content
 * @param {boolean} [props.dismissible=false] - Whether the alert can be dismissed
 * @param {function} [props.onDismiss] - Callback when the alert is dismissed
 * @param {React.ReactNode} [props.icon] - Custom icon element to display; if not provided, a default icon is rendered based on type
 * @param {boolean} [props.showIcon=true] - Whether to show the icon
 * @param {string} [props.className=''] - Additional CSS classes for the alert container
 * @param {React.ReactNode} [props.children] - Optional children rendered after the message
 * @param {string} [props.ariaLive='polite'] - aria-live attribute value ('polite', 'assertive', 'off')
 * @returns {JSX.Element|null}
 */
const Alert = ({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  icon,
  showIcon = true,
  className = '',
  children,
  ariaLive = 'polite',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  /**
   * Map alert type prop to the corresponding HB alert CSS class.
   *
   * @param {string} alertType - The alert type
   * @returns {string} The HB alert CSS class
   */
  const getAlertClass = useCallback((alertType) => {
    const typeMap = {
      info: 'hb-alert-info',
      success: 'hb-alert-success',
      warning: 'hb-alert-warning',
      error: 'hb-alert-error',
      neutral: 'hb-alert-neutral',
      promotional: 'hb-alert-info',
      system: 'hb-alert-info',
      critical: 'hb-alert-error',
      standard: 'hb-alert-neutral',
    };

    return typeMap[alertType] || 'hb-alert-info';
  }, []);

  /**
   * Get the default icon SVG based on the alert type.
   *
   * @param {string} alertType - The alert type
   * @returns {JSX.Element} The default icon SVG element
   */
  const getDefaultIcon = useCallback((alertType) => {
    const icons = {
      info: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      success: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      neutral: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    // Map compound types to base icon types
    const iconTypeMap = {
      promotional: 'info',
      system: 'info',
      critical: 'error',
      standard: 'neutral',
    };

    const resolvedType = iconTypeMap[alertType] || alertType;

    return icons[resolvedType] || icons.info;
  }, []);

  /**
   * Handle dismissing the alert.
   */
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);

    if (onDismiss && typeof onDismiss === 'function') {
      onDismiss();
    }
  }, [onDismiss]);

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  // Determine the appropriate aria-live value based on type
  const resolvedAriaLive = type === 'error' || type === 'critical' ? 'assertive' : ariaLive;

  return (
    <div
      className={`${getAlertClass(type)} ${className}`}
      role="alert"
      aria-live={resolvedAriaLive}
    >
      {/* Icon */}
      {showIcon && (
        <div className="hb-alert-icon" aria-hidden="true">
          {icon || getDefaultIcon(type)}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="hb-alert-title">{title}</p>
        )}
        {message && (
          <p className="text-sm font-medium mb-0">{message}</p>
        )}
        {children}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="hb-alert-dismiss"
          aria-label="Dismiss alert"
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
  );
};

export default Alert;