import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import claimsData from '../../data/claims.json';
import { ROUTES, CLAIM_STATUS_LABELS, CLAIM_STATUS_VARIANTS } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

/**
 * RecentClaimsWidget - Dashboard recent claims summary widget component
 * Implements the recent claims widget from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Displays the 3 most recent claims from mock data for the current member.
 * Shows claim number (masked with data-phi attribute for Glassbox compliance),
 * provider name, status badge, service date, and amount owed. Links to the
 * full claims page. Uses HB card and table styling with proper accessibility.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the widget wrapper
 * @returns {JSX.Element}
 */
const RecentClaimsWidget = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { tagWidget, tagClaim, isEnabled: isGlassboxEnabled } = useGlassbox();
  const navigate = useNavigate();

  const MAX_DISPLAY = 3;

  /**
   * Get the recent claims for the current member, sorted by service date descending.
   */
  const recentClaims = useMemo(() => {
    if (!currentUser || !currentUser.memberId) {
      return [];
    }

    return claimsData
      .filter((claim) => claim.memberId === currentUser.memberId)
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
      .slice(0, MAX_DISPLAY);
  }, [currentUser]);

  /**
   * Handle navigation to the full claims page.
   */
  const handleViewAllClaims = useCallback(() => {
    if (isGlassboxEnabled) {
      tagWidget('recent_claims', {
        action: 'view_all_click',
        route: '/dashboard',
      });
    }

    navigate(ROUTES.CLAIMS);
  }, [navigate, isGlassboxEnabled, tagWidget]);

  /**
   * Handle clicking on a specific claim row.
   *
   * @param {object} claim - The claim object
   */
  const handleClaimClick = useCallback((claim) => {
    if (!claim || !claim.id) {
      return;
    }

    if (isGlassboxEnabled) {
      tagClaim(claim.id, {
        route: '/dashboard',
        action: 'widget_click',
      });
    }

    navigate(`/claims/${claim.id}`);
  }, [navigate, isGlassboxEnabled, tagClaim]);

  /**
   * Handle keyboard events on claim rows for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} claim - The claim object
   */
  const handleClaimKeyDown = useCallback((e, claim) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClaimClick(claim);
    }
  }, [handleClaimClick]);

  /**
   * Get the status badge variant for a claim status.
   *
   * @param {string} status - The claim status
   * @returns {string} The badge variant
   */
  const getStatusVariant = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return 'neutral';
    }

    const normalized = status.toLowerCase().trim();
    return CLAIM_STATUS_VARIANTS[normalized] || 'neutral';
  }, []);

  /**
   * Get the status label for a claim status.
   *
   * @param {string} status - The claim status
   * @returns {string} The status label
   */
  const getStatusLabel = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return '';
    }

    const normalized = status.toLowerCase().trim();

    if (CLAIM_STATUS_LABELS[normalized]) {
      return CLAIM_STATUS_LABELS[normalized];
    }

    return normalized
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  /**
   * Get the claim type icon SVG based on the claim type.
   *
   * @param {string} type - The claim type
   * @returns {JSX.Element} The icon SVG element
   */
  const getClaimTypeIcon = useCallback((type) => {
    if (!type || typeof type !== 'string') {
      return (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    const lowerType = type.toLowerCase();

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
        <svg className="w-4 h-4 text-horizon-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      pharmacy: (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.medical;
  }, []);

  return (
    <div
      className={`hb-card ${className}`}
      role="region"
      aria-label="Recent Claims"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-horizon-primary mb-0">
              Recent Claims
            </h3>
          </div>
          {recentClaims.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleViewAllClaims}
              ariaLabel="View all claims"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              View All
            </Button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="hb-card-body p-0">
        {recentClaims.length > 0 ? (
          <div className="divide-y divide-horizon-gray-100">
            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="px-6 py-4 hover:bg-horizon-gray-50 transition-colors duration-150 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleClaimClick(claim)}
                onKeyDown={(e) => handleClaimKeyDown(e, claim)}
                aria-label={`Claim ${claim.claimNumber} for ${claim.provider.name}, status ${getStatusLabel(claim.status)}, you owe ${formatCurrency(claim.whatYouOwe)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Claim info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Claim type icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getClaimTypeIcon(claim.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Provider name */}
                      <p className="text-sm font-medium text-horizon-gray-800 mb-0.5 truncate">
                        {claim.provider.name}
                      </p>

                      {/* Claim number - masked for Glassbox */}
                      <p
                        className="hb-text-caption text-horizon-gray-500 mb-1 truncate"
                        data-phi="claim-number"
                      >
                        {claim.claimNumber}
                      </p>

                      {/* Service date and status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="hb-text-caption text-horizon-gray-400">
                          {formatDate(claim.serviceDate, 'MMM D')}
                        </span>
                        <Badge
                          label={getStatusLabel(claim.status)}
                          variant={getStatusVariant(claim.status)}
                          size="sm"
                          dot
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-horizon-gray-800 mb-0">
                      {formatCurrency(claim.whatYouOwe)}
                    </p>
                    <p className="hb-text-caption text-horizon-gray-400 mb-0">
                      You owe
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            size="sm"
            title="No recent claims"
            message="You don't have any claims to display yet."
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* Card Footer */}
      {recentClaims.length > 0 && (
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
                Showing {recentClaims.length} most recent claim{recentClaims.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewAllClaims}
              className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium"
              aria-label="View all claims"
            >
              See all claims →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentClaimsWidget;