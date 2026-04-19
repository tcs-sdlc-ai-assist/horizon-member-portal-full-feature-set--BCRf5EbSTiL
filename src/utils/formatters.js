import { CLAIM_STATUS, CLAIM_STATUS_LABELS, CLAIM_STATUS_VARIANTS } from './constants.js';

/**
 * formatters.js - Data display formatting utilities
 * Provides formatting functions for currency, dates, claim statuses,
 * phone numbers, percentages, text truncation, and status badge classes.
 * User Stories: SCRUM-7168, SCRUM-7171, SCRUM-7172
 */

/**
 * Format a numeric amount as US currency.
 * Example: 304 → "$304.00", 1200.5 → "$1,200.50"
 *
 * @param {number|string} amount - The amount to format
 * @returns {string} The formatted currency string, or "$0.00" if invalid
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : Number(amount);

  if (isNaN(num)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format a date string for display.
 * Supports multiple output formats.
 *
 * @param {string} dateString - The date string to format (ISO or other parseable format)
 * @param {string} [format='MM/DD/YYYY'] - The desired output format
 *   Supported: 'MM/DD/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY h:mm A', 'MMMM YYYY',
 *              'MMM D', 'MMMM D, YYYY', 'short', 'long', 'iso'
 * @returns {string} The formatted date string, or empty string if invalid
 */
export const formatDate = (dateString, format = 'MM/DD/YYYY') => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthShortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;

    case 'YYYY-MM-DD':
    case 'iso':
      return `${year}-${month}-${day}`;

    case 'MM/DD/YYYY h:mm A': {
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours === 0 ? 12 : hours;
      return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
    }

    case 'MMMM YYYY':
      return `${monthNames[date.getMonth()]} ${year}`;

    case 'MMM D':
    case 'short':
      return `${monthShortNames[date.getMonth()]} ${date.getDate()}`;

    case 'MMMM D, YYYY':
    case 'long':
      return `${monthNames[date.getMonth()]} ${date.getDate()}, ${year}`;

    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Format a claim status string into a human-readable label.
 * Example: "in_review" → "In Review", "approved" → "Approved"
 *
 * @param {string} status - The claim status value
 * @returns {string} The formatted status label, or the original status if not recognized
 */
export const formatClaimStatus = (status) => {
  if (!status || typeof status !== 'string') {
    return '';
  }

  const normalized = status.toLowerCase().trim();

  if (CLAIM_STATUS_LABELS[normalized]) {
    return CLAIM_STATUS_LABELS[normalized];
  }

  // Fallback: convert snake_case to Title Case
  return normalized
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format a phone number string into a standard US format.
 * Example: "5551234567" → "(555) 123-4567"
 * Example: "1-800-355-2583" → "(800) 355-2583"
 *
 * @param {string} phone - The phone number to format
 * @returns {string} The formatted phone number, or the original string if not parseable
 */
export const formatPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const digits = phone.replace(/\D/g, '');

  // Handle 11-digit numbers starting with 1 (US country code)
  if (digits.length === 11 && digits.charAt(0) === '1') {
    const area = digits.substring(1, 4);
    const prefix = digits.substring(4, 7);
    const line = digits.substring(7, 11);
    return `(${area}) ${prefix}-${line}`;
  }

  // Handle standard 10-digit numbers
  if (digits.length === 10) {
    const area = digits.substring(0, 3);
    const prefix = digits.substring(3, 6);
    const line = digits.substring(6, 10);
    return `(${area}) ${prefix}-${line}`;
  }

  // Handle 7-digit numbers (no area code)
  if (digits.length === 7) {
    const prefix = digits.substring(0, 3);
    const line = digits.substring(3, 7);
    return `${prefix}-${line}`;
  }

  // Return original if we can't parse it
  return phone;
};

/**
 * Format a numeric value as a percentage.
 * Example: 0.85 → "85%", 56.7 → "57%", 100 → "100%"
 *
 * @param {number|string} value - The value to format as a percentage.
 *   Values <= 1 are treated as decimals (0.85 → 85%).
 *   Values > 1 are treated as already being percentages (85 → 85%).
 * @param {number} [decimals=0] - Number of decimal places to show
 * @returns {string} The formatted percentage string, or "0%" if invalid
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) {
    return '0%';
  }

  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(num)) {
    return '0%';
  }

  // If value is between 0 and 1 (exclusive), treat as decimal
  const percentage = (num > 0 && num <= 1) ? num * 100 : num;

  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Truncate text to a maximum length, appending an ellipsis if truncated.
 * Example: truncateText("Hello World", 5) → "Hello..."
 *
 * @param {string} text - The text to truncate
 * @param {number} [maxLength=100] - The maximum length before truncation
 * @returns {string} The truncated text with ellipsis, or original text if within limit
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const cleaned = text.trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength).trimEnd() + '...';
};

/**
 * Get the appropriate HB CSS badge class for a claim or notification status.
 * Maps status values to the HB badge system classes defined in index.css.
 *
 * @param {string} status - The status value (claim status, notification type, etc.)
 * @returns {string} The HB CSS badge class string (e.g., "hb-badge hb-badge-success")
 */
export const getStatusBadgeClass = (status) => {
  if (!status || typeof status !== 'string') {
    return 'hb-badge hb-badge-neutral';
  }

  const normalized = status.toLowerCase().trim();

  // Check CLAIM_STATUS_VARIANTS first
  if (CLAIM_STATUS_VARIANTS[normalized]) {
    const variant = CLAIM_STATUS_VARIANTS[normalized];
    return `hb-badge hb-badge-${variant}`;
  }

  // Map notification and general status types
  const statusMap = {
    // Claim statuses
    approved: 'success',
    partially_approved: 'warning',
    denied: 'error',
    pending: 'warning',
    in_review: 'warning',
    submitted: 'info',
    received: 'info',
    appealed: 'info',
    closed: 'neutral',
    voided: 'neutral',

    // Notification types
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    action: 'error',
    system: 'info',

    // Coverage statuses
    active: 'success',
    inactive: 'neutral',
    terminated: 'error',

    // Prior auth statuses
    draft: 'neutral',
    expired: 'neutral',
    cancelled: 'neutral',
  };

  const variant = statusMap[normalized] || 'neutral';

  return `hb-badge hb-badge-${variant}`;
};