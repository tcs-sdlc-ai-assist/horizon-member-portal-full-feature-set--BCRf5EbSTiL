import { useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import CoverageSelector from '../components/common/CoverageSelector.jsx';
import IDCardPreview from '../components/idcards/IDCardPreview.jsx';
import IDCardActions from '../components/idcards/IDCardActions.jsx';
import IDCardEnlargeModal from '../components/idcards/IDCardEnlargeModal.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import idCardsData from '../data/idcards.json';

/**
 * IDCardsPage - ID Cards page with view/print/download
 * Implements the IDCardCenter from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7170
 *
 * Renders CoverageSelector at top, IDCardPreview (front view by default)
 * with flip button, enlarge button (opens IDCardEnlargeModal), and
 * IDCardActions (Print/Download/Request). Loads data from idcards.json
 * based on selected coverage. Implements IDCardCenter exports
 * (downloadIDCard, printIDCard) from the LLD.
 *
 * @returns {JSX.Element}
 */
const IDCardsPage = () => {
  const { currentUser } = useAuth();
  const { tagPage, tagCardViewed, tagWidget, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage, logCardViewed } = useAuditLog();

  const [selectedCoverageId, setSelectedCoverageId] = useState(null);
  const [currentSide, setCurrentSide] = useState('front');
  const [isEnlargeModalOpen, setIsEnlargeModalOpen] = useState(false);

  const frontRef = useRef(null);
  const backRef = useRef(null);

  /**
   * Log ID Cards page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/id-cards', {
        action: 'id_cards_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/id-cards', {
          action: 'id_cards_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

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
   * Build coverage options for the CoverageSelector.
   */
  const coverageOptions = useMemo(() => {
    return memberCards.map((card) => ({
      id: card.coverageId,
      label: card.coverageType,
    }));
  }, [memberCards]);

  /**
   * Get the currently selected card. Defaults to the first card if none selected.
   */
  const selectedCard = useMemo(() => {
    if (memberCards.length === 0) {
      return null;
    }

    if (selectedCoverageId) {
      const found = memberCards.find((c) => c.coverageId === selectedCoverageId);
      if (found) {
        return found;
      }
    }

    return memberCards[0];
  }, [memberCards, selectedCoverageId]);

  /**
   * Set the initial selected coverage ID when cards load.
   */
  useMemo(() => {
    if (!selectedCoverageId && memberCards.length > 0) {
      setSelectedCoverageId(memberCards[0].coverageId);
    }
  }, [memberCards, selectedCoverageId]);

  /**
   * Log card viewed when selected card changes.
   */
  useMemo(() => {
    if (selectedCard && currentUser) {
      logCardViewed(selectedCard.coverageId, {
        route: '/id-cards',
        action: 'card_view',
        coverageType: selectedCard.coverageType,
      });

      if (isGlassboxEnabled) {
        tagCardViewed(selectedCard.coverageId, {
          route: '/id-cards',
          action: 'card_view',
          coverageType: selectedCard.coverageType,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCard?.coverageId]);

  /**
   * Handle coverage type change from the selector.
   *
   * @param {string} coverageId - The selected coverage/plan ID
   */
  const handleCoverageChange = useCallback((coverageId) => {
    setSelectedCoverageId(coverageId);
    setCurrentSide('front');

    if (isGlassboxEnabled) {
      tagWidget('id_card', {
        action: 'coverage_change',
        route: '/id-cards',
        coverageId,
      });
    }
  }, [isGlassboxEnabled, tagWidget]);

  /**
   * Toggle between front and back views of the ID card.
   */
  const handleFlip = useCallback(() => {
    setCurrentSide((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  /**
   * Handle opening the enlarge modal.
   */
  const handleEnlarge = useCallback(() => {
    setIsEnlargeModalOpen(true);
  }, []);

  /**
   * Handle closing the enlarge modal.
   */
  const handleCloseEnlarge = useCallback(() => {
    setIsEnlargeModalOpen(false);
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
   * Get the coverage type icon SVG based on the coverage type.
   *
   * @param {string} coverageType - The coverage type
   * @returns {JSX.Element} The icon SVG element
   */
  const getCoverageIcon = useCallback((coverageType) => {
    if (!coverageType || typeof coverageType !== 'string') {
      return (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      );
    }

    const lowerType = coverageType.toLowerCase();

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

  const sideLabel = currentSide === 'front' ? 'Front' : 'Back';
  const oppositeSideLabel = currentSide === 'front' ? 'Back' : 'Front';

  return (
    <div>
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
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-horizon-primary mb-0">
                ID Cards
              </h1>
              <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                View, print, or download your insurance ID cards.
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
                ariaLabel="Select coverage type for ID card"
              />
            </div>
          )}
        </div>
      </div>

      {memberCards.length > 0 && selectedCard ? (
        <>
          {/* Card Overview */}
          <div className="hb-card mb-6">
            <div className="hb-card-header">
              <div className="flex items-center justify-between">
                <div className="hb-inline-sm">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                    {getCoverageIcon(selectedCard.coverageType)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-horizon-primary mb-0">
                      {selectedCard.planName}
                    </h2>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">
                      {selectedCard.coverageType} Coverage
                    </p>
                  </div>
                </div>
                <div className="hb-inline-sm">
                  <Badge
                    label={selectedCard.coverageType}
                    variant={getCoverageVariant(selectedCard.coverageType)}
                    size="sm"
                    dot
                  />
                  <Badge
                    label="Active"
                    variant="success"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div className="hb-card-body">
              {/* Card Side Toggle and Enlarge Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="hb-inline-sm">
                  <span className="text-sm font-medium text-horizon-gray-700">
                    Viewing: {sideLabel} of Card
                  </span>
                  {/* Side indicator dots */}
                  <div className="flex items-center gap-1.5 ml-2" aria-hidden="true">
                    <span
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        currentSide === 'front'
                          ? 'bg-horizon-primary'
                          : 'bg-horizon-gray-300'
                      }`}
                    />
                    <span
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        currentSide === 'back'
                          ? 'bg-horizon-primary'
                          : 'bg-horizon-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="hb-inline-sm">
                  {/* Flip Button */}
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="hb-inline-sm text-sm font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer"
                    aria-label={`Flip to view ${oppositeSideLabel.toLowerCase()} of ${selectedCard.coverageType} ID card`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>View {oppositeSideLabel}</span>
                  </button>

                  {/* Enlarge Button */}
                  <button
                    type="button"
                    onClick={handleEnlarge}
                    className="hb-inline-sm text-sm font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer"
                    aria-label={`Enlarge ${selectedCard.coverageType} ID card`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <span>Enlarge</span>
                  </button>
                </div>
              </div>

              {/* ID Card Preview */}
              <div className="max-w-xl mx-auto">
                <IDCardPreview
                  cardData={selectedCard}
                  side={currentSide}
                  showEnlarge={false}
                  compact={false}
                  className=""
                  frontRef={frontRef}
                  backRef={backRef}
                />
              </div>
            </div>
          </div>

          {/* Hidden back card for PDF capture when viewing front */}
          {currentSide === 'front' && (
            <div className="sr-only" aria-hidden="true">
              <IDCardPreview
                cardData={selectedCard}
                side="back"
                showEnlarge={false}
                compact={false}
                backRef={backRef}
              />
            </div>
          )}

          {/* Hidden front card for PDF capture when viewing back */}
          {currentSide === 'back' && (
            <div className="sr-only" aria-hidden="true">
              <IDCardPreview
                cardData={selectedCard}
                side="front"
                showEnlarge={false}
                compact={false}
                frontRef={frontRef}
              />
            </div>
          )}

          {/* ID Card Actions */}
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-horizon-primary mb-0">
                  Card Actions
                </h3>
              </div>
            </div>
            <div className="hb-card-body">
              <IDCardActions
                cardData={selectedCard}
                frontRef={frontRef}
                backRef={backRef}
                showPrint={true}
                showDownload={true}
                showRequestNew={true}
                layout="horizontal"
                size="md"
              />
            </div>
          </div>

          {/* All Cards Summary */}
          {memberCards.length > 1 && (
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-horizon-primary mb-0">
                      All Coverage Cards
                    </h3>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">
                      {memberCards.length} active card{memberCards.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="hb-card-body p-0">
                <div className="divide-y divide-horizon-gray-100">
                  {memberCards.map((card) => {
                    const isSelected = card.coverageId === selectedCard.coverageId;

                    return (
                      <div
                        key={card.coverageId}
                        className={`px-6 py-4 cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-horizon-primary/5'
                            : 'hover:bg-horizon-gray-50'
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleCoverageChange(card.coverageId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCoverageChange(card.coverageId);
                          }
                        }}
                        aria-label={`Select ${card.coverageType} ID card`}
                        aria-current={isSelected ? 'true' : undefined}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {getCoverageIcon(card.coverageType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-horizon-gray-800 mb-0.5 truncate">
                                {card.planName}
                              </p>
                              <div className="hb-inline-sm">
                                <Badge
                                  label={card.coverageType}
                                  variant={getCoverageVariant(card.coverageType)}
                                  size="sm"
                                  dot
                                />
                                <span className="hb-text-caption text-horizon-gray-400">
                                  Effective {card.effectiveDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <svg
                                className="w-5 h-5 text-horizon-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-horizon-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
                Your digital ID card can be used at most healthcare providers. If you need a physical card,
                use the &ldquo;Request New Card&rdquo; button above. New cards typically arrive within 7-10 business days.
                For questions, contact Member Services at 1-800-355-2583.
              </p>
            </div>
          </div>

          {/* Enlarge Modal */}
          <IDCardEnlargeModal
            isOpen={isEnlargeModalOpen}
            onClose={handleCloseEnlarge}
            cardData={selectedCard}
            initialSide={currentSide}
          />
        </>
      ) : (
        <EmptyState
          title="No ID cards available"
          message="You don't have any active ID cards to display. If you believe this is an error, please contact Member Services at 1-800-355-2583."
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
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
          }
        />
      )}
    </div>
  );
};

export default IDCardsPage;