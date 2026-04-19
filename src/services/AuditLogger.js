import { addLog, getLogs, getLogsByUser, getLogsByAction, getLogsByResource } from '../stores/AuditLogStore.js';
import { addTag } from '../stores/GlassboxTagStore.js';
import { GLASSBOX_EVENTS, APP } from '../utils/constants.js';

/**
 * AuditLogger - Audit logging service for compliance
 * Implements the AuditLogger component from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7166
 *
 * Wraps AuditLogStore to provide a high-level API for recording audit entries
 * for sensitive actions such as document downloads, ID card downloads, claim views,
 * login/logout events, and external link clicks.
 */

/**
 * Supported audit actions.
 */
export const AUDIT_ACTIONS = {
  LOGIN: GLASSBOX_EVENTS.LOGIN_SUCCESS,
  LOGIN_FAILURE: GLASSBOX_EVENTS.LOGIN_FAILURE,
  LOGOUT: GLASSBOX_EVENTS.LOGOUT,
  SESSION_TIMEOUT: GLASSBOX_EVENTS.SESSION_TIMEOUT,
  SESSION_EXTENDED: GLASSBOX_EVENTS.SESSION_EXTENDED,
  ID_CARD_DOWNLOAD: GLASSBOX_EVENTS.ID_CARD_DOWNLOADED,
  ID_CARD_PRINT: 'id_card_print',
  ID_CARD_VIEWED: GLASSBOX_EVENTS.ID_CARD_VIEWED,
  DOCUMENT_DOWNLOAD: GLASSBOX_EVENTS.DOCUMENT_DOWNLOADED,
  DOCUMENT_VIEWED: GLASSBOX_EVENTS.DOCUMENT_VIEWED,
  EOB_DOWNLOAD: 'eob_download',
  EXTERNAL_LINK_CLICK: 'external_link_click',
  CLAIM_OPENED: GLASSBOX_EVENTS.CLAIM_VIEWED,
  CLAIM_SEARCHED: GLASSBOX_EVENTS.CLAIM_SEARCHED,
  CLAIM_FILTERED: GLASSBOX_EVENTS.CLAIM_FILTERED,
  NEW_CARD_REQUEST: 'new_card_request',
  COVERAGE_VIEWED: GLASSBOX_EVENTS.COVERAGE_VIEWED,
  BENEFITS_VIEWED: GLASSBOX_EVENTS.BENEFITS_VIEWED,
  SPENDING_VIEWED: GLASSBOX_EVENTS.SPENDING_VIEWED,
  PROFILE_UPDATED: GLASSBOX_EVENTS.PROFILE_UPDATED,
  SUPPORT_CONTACTED: GLASSBOX_EVENTS.SUPPORT_CONTACTED,
  FIND_CARE_SEARCHED: GLASSBOX_EVENTS.FIND_CARE_SEARCHED,
  PRIOR_AUTH_SUBMITTED: GLASSBOX_EVENTS.PRIOR_AUTH_SUBMITTED,
  PRIOR_AUTH_VIEWED: GLASSBOX_EVENTS.PRIOR_AUTH_VIEWED,
  NOTIFICATION_CLICKED: GLASSBOX_EVENTS.NOTIFICATION_CLICKED,
  NOTIFICATION_DISMISSED: GLASSBOX_EVENTS.NOTIFICATION_DISMISSED,
  ERROR_OCCURRED: GLASSBOX_EVENTS.ERROR_OCCURRED,
  WIDGET_INTERACTED: GLASSBOX_EVENTS.WIDGET_INTERACTED,
  MESSAGE_SENT: GLASSBOX_EVENTS.MESSAGE_SENT,
  MESSAGE_READ: GLASSBOX_EVENTS.MESSAGE_READ,
  PAGE_VIEW: GLASSBOX_EVENTS.PAGE_VIEW,
};

/**
 * Log a sensitive action for audit and compliance purposes.
 * Creates a timestamped audit entry in the AuditLogStore and optionally
 * tags the event in GlassboxTagStore if Glassbox is enabled.
 *
 * @param {number|string} userId - The user ID performing the action
 * @param {string} action - The action type being logged (use AUDIT_ACTIONS constants)
 * @param {object} [metadata={}] - Additional metadata for the log entry
 * @param {string} [metadata.resourceId] - The resource ID related to the action
 * @param {string} [metadata.route] - The route where the action occurred
 * @param {string[]} [metadata.maskedFields] - Fields that should be masked for compliance
 * @returns {object|null} The created audit log entry, or null if invalid input
 */
export const logAction = (userId, action, metadata = {}) => {
  if (!userId && userId !== 0) {
    return null;
  }

  if (!action || typeof action !== 'string') {
    return null;
  }

  const { resourceId, route, maskedFields, ...restMetadata } = metadata;

  const logEntry = addLog({
    userId,
    action,
    resourceId: resourceId || null,
    metadata: {
      ...restMetadata,
      route: route || null,
      timestamp: new Date().toISOString(),
    },
  });

  if (!logEntry) {
    return null;
  }

  // Tag Glassbox event if enabled
  if (APP.GLASSBOX_ENABLED) {
    addTag({
      eventName: action,
      metadata: {
        userId,
        route: route || null,
        maskedFields: maskedFields || [],
        resourceId: resourceId || null,
      },
    });
  }

  return logEntry;
};

/**
 * Log a document download action.
 *
 * @param {number|string} userId - The user ID performing the download
 * @param {string} documentId - The document ID being downloaded
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logDocumentDownload = (userId, documentId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.DOCUMENT_DOWNLOAD, {
    resourceId: documentId,
    maskedFields: ['memberId', 'claimNumber'],
    ...metadata,
  });
};

/**
 * Log a document viewed action.
 *
 * @param {number|string} userId - The user ID viewing the document
 * @param {string} documentId - The document ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logDocumentViewed = (userId, documentId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.DOCUMENT_VIEWED, {
    resourceId: documentId,
    ...metadata,
  });
};

/**
 * Log an EOB download action.
 *
 * @param {number|string} userId - The user ID performing the download
 * @param {string} documentId - The EOB document ID being downloaded
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logEobDownload = (userId, documentId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.EOB_DOWNLOAD, {
    resourceId: documentId,
    maskedFields: ['memberId', 'claimNumber'],
    ...metadata,
  });
};

/**
 * Log an ID card download action.
 *
 * @param {number|string} userId - The user ID performing the download
 * @param {string} cardId - The ID card coverage ID being downloaded
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logIdCardDownload = (userId, cardId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.ID_CARD_DOWNLOAD, {
    resourceId: cardId,
    maskedFields: ['memberId', 'groupNumber', 'subscriberName', 'dateOfBirth'],
    ...metadata,
  });
};

/**
 * Log an ID card print action.
 *
 * @param {number|string} userId - The user ID printing the card
 * @param {string} cardId - The ID card coverage ID being printed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logIdCardPrint = (userId, cardId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.ID_CARD_PRINT, {
    resourceId: cardId,
    maskedFields: ['memberId', 'groupNumber', 'subscriberName', 'dateOfBirth'],
    ...metadata,
  });
};

/**
 * Log an ID card viewed action.
 *
 * @param {number|string} userId - The user ID viewing the card
 * @param {string} cardId - The ID card coverage ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logIdCardViewed = (userId, cardId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.ID_CARD_VIEWED, {
    resourceId: cardId,
    ...metadata,
  });
};

/**
 * Log a claim opened/viewed action.
 *
 * @param {number|string} userId - The user ID viewing the claim
 * @param {string} claimId - The claim ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logClaimOpened = (userId, claimId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.CLAIM_OPENED, {
    resourceId: claimId,
    maskedFields: ['memberId', 'claimNumber', 'diagnosisCodes'],
    ...metadata,
  });
};

/**
 * Log an external link click action.
 *
 * @param {number|string} userId - The user ID clicking the link
 * @param {string} url - The external URL being navigated to
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logExternalLinkClick = (userId, url, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.EXTERNAL_LINK_CLICK, {
    resourceId: url,
    url,
    ...metadata,
  });
};

/**
 * Log a new card request action.
 *
 * @param {number|string} userId - The user ID requesting a new card
 * @param {string} cardId - The ID card coverage ID for the request
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logNewCardRequest = (userId, cardId, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.NEW_CARD_REQUEST, {
    resourceId: cardId,
    maskedFields: ['memberId', 'groupNumber', 'subscriberName'],
    ...metadata,
  });
};

/**
 * Log a page view action.
 *
 * @param {number|string} userId - The user ID viewing the page
 * @param {string} route - The route being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created audit log entry, or null if invalid
 */
export const logPageView = (userId, route, metadata = {}) => {
  return logAction(userId, AUDIT_ACTIONS.PAGE_VIEW, {
    route,
    ...metadata,
  });
};

/**
 * Retrieve all audit logs.
 *
 * @returns {Array<object>} All audit log entries sorted by timestamp descending
 */
export const getAuditLogs = () => {
  return getLogs();
};

/**
 * Retrieve audit logs for a specific user.
 *
 * @param {number|string} userId - The user ID to filter by
 * @returns {Array<object>} Audit log entries for the specified user
 */
export const getAuditLogsByUser = (userId) => {
  return getLogsByUser(userId);
};

/**
 * Retrieve audit logs for a specific action type.
 *
 * @param {string} action - The action type to filter by
 * @returns {Array<object>} Audit log entries for the specified action
 */
export const getAuditLogsByAction = (action) => {
  return getLogsByAction(action);
};

/**
 * Retrieve audit logs for a specific resource.
 *
 * @param {string} resourceId - The resource ID to filter by
 * @returns {Array<object>} Audit log entries for the specified resource
 */
export const getAuditLogsByResource = (resourceId) => {
  return getLogsByResource(resourceId);
};