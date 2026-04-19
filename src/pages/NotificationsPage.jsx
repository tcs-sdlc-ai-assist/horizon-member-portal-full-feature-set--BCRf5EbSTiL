import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import NotificationsList from '../components/notifications/NotificationsList.jsx';

/**
 * NotificationsPage - Notifications page component
 * Implements the Notifications page from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders NotificationsList with full notification management including
 * mark as read, mark all as read, dismiss, and category filtering.
 * Shows notification count in page heading. Logs page view via
 * useAuditLog and tags via useGlassbox on mount.
 *
 * @returns {JSX.Element}
 */
const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();

  /**
   * Log notifications page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/notifications', {
        action: 'notifications_page_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/notifications', {
          action: 'notifications_page_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  return (
    <div>
      <NotificationsList />
    </div>
  );
};

export default NotificationsPage;