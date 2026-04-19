import { useState, useCallback } from 'react';
import Modal from '../common/Modal.jsx';
import IDCardPreview from './IDCardPreview.jsx';
import Button from '../common/Button.jsx';

/**
 * IDCardEnlargeModal - Enlarged ID card modal view component
 * Implements the enlarged ID card modal from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7170
 *
 * Modal component for enlarged ID card view. Uses Modal component with lg size.
 * Renders IDCardPreview at larger scale with flip button to toggle front/back.
 * Accessible with proper focus management, ARIA attributes, and keyboard navigation.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Callback when the modal is closed
 * @param {object} props.cardData - The ID card data object from idcards.json
 * @param {'front'|'back'} [props.initialSide='front'] - Which side to show initially
 * @param {string} [props.className=''] - Additional CSS classes for the modal content
 * @returns {JSX.Element|null}
 */
const IDCardEnlargeModal = ({
  isOpen,
  onClose,
  cardData,
  initialSide = 'front',
  className = '',
}) => {
  const [currentSide, setCurrentSide] = useState(initialSide);

  /**
   * Reset the side to the initial side when the modal opens.
   */
  const handleOpen = useCallback(() => {
    setCurrentSide(initialSide);
  }, [initialSide]);

  /**
   * Toggle between front and back views of the ID card.
   */
  const handleFlip = useCallback(() => {
    setCurrentSide((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  /**
   * Handle closing the modal.
   */
  const handleClose = useCallback(() => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  /**
   * Handle keyboard events for flip action.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleFlipKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  }, [handleFlip]);

  // Don't render if no card data or not open
  if (!cardData || !isOpen) {
    return null;
  }

  const coverageType = cardData.coverageType || 'Insurance';
  const sideLabel = currentSide === 'front' ? 'Front' : 'Back';
  const oppositeSideLabel = currentSide === 'front' ? 'Back' : 'Front';

  const modalTitle = `${coverageType} ID Card - ${sideLabel}`;

  /**
   * Get the flip icon SVG element.
   *
   * @returns {JSX.Element} The flip icon SVG
   */
  const getFlipIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="hb-inline-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFlip}
          ariaLabel={`View ${oppositeSideLabel.toLowerCase()} of ${coverageType} ID card`}
          leftIcon={getFlipIcon()}
        >
          View {oppositeSideLabel}
        </Button>

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

        <span className="hb-text-caption text-horizon-gray-400 ml-1">
          {sideLabel}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleClose}
      >
        Close
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="lg"
      centered={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      showCloseButton={true}
      footer={footerContent}
      ariaLabel={`Enlarged ${coverageType} ID card ${sideLabel.toLowerCase()} view`}
    >
      <div className={`py-2 ${className}`}>
        {/* Card side indicator for screen readers */}
        <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
          Showing {sideLabel.toLowerCase()} of {coverageType} ID card
        </div>

        {/* Enlarged card preview */}
        <div className="hb-animate-fade-in">
          <IDCardPreview
            cardData={cardData}
            side={currentSide}
            showEnlarge={false}
            compact={false}
            className=""
          />
        </div>

        {/* Flip instruction hint */}
        <div className="mt-4 text-center">
          <p className="hb-text-caption text-horizon-gray-400 mb-0">
            <button
              type="button"
              onClick={handleFlip}
              onKeyDown={handleFlipKeyDown}
              className="text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium hb-inline-sm justify-center"
              aria-label={`Flip to view ${oppositeSideLabel.toLowerCase()} of card`}
            >
              {getFlipIcon()}
              <span>Flip to view {oppositeSideLabel.toLowerCase()}</span>
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default IDCardEnlargeModal;