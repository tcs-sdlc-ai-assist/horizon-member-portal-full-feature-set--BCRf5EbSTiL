import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import ProgressBar from '../common/ProgressBar.jsx';
import CoverageSelector from '../common/CoverageSelector.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import benefitsData from '../../data/benefits.json';
import { ROUTES } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatters.js';

/**
 * DeductibleOOPWidget - Dashboard deductible and out-of-pocket summary widget component
 * Implements the deductible & OOP progress widget from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Displays individual and family deductible used/total and out-of-pocket maximum
 * used/total from mock benefits data using ProgressBar components. Supports
 * switching between Medical, Dental, and Vision coverage types via CoverageSelector.
 * Financial amounts have data-phi attribute for Glassbox compliance masking.
 * Uses HB card styling with proper accessibility.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the widget wrapper
 * @returns {JSX.Element}
 */
const DeductibleOOPWidget = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { tagWidget, tagBenefits, isEnabled: isGlassboxEnabled } = useGlassbox();
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
   * Handle coverage type change from the selector.
   *
   * @param {string} coverageId - The selected coverage/plan ID
   */
  const handleCoverageChange = useCallback((coverageId) => {
    setSelectedCoverageId(coverageId);

    if (isGlassboxEnabled) {
      tagWidget('deductible_progress', {
        action: 'coverage_change',
        route: '/dashboard',
        coverageId,
      });
    }
  }, [isGlassboxEnabled, tagWidget]);

  /**
   * Handle navigation to the full benefits page.
   */
  const handleViewBenefits = useCallback(() => {
    if (isGlassboxEnabled) {
      tagWidget('deductible_progress', {
        action: 'view_benefits_click',
        route: '/dashboard',
      });

      if (selectedPlan) {
        tagBenefits(selectedPlan.planId, {
          route: '/dashboard',
          action: 'widget_navigate',
        });
      }
    }

    navigate(ROUTES.BENEFITS);
  }, [navigate, isGlassboxEnabled, tagWidget, tagBenefits, selectedPlan]);

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
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      vision: (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.medical;
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

  return (
    <div
      className={`hb-card ${className}`}
      role="region"
      aria-label="Deductible & Out-of-Pocket"
    >
      {/* Card Header */}
      <div className="hb-card-header">
        <div className="flex items-center justify-between">
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-horizon-primary mb-0">
              Deductible & Out-of-Pocket
            </h3>
          </div>
          {memberPlans.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleViewBenefits}
              ariaLabel="View full benefits details"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              View Details
            </Button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="hb-card-body">
        {memberPlans.length > 0 ? (
          <>
            {/* Coverage Selector */}
            {coverageOptions.length > 1 && (
              <div className="mb-4">
                <CoverageSelector
                  coverages={coverageOptions}
                  selectedCoverageId={selectedCoverageId}
                  onChange={handleCoverageChange}
                  label="Coverage Type"
                  showLabel={false}
                  size="sm"
                  ariaLabel="Select coverage type for deductible and out-of-pocket progress"
                />
              </div>
            )}

            {/* Single coverage label */}
            {coverageOptions.length === 1 && selectedPlan && (
              <div className="hb-inline-sm mb-4">
                {getCoverageIcon(selectedPlan.planType)}
                <span className="text-sm font-medium text-horizon-gray-700">
                  {selectedPlan.planName}
                </span>
              </div>
            )}

            {selectedPlan && (
              <div className="space-y-5">
                {/* Deductible Section */}
                {hasDeductibleData(selectedPlan.deductible) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h4 className="text-sm font-semibold text-horizon-gray-700 mb-0">
                        Deductible
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {/* Individual Deductible */}
                      {selectedPlan.deductible.individual && selectedPlan.deductible.individual.total > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="hb-text-caption text-horizon-gray-500">Individual</span>
                            <span
                              className="hb-text-caption font-medium text-horizon-gray-600"
                              data-phi="financial-amount"
                            >
                              {formatCurrency(selectedPlan.deductible.individual.used)} of {formatCurrency(selectedPlan.deductible.individual.total)}
                            </span>
                          </div>
                          <ProgressBar
                            current={selectedPlan.deductible.individual.used}
                            total={selectedPlan.deductible.individual.total}
                            formatValue="currency"
                            size="sm"
                            showValues={false}
                            showPercentage={false}
                            ariaLabel={`Individual deductible: ${formatCurrency(selectedPlan.deductible.individual.used)} of ${formatCurrency(selectedPlan.deductible.individual.total)}`}
                          />
                        </div>
                      )}

                      {/* Family Deductible */}
                      {selectedPlan.deductible.family && selectedPlan.deductible.family.total > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="hb-text-caption text-horizon-gray-500">Family</span>
                            <span
                              className="hb-text-caption font-medium text-horizon-gray-600"
                              data-phi="financial-amount"
                            >
                              {formatCurrency(selectedPlan.deductible.family.used)} of {formatCurrency(selectedPlan.deductible.family.total)}
                            </span>
                          </div>
                          <ProgressBar
                            current={selectedPlan.deductible.family.used}
                            total={selectedPlan.deductible.family.total}
                            formatValue="currency"
                            size="sm"
                            showValues={false}
                            showPercentage={false}
                            ariaLabel={`Family deductible: ${formatCurrency(selectedPlan.deductible.family.used)} of ${formatCurrency(selectedPlan.deductible.family.total)}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Divider between sections */}
                {hasDeductibleData(selectedPlan.deductible) && hasOOPData(selectedPlan.outOfPocketMax) && (
                  <div className="hb-divider my-0" />
                )}

                {/* Out-of-Pocket Maximum Section */}
                {hasOOPData(selectedPlan.outOfPocketMax) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <h4 className="text-sm font-semibold text-horizon-gray-700 mb-0">
                        Out-of-Pocket Maximum
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {/* Individual OOP */}
                      {selectedPlan.outOfPocketMax.individual && selectedPlan.outOfPocketMax.individual.total > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="hb-text-caption text-horizon-gray-500">Individual</span>
                            <span
                              className="hb-text-caption font-medium text-horizon-gray-600"
                              data-phi="financial-amount"
                            >
                              {formatCurrency(selectedPlan.outOfPocketMax.individual.used)} of {formatCurrency(selectedPlan.outOfPocketMax.individual.total)}
                            </span>
                          </div>
                          <ProgressBar
                            current={selectedPlan.outOfPocketMax.individual.used}
                            total={selectedPlan.outOfPocketMax.individual.total}
                            formatValue="currency"
                            size="sm"
                            showValues={false}
                            showPercentage={false}
                            ariaLabel={`Individual out-of-pocket maximum: ${formatCurrency(selectedPlan.outOfPocketMax.individual.used)} of ${formatCurrency(selectedPlan.outOfPocketMax.individual.total)}`}
                          />
                        </div>
                      )}

                      {/* Family OOP */}
                      {selectedPlan.outOfPocketMax.family && selectedPlan.outOfPocketMax.family.total > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="hb-text-caption text-horizon-gray-500">Family</span>
                            <span
                              className="hb-text-caption font-medium text-horizon-gray-600"
                              data-phi="financial-amount"
                            >
                              {formatCurrency(selectedPlan.outOfPocketMax.family.used)} of {formatCurrency(selectedPlan.outOfPocketMax.family.total)}
                            </span>
                          </div>
                          <ProgressBar
                            current={selectedPlan.outOfPocketMax.family.used}
                            total={selectedPlan.outOfPocketMax.family.total}
                            formatValue="currency"
                            size="sm"
                            showValues={false}
                            showPercentage={false}
                            ariaLabel={`Family out-of-pocket maximum: ${formatCurrency(selectedPlan.outOfPocketMax.family.used)} of ${formatCurrency(selectedPlan.outOfPocketMax.family.total)}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No deductible or OOP data for this plan */}
                {!hasDeductibleData(selectedPlan.deductible) && !hasOOPData(selectedPlan.outOfPocketMax) && (
                  <div className="text-center py-4">
                    <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                      No deductible or out-of-pocket information available for this plan.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            size="sm"
            title="No benefits data available"
            message="You don't have any active plans to display deductible and out-of-pocket progress."
            icon={
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* Card Footer */}
      {memberPlans.length > 0 && selectedPlan && (
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
                {selectedPlan.planType.charAt(0).toUpperCase() + selectedPlan.planType.slice(1)} plan year {selectedPlan.effectiveDate ? selectedPlan.effectiveDate.substring(0, 4) : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewBenefits}
              className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium"
              aria-label="View full benefits details"
            >
              View benefits →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeductibleOOPWidget;