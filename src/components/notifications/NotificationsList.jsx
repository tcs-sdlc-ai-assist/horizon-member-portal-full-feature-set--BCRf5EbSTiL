import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationsContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatDate } from '../../utils/formatters.js';
import { ROUTES } from '../../utils/constants.js';

/**
 * NotificationsList - Notifications list with read/unread management
 * Implements the notifications list view from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders all notifications with unread/read visual states (bold/normal),
 * type icon, title, message, and timestamp. Includes 'Mark All as Read'
 * button using NotificationsContext. Uses HB list and alert styling.
 * Accessible with proper ARIA live region for updates.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const NotificationsList = ({ className = '' }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();
  const { tagNotification, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  /**
   * Get unique notification categories for filter tabs.
   */
  const categoryOptions = useMemo(() => {
    const categories = new Set();

    notifications.forEach((notification) => {
      if (notification.category) {
        categories.add(notification.category);
      }
    });

    return Array.from(categories).map((category) => ({
      value: category,
      label: getCategoryLabel(category),
    }));
  }, [notifications]);

  /**
   * Filter notifications based on the active filter.
   */
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') {
      return notifications;
    }

    if (activeFilter === 'unread') {
      return notifications.filter((n) => n.isRead === false);
    }

    return notifications.filter((n) => n.category === activeFilter);
  }, [notifications, activeFilter]);

  /**
   * Handle clicking on a notification to mark it as read and navigate.
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
        route: '/notifications',
        action: 'notification_click',
        category: notification.category,
        type: notification.type,
      });
    }

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
  }, [markAsRead, isGlassboxEnabled, tagNotification, navigate]);

  /**
   * Handle keyboard events on notification items for accessibility.
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
   * Handle marking all notifications as read.
   */
  const handleMarkAllAsRead = useCallback(() => {
    if (isMarkingAll || unreadCount === 0) {
      return;
    }

    setIsMarkingAll(true);

    try {
      markAllAsRead();

      if (isGlassboxEnabled) {
        tagAction('mark_all_notifications_read', {
          route: '/notifications',
          action: 'mark_all_read',
          count: unreadCount,
        });
      }
    } finally {
      setIsMarkingAll(false);
    }
  }, [isMarkingAll, unreadCount, markAllAsRead, isGlassboxEnabled, tagAction]);

  /**
   * Handle dismissing a notification.
   *
   * @param {React.MouseEvent} e - The click event
   * @param {object} notification - The notification object
   */
  const handleDismiss = useCallback((e, notification) => {
    e.stopPropagation();

    if (!notification || !notification.id) {
      return;
    }

    dismissNotification(notification.id);

    if (isGlassboxEnabled) {
      tagAction('notification_dismissed', {
        route: '/notifications',
        action: 'dismiss',
        resourceId: notification.id,
        category: notification.category,
      });
    }
  }, [dismissNotification, isGlassboxEnabled, tagAction]);

  /**
   * Handle filter tab change.
   *
   * @param {string} filter - The filter value
   */
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
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
        <svg className="w-5 h-5 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    }

    const lowerType = type.toLowerCase();

    const icons = {
      info: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      success: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      system: (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.info;
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
   * Get the badge variant for a notification category.
   *
   * @param {string} category - The notification category
   * @returns {string} The badge variant
   */
  const getCategoryVariant = useCallback((category) => {
    if (!category || typeof category !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      claim_update: 'primary',
      document_ready: 'info',
      coverage_change: 'warning',
      system: 'neutral',
      prior_auth_update: 'secondary',
    };

    return variantMap[category] || 'neutral';
  }, []);

  /**
   * Format a notification timestamp for display.
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

  return (
    <div className={`${className}`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-horizon-primary/10 flex-shrink-0">
              <svg
                className="w-5 h-5 text-horizon-primary"
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
            <div>
              <h1 className="text-2xl font-bold text-horizon-primary mb-0">
                Notifications
              </h1>
              <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`
                  : 'You\'re all caught up!'}
              </p>
            </div>
          </div>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              loading={isMarkingAll}
              loadingText="Marking..."
              disabled={isMarkingAll}
              ariaLabel="Mark all notifications as read"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Total</p>
            <p className="text-xl font-bold text-horizon-primary mb-0">
              {notifications.length}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Unread</p>
            <p className="text-xl font-bold text-horizon-gray-800 mb-0">
              {unreadCount}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Read</p>
            <p className="text-xl font-bold text-horizon-gray-800 mb-0">
              {notifications.length - unreadCount}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 overflow-x-auto hb-scrollbar pb-1" role="tablist" aria-label="Notification filters">
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'all'}
              onClick={() => handleFilterChange('all')}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer
                ${activeFilter === 'all'
                  ? 'bg-horizon-primary text-white'
                  : 'text-horizon-gray-600 hover:bg-horizon-gray-100 hover:text-horizon-primary'
                }
              `}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'unread'}
              onClick={() => handleFilterChange('unread')}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer
                ${activeFilter === 'unread'
                  ? 'bg-horizon-primary text-white'
                  : 'text-horizon-gray-600 hover:bg-horizon-gray-100 hover:text-horizon-primary'
                }
              `}
            >
              Unread ({unreadCount})
            </button>
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={activeFilter === option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${activeFilter === option.value
                    ? 'bg-horizon-primary text-white'
                    : 'text-horizon-gray-600 hover:bg-horizon-gray-100 hover:text-horizon-primary'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div
          className="hb-card"
          role="region"
          aria-label="Notifications list"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className="hb-card-body p-0">
            {filteredNotifications.length > 0 ? (
              <ul className="divide-y divide-horizon-gray-100" role="list">
                {filteredNotifications.map((notification) => {
                  const isUnread = notification.isRead === false;

                  return (
                    <li
                      key={notification.id}
                      role="listitem"
                      className={`
                        px-6 py-4 transition-colors duration-150 cursor-pointer
                        ${isUnread
                          ? 'bg-horizon-primary/5 hover:bg-horizon-primary/10'
                          : 'bg-white hover:bg-horizon-gray-50'
                        }
                      `}
                      onClick={() => handleNotificationClick(notification)}
                      onKeyDown={(e) => handleNotificationKeyDown(e, notification)}
                      tabIndex={0}
                      aria-label={`${isUnread ? 'Unread: ' : ''}${notification.title} - ${formatTimestamp(notification.timestamp)}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread indicator + Icon */}
                        <div className="flex-shrink-0 relative mt-0.5">
                          {getNotificationIcon(notification.type)}
                          {isUnread && (
                            <span
                              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-horizon-primary rounded-full border-2 border-white"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <p
                            className={`text-sm mb-0.5 ${
                              isUnread
                                ? 'font-bold text-horizon-gray-800'
                                : 'font-medium text-horizon-gray-700'
                            }`}
                          >
                            {notification.title}
                          </p>

                          {/* Message */}
                          <p
                            className={`text-sm mb-2 hb-text-clamp-2 ${
                              isUnread
                                ? 'text-horizon-gray-700'
                                : 'text-horizon-gray-500'
                            }`}
                          >
                            {notification.message}
                          </p>

                          {/* Meta: Category badge + Timestamp */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {notification.type && (
                              <Badge
                                label={getTypeLabel(notification.type)}
                                variant={getTypeVariant(notification.type)}
                                size="sm"
                                dot
                              />
                            )}
                            {notification.category && (
                              <Badge
                                label={getCategoryLabel(notification.category)}
                                variant={getCategoryVariant(notification.category)}
                                size="sm"
                              />
                            )}
                            <span className="hb-text-caption text-horizon-gray-400">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center gap-1">
                          {/* Dismiss button */}
                          <button
                            type="button"
                            onClick={(e) => handleDismiss(e, notification)}
                            className="p-1.5 rounded-full text-horizon-gray-400 hover:text-horizon-gray-700 hover:bg-horizon-gray-100 transition-all duration-200 cursor-pointer"
                            aria-label={`Dismiss notification: ${notification.title}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {/* Navigate arrow */}
                          {notification.relatedId && (
                            <div className="flex-shrink-0">
                              <svg
                                className="w-4 h-4 text-horizon-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-horizon-gray-100 mb-3">
                  <svg
                    className="w-6 h-6 text-horizon-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                  No notifications match the selected filter.
                </p>
              </div>
            )}
          </div>

          {/* Card Footer */}
          {filteredNotifications.length > 0 && (
            <div className="hb-card-footer">
              <div className="flex items-center justify-between">
                <div className="hb-inline-sm">
                  <svg
                    className="w-4 h-4 text-horizon-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0">
                    Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                    {activeFilter !== 'all' ? ` (filtered)` : ''}
                  </p>
                </div>
                {unreadCount > 0 && activeFilter === 'all' && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium"
                    aria-label="Mark all as read"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No notifications"
          message="You don't have any notifications at this time. We'll notify you about important updates to your claims, documents, and coverage."
          icon={
            <svg
              className="w-8 h-8 text-horizon-gray-400"
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
          }
        />
      )}

      {/* Footer note */}
      {notifications.length > 0 && (
        <div className="mt-4">
          <div className="hb-inline-sm">
            <svg
              className="w-4 h-4 text-horizon-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="hb-text-caption text-horizon-gray-500 mb-0">
              Notifications are retained for 90 days. Click on a notification to view related details.
              To manage notification preferences, visit your{' '}
              <a
                href="/settings"
                className="hb-text-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.SETTINGS);
                }}
              >
                Settings
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Get the display label for a notification type.
 *
 * @param {string} type - The notification type
 * @returns {string} The type label
 */
function getTypeLabel(type) {
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
}

/**
 * Get the display label for a notification category.
 *
 * @param {string} category - The notification category
 * @returns {string} The category label
 */
function getCategoryLabel(category) {
  if (!category || typeof category !== 'string') {
    return '';
  }

  const labelMap = {
    claim_update: 'Claim Update',
    document_ready: 'Document Ready',
    coverage_change: 'Coverage Change',
    system: 'System',
    prior_auth_update: 'Prior Auth Update',
  };

  return labelMap[category] || category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default NotificationsList;