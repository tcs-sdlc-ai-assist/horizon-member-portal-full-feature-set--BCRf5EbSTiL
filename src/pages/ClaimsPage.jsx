import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import ClaimsList from '../components/claims/ClaimsList.jsx';
import ClaimDetail from '../components/claims/ClaimDetail.jsx';
import ClaimSubmissionForm from '../components/claims/ClaimSubmissionForm.jsx';

/**
 * ClaimsPage - Claims page with list, detail, and submission views
 * Implements the ClaimsCenter from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171
 *
 * Renders ClaimsList as the default view. When a claimId route param is present,
 * renders ClaimDetail for the specific claim. When the path ends with /submit,
 * renders ClaimSubmissionForm. Implements ClaimsCenter exports (downloadEOB)
 * from the LLD. Logs page view via useAuditLog and tags via useGlassbox on mount.
 *
 * @returns {JSX.Element}
 */
const ClaimsPage = () => {
  const { claimId } = useParams();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();

  /**
   * Determine which view to render based on the current route.
   * - /claims/submit → ClaimSubmissionForm
   * - /claims/:claimId → ClaimDetail
   * - /claims → ClaimsList
   */
  const isSubmitView = location.pathname.endsWith('/submit');
  const isDetailView = !isSubmitView && claimId && claimId !== 'submit';

  /**
   * Log claims page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      const route = location.pathname;
      let action = 'claims_list_view';

      if (isSubmitView) {
        action = 'claims_submit_view';
      } else if (isDetailView) {
        action = 'claims_detail_view';
      }

      logPage(route, {
        action,
      });

      if (isGlassboxEnabled) {
        tagPage(route, {
          action,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, location.pathname]);

  // Render ClaimSubmissionForm for /claims/submit
  if (isSubmitView) {
    return <ClaimSubmissionForm />;
  }

  // Render ClaimDetail for /claims/:claimId
  if (isDetailView) {
    return <ClaimDetail />;
  }

  // Default: Render ClaimsList
  return <ClaimsList />;
};

export default ClaimsPage;