import { GLASSBOX_EVENTS } from '../utils/constants.js';

/**
 * AuditLogStore - Audit log data persistence layer
 * Implements the AuditLogStore component from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7166
 *
 * Maintains an in-memory array of audit log entries for sensitive actions
 * such as document downloads, ID card downloads, and claim views.
 */

const auditLogs = [];

let nextLogId = 1;

/**
 * Valid audit actions that can be logged.
 */
const VALID_ACTIONS = [
  GLASSBOX_EVENTS.DOCUMENT_DOWNLOADED,
  GLASSBOX_EVENTS.DOCUMENT_VIEWED,
  GLASSBOX_EVENTS.ID_CARD_DOWNLOADED,
  GLASSBOX_EVENTS.ID_CARD_VIEWED,
  GLASSBOX_EVENTS.CLAIM_VIEWED,
  GLASSBOX_EVENTS.LOGIN_SUCCESS,
  GLASSBOX_EVENTS.LOGIN_FAILURE,
  GLASSBOX_EVENTS.LOGOUT,
  GLASSBOX_EVENTS.SESSION_TIMEOUT,
  GLASSBOX_EVENTS.SESSION_EXTENDED,
  GLASSBOX_EVENTS.PROFILE_UPDATED,
  GLASSBOX_EVENTS.SUPPORT_CONTACTED,
  GLASSBOX_EVENTS.PRIOR_AUTH_SUBMITTED,
  GLASSBOX_EVENTS.PRIOR_AUTH_VIEWED,
  GLASSBOX_EVENTS.ERROR_OCCURRED,
  GLASSBOX_EVENTS.COVERAGE_VIEWED,
  GLASSBOX_EVENTS.BENEFITS_VIEWED,
  GLASSBOX_EVENTS.SPENDING_VIEWED,
  GLASSBOX_EVENTS.FIND_CARE_SEARCHED,
  GLASSBOX_EVENTS.MESSAGE_SENT,
  GLASSBOX_EVENTS.MESSAGE_READ,
  GLASSBOX_EVENTS.NOTIFICATION_CLICKED,
  GLASSBOX_EVENTS.NOTIFICATION_DISMISSED,
  GLASSBOX_EVENTS.PAGE_VIEW,
  GLASSBOX_EVENTS.CLAIM_SEARCHED,
  GLASSBOX_EVENTS.CLAIM_FILTERED,
  GLASSBOX_EVENTS.WIDGET_INTERACTED,
];

/**
 * Generate a unique audit log ID.
 * @returns {string} A unique log ID string
 */
const generateLogId = () => {
  const id = `audit_${String(nextLogId).padStart(6, '0')}`;
  nextLogId++;
  return id;
};

/**
 * Add a new audit log entry.
 * @param {object} entry - The audit log entry to add
 * @param {number|string} entry.userId - The user ID performing the action
 * @param {string} entry.action - The action type being logged
 * @param {string} [entry.resourceId] - The resource ID related to the action
 * @param {object} [entry.metadata] - Additional metadata for the log entry
 * @returns {object|null} The created log entry with id and timestamp, or null if invalid
 */
export const addLog = (entry) => {
  if (!entry || !entry.userId || !entry.action) {
    return null;
  }

  if (typeof entry.action !== 'string') {
    return null;
  }

  const logEntry = {
    id: generateLogId(),
    userId: entry.userId,
    action: entry.action,
    resourceId: entry.resourceId || null,
    timestamp: entry.timestamp || new Date().toISOString(),
    metadata: entry.metadata || {},
  };

  auditLogs.push(logEntry);

  return { ...logEntry };
};

/**
 * Get all audit log entries.
 * @returns {Array<object>} A copy of all audit log entries, sorted by timestamp descending
 */
export const getLogs = () => {
  return [...auditLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Get audit log entries filtered by user ID.
 * @param {number|string} userId - The user ID to filter by
 * @returns {Array<object>} Audit log entries for the specified user, sorted by timestamp descending
 */
export const getLogsByUser = (userId) => {
  if (userId === undefined || userId === null) {
    return [];
  }

  return auditLogs
    .filter((log) => log.userId === userId)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .map((log) => ({ ...log }));
};

/**
 * Get audit log entries filtered by action type.
 * @param {string} actionType - The action type to filter by
 * @returns {Array<object>} Audit log entries for the specified action, sorted by timestamp descending
 */
export const getLogsByAction = (actionType) => {
  if (!actionType || typeof actionType !== 'string') {
    return [];
  }

  return auditLogs
    .filter((log) => log.action === actionType)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .map((log) => ({ ...log }));
};

/**
 * Get audit log entries filtered by resource ID.
 * @param {string} resourceId - The resource ID to filter by
 * @returns {Array<object>} Audit log entries for the specified resource, sorted by timestamp descending
 */
export const getLogsByResource = (resourceId) => {
  if (!resourceId || typeof resourceId !== 'string') {
    return [];
  }

  return auditLogs
    .filter((log) => log.resourceId === resourceId)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .map((log) => ({ ...log }));
};

/**
 * Get the total count of audit log entries.
 * @returns {number} The total number of audit log entries
 */
export const getLogCount = () => {
  return auditLogs.length;
};

/**
 * Clear all audit log entries (useful for testing).
 */
export const clearLogs = () => {
  auditLogs.length = 0;
  nextLogId = 1;
};

/**
 * Get the list of valid audit actions.
 * @returns {Array<string>} Array of valid action strings
 */
export const getValidActions = () => {
  return [...VALID_ACTIONS];
};