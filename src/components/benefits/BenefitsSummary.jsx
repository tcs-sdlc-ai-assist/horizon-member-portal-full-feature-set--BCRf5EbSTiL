import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';
import ProgressBar from '../common/ProgressBar.jsx';
import CoverageSelector from '../common/CoverageSelector.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import benefitsData from '../../data/benefits.json';
import { ROUTES } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

/**
 * BenefitsSummary - Benefits at a glance component with deductible/OOP progress
 * Implements the benefits summary view from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Shows plan status, plan type, and CoverageSelector to switch between Medical,
 * Dental, and Vision plans. Displays deductible progress (individual/family) and
 * out-of-pocket progress (individual/family) using ProgressBar components.
 * Financial values have data-phi attribute for Glassbox compliance masking.
 * Includes coverage categories table with in-network and out-of-network details.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const BenefitsSummary = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { tagBenefits, tagCoverage, tagWidget, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logAction } = useAuditLog();
  const navigate = useNavigate();

  const [selectedCoverageId, setSelectedCoverageId] = useState(null);

  /**
   * Get the benefits plans for the current member, filtered by active status.
   */
  const memberPlans = useMemo(() => {
    if (!currentUser || !currentUser.memberId) {
      return [];
    }

    return benefitsData.filter(
      (plan) => plan.memberId === currentUser.memberId && plan.status === 'active'
    );
  }, [currentUser]);

  /**
   * Build coverage options for the CoverageSelector.
   */
  const coverageOptions = useMemo(() => {
    return memberPlans.map((plan) => ({
      id: plan.planId,
      label: plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1),
    }));
  }, [memberPlans]);

  /**
   * Get the currently selected plan. Defaults to the first plan if none selected.
   */
  const selectedPlan = useMemo(() => {
    if (memberPlans.length === 0) {
      return null;
    }

    if (selectedCoverageId) {
      const found = memberPlans.find((p) => p.planId === selectedCoverageId);
      if (found) {
        return found;
      }
    }

    return memberPlans[0];
  }, [memberPlans, selectedCoverageId]);

  /**
   * Set the initial selected coverage ID when plans load.
   */
  useMemo(() => {
    if (!selectedCoverageId && memberPlans.length > 0) {
      setSelectedCoverageId(memberPlans[0].planId);
    }
  }, [memberPlans, selectedCoverageId]);

  /**
   * Log benefits viewed on mount when a plan is selected.
   */
  useMemo(() => {
    if (selectedPlan && currentUser) {
      if (isGlassboxEnabled) {
        tagBenefits(selectedPlan.planId, {
          route: '/benefits',
          action: 'benefits_summary_view',
          planType: selectedPlan.planType,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan?.planId]);

  /**
   * Handle coverage type change from the selector.
   *
   * @param {string} coverageId - The selected coverage/plan ID
   */
  const handleCoverageChange = useCallback((coverageId) => {
    setSelectedCoverageId(coverageId);

    if (isGlassboxEnabled) {
      tagCoverage(coverageId, {
        route: '/benefits',
        action: 'coverage_change',
      });
    }
  }, [isGlassboxEnabled, tagCoverage]);

  /**
   * Handle navigation to the claims page.
   */
  const handleViewClaims = useCallback(() => {
    navigate(ROUTES.CLAIMS);
  }, [navigate]);

  /**
   * Handle navigation to the ID cards page.
   */
  const handleViewIDCards = useCallback(() => {
    navigate(ROUTES.ID_CARDS);
  }, [navigate]);

  /**
   * Get the coverage type icon SVG based on the plan type.
   *
   * @param {string} planType - The plan type
   * @returns {JSX.Element} The icon SVG element
   */
  const getCoverageIcon = useCallback((planType) => {
    if (!planType || typeof planType !== 'string') {
      return (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }

    const lowerType = planType.toLowerCase();

    const icons = {
      medical: (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      dental: (
        <svg className="w-5 h-5 text-horizon-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      vision: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.medical;
  }, []);

  /**
   * Get the badge variant for a plan status.
   *
   * @param {string} status - The plan status
   * @returns {string} The badge variant
   */
  const getStatusVariant = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      active: 'success',
      inactive: 'neutral',
      pending: 'warning',
      terminated: 'error',
    };

    return variantMap[status.toLowerCase()] || 'neutral';
  }, []);

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
   * Check if a deductible section has meaningful data (total > 0).
   *
   * @param {object} deductible - The deductible object with individual and family
   * @returns {boolean} True if at least one total is greater than 0
   */
  const hasDeductibleData = useCallback((deductible) => {
    if (!deductible) {
      return false;
    }

    const individualTotal = deductible.individual ? deductible.individual.total : 0;
    const familyTotal = deductible.family ? deductible.family.total : 0;

    return individualTotal > 0 || familyTotal > 0;
  }, []);

  /**
   * Check if an OOP section has meaningful data (total > 0).
   *
   * @param {object} oop - The out-of-pocket max object with individual and family
   * @returns {boolean} True if at least one total is greater than 0
   */
  const hasOOPData = useCallback((oop) => {
    if (!oop) {
      return false;
    }

    const individualTotal = oop.individual ? oop.individual.total : 0;
    const familyTotal = oop.family ? oop.family.total : 0;

    return individualTotal > 0 || familyTotal > 0;
  }, []);

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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-horizon-primary mb-0">
                Benefits & Coverage
              </h1>
              <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                View your plan benefits, deductible progress, and coverage details.
              </p>
            </div>
          </div>

          {/* Coverage Selector */}
          {coverageOptions.length > 1 && (
            <div className="w-full sm:w-auto sm:min-w-[220px]">
              <CoverageSelector
                coverages={coverageOptions}
                selectedCoverageId={selectedCoverageId}
                onChange={handleCoverageChange}
                label="Coverage Type"
                showLabel={false}
                size="md"
                ariaLabel="Select coverage type for benefits summary"
              />
            </div>
          )}
        </div>
      </div>

      {memberPlans.length > 0 && selectedPlan ? (
        <>
          {/* Plan Overview Card */}
          <div className="hb-card mb-6">
            <div className="hb-card-header">
              <div className="flex items-center justify-between">
                <div className="hb-inline-sm">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                    {getCoverageIcon(selectedPlan.planType)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-horizon-primary mb-0">
                      Plan Overview
                    </h2>
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
                  <Badge
                    label={selectedPlan.status.charAt(0).toUpperCase() + selectedPlan.status.slice(1)}
                    variant={getStatusVariant(selectedPlan.status)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
            <div className="hb-card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Plan Name</p>
                  <p className="text-sm font-medium text-horizon-gray-800 mb-0">
                    {selectedPlan.planName}
                  </p>
                </div>
                <div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Plan Type</p>
                  <p className="text-sm font-medium text-horizon-gray-800 mb-0">
                    {selectedPlan.planType.charAt(0).toUpperCase() + selectedPlan.planType.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Effective Date</p>
                  <p className="text-sm font-medium text-horizon-gray-800 mb-0">
                    {formatDate(selectedPlan.effectiveDate, 'MM/DD/YYYY')}
                  </p>
                </div>
                <div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Group Number</p>
                  <p
                    className="text-sm font-medium text-horizon-gray-800 mb-0"
                    data-phi="group-number"
                  >
                    {selectedPlan.groupNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deductible & Out-of-Pocket Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Deductible Progress Card */}
            <div className="hb-card" role="region" aria-label="Deductible Progress">
              <div className="hb-card-header">
                <div className="hb-inline-sm">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-horizon-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-horizon-primary mb-0">
                    Deductible
                  </h3>
                </div>
              </div>
              <div className="hb-card-body">
                {hasDeductibleData(selectedPlan.deductible) ? (
                  <div className="space-y-5">
                    {/* Individual Deductible */}
                    {selectedPlan.deductible.individual && selectedPlan.deductible.individual.total > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-horizon-gray-700">Individual</span>
                          <span
                            className="text-sm font-medium text-horizon-gray-600"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.deductible.individual.used)} of {formatCurrency(selectedPlan.deductible.individual.total)}
                          </span>
                        </div>
                        <ProgressBar
                          current={selectedPlan.deductible.individual.used}
                          total={selectedPlan.deductible.individual.total}
                          formatValue="currency"
                          size="md"
                          showValues={false}
                          showPercentage={true}
                          ariaLabel={`Individual deductible: ${formatCurrency(selectedPlan.deductible.individual.used)} of ${formatCurrency(selectedPlan.deductible.individual.total)}`}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.deductible.individual.used)} used
                          </span>
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.deductible.individual.total - selectedPlan.deductible.individual.used)} remaining
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Family Deductible */}
                    {selectedPlan.deductible.family && selectedPlan.deductible.family.total > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-horizon-gray-700">Family</span>
                          <span
                            className="text-sm font-medium text-horizon-gray-600"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.deductible.family.used)} of {formatCurrency(selectedPlan.deductible.family.total)}
                          </span>
                        </div>
                        <ProgressBar
                          current={selectedPlan.deductible.family.used}
                          total={selectedPlan.deductible.family.total}
                          formatValue="currency"
                          size="md"
                          showValues={false}
                          showPercentage={true}
                          ariaLabel={`Family deductible: ${formatCurrency(selectedPlan.deductible.family.used)} of ${formatCurrency(selectedPlan.deductible.family.total)}`}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.deductible.family.used)} used
                          </span>
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.deductible.family.total - selectedPlan.deductible.family.used)} remaining
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                      No deductible information available for this plan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Out-of-Pocket Maximum Progress Card */}
            <div className="hb-card" role="region" aria-label="Out-of-Pocket Maximum Progress">
              <div className="hb-card-header">
                <div className="hb-inline-sm">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-horizon-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-horizon-primary mb-0">
                    Out-of-Pocket Maximum
                  </h3>
                </div>
              </div>
              <div className="hb-card-body">
                {hasOOPData(selectedPlan.outOfPocketMax) ? (
                  <div className="space-y-5">
                    {/* Individual OOP */}
                    {selectedPlan.outOfPocketMax.individual && selectedPlan.outOfPocketMax.individual.total > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-horizon-gray-700">Individual</span>
                          <span
                            className="text-sm font-medium text-horizon-gray-600"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.outOfPocketMax.individual.used)} of {formatCurrency(selectedPlan.outOfPocketMax.individual.total)}
                          </span>
                        </div>
                        <ProgressBar
                          current={selectedPlan.outOfPocketMax.individual.used}
                          total={selectedPlan.outOfPocketMax.individual.total}
                          formatValue="currency"
                          size="md"
                          showValues={false}
                          showPercentage={true}
                          ariaLabel={`Individual out-of-pocket maximum: ${formatCurrency(selectedPlan.outOfPocketMax.individual.used)} of ${formatCurrency(selectedPlan.outOfPocketMax.individual.total)}`}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.outOfPocketMax.individual.used)} used
                          </span>
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.outOfPocketMax.individual.total - selectedPlan.outOfPocketMax.individual.used)} remaining
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Family OOP */}
                    {selectedPlan.outOfPocketMax.family && selectedPlan.outOfPocketMax.family.total > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-horizon-gray-700">Family</span>
                          <span
                            className="text-sm font-medium text-horizon-gray-600"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.outOfPocketMax.family.used)} of {formatCurrency(selectedPlan.outOfPocketMax.family.total)}
                          </span>
                        </div>
                        <ProgressBar
                          current={selectedPlan.outOfPocketMax.family.used}
                          total={selectedPlan.outOfPocketMax.family.total}
                          formatValue="currency"
                          size="md"
                          showValues={false}
                          showPercentage={true}
                          ariaLabel={`Family out-of-pocket maximum: ${formatCurrency(selectedPlan.outOfPocketMax.family.used)} of ${formatCurrency(selectedPlan.outOfPocketMax.family.total)}`}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.outOfPocketMax.family.used)} used
                          </span>
                          <span
                            className="hb-text-caption text-horizon-gray-500"
                            data-phi="financial-amount"
                          >
                            {formatCurrency(selectedPlan.outOfPocketMax.family.total - selectedPlan.outOfPocketMax.family.used)} remaining
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                      No out-of-pocket maximum information available for this plan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          {(hasDeductibleData(selectedPlan.deductible) || hasOOPData(selectedPlan.outOfPocketMax)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {selectedPlan.deductible.individual && selectedPlan.deductible.individual.total > 0 && (
                <div className="hb-card-flat p-4">
                  <p className="hb-text-caption text-horizon-gray-500 mb-1">Individual Deductible Met</p>
                  <p
                    className="text-xl font-bold text-horizon-primary mb-0"
                    data-phi="financial-amount"
                  >
                    {Math.round((selectedPlan.deductible.individual.used / selectedPlan.deductible.individual.total) * 100)}%
                  </p>
                </div>
              )}
              {selectedPlan.deductible.family && selectedPlan.deductible.family.total > 0 && (
                <div className="hb-card-flat p-4">
                  <p className="hb-text-caption text-horizon-gray-500 mb-1">Family Deductible Met</p>
                  <p
                    className="text-xl font-bold text-horizon-primary mb-0"
                    data-phi="financial-amount"
                  >
                    {Math.round((selectedPlan.deductible.family.used / selectedPlan.deductible.family.total) * 100)}%
                  </p>
                </div>
              )}
              {selectedPlan.outOfPocketMax.individual && selectedPlan.outOfPocketMax.individual.total > 0 && (
                <div className="hb-card-flat p-4">
                  <p className="hb-text-caption text-horizon-gray-500 mb-1">Individual OOP Used</p>
                  <p
                    className="text-xl font-bold text-horizon-gray-800 mb-0"
                    data-phi="financial-amount"
                  >
                    {formatCurrency(selectedPlan.outOfPocketMax.individual.used)}
                  </p>
                </div>
              )}
              {selectedPlan.outOfPocketMax.family && selectedPlan.outOfPocketMax.family.total > 0 && (
                <div className="hb-card-flat p-4">
                  <p className="hb-text-caption text-horizon-gray-500 mb-1">Family OOP Used</p>
                  <p
                    className="text-xl font-bold text-horizon-gray-800 mb-0"
                    data-phi="financial-amount"
                  >
                    {formatCurrency(selectedPlan.outOfPocketMax.family.used)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Coverage Categories Table */}
          {selectedPlan.coverageCategories && selectedPlan.coverageCategories.length > 0 && (
            <div className="hb-card mb-6">
              <div className="hb-card-header">
                <div className="hb-inline-sm">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-horizon-primary"
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
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-horizon-primary mb-0">
                      Coverage Details
                    </h3>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">
                      {selectedPlan.coverageCategories.length} coverage categor{selectedPlan.coverageCategories.length !== 1 ? 'ies' : 'y'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="hb-card-body p-0">
                <div className="hb-table-wrapper border-0 rounded-none">
                  <table
                    className="hb-table hb-table-striped hb-table-hover"
                    role="table"
                    aria-label="Coverage categories"
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
                            <span className="text-sm font-medium text-horizon-gray-800">
                              {category.name}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm text-horizon-gray-700">
                              {formatCostShare(category.inNetwork)}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm text-horizon-gray-700">
                              {formatCostShare(category.outOfNetwork)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="hb-card mb-6">
            <div className="hb-card-body">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleViewClaims}
                  ariaLabel="View your claims"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                >
                  View Claims
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleViewIDCards}
                  ariaLabel="View your ID cards"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  }
                >
                  View ID Cards
                </Button>
              </div>
            </div>
          </div>

          {/* Footer note */}
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
                Benefits shown are a summary. For complete plan details, refer to your Summary of Benefits and Coverage (SBC)
                document in the Document Center. If you have questions about your benefits, contact Member Services at 1-800-355-2583.
              </p>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No benefits data available"
          message="You don't have any active plans to display benefits information. If you believe this is an error, please contact Member Services."
          actionLabel="Contact Support"
          onAction={() => navigate(ROUTES.SUPPORT)}
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />
      )}
    </div>
  );
};

export default BenefitsSummary;