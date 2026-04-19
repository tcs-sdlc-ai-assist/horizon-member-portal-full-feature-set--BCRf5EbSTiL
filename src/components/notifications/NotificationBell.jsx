import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationsContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import Badge from '../common/Badge.jsx';
import { ROUTES } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

/**
 * NotificationBell - Header notification bell icon with unread count badge
 * Implements the notification bell component from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Shows a bell icon with an unread count badge using avatar-badge styling.
 * Clicking opens a dropdown preview of recent notifications or navigates
 * to the full notifications page. Uses NotificationsContext for unread count
 * and recent notifications data. Accessible with ARIA attributes and
 * keyboard navigation.
 *
 * @param {object} props
 * @param {boolean} [props.showDropdown=true] - Whether to show a dropdown preview on click (false navigates directly)
 * @param {number} [props.maxPreview=5] - Maximum number of notifications to show in the dropdown preview
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const NotificationBell = ({ showDropdown = true, maxPreview = 5, className = '' }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
  } = useNotifications();
  const { tagNotification, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  /**
   * Get the most recent notifications for the dropdown preview.
   */
  const previewNotifications = notifications.slice(0, maxPreview);

  /**
   * Handle bell icon click.
   * Opens dropdown if showDropdown is true, otherwise navigates to notifications page.
   */
  const handleBellClick = useCallback(() => {
    if (showDropdown) {
      setIsOpen((prev) => !prev);
    } else {
      navigate(ROUTES.NOTIFICATIONS);
    }
  }, [showDropdown, navigate]);

  /**
   * Handle navigating to the full notifications page.
   */
  const handleViewAll = useCallback(() => {
    setIsOpen(false);

    if (isGlassboxEnabled) {
      tagAction('notification_view_all', {
        route: window.location.pathname,
        action: 'view_all_click',
      });
    }

    navigate(ROUTES.NOTIFICATIONS);
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle clicking on a notification in the dropdown preview.
   *
   * @param {object} notification - The notification object
   */
  const handleNotificationClick = useCallback((notification) => {
    if (!notification || !notification.id) {
      return;
    }

    // Mark as read
    markAsRead(notification.id);

    // Tag Glassbox event if enabled
    if (isGlassboxEnabled) {
      tagNotification(notification.id, {
        route: window.location.pathname,
        action: 'bell_dropdown_click',
        category: notification.category,
        type: notification.type,
      });
    }

    setIsOpen(false);

    // Navigate to related resource if available
    if (notification.relatedId) {
      if (notification.category === 'claim_update' && notification.relatedId.startsWith('CLM-')) {
        navigate(`/claims/${notification.relatedId}`);
        return;
      }

      if (notification.category === 'document_ready' && notification.relatedId.startsWith('DOC-')) {
        navigate(ROUTES.DOCUMENTS);
        return;
      }
    }

    // Default: navigate to notifications page
    navigate(ROUTES.NOTIFICATIONS);
  }, [markAsRead, isGlassboxEnabled, tagNotification, navigate]);

  /**
   * Handle keyboard events on notification items in the dropdown.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} notification - The notification object
   */
  const handleNotificationKeyDown = useCallback((e, notification) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNotificationClick(notification);
    }
  }, [handleNotificationClick]);

  /**
   * Handle keyboard events on the bell button and dropdown.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
      if (bellRef.current) {
        const trigger = bellRef.current.querySelector('button');
        if (trigger) {
          trigger.focus();
        }
      }
    }
  }, [isOpen]);

  /**
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Get the notification type icon SVG based on the notification type.
   *
   * @param {string} type - The notification type
   * @returns {JSX.Element} The icon SVG element
   */
  const getNotificationIcon = useCallback((type) => {
    if (!type || typeof type !== 'string') {
      return (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    }

    const lowerType = type.toLowerCase();

    const icons = {
      info: (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      success: (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      warning: (
        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      error: (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      system: (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.info;
  }, []);

  /**
   * Format a notification timestamp for the dropdown preview.
   *
   * @param {string} timestamp - The ISO timestamp string
   * @returns {string} The formatted relative or absolute time string
   */
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    }

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    return formatDate(timestamp, 'MMM D');
  }, []);

  /**
   * Get the badge variant for a notification type.
   *
   * @param {string} type - The notification type
   * @returns {string} The badge variant
   */
  const getTypeVariant = useCallback((type) => {
    if (!type || typeof type !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error',
      action: 'error',
      system: 'primary',
    };

    return variantMap[type.toLowerCase()] || 'neutral';
  }, []);

  /**
   * Get the display label for a notification type.
   *
   * @param {string} type - The notification type
   * @returns {string} The type label
   */
  const getTypeLabel = useCallback((type) => {
    if (!type || typeof type !== 'string') {
      return '';
    }

    const labelMap = {
      info: 'Info',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      action: 'Action Required',
      system: 'System',
    };

    return labelMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  }, []);

  return (
    <div
      ref={bellRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleBellClick}
        className="relative p-2 rounded-lg text-horizon-gray-500 hover:text-horizon-primary hover:bg-horizon-gray-100 transition-all duration-200"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={showDropdown ? isOpen : undefined}
        aria-haspopup={showDropdown ? 'true' : undefined}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-xxs font-bold text-white bg-red-500 rounded-full"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Preview */}
      {showDropdown && isOpen && (
        <div
          ref={dropdownRef}
          className="hb-dropdown-menu hb-dropdown-menu-right"
          role="menu"
          aria-label="Notification preview"
          style={{ zIndex: 9999, minWidth: '320px', maxWidth: '380px' }}
        >
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-horizon-gray-200">
            <div className="hb-inline-sm">
              <h3 className="text-sm font-bold text-horizon-primary mb-0">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  className="hb-badge hb-badge-primary text-xxs"
                  aria-label={`${unreadCount} unread`}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleViewAll}
              className="text-xs font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer"
              role="menuitem"
            >
              View All
            </button>
          </div>

          {/* Notification Items */}
          {previewNotifications.length > 0 ? (
            <div className="max-h-80 overflow-y-auto hb-scrollbar">
              {previewNotifications.map((notification) => {
                const isUnread = notification.isRead === false;

                return (
                  <div
                    key={notification.id}
                    className={`
                      px-4 py-3 cursor-pointer transition-colors duration-150
                      ${isUnread
                        ? 'bg-horizon-primary/5 hover:bg-horizon-primary/10'
                        : 'hover:bg-horizon-gray-50'
                      }
                    `}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => handleNotificationKeyDown(e, notification)}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className="flex-shrink-0 relative mt-0.5">
                        {getNotificationIcon(notification.type)}
                        {isUnread && (
                          <span
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-horizon-primary rounded-full border border-white"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs mb-0.5 hb-text-clamp-2 ${
                            isUnread
                              ? 'font-bold text-horizon-gray-800'
                              : 'font-medium text-horizon-gray-700'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-horizon-gray-500 mb-1 hb-text-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            label={getTypeLabel(notification.type)}
                            variant={getTypeVariant(notification.type)}
                            size="sm"
                            dot
                          />
                          <span className="hb-text-caption text-horizon-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-horizon-gray-100 mb-2">
                <svg
                  className="w-5 h-5 text-horizon-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-xs text-horizon-gray-500 mb-0">
                No notifications
              </p>
            </div>
          )}

          {/* Dropdown Footer */}
          {previewNotifications.length > 0 && (
            <div className="border-t border-horizon-gray-200">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full px-4 py-2.5 text-xs font-medium text-horizon-blue hover:text-horizon-primary hover:bg-horizon-gray-50 transition-colors duration-200 cursor-pointer text-center"
                role="menuitem"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;