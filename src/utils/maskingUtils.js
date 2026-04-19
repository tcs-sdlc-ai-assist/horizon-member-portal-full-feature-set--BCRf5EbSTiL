/**
 * maskingUtils - PHI/PII masking utilities for Glassbox compliance
 * Implements the Masking Middleware from the HLD.
 * User Stories: SCRUM-7165, SCRUM-7173
 *
 * Provides utility functions for masking sensitive member data (PHI/PII)
 * before it is captured by Glassbox session replay or analytics.
 * All functions return partially masked strings to maintain some context
 * while protecting sensitive information.
 */

/**
 * Mask a member ID, showing only the last 4 characters.
 * Example: "HBM-100234567" → "***4567"
 *
 * @param {string} id - The member ID to mask
 * @returns {string} The masked member ID, or empty string if invalid
 */
export const maskMemberId = (id) => {
  if (!id || typeof id !== 'string') {
    return '';
  }

  const cleaned = id.trim();

  if (cleaned.length <= 4) {
    return '***' + cleaned;
  }

  return '***' + cleaned.slice(-4);
};

/**
 * Mask a person's name, showing only the first initial of each part.
 * Example: "John Doe" → "J*** D***"
 *
 * @param {string} name - The full name to mask
 * @returns {string} The masked name, or empty string if invalid
 */
export const maskName = (name) => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const cleaned = name.trim();

  if (cleaned.length === 0) {
    return '';
  }

  const parts = cleaned.split(/\s+/);

  return parts
    .map((part) => {
      if (part.length <= 1) {
        return part + '***';
      }
      return part.charAt(0) + '***';
    })
    .join(' ');
};

/**
 * Mask a claim number, showing only the last 5 characters.
 * Example: "HZN-2024-00012345" → "***12345"
 *
 * @param {string} num - The claim number to mask
 * @returns {string} The masked claim number, or empty string if invalid
 */
export const maskClaimNumber = (num) => {
  if (!num || typeof num !== 'string') {
    return '';
  }

  const cleaned = num.trim();

  if (cleaned.length <= 5) {
    return '***' + cleaned;
  }

  return '***' + cleaned.slice(-5);
};

/**
 * Mask a group number, showing only the last 3 characters.
 * Example: "GRP-50012" → "***012"
 *
 * @param {string} num - The group number to mask
 * @returns {string} The masked group number, or empty string if invalid
 */
export const maskGroupNumber = (num) => {
  if (!num || typeof num !== 'string') {
    return '';
  }

  const cleaned = num.trim();

  if (cleaned.length <= 3) {
    return '***' + cleaned;
  }

  return '***' + cleaned.slice(-3);
};

/**
 * Mask a financial amount, replacing with a generic placeholder.
 * Example: 304.00 → "$***.** "
 * Example: "$1,200.00" → "$***.**"
 *
 * @param {number|string} amount - The financial amount to mask
 * @returns {string} The masked financial amount, or empty string if invalid
 */
export const maskFinancialAmount = (amount) => {
  if (amount === null || amount === undefined) {
    return '';
  }

  if (typeof amount === 'number') {
    if (isNaN(amount)) {
      return '';
    }
    return '$***.**';
  }

  if (typeof amount === 'string') {
    const cleaned = amount.trim();

    if (cleaned.length === 0) {
      return '';
    }

    return '$***.**';
  }

  return '';
};

/**
 * Mask a Social Security Number, showing only the last 4 digits.
 * Example: "123-45-6789" → "***-**-6789"
 * Example: "123456789" → "***-**-6789"
 *
 * @param {string} ssn - The SSN to mask
 * @returns {string} The masked SSN, or empty string if invalid
 */
export const maskSSN = (ssn) => {
  if (!ssn || typeof ssn !== 'string') {
    return '';
  }

  const digits = ssn.replace(/\D/g, '');

  if (digits.length < 4) {
    return '***-**-' + digits;
  }

  return '***-**-' + digits.slice(-4);
};

/**
 * Mask a date of birth, showing only the year.
 * Example: "1985-03-15" → "**,**,1985"
 *
 * @param {string} dob - The date of birth to mask
 * @returns {string} The masked date of birth, or empty string if invalid
 */
export const maskDateOfBirth = (dob) => {
  if (!dob || typeof dob !== 'string') {
    return '';
  }

  const cleaned = dob.trim();

  // Handle ISO format YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})-\d{2}-\d{2}/);
  if (isoMatch) {
    return '**/**/' + isoMatch[1];
  }

  // Handle MM/DD/YYYY format
  const usMatch = cleaned.match(/\d{2}\/\d{2}\/(\d{4})/);
  if (usMatch) {
    return '**/**/' + usMatch[1];
  }

  // Fallback: try to extract a 4-digit year
  const yearMatch = cleaned.match(/(\d{4})/);
  if (yearMatch) {
    return '**/**/' + yearMatch[1];
  }

  return '**/**/****';
};

