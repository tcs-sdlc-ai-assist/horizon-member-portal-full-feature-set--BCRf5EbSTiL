import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import BenefitsSummary from '../components/benefits/BenefitsSummary.jsx';

/**
 * BenefitsPage - Benefits & Coverage page component
 * Implements the Benefits & Coverage page from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Renders BenefitsSummary which includes CoverageSelector, plan status,
 * deductible/OOP progress bars, coverage categories table, and quick actions.
 * Data is loaded from benefits.json based on the selected coverage type.
 * Logs page view via useAuditLog and tags via useGlassbox on mount.
 *
 * @returns {JSX.Element}
 */
const BenefitsPage = () => {
  const { currentUser } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();

  /**
   * Log benefits page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/benefits', {
        action: 'benefits_page_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/benefits', {
          action: 'benefits_page_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  return (
    <div>
      <BenefitsSummary />
    </div>
  );
};

export default BenefitsPage;