import { useState, useCallback } from 'react';
import Button from '../common/Button.jsx';
import Alert from '../common/Alert.jsx';
import useAuditLog from '../../hooks/useAuditLog.js';
import useGlassbox from '../../hooks/useGlassbox.js';
import { generateIDCardPDFWithBack, generateIDCardFileName } from '../../utils/pdfGenerator.js';

/**
 * IDCardActions - ID card action buttons component (print/download/request)
 * Implements the ID card actions from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7170, SCRUM-7166, SCRUM-7165
 *
 * Renders Print, Download (PDF), and Request New Card buttons.
 * Print opens print-friendly view via window.print().
 * Download calls pdfGenerator utility and logs audit event.
 * Request New Card creates stub record and shows confirmation alert.
 * All actions logged via useAuditLog and tagged via useGlassbox.
 *
 * @param {object} props
 * @param {object} props.cardData - The ID card data object from idcards.json
 * @param {React.Ref} [props.frontRef] - Ref to the front card DOM element (for PDF capture)
 * @param {React.Ref} [props.backRef] - Ref to the back card DOM element (for PDF capture)
 * @param {boolean} [props.showPrint=true] - Whether to show the Print button
 * @param {boolean} [props.showDownload=true] - Whether to show the Download button
 * @param {boolean} [props.showRequestNew=true] - Whether to show the Request New Card button
 * @param {'horizontal'|'vertical'} [props.layout='horizontal'] - Button layout direction
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element|null}
 */
