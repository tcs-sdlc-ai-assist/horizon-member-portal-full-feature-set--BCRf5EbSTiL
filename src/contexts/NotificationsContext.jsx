import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import notificationsData from '../data/notifications.json';
import { logAction, AUDIT_ACTIONS } from '../services/AuditLogger.js';

/**
 * NotificationsContext - Notifications state context provider
 * Implements the Notifications component from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Provides notifications array, unreadCount, markAsRead(id), markAllAsRead(),
 * and getNotifications(). Manages read/unread state in memory.
 * Loads mock notifications data filtered by the current user's memberId.
 */

const NotificationsContext = createContext(null);

/**
 * Load notifications for a given member ID from the mock data.
 * Includes system-wide notifications (memberId === null) and
 * notifications specific to the given member.
 *
 * @param {string|null} memberId - The member ID to filter notifications for
 * @returns {Array<object>} Array of notification objects
 */
const loadNotificationsForMember = (memberId) => {
  if (!Array.isArray(notificationsData)) {
    return [];
  }

  return notificationsData
    .filter((notification) => {
      if (!notification) {
        return false;
      }

      // Include system-wide notifications (no specific member)
      if (notification.memberId === null || notification.memberId === undefined) {
        return true;
      }

      // Include notifications for this specific member
      if (memberId && notification.memberId === memberId) {
        return true;
      }

      return false;
    })
    .map((notification) => ({ ...notification }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * NotificationsProvider - Context provider component for notifications state.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export const NotificationsProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Load notifications when user changes or authenticates.
   */
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const memberId = currentUser.memberId || null;
      const memberNotifications = loadNotificationsForMember(memberId);
      setNotifications(memberNotifications);
      setIsLoaded(true);
    } else {
      setNotifications([]);
      setIsLoaded(false);
    }
  }, [isAuthenticated, currentUser]);

  /**
   * Calculate the unread count from the current notifications state.
   */
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.isRead === false).length;
  }, [notifications]);

  /**
   * Get all notifications.
   *
   * @returns {Array<object>} Array of notification objects sorted by timestamp descending
   */
  const getNotifications = useCallback(() => {
    return [...notifications];
  }, [notifications]);

  /**
   * Get only unread notifications.
   *
   * @returns {Array<object>} Array of unread notification objects
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => n.isRead === false);
  }, [notifications]);

  /**
   * Get notifications filtered by category.
   *
   * @param {string} category - The category to filter by
   * @returns {Array<object>} Array of notification objects matching the category
   */
  const getNotificationsByCategory = useCallback((category) => {
    if (!category || typeof category !== 'string') {
      return [...notifications];
    }

    return notifications.filter((n) => n.category === category);
  }, [notifications]);

  /**
   * Get a single notification by its ID.
   *
   * @param {string} notificationId - The notification ID to look up
   * @returns {object|null} The notification object, or null if not found
   */
  const getNotificationById = useCallback((notificationId) => {
    if (!notificationId || typeof notificationId !== 'string') {
      return null;
    }

    const notification = notifications.find((n) => n.id === notificationId);
    return notification ? { ...notification } : null;
  }, [notifications]);

  /**
   * Mark a specific notification as read.
   *
   * @param {string} notificationId - The notification ID to mark as read
   * @returns {boolean} True if the notification was found and updated, false otherwise
   */
  const markAsRead = useCallback((notificationId) => {
    if (!notificationId || typeof notificationId !== 'string') {
      return false;
    }

    let found = false;

    setNotifications((prev) => {
      return prev.map((notification) => {
        if (notification.id === notificationId && !notification.isRead) {
          found = true;
          return { ...notification, isRead: true };
        }
        return notification;
      });
    });

    // Log the notification click action for audit
    if (found && currentUser) {
      logAction(currentUser.id, AUDIT_ACTIONS.NOTIFICATION_CLICKED, {
        resourceId: notificationId,
        route: '/notifications',
      });
    }

    return found;
  }, [currentUser]);

  /**
   * Mark all notifications as read.
   *
   * @returns {number} The number of notifications that were marked as read
   */
  const markAllAsRead = useCallback(() => {
    let count = 0;

    setNotifications((prev) => {
      return prev.map((notification) => {
        if (!notification.isRead) {
          count++;
          return { ...notification, isRead: true };
        }
        return notification;
      });
    });

    return count;
  }, []);

  /**
   * Dismiss a specific notification (mark as read and remove from list).
   *
   * @param {string} notificationId - The notification ID to dismiss
   * @returns {boolean} True if the notification was found and dismissed, false otherwise
   */
  const dismissNotification = useCallback((notificationId) => {
    if (!notificationId || typeof notificationId !== 'string') {
      return false;
    }

    let found = false;

    setNotifications((prev) => {
      const index = prev.findIndex((n) => n.id === notificationId);

      if (index === -1) {
        return prev;
      }

      found = true;
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    // Log the notification dismissed action for audit
    if (found && currentUser) {
      logAction(currentUser.id, AUDIT_ACTIONS.NOTIFICATION_DISMISSED, {
        resourceId: notificationId,
        route: '/notifications',
      });
    }

    return found;
  }, [currentUser]);

  const contextValue = {
    notifications,
    unreadCount,
    isLoaded,
    getNotifications,
    getUnreadNotifications,
    getNotificationsByCategory,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

/**
 * useNotifications - Custom hook to access notifications context.
 *
 * @returns {object} Notifications context value
 * @throws {Error} If used outside of NotificationsProvider
 */
export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider.');
  }

  return context;
};

export default NotificationsContext;