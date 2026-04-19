import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import DocumentList from '../components/documents/DocumentList.jsx';

/**
 * DocumentCenterPage - Document Center page component
 * Implements the DocumentCenter from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7172
 *
 * Renders DocumentList with category filters (EOB, Plan Documents, Letters,
 * Tax Forms), sorting by date/name, and download functionality. All document
 * downloads are audit logged via useAuditLog and tagged via useGlassbox.
 * Supports URL query parameter for initial category filter (e.g., ?category=eob).
 * Logs page view on mount.
 *
 * @returns {JSX.Element}
 */
const DocumentCenterPage = () => {
  const { currentUser } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();

  /**
   * Log document center page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/documents', {
        action: 'document_center_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/documents', {
          action: 'document_center_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  return (
    <div>
      <DocumentList />
    </div>
  );
};

export default DocumentCenterPage;