const IDCardActions = ({
  cardData,
  frontRef,
  backRef,
  showPrint = true,
  showDownload = true,
  showRequestNew = true,
  layout = 'horizontal',
  size = 'md',
  className = '',
}) => {
  const { logCardDownload, logCardPrint, logCardRequest } = useAuditLog();
  const { tagCardDownloaded, tagCardViewed, tagWidget, isEnabled: isGlassboxEnabled } = useGlassbox();

  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Clear all status messages.
   */
  const clearMessages = useCallback(() => {
    setSuccessMessage('');
    setErrorMessage('');
  }, []);

  /**
   * Handle printing the ID card via window.print().
   * Logs the print action for audit and Glassbox compliance.
   */
  const handlePrint = useCallback(() => {
    if (isPrinting || !cardData) {
      return;
    }

    clearMessages();
    setIsPrinting(true);

    try {
      // Log audit event for card print
      logCardPrint(cardData.coverageId, {
        route: '/id-cards',
        action: 'print',
        coverageType: cardData.coverageType,
      });

      // Tag Glassbox event if enabled
      if (isGlassboxEnabled) {
        tagWidget('id_card', {
          action: 'print',
          route: '/id-cards',
          coverageId: cardData.coverageId,
          coverageType: cardData.coverageType,
        });
      }

      window.print();
    } catch (_error) {
      setErrorMessage('Unable to print the ID card. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  }, [isPrinting, cardData, clearMessages, logCardPrint, isGlassboxEnabled, tagWidget]);

  /**
   * Handle downloading the ID card as a PDF.
   * Uses pdfGenerator utility to capture front and back card elements.
   * Logs the download action for audit and Glassbox compliance.
   */
  const handleDownload = useCallback(async () => {
    if (isDownloading || !cardData) {
      return;
    }

    clearMessages();
    setIsDownloading(true);

    try {
      const fileName = generateIDCardFileName(
        cardData.coverageType,
        cardData.subscriberName
      );

      if (frontRef && frontRef.current && backRef && backRef.current) {
        await generateIDCardPDFWithBack(
          frontRef.current,
          backRef.current,
          fileName
        );
      } else if (frontRef && frontRef.current) {
        // Import the single-side generator dynamically to avoid unused import
        const { generateIDCardPDF } = await import('../../utils/pdfGenerator.js');
        await generateIDCardPDF(frontRef.current, fileName);
      } else {
        throw new Error('Card elements are not available for PDF generation.');
      }

      // Log audit event for card download
      logCardDownload(cardData.coverageId, {
        route: '/id-cards',
        action: 'download',
        coverageType: cardData.coverageType,
        fileName,
      });

      // Tag Glassbox event if enabled
      if (isGlassboxEnabled) {
        tagCardDownloaded(cardData.coverageId, {
          route: '/id-cards',
          action: 'download',
          coverageType: cardData.coverageType,
        });
      }

      setSuccessMessage(`${cardData.coverageType || 'ID'} card downloaded successfully.`);
    } catch (_error) {
      setErrorMessage('Unable to download the ID card. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, cardData, frontRef, backRef, clearMessages, logCardDownload, isGlassboxEnabled, tagCardDownloaded]);

  /**
   * Handle requesting a new ID card.
   * Creates a stub record and shows a confirmation alert.
   * Logs the request action for audit and Glassbox compliance.
   */
  const handleRequestNew = useCallback(() => {
    if (isRequesting || !cardData) {
      return;
    }

    clearMessages();
    setIsRequesting(true);

    try {
      // Log audit event for new card request
      logCardRequest(cardData.coverageId, {
        route: '/id-cards',
        action: 'request_new',
        coverageType: cardData.coverageType,
      });

      // Tag Glassbox event if enabled
      if (isGlassboxEnabled) {
        tagWidget('id_card', {
          action: 'request_new',
          route: '/id-cards',
          coverageId: cardData.coverageId,
          coverageType: cardData.coverageType,
        });
      }

      setSuccessMessage(
        `A new ${cardData.coverageType || ''} ID card has been requested. You will receive it by mail within 7-10 business days.`
      );
    } catch (_error) {
      setErrorMessage('Unable to request a new ID card. Please try again later.');
    } finally {
      setIsRequesting(false);
    }
  }, [isRequesting, cardData, clearMessages, logCardRequest, isGlassboxEnabled, tagWidget]);

  /**
   * Get the button size prop based on the size prop.
   *
   * @returns {string} The button size value
   */
  const getButtonSize = useCallback(() => {
    const sizeMap = {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
    };

    return sizeMap[size] || 'md';
  }, [size]);

  // Don't render if no card data
  if (!cardData) {
    return null;
  }

  const isAnyActionInProgress = isPrinting || isDownloading || isRequesting;
  const buttonSize = getButtonSize();

  const layoutClass = layout === 'vertical'
    ? 'flex flex-col gap-3'
    : 'flex flex-wrap items-center gap-3';

  return (
    <div className={`${className}`}>
      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4">
          <Alert
            type="success"
            message={successMessage}
            dismissible
            onDismiss={() => setSuccessMessage('')}
          />
        </div>
      )}

      {errorMessage && (
        <div className="mb-4">
          <Alert
            type="error"
            message={errorMessage}
            dismissible
            onDismiss={() => setErrorMessage('')}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className={layoutClass}>
        {/* Print Button */}
        {showPrint && (
          <Button
            variant="outline"
            size={buttonSize}
            onClick={handlePrint}
            loading={isPrinting}
            loadingText="Printing..."
            disabled={isAnyActionInProgress}
            ariaLabel={`Print ${cardData.coverageType || ''} ID card`}
            leftIcon={
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            }
          >
            Print
          </Button>
        )}

        {/* Download PDF Button */}
        {showDownload && (
          <Button
            variant="primary"
            size={buttonSize}
            onClick={handleDownload}
            loading={isDownloading}
            loadingText="Downloading..."
            disabled={isAnyActionInProgress}
            ariaLabel={`Download ${cardData.coverageType || ''} ID card as PDF`}
            leftIcon={
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            }
          >
            Download PDF
          </Button>
        )}

        {/* Request New Card Button */}
        {showRequestNew && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={handleRequestNew}
            loading={isRequesting}
            loadingText="Requesting..."
            disabled={isAnyActionInProgress}
            ariaLabel={`Request a new ${cardData.coverageType || ''} ID card`}
            leftIcon={
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          >
            Request New Card
          </Button>
        )}
      </div>
    </div>
  );
};

export default IDCardActions;