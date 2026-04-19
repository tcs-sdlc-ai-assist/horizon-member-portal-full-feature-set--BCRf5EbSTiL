import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import idCardsData from '../../data/idcards.json';
import { ROUTES } from '../../utils/constants.js';
import { maskMemberId } from '../../utils/maskingUtils.js';

/**
 * IDCardSummaryWidget - Dashboard ID card summary widget component
 * Implements the ID card summary widget from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Displays a summary of the member's active ID cards with plan name, member ID
 * (masked with data-phi attribute for Glassbox compliance), coverage type badge,
 * and quick action links to view or download the full ID card. Links to the
 * full ID Cards page. Uses HB card styling with proper accessibility.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the widget wrapper
 * @returns {JSX.Element}
 */
const IDCardSummaryWidget = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { tagWidget, tagCardViewed, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logCardViewed } = useAuditLog();
  const navigate = useNavigate();

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  /**
   * Get the ID cards for the current member, filtered by active status.
   */
  const memberCards = useMemo(() => {
    if (!currentUser || !currentUser.memberId) {
      return [];
    }

    return idCardsData.filter(
      (card) => card.memberId === currentUser.memberId && card.status === 'active'
    );
  }, [currentUser]);

  /**
   * Get the currently displayed card.
   */
  const activeCard = useMemo(() => {
    if (memberCards.length === 0) {
      return null;
    }

    const index = Math.min(activeCardIndex, memberCards.length - 1);
    return memberCards[index];
  }, [memberCards, activeCardIndex]);

  /**
   * Handle navigation to the full ID Cards page.
   */
  const handleViewAllCards = useCallback(() => {
    if (isGlassboxEnabled) {
      tagWidget('id_card', {
        action: 'view_all_click',
        route: '/dashboard',
      });
    }

    navigate(ROUTES.ID_CARDS);
  }, [navigate, isGlassboxEnabled, tagWidget]);

  /**
   * Handle clicking on a specific card to view it.
   *
   * @param {object} card - The ID card object
   */
  const handleViewCard = useCallback((card) => {
    if (!card || !card.coverageId) {
      return;
    }

    // Log audit event for card viewed
    logCardViewed(card.coverageId, {
      route: '/dashboard',
      action: 'widget_view',
      coverageType: card.coverageType,
    });

    if (isGlassboxEnabled) {
      tagCardViewed(card.coverageId, {
        route: '/dashboard',
        action: 'widget_view',
        coverageType: card.coverageType,
      });
    }

    navigate(ROUTES.ID_CARDS);
  }, [navigate, logCardViewed, isGlassboxEnabled, tagCardViewed]);

  /**
   * Handle switching between cards.
   *
   * @param {number} index - The card index to switch to
   */
  const handleCardSwitch = useCallback((index) => {
    if (index >= 0 && index < memberCards.length) {
      setActiveCardIndex(index);
    }
  }, [memberCards.length]);

  /**
   * Handle keyboard events on card tabs for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {number} index - The card index
   */
  const handleTabKeyDown = useCallback((e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardSwitch(index);
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % memberCards.length;
      handleCardSwitch(nextIndex);
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + memberCards.length) % memberCards.length;
      handleCardSwitch(prevIndex);
    }
  }, [handleCardSwitch, memberCards.length]);

  /**
   * Get the coverage type icon SVG based on the coverage type.
   *
   * @param {string} coverageType - The coverage type
   * @returns {JSX.Element} The icon SVG element
   */
  const getCoverageIcon = useCallback((coverageType) => {
    if (!coverageType || typeof coverageType !== 'string') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }

    const lowerType = coverageType.toLowerCase();

    const icons = {
      medical: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      dental: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      vision: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.medical;
  }, []);

  /**
   * Get the badge variant for a coverage type.
   *
   * @param {string} coverageType - The coverage type
   * @returns {string} The badge variant
   */
  const getCoverageVariant = useCallback((coverageType) => {
    if (!coverageType || typeof coverageType !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      medical: 'primary',
      dental: 'secondary',
      vision: 'info',
    };

    return variantMap[coverageType.toLowerCase()] || 'neutral';
  }, []);

  /**
   * Get key copay information for display based on coverage type.
   *
   * @param {object} card - The ID card object
   * @returns {Array<{label: string, value: string}>} Array of copay display items
   */
  const getKeyCopays = useCallback((card) => {
    if (!card || !card.copays) {
      return [];
    }

    const lowerType = (card.coverageType || '').toLowerCase();

    if (lowerType === 'medical') {
      const copays = [];
      if (card.copays.primaryCare !== undefined) {
        copays.push({ label: 'Primary Care', value: `$${card.copays.primaryCare}` });
      }
      if (card.copays.specialist !== undefined) {
        copays.push({ label: 'Specialist', value: `$${card.copays.specialist}` });
      }
      if (card.copays.urgentCare !== undefined) {
        copays.push({ label: 'Urgent Care', value: `$${card.copays.urgentCare}` });
      }
      return copays.slice(0, 3);
    }

    if (lowerType === 'dental') {
      const copays = [];
      if (card.copays.preventive !== undefined) {
        copays.push({ label: 'Preventive', value: card.copays.preventive === 0 ? '$0' : `${card.copays.preventive}%` });
      }
      if (card.copays.basic !== undefined) {
        copays.push({ label: 'Basic', value: `${card.copays.basic}%` });
      }
      if (card.copays.major !== undefined) {
        copays.push({ label: 'Major', value: `${card.copays.major}%` });
      }
      return copays.slice(0, 3);
    }

    if (lowerType === 'vision') {
      const copays = [];
      if (card.copays.eyeExam !== undefined) {
        copays.push({ label: 'Eye Exam', value: `$${card.copays.eyeExam}` });
      }
      if (card.copays.lenses !== undefined) {
        copays.push({ label: 'Lenses', value: `$${card.copays.lenses}` });
      }
      if (card.copays.frames !== undefined) {
        copays.push({ label: 'Frames', value: `$${card.copays.frames}` });
      }
      return copays.slice(0, 3);
    }

    return [];
  }, []);

  return (
    <div
      className={`hb-card ${className}`}
      role="region"
      aria-label="ID Cards"
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
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-horizon-primary mb-0">
              ID Cards
            </h3>
          </div>
          {memberCards.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleViewAllCards}
              ariaLabel="View all ID cards"
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
        {memberCards.length > 0 ? (
          <>
            {/* Coverage type tabs */}
            {memberCards.length > 1 && (
              <div
                className="flex border-b border-horizon-gray-200"
                role="tablist"
                aria-label="Coverage type tabs"
              >
                {memberCards.map((card, index) => {
                  const isActive = index === activeCardIndex;

                  return (
                    <button
                      key={card.coverageId}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`idcard-panel-${card.coverageId}`}
                      id={`idcard-tab-${card.coverageId}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleCardSwitch(index)}
                      onKeyDown={(e) => handleTabKeyDown(e, index)}
                      className={`
                        flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200
                        border-b-2 -mb-px cursor-pointer
                        ${isActive
                          ? 'text-horizon-primary border-horizon-primary bg-horizon-primary/5'
                          : 'text-horizon-gray-500 border-transparent hover:text-horizon-primary hover:border-horizon-gray-300'
                        }
                      `}
                    >
                      <span className="hb-inline-sm justify-center">
                        <span className="flex-shrink-0">
                          {getCoverageIcon(card.coverageType)}
                        </span>
                        <span className="hidden sm:inline">{card.coverageType}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active card display */}
            {activeCard && (
              <div
                id={`idcard-panel-${activeCard.coverageId}`}
                role="tabpanel"
                aria-labelledby={`idcard-tab-${activeCard.coverageId}`}
                className="px-6 py-4"
              >
                {/* Plan name and badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-horizon-gray-800 mb-1 truncate">
                      {activeCard.planName}
                    </p>
                    <Badge
                      label={activeCard.coverageType}
                      variant={getCoverageVariant(activeCard.coverageType)}
                      size="sm"
                      dot
                    />
                  </div>
                  <Badge
                    label="Active"
                    variant="success"
                    size="sm"
                  />
                </div>

                {/* Member ID (masked) */}
                <div className="bg-horizon-gray-50 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="hb-text-caption text-horizon-gray-500 mb-0.5">
                        Member ID
                      </p>
                      <p
                        className="text-sm font-medium text-horizon-gray-800 mb-0"
                        data-phi="member-id"
                      >
                        {maskMemberId(activeCard.memberId)}
                      </p>
                    </div>
                    <div>
                      <p className="hb-text-caption text-horizon-gray-500 mb-0.5">
                        Group
                      </p>
                      <p
                        className="text-sm font-medium text-horizon-gray-800 mb-0"
                        data-phi="group-number"
                      >
                        {activeCard.groupNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key copays */}
                {getKeyCopays(activeCard).length > 0 && (
                  <div className="mb-3">
                    <p className="hb-text-caption text-horizon-gray-500 mb-2">
                      Key Copays
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {getKeyCopays(activeCard).map((copay) => (
                        <div
                          key={copay.label}
                          className="text-center p-2 rounded-lg bg-horizon-gray-50"
                        >
                          <p className="text-sm font-bold text-horizon-primary mb-0">
                            {copay.value}
                          </p>
                          <p className="hb-text-caption text-horizon-gray-500 mb-0">
                            {copay.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick action button */}
                <button
                  type="button"
                  onClick={() => handleViewCard(activeCard)}
                  className="hb-btn-outline hb-btn-block hb-btn-sm"
                  aria-label={`View ${activeCard.coverageType} ID card`}
                >
                  <span className="hb-inline-sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <span>View Full ID Card</span>
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            size="sm"
            title="No ID cards available"
            message="You don't have any active ID cards to display."
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
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* Card Footer */}
      {memberCards.length > 0 && (
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
                {memberCards.length} active card{memberCards.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewAllCards}
              className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium"
              aria-label="View and manage all ID cards"
            >
              Manage cards →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDCardSummaryWidget;