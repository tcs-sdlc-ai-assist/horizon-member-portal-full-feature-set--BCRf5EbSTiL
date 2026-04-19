import { useState, useCallback, useRef } from 'react';
import Modal from '../common/Modal.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import { maskMemberId, maskGroupNumber } from '../../utils/maskingUtils.js';

/**
 * IDCardPreview - ID card front/back preview renderer component
 * Implements the ID card preview from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7170
 *
 * Renders front and back of insurance card with all card fields (member name,
 * ID, group number, plan info, RX info) with proper layout. PHI/PII fields
 * have data-phi attribute for Glassbox compliance masking. Supports enlarge
 * mode (renders in modal). Props: cardData, side (front/back).
 *
 * @param {object} props
 * @param {object} props.cardData - The ID card data object from idcards.json
 * @param {'front'|'back'|'both'} [props.side='front'] - Which side(s) of the card to display
 * @param {boolean} [props.showEnlarge=true] - Whether to show the enlarge button
 * @param {boolean} [props.compact=false] - Whether to render in compact mode
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @param {React.Ref} [props.frontRef] - Ref forwarded to the front card element (for PDF capture)
 * @param {React.Ref} [props.backRef] - Ref forwarded to the back card element (for PDF capture)
 * @returns {JSX.Element|null}
 */
const IDCardPreview = ({
  cardData,
  side = 'front',
  showEnlarge = true,
  compact = false,
  className = '',
  frontRef,
  backRef,
}) => {
  const [isEnlargeOpen, setIsEnlargeOpen] = useState(false);
  const [enlargeSide, setEnlargeSide] = useState('front');

  const internalFrontRef = useRef(null);
  const internalBackRef = useRef(null);

  const activeFrontRef = frontRef || internalFrontRef;
  const activeBackRef = backRef || internalBackRef;

  /**
   * Handle opening the enlarge modal.
   *
   * @param {'front'|'back'} cardSide - Which side to show enlarged
   */
  const handleEnlarge = useCallback((cardSide) => {
    setEnlargeSide(cardSide);
    setIsEnlargeOpen(true);
  }, []);

  /**
   * Handle closing the enlarge modal.
   */
  const handleCloseEnlarge = useCallback(() => {
    setIsEnlargeOpen(false);
  }, []);

  /**
   * Get the coverage type color classes for the card header.
   *
   * @param {string} coverageType - The coverage type
   * @returns {object} Object with bg and text color classes
   */
  const getCoverageColors = useCallback((coverageType) => {
    if (!coverageType || typeof coverageType !== 'string') {
      return {
        headerBg: 'bg-horizon-primary',
        headerText: 'text-white',
        accentBg: 'bg-horizon-primary/10',
        accentText: 'text-horizon-primary',
      };
    }

    const lowerType = coverageType.toLowerCase();

    const colorMap = {
      medical: {
        headerBg: 'bg-horizon-primary',
        headerText: 'text-white',
        accentBg: 'bg-horizon-primary/10',
        accentText: 'text-horizon-primary',
      },
      dental: {
        headerBg: 'bg-horizon-secondary',
        headerText: 'text-white',
        accentBg: 'bg-horizon-secondary/10',
        accentText: 'text-horizon-secondary-dark',
      },
      vision: {
        headerBg: 'bg-blue-600',
        headerText: 'text-white',
        accentBg: 'bg-blue-50',
        accentText: 'text-blue-700',
      },
    };

    return colorMap[lowerType] || colorMap.medical;
  }, []);

  /**
   * Get the coverage type icon SVG.
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
   * Render the front of the ID card.
   *
   * @param {boolean} [enlarged=false] - Whether rendering in enlarged mode
   * @returns {JSX.Element}
   */
  const renderFrontCard = useCallback((enlarged = false) => {
    if (!cardData) {
      return null;
    }

    const colors = getCoverageColors(cardData.coverageType);
    const frontFields = cardData.frontFields || {};
    const paddingClass = compact && !enlarged ? 'p-3' : 'p-4 sm:p-5';
    const textSizeClass = compact && !enlarged ? 'text-xs' : 'text-sm';

    return (
      <div
        ref={enlarged ? undefined : activeFrontRef}
        className={`bg-white rounded-xl border border-horizon-gray-200 shadow-horizon overflow-hidden ${enlarged ? 'w-full' : ''}`}
        role="img"
        aria-label={`${cardData.coverageType || 'Insurance'} ID card front`}
      >
        {/* Card Header */}
        <div className={`${colors.headerBg} ${colors.headerText} px-4 py-3 sm:px-5 sm:py-3.5`}>
          <div className="flex items-center justify-between">
            <div className="hb-inline-sm">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
                {getCoverageIcon(cardData.coverageType)}
              </div>
              <div>
                <p className="text-sm font-bold mb-0" data-phi="id-card-field">
                  {frontFields.planName || cardData.planName || 'Horizon BCBSNJ'}
                </p>
                <p className="text-xxs opacity-80 mb-0">
                  {cardData.coverageType || 'Coverage'}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <svg
                className="w-7 h-7 opacity-80"
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
          </div>
        </div>

        {/* Card Body */}
        <div className={paddingClass}>
          {/* Member Name */}
          <div className="mb-3">
            <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Member Name</p>
            <p
              className={`${textSizeClass} font-bold text-horizon-gray-800 mb-0`}
              data-phi="subscriber-name"
            >
              {frontFields.memberName || cardData.subscriberName || ''}
            </p>
          </div>

          {/* Member ID and Group Number */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Member ID</p>
              <p
                className={`${textSizeClass} font-medium text-horizon-gray-800 mb-0`}
                data-phi="member-id"
              >
                {frontFields.memberId || cardData.memberId || ''}
              </p>
            </div>
            <div>
              <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Group Number</p>
              <p
                className={`${textSizeClass} font-medium text-horizon-gray-800 mb-0`}
                data-phi="group-number"
              >
                {frontFields.groupNumber || cardData.groupNumber || ''}
              </p>
            </div>
          </div>

          {/* Effective Date */}
          <div className="mb-3">
            <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Effective Date</p>
            <p className={`${textSizeClass} font-medium text-horizon-gray-800 mb-0`}>
              {frontFields.effectiveDate || cardData.effectiveDate || ''}
            </p>
          </div>

          {/* Copays - Medical */}
          {cardData.coverageType && cardData.coverageType.toLowerCase() === 'medical' && (
            <div className={`${colors.accentBg} rounded-lg p-3 mb-3`}>
              <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">Copays</p>
              <div className="grid grid-cols-2 gap-2">
                {frontFields.copayPrimaryCare && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Primary Care</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`} data-phi="financial-amount">
                      {frontFields.copayPrimaryCare}
                    </p>
                  </div>
                )}
                {frontFields.copaySpecialist && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Specialist</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`} data-phi="financial-amount">
                      {frontFields.copaySpecialist}
                    </p>
                  </div>
                )}
                {frontFields.copayUrgentCare && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Urgent Care</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`} data-phi="financial-amount">
                      {frontFields.copayUrgentCare}
                    </p>
                  </div>
                )}
                {frontFields.copayEmergencyRoom && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Emergency Room</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`} data-phi="financial-amount">
                      {frontFields.copayEmergencyRoom}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coverage - Dental */}
          {cardData.coverageType && cardData.coverageType.toLowerCase() === 'dental' && (
            <div className={`${colors.accentBg} rounded-lg p-3 mb-3`}>
              <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">Coverage</p>
              <div className="grid grid-cols-2 gap-2">
                {frontFields.preventiveCoverage && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Preventive</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`}>
                      {frontFields.preventiveCoverage}
                    </p>
                  </div>
                )}
                {frontFields.basicCoverage && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Basic</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`}>
                      {frontFields.basicCoverage}
                    </p>
                  </div>
                )}
                {frontFields.majorCoverage && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Major</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`}>
                      {frontFields.majorCoverage}
                    </p>
                  </div>
                )}
                {frontFields.orthodontiaCoverage && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Orthodontia</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`}>
                      {frontFields.orthodontiaCoverage}
                    </p>
                  </div>
                )}
              </div>
              {(frontFields.annualMaximum || frontFields.deductible) && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-horizon-gray-200">
                  {frontFields.annualMaximum && (
                    <div>
                      <p className="hb-text-caption text-horizon-gray-500 mb-0">Annual Max</p>
                      <p className={`${textSizeClass} font-medium text-horizon-gray-700 mb-0`} data-phi="financial-amount">
                        {frontFields.annualMaximum}
                      </p>
                    </div>
                  )}
                  {frontFields.deductible && (
                    <div>
                      <p className="hb-text-caption text-horizon-gray-500 mb-0">Deductible</p>
                      <p className={`${textSizeClass} font-medium text-horizon-gray-700 mb-0`} data-phi="financial-amount">
                        {frontFields.deductible}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Coverage - Vision */}
          {cardData.coverageType && cardData.coverageType.toLowerCase() === 'vision' && (
            <div className={`${colors.accentBg} rounded-lg p-3 mb-3`}>
              <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">Copays</p>
              <div className="grid grid-cols-2 gap-2">
                {frontFields.copayEyeExam && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Eye Exam</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`} data-phi="financial-amount">
                      {frontFields.copayEyeExam}
                    </p>
                  </div>
                )}
                {frontFields.copayLenses && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Lenses</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`} data-phi="financial-amount">
                      {frontFields.copayLenses}
                    </p>
                  </div>
                )}
                {frontFields.copayFrames && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Frames</p>
                    <p className={`${textSizeClass} font-bold ${colors.accentText} mb-0`} data-phi="financial-amount">
                      {frontFields.copayFrames}
                    </p>
                  </div>
                )}
                {frontFields.examFrequency && (
                  <div>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">Exam Frequency</p>
                    <p className={`${textSizeClass} font-medium text-horizon-gray-700 mb-0`}>
                      {frontFields.examFrequency}
                    </p>
                  </div>
                )}
              </div>
              {(frontFields.frameAllowance || frontFields.contactLensAllowance) && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-horizon-gray-200">
                  {frontFields.frameAllowance && (
                    <div>
                      <p className="hb-text-caption text-horizon-gray-500 mb-0">Frame Allowance</p>
                      <p className={`${textSizeClass} font-medium text-horizon-gray-700 mb-0`} data-phi="financial-amount">
                        {frontFields.frameAllowance}
                      </p>
                    </div>
                  )}
                  {frontFields.contactLensAllowance && (
                    <div>
                      <p className="hb-text-caption text-horizon-gray-500 mb-0">Contact Lens</p>
                      <p className={`${textSizeClass} font-medium text-horizon-gray-700 mb-0`} data-phi="financial-amount">
                        {frontFields.contactLensAllowance}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RX Information (Medical cards only) */}
          {cardData.rxBin && (
            <div className="bg-horizon-gray-50 rounded-lg p-3">
              <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">Prescription (Rx)</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0">RX BIN</p>
                  <p
                    className={`${textSizeClass} font-medium text-horizon-gray-800 mb-0`}
                    data-phi="rx-bin"
                  >
                    {frontFields.rxBin || cardData.rxBin}
                  </p>
                </div>
                <div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0">RX PCN</p>
                  <p
                    className={`${textSizeClass} font-medium text-horizon-gray-800 mb-0`}
                    data-phi="rx-pcn"
                  >
                    {frontFields.rxPcn || cardData.rxPcn}
                  </p>
                </div>
                <div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0">RX Group</p>
                  <p
                    className={`${textSizeClass} font-medium text-horizon-gray-800 mb-0`}
                    data-phi="rx-group"
                  >
                    {frontFields.rxGroup || cardData.rxGroup}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enlarge button */}
        {showEnlarge && !enlarged && (
          <div className="px-4 pb-3 sm:px-5 sm:pb-4">
            <button
              type="button"
              onClick={() => handleEnlarge('front')}
              className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium hb-inline-sm"
              aria-label={`Enlarge ${cardData.coverageType || ''} ID card front`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span>Enlarge</span>
            </button>
          </div>
        )}
      </div>
    );
  }, [cardData, compact, showEnlarge, getCoverageColors, getCoverageIcon, handleEnlarge, activeFrontRef]);

  /**
   * Render the back of the ID card.
   *
   * @param {boolean} [enlarged=false] - Whether rendering in enlarged mode
   * @returns {JSX.Element}
   */
  const renderBackCard = useCallback((enlarged = false) => {
    if (!cardData) {
      return null;
    }

    const backFields = cardData.backFields || {};
    const paddingClass = compact && !enlarged ? 'p-3' : 'p-4 sm:p-5';
    const textSizeClass = compact && !enlarged ? 'text-xs' : 'text-sm';

    return (
      <div
        ref={enlarged ? undefined : activeBackRef}
        className={`bg-white rounded-xl border border-horizon-gray-200 shadow-horizon overflow-hidden ${enlarged ? 'w-full' : ''}`}
        role="img"
        aria-label={`${cardData.coverageType || 'Insurance'} ID card back`}
      >
        {/* Card Header */}
        <div className="bg-horizon-gray-800 text-white px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center justify-between">
            <div className="hb-inline-sm">
              <svg
                className="w-5 h-5 opacity-80"
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
              <p className="text-sm font-bold mb-0">Important Information</p>
            </div>
            <Badge
              label={cardData.coverageType || 'Coverage'}
              variant={getCoverageVariant(cardData.coverageType)}
              size="sm"
            />
          </div>
        </div>

        {/* Card Body */}
        <div className={paddingClass}>
          {/* Claims Address */}
          {backFields.claimsAddress && (
            <div className="mb-3">
              <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-1">Claims Address</p>
              <p className={`${textSizeClass} text-horizon-gray-700 mb-0`}>
                {backFields.claimsAddress}
              </p>
            </div>
          )}

          {/* Phone Numbers */}
          <div className="bg-horizon-gray-50 rounded-lg p-3 mb-3">
            <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">Contact Numbers</p>
            <div className="space-y-2">
              {backFields.memberServicesPhone && (
                <div className="flex items-center justify-between">
                  <span className="hb-text-caption text-horizon-gray-500">Member Services</span>
                  <a
                    href={`tel:${backFields.memberServicesPhone.replace(/\D/g, '')}`}
                    className={`${textSizeClass} font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline`}
                    aria-label={`Call Member Services at ${backFields.memberServicesPhone}`}
                  >
                    {backFields.memberServicesPhone}
                  </a>
                </div>
              )}
              {backFields.claimsPhone && backFields.claimsPhone !== backFields.memberServicesPhone && (
                <div className="flex items-center justify-between">
                  <span className="hb-text-caption text-horizon-gray-500">Claims</span>
                  <a
                    href={`tel:${backFields.claimsPhone.replace(/\D/g, '')}`}
                    className={`${textSizeClass} font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline`}
                    aria-label={`Call Claims at ${backFields.claimsPhone}`}
                  >
                    {backFields.claimsPhone}
                  </a>
                </div>
              )}
              {backFields.preAuthPhone && (
                <div className="flex items-center justify-between">
                  <span className="hb-text-caption text-horizon-gray-500">Pre-Authorization</span>
                  <a
                    href={`tel:${backFields.preAuthPhone.replace(/\D/g, '')}`}
                    className={`${textSizeClass} font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline`}
                    aria-label={`Call Pre-Authorization at ${backFields.preAuthPhone}`}
                  >
                    {backFields.preAuthPhone}
                  </a>
                </div>
              )}
              {backFields.nurseLinePhone && (
                <div className="flex items-center justify-between">
                  <span className="hb-text-caption text-horizon-gray-500">24/7 Nurse Line</span>
                  <a
                    href={`tel:${backFields.nurseLinePhone.replace(/\D/g, '')}`}
                    className={`${textSizeClass} font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline`}
                    aria-label={`Call Nurse Line at ${backFields.nurseLinePhone}`}
                  >
                    {backFields.nurseLinePhone}
                  </a>
                </div>
              )}
              {backFields.mentalHealthPhone && (
                <div className="flex items-center justify-between">
                  <span className="hb-text-caption text-horizon-gray-500">Mental Health</span>
                  <a
                    href={`tel:${backFields.mentalHealthPhone.replace(/\D/g, '')}`}
                    className={`${textSizeClass} font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline`}
                    aria-label={`Call Mental Health at ${backFields.mentalHealthPhone}`}
                  >
                    {backFields.mentalHealthPhone}
                  </a>
                </div>
              )}
              {backFields.pharmacyHelpDesk && (
                <div className="flex items-center justify-between">
                  <span className="hb-text-caption text-horizon-gray-500">Pharmacy Help</span>
                  <a
                    href={`tel:${backFields.pharmacyHelpDesk.replace(/\D/g, '')}`}
                    className={`${textSizeClass} font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline`}
                    aria-label={`Call Pharmacy Help Desk at ${backFields.pharmacyHelpDesk}`}
                  >
                    {backFields.pharmacyHelpDesk}
                  </a>
                </div>
              )}
              {backFields.providerServicesPhone && (
                <div className="flex items-center justify-between">
                  <span className="hb-text-caption text-horizon-gray-500">Provider Services</span>
                  <a
                    href={`tel:${backFields.providerServicesPhone.replace(/\D/g, '')}`}
                    className={`${textSizeClass} font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline`}
                    aria-label={`Call Provider Services at ${backFields.providerServicesPhone}`}
                  >
                    {backFields.providerServicesPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Website */}
          {backFields.websiteUrl && (
            <div className="mb-3">
              <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Website</p>
              <p className={`${textSizeClass} font-medium text-horizon-blue mb-0`}>
                {backFields.websiteUrl}
              </p>
            </div>
          )}

          {/* Provider Search URL */}
          {backFields.providerSearchUrl && (
            <div className="mb-3">
              <p className="hb-text-caption text-horizon-gray-500 mb-0.5">Find a Provider</p>
              <p className={`${textSizeClass} font-medium text-horizon-blue mb-0`}>
                {backFields.providerSearchUrl}
              </p>
            </div>
          )}

          {/* Emergency Notice */}
          {backFields.emergencyNotice && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="hb-inline-sm">
                <svg
                  className="w-4 h-4 text-red-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-xs text-red-700 font-medium mb-0">
                  {backFields.emergencyNotice}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enlarge button */}
        {showEnlarge && !enlarged && (
          <div className="px-4 pb-3 sm:px-5 sm:pb-4">
            <button
              type="button"
              onClick={() => handleEnlarge('back')}
              className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium hb-inline-sm"
              aria-label={`Enlarge ${cardData.coverageType || ''} ID card back`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span>Enlarge</span>
            </button>
          </div>
        )}
      </div>
    );
  }, [cardData, compact, showEnlarge, getCoverageVariant, handleEnlarge, activeBackRef]);

  // Don't render if no card data
  if (!cardData) {
    return null;
  }

  const showFront = side === 'front' || side === 'both';
  const showBack = side === 'back' || side === 'both';

  return (
    <div className={`${className}`}>
      {/* Card Preview(s) */}
      <div className={side === 'both' ? 'space-y-4' : ''}>
        {showFront && (
          <div>
            {side === 'both' && (
              <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">
                Front of Card
              </p>
            )}
            {renderFrontCard(false)}
          </div>
        )}

        {showBack && (
          <div>
            {side === 'both' && (
              <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">
                Back of Card
              </p>
            )}
            {renderBackCard(false)}
          </div>
        )}
      </div>

      {/* Dependents Info (shown below card when side is 'both' or 'front') */}
      {showFront && cardData.dependents && cardData.dependents.length > 0 && (
        <div className="mt-3">
          <p className="hb-text-caption font-semibold text-horizon-gray-600 mb-2">
            Covered Dependents
          </p>
          <div className="space-y-1.5">
            {cardData.dependents.map((dependent, index) => (
              <div
                key={`${dependent.memberId}-${index}`}
                className="flex items-center justify-between bg-horizon-gray-50 rounded-lg px-3 py-2"
              >
                <div className="hb-inline-sm">
                  <div className="hb-avatar hb-avatar-xs bg-horizon-secondary">
                    {dependent.name ? dependent.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium text-horizon-gray-800 mb-0"
                      data-phi="dependent-name"
                    >
                      {dependent.name}
                    </p>
                    <p className="hb-text-caption text-horizon-gray-500 mb-0">
                      {dependent.relationship}
                    </p>
                  </div>
                </div>
                <p
                  className="hb-text-caption text-horizon-gray-500 mb-0"
                  data-phi="member-id"
                >
                  {maskMemberId(dependent.memberId)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enlarge Modal */}
      <Modal
        isOpen={isEnlargeOpen}
        onClose={handleCloseEnlarge}
        title={`${cardData.coverageType || 'Insurance'} ID Card - ${enlargeSide === 'front' ? 'Front' : 'Back'}`}
        size="lg"
        centered={true}
        closeOnBackdrop={true}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel={`Enlarged ${cardData.coverageType || ''} ID card ${enlargeSide}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="hb-inline-sm">
              {enlargeSide === 'front' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnlargeSide('back')}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  View Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnlargeSide('front')}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  View Front
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseEnlarge}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="py-2">
          {enlargeSide === 'front' ? renderFrontCard(true) : renderBackCard(true)}
        </div>
      </Modal>
    </div>
  );
};

export default IDCardPreview;