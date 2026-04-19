import { useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import Badge from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import benefitsData from '../../data/benefits.json';

/**
 * CoverageDetails - Coverage category details table component
 * Implements the coverage details view from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Renders a list/table of coverage categories (e.g., Primary Care, Specialist,
 * Emergency, etc.) with in-network and out-of-network copay/coinsurance values
 * from mock benefits data. Uses HB table styling (hb-table, hb-table-wrapper,
 * hb-table-striped, hb-table-hover). Financial values have data-phi attribute
 * for Glassbox compliance masking. Supports filtering by plan ID and coverage
 * type. Accessible with proper table semantics and ARIA attributes.
 *
 * @param {object} props
 * @param {string} [props.planId] - The plan ID to display coverage details for; if not provided, defaults to the first active plan
 * @param {string} [props.coverageType] - Optional coverage type filter ('medical', 'dental', 'vision')
 * @param {boolean} [props.compact=false] - Whether to render in compact mode with smaller text
 * @param {boolean} [props.showHeader=true] - Whether to show the card header
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const CoverageDetails = ({
  planId,
  coverageType,
  compact = false,
  showHeader = true,
  className = '',
}) => {
  const { currentUser } = useAuth();
  const { tagBenefits, isEnabled: isGlassboxEnabled } = useGlassbox();

  /**
   * Get the benefits plans for the current member, filtered by active status.
   */
  const memberPlans = useMemo(() => {
    if (!currentUser || !currentUser.memberId) {
      return [];
    }

    let plans = benefitsData.filter(
      (plan) => plan.memberId === currentUser.memberId && plan.status === 'active'
    );

    if (coverageType) {
      plans = plans.filter(
        (plan) => plan.planType.toLowerCase() === coverageType.toLowerCase()
      );
    }

    return plans;
  }, [currentUser, coverageType]);

  /**
   * Get the selected plan. Uses planId prop if provided, otherwise defaults to first plan.
   */
  const selectedPlan = useMemo(() => {
    if (memberPlans.length === 0) {
      return null;
    }

    if (planId) {
      const found = memberPlans.find((p) => p.planId === planId);
      if (found) {
        return found;
      }
    }

    return memberPlans[0];
  }, [memberPlans, planId]);

  /**
   * Log coverage details viewed on mount when a plan is selected.
   */
  useMemo(() => {
    if (selectedPlan && currentUser && isGlassboxEnabled) {
      tagBenefits(selectedPlan.planId, {
        route: '/benefits',
        action: 'coverage_details_view',
        planType: selectedPlan.planType,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan?.planId]);

  /**
   * Format a copay/coinsurance value for display.
   *
   * @param {object} costShare - The cost share object with copay and coinsurance
   * @returns {string} The formatted cost share string
   */
  const formatCostShare = useCallback((costShare) => {
    if (!costShare) {
      return 'N/A';
    }

    if (costShare.copay !== null && costShare.copay !== undefined) {
      if (costShare.copay === 0) {
        return '$0 (Covered at 100%)';
      }
      return `$${costShare.copay} copay`;
    }

    if (costShare.coinsurance !== null && costShare.coinsurance !== undefined) {
      if (costShare.coinsurance === 0) {
        return 'Covered at 100%';
      }
      return `${costShare.coinsurance}% coinsurance`;
    }

    return 'Not Covered';
  }, []);

  /**
   * Determine if a cost share value represents full coverage (no member cost).
   *
   * @param {object} costShare - The cost share object
   * @returns {boolean} True if the service is fully covered
   */
  const isFullyCovered = useCallback((costShare) => {
    if (!costShare) {
      return false;
    }

    if (costShare.copay === 0 || costShare.coinsurance === 0) {
      return true;
    }

    return false;
  }, []);

  /**
   * Determine if a cost share value represents "not covered".
   *
   * @param {object} costShare - The cost share object
   * @returns {boolean} True if the service is not covered
   */
  const isNotCovered = useCallback((costShare) => {
    if (!costShare) {
      return true;
    }

    if (
      (costShare.copay === null || costShare.copay === undefined) &&
      (costShare.coinsurance === null || costShare.coinsurance === undefined)
    ) {
      return true;
    }

    return false;
  }, []);

  /**
   * Get the text color class for a cost share value.
   *
   * @param {object} costShare - The cost share object
   * @returns {string} The CSS class for the text color
   */
  const getCostShareColorClass = useCallback((costShare) => {
    if (isFullyCovered(costShare)) {
      return 'text-green-700 font-medium';
    }

    if (isNotCovered(costShare)) {
      return 'text-horizon-gray-400 italic';
    }

    return 'text-horizon-gray-700';
  }, [isFullyCovered, isNotCovered]);

  /**
   * Get the badge variant for a plan type.
   *
   * @param {string} planType - The plan type
   * @returns {string} The badge variant
   */
  const getPlanTypeVariant = useCallback((planType) => {
    if (!planType || typeof planType !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      medical: 'primary',
      dental: 'secondary',
      vision: 'info',
    };

    return variantMap[planType.toLowerCase()] || 'neutral';
  }, []);

  /**
   * Get the coverage type icon SVG based on the plan type.
   *
   * @param {string} planType - The plan type
   * @returns {JSX.Element} The icon SVG element
   */
  const getCoverageIcon = useCallback((planType) => {
    if (!planType || typeof planType !== 'string') {
      return (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }

    const lowerType = planType.toLowerCase();

    const icons = {
      medical: (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      dental: (
        <svg className="w-4 h-4 text-horizon-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      vision: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.medical;
  }, []);

  const textSizeClass = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={`${className}`}>
      {selectedPlan && selectedPlan.coverageCategories && selectedPlan.coverageCategories.length > 0 ? (
        <div className="hb-card">
          {/* Card Header */}
          {showHeader && (
            <div className="hb-card-header">
              <div className="flex items-center justify-between">
                <div className="hb-inline-sm">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                    {getCoverageIcon(selectedPlan.planType)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-horizon-primary mb-0">
                      Coverage Details
                    </h3>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">
                      {selectedPlan.planName}
                    </p>
                  </div>
                </div>
                <div className="hb-inline-sm">
                  <Badge
                    label={selectedPlan.planType.charAt(0).toUpperCase() + selectedPlan.planType.slice(1)}
                    variant={getPlanTypeVariant(selectedPlan.planType)}
                    size="sm"
                    dot
                  />
                  <span className="hb-text-caption text-horizon-gray-400">
                    {selectedPlan.coverageCategories.length} categor{selectedPlan.coverageCategories.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Coverage Categories Table */}
          <div className="hb-card-body p-0">
            <div className="hb-table-wrapper border-0 rounded-none">
              <table
                className={`hb-table hb-table-striped hb-table-hover ${compact ? 'hb-table-compact' : ''}`}
                role="table"
                aria-label={`${selectedPlan.planType.charAt(0).toUpperCase() + selectedPlan.planType.slice(1)} coverage categories`}
              >
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">In-Network</th>
                    <th scope="col">Out-of-Network</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlan.coverageCategories.map((category, index) => (
                    <tr key={`${category.name}-${index}`}>
                      <td>
                        <span className={`${textSizeClass} font-medium text-horizon-gray-800`}>
                          {category.name}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${textSizeClass} ${getCostShareColorClass(category.inNetwork)}`}
                          data-phi="financial-amount"
                        >
                          {formatCostShare(category.inNetwork)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${textSizeClass} ${getCostShareColorClass(category.outOfNetwork)}`}
                          data-phi="financial-amount"
                        >
                          {formatCostShare(category.outOfNetwork)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Footer */}
          <div className="hb-card-footer">
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
                Coverage details shown are a summary. Copays and coinsurance apply after any applicable deductible
                unless otherwise noted. For complete plan details, refer to your Summary of Benefits and Coverage (SBC).
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No coverage details available"
          message="Coverage category details are not available for the selected plan. If you believe this is an error, please contact Member Services at 1-800-355-2583."
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      )}
    </div>
  );
};

export default CoverageDetails;