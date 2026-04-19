import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * pdfGenerator.js - PDF generation utility for ID card downloads
 * Uses jspdf and html2canvas to capture ID card DOM elements and
 * generate downloadable PDF files with front and back card views.
 * User Stories: SCRUM-7170
 */

/**
 * Default PDF configuration options.
 */
const PDF_DEFAULTS = {
  orientation: 'landscape',
  unit: 'mm',
  format: [153.0, 85.6], // Standard credit card size in mm (ISO/IEC 7810 ID-1)
  imageQuality: 0.95,
  scale: 2,
  backgroundColor: '#ffffff',
  margin: 5,
};

/**
 * Capture a DOM element as a canvas image using html2canvas.
 *
 * @param {HTMLElement} element - The DOM element to capture
 * @param {object} [options={}] - html2canvas options
 * @returns {Promise<HTMLCanvasElement>} The captured canvas element
 */
const captureElementAsCanvas = async (element, options = {}) => {
  if (!element) {
    throw new Error('Element is required for canvas capture.');
  }

  const canvas = await html2canvas(element, {
    scale: options.scale || PDF_DEFAULTS.scale,
    backgroundColor: options.backgroundColor || PDF_DEFAULTS.backgroundColor,
    useCORS: true,
    allowTaint: false,
    logging: false,
    removeContainer: true,
    ...options,
  });

  return canvas;
};

/**
 * Generate a PDF from a single ID card DOM element (front only).
 * Captures the element as an image and places it in a landscape PDF.
 *
 * @param {HTMLElement} cardElement - The ID card DOM element to capture
 * @param {string} [fileName='id-card.pdf'] - The file name for the downloaded PDF
 * @param {object} [options={}] - Additional PDF generation options
 * @returns {Promise<void>} Resolves when the PDF has been generated and download triggered
 */