/**
 * Mask an email address, showing only the first character and domain.
 * Example: "john.doe@example.com" → "j***@example.com"
 *
 * @param {string} email - The email address to mask
 * @returns {string} The masked email, or empty string if invalid
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const cleaned = email.trim();
  const atIndex = cleaned.indexOf('@');

  if (atIndex <= 0) {
    return '***';
  }

  const localPart = cleaned.substring(0, atIndex);
  const domain = cleaned.substring(atIndex);

  return localPart.charAt(0) + '***' + domain;
};

/**
 * Mask a phone number, showing only the last 4 digits.
 * Example: "555-123-4567" → "***-***-4567"
 *
 * @param {string} phone - The phone number to mask
 * @returns {string} The masked phone number, or empty string if invalid
 */
export const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const digits = phone.replace(/\D/g, '');

  if (digits.length < 4) {
    return '***-***-' + digits;
  }

  return '***-***-' + digits.slice(-4);
};

/**
 * Mask an address, showing only the city and state.
 * Example: "123 Main Street, Newark, NJ 07101" → "***, Newark, NJ ***"
 *
 * @param {object|string} address - The address to mask (object with city/state or string)
 * @returns {string} The masked address, or empty string if invalid
 */
export const maskAddress = (address) => {
  if (!address) {
    return '';
  }

  if (typeof address === 'object') {
    const city = address.city || '***';
    const state = address.state || '**';
    return '***, ' + city + ', ' + state + ' ***';
  }

  if (typeof address === 'string') {
    const cleaned = address.trim();
    if (cleaned.length === 0) {
      return '';
    }
    return '***';
  }

  return '';
};

/**
 * Get CSS selectors for DOM elements containing PHI/PII that should be
 * masked by Glassbox session replay. These selectors identify elements
 * in the portal UI that display sensitive member information.
 *
 * @returns {string[]} Array of CSS selector strings for PHI/PII elements
 */
export const getMaskingSelectors = () => {
  return [
    // Member identification
    '[data-phi="member-id"]',
    '[data-phi="member-name"]',
    '[data-phi="subscriber-name"]',
    '[data-phi="dependent-name"]',
    '[data-phi="group-number"]',
    '[data-phi="date-of-birth"]',
    '[data-phi="ssn"]',

    // Contact information
    '[data-phi="email"]',
    '[data-phi="phone"]',
    '[data-phi="address"]',

    // Claims and financial
    '[data-phi="claim-number"]',
    '[data-phi="diagnosis-code"]',
    '[data-phi="procedure-code"]',
    '[data-phi="financial-amount"]',
    '[data-phi="billing-amount"]',

    // Prescription / pharmacy
    '[data-phi="rx-id"]',
    '[data-phi="rx-bin"]',
    '[data-phi="rx-pcn"]',
    '[data-phi="rx-group"]',
    '[data-phi="ndc-code"]',

    // ID card fields
    '[data-phi="id-card-field"]',

    // Provider information with member context
    '[data-phi="provider-npi"]',

    // Generic PHI/PII marker
    '[data-phi]',
    '[data-pii]',

    // Common class-based selectors
    '.phi-masked',
    '.pii-masked',
  ];
};

/**
 * Apply masking to a value based on the field type.
 * Convenience function that routes to the appropriate masking function.
 *
 * @param {string} fieldType - The type of field to mask
 * @param {*} value - The value to mask
 * @returns {string} The masked value
 */
export const maskField = (fieldType, value) => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (fieldType) {
    case 'memberId':
      return maskMemberId(String(value));
    case 'name':
    case 'subscriberName':
    case 'dependentName':
      return maskName(String(value));
    case 'claimNumber':
      return maskClaimNumber(String(value));
    case 'groupNumber':
      return maskGroupNumber(String(value));
    case 'financialAmount':
    case 'billingAmount':
      return maskFinancialAmount(value);
    case 'ssn':
      return maskSSN(String(value));
    case 'dateOfBirth':
      return maskDateOfBirth(String(value));
    case 'email':
      return maskEmail(String(value));
    case 'phone':
      return maskPhone(String(value));
    case 'address':
      return maskAddress(value);
    default:
      return '***';
  }
};

/**
 * Mask multiple fields in an object based on a list of field names.
 * Returns a new object with specified fields masked.
 *
 * @param {object} data - The data object containing fields to mask
 * @param {string[]} fieldsToMask - Array of field names to mask
 * @returns {object} A new object with specified fields masked
 */
export const maskFields = (data, fieldsToMask) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  if (!Array.isArray(fieldsToMask) || fieldsToMask.length === 0) {
    return { ...data };
  }

  const masked = { ...data };

  fieldsToMask.forEach((field) => {
    if (field in masked && masked[field] !== null && masked[field] !== undefined) {
      masked[field] = maskField(field, masked[field]);
    }
  });

  return masked;
};