export const generateIDCardPDF = async (cardElement, fileName = 'id-card.pdf', options = {}) => {
  if (!cardElement) {
    throw new Error('Card element is required to generate PDF.');
  }

  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  try {
    const canvas = await captureElementAsCanvas(cardElement, {
      scale: options.scale || PDF_DEFAULTS.scale,
      backgroundColor: options.backgroundColor || PDF_DEFAULTS.backgroundColor,
    });

    const imgData = canvas.toDataURL('image/png', PDF_DEFAULTS.imageQuality);

    const pdf = new jsPDF({
      orientation: PDF_DEFAULTS.orientation,
      unit: PDF_DEFAULTS.unit,
      format: [215.9, 279.4], // Letter size in mm
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = options.margin || PDF_DEFAULTS.margin;

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const imgAspectRatio = canvas.width / canvas.height;
    let imgWidth = availableWidth;
    let imgHeight = imgWidth / imgAspectRatio;

    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * imgAspectRatio;
    }

    const xOffset = (pageWidth - imgWidth) / 2;
    const yOffset = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

    pdf.save(safeName);
  } catch (error) {
    console.error('Failed to generate ID card PDF:', error);
    throw new Error('Failed to generate ID card PDF. Please try again.');
  }
};

/**
 * Generate a PDF from front and back ID card DOM elements.
 * Creates a two-page PDF with the front on page 1 and back on page 2.
 *
 * @param {HTMLElement} frontElement - The front of the ID card DOM element
 * @param {HTMLElement} backElement - The back of the ID card DOM element
 * @param {string} [fileName='id-card.pdf'] - The file name for the downloaded PDF
 * @param {object} [options={}] - Additional PDF generation options
 * @returns {Promise<void>} Resolves when the PDF has been generated and download triggered
 */
export const generateIDCardPDFWithBack = async (frontElement, backElement, fileName = 'id-card.pdf', options = {}) => {
  if (!frontElement) {
    throw new Error('Front card element is required to generate PDF.');
  }

  if (!backElement) {
    throw new Error('Back card element is required to generate PDF.');
  }

  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  try {
    const canvasOptions = {
      scale: options.scale || PDF_DEFAULTS.scale,
      backgroundColor: options.backgroundColor || PDF_DEFAULTS.backgroundColor,
    };

    const [frontCanvas, backCanvas] = await Promise.all([
      captureElementAsCanvas(frontElement, canvasOptions),
      captureElementAsCanvas(backElement, canvasOptions),
    ]);

    const frontImgData = frontCanvas.toDataURL('image/png', PDF_DEFAULTS.imageQuality);
    const backImgData = backCanvas.toDataURL('image/png', PDF_DEFAULTS.imageQuality);

    const pdf = new jsPDF({
      orientation: PDF_DEFAULTS.orientation,
      unit: PDF_DEFAULTS.unit,
      format: [215.9, 279.4], // Letter size in mm
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = options.margin || PDF_DEFAULTS.margin;

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    // Page 1: Front of card
    const frontAspectRatio = frontCanvas.width / frontCanvas.height;
    let frontWidth = availableWidth;
    let frontHeight = frontWidth / frontAspectRatio;

    if (frontHeight > availableHeight) {
      frontHeight = availableHeight;
      frontWidth = frontHeight * frontAspectRatio;
    }

    const frontXOffset = (pageWidth - frontWidth) / 2;
    const frontYOffset = (pageHeight - frontHeight) / 2;

    pdf.addImage(frontImgData, 'PNG', frontXOffset, frontYOffset, frontWidth, frontHeight);

    // Page 2: Back of card
    pdf.addPage();

    const backAspectRatio = backCanvas.width / backCanvas.height;
    let backWidth = availableWidth;
    let backHeight = backWidth / backAspectRatio;

    if (backHeight > availableHeight) {
      backHeight = availableHeight;
      backWidth = backHeight * backAspectRatio;
    }

    const backXOffset = (pageWidth - backWidth) / 2;
    const backYOffset = (pageHeight - backHeight) / 2;

    pdf.addImage(backImgData, 'PNG', backXOffset, backYOffset, backWidth, backHeight);

    pdf.save(safeName);
  } catch (error) {
    console.error('Failed to generate ID card PDF with front and back:', error);
    throw new Error('Failed to generate ID card PDF. Please try again.');
  }
};

/**
 * Generate a PDF containing multiple ID cards (e.g., Medical, Dental, Vision).
 * Each card front/back pair is placed on its own page(s).
 *
 * @param {Array<{front: HTMLElement, back: HTMLElement|null, label: string}>} cards - Array of card element pairs
 * @param {string} [fileName='id-cards.pdf'] - The file name for the downloaded PDF
 * @param {object} [options={}] - Additional PDF generation options
 * @returns {Promise<void>} Resolves when the PDF has been generated and download triggered
 */
export const generateMultipleIDCardsPDF = async (cards, fileName = 'id-cards.pdf', options = {}) => {
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    throw new Error('At least one card element pair is required to generate PDF.');
  }

  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  try {
    const canvasOptions = {
      scale: options.scale || PDF_DEFAULTS.scale,
      backgroundColor: options.backgroundColor || PDF_DEFAULTS.backgroundColor,
    };

    const pdf = new jsPDF({
      orientation: PDF_DEFAULTS.orientation,
      unit: PDF_DEFAULTS.unit,
      format: [215.9, 279.4], // Letter size in mm
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = options.margin || PDF_DEFAULTS.margin;

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (!card.front) {
        continue;
      }

      if (i > 0) {
        pdf.addPage();
      }

      // Add label header if provided
      if (card.label) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 70, 139); // horizon-primary color
        pdf.text(card.label + ' - Front', margin, margin + 5);
      }

      const frontCanvas = await captureElementAsCanvas(card.front, canvasOptions);
      const frontImgData = frontCanvas.toDataURL('image/png', PDF_DEFAULTS.imageQuality);

      const frontAspectRatio = frontCanvas.width / frontCanvas.height;
      const labelOffset = card.label ? 15 : 0;
      const adjustedAvailableHeight = availableHeight - labelOffset;

      let frontWidth = availableWidth;
      let frontHeight = frontWidth / frontAspectRatio;

      if (frontHeight > adjustedAvailableHeight) {
        frontHeight = adjustedAvailableHeight;
        frontWidth = frontHeight * frontAspectRatio;
      }

      const frontXOffset = (pageWidth - frontWidth) / 2;
      const frontYOffset = margin + labelOffset + (adjustedAvailableHeight - frontHeight) / 2;

      pdf.addImage(frontImgData, 'PNG', frontXOffset, frontYOffset, frontWidth, frontHeight);

      // Add back of card on next page if provided
      if (card.back) {
        pdf.addPage();

        if (card.label) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 70, 139);
          pdf.text(card.label + ' - Back', margin, margin + 5);
        }

        const backCanvas = await captureElementAsCanvas(card.back, canvasOptions);
        const backImgData = backCanvas.toDataURL('image/png', PDF_DEFAULTS.imageQuality);

        const backAspectRatio = backCanvas.width / backCanvas.height;

        let backWidth = availableWidth;
        let backHeight = backWidth / backAspectRatio;

        if (backHeight > adjustedAvailableHeight) {
          backHeight = adjustedAvailableHeight;
          backWidth = backHeight * backAspectRatio;
        }

        const backXOffset = (pageWidth - backWidth) / 2;
        const backYOffset = margin + labelOffset + (adjustedAvailableHeight - backHeight) / 2;

        pdf.addImage(backImgData, 'PNG', backXOffset, backYOffset, backWidth, backHeight);
      }
    }

    pdf.save(safeName);
  } catch (error) {
    console.error('Failed to generate multiple ID cards PDF:', error);
    throw new Error('Failed to generate ID cards PDF. Please try again.');
  }
};

/**
 * Generate a sanitized file name for an ID card PDF download.
 *
 * @param {string} coverageType - The coverage type (e.g., "Medical", "Dental", "Vision")
 * @param {string} [memberName=''] - The member name to include in the file name
 * @returns {string} A sanitized file name string ending in .pdf
 */
export const generateIDCardFileName = (coverageType, memberName = '') => {
  const sanitize = (str) => {
    return str
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .trim();
  };

  const type = sanitize(coverageType || 'id-card');
  const name = sanitize(memberName);
  const date = new Date().toISOString().split('T')[0];

  if (name) {
    return `${type}-id-card-${name}-${date}.pdf`;
  }

  return `${type}-id-card-${date}.pdf`;
};