import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  logAction as auditLogAction,
  logDocumentDownload,
  logDocumentViewed,
  logEobDownload,
  logIdCardDownload,
  logIdCardPrint,
  logIdCardViewed,
  logClaimOpened,
  logExternalLinkClick,
  logNewCardRequest,
  logPageView,
  AUDIT_ACTIONS,
} from '../services/AuditLogger.js';

/**
 * useAuditLog - Custom hook wrapping AuditLogger service
 * Implements audit logging convenience hook from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7166
 *
 * Automatically includes the current user ID from AuthContext in all audit log entries.
 * Returns logging functions that components can call without needing to pass userId.
 *
 * @returns {object} Audit logging functions bound to the current user
 */
const useAuditLog = () => {
  const { currentUser } = useAuth();

  /**
   * Get the current user ID, or null if not authenticated.
   *
   * @returns {number|string|null} The current user ID
   */
  const getUserId = useCallback(() => {
    if (!currentUser) {
      return null;
    }
    return currentUser.id;
  }, [currentUser]);

  /**
   * Log a generic audit action with the current user's ID.
   *
   * @param {string} action - The action type being logged (use AUDIT_ACTIONS constants)
   * @param {object} [metadata={}] - Additional metadata for the log entry
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logAction = useCallback((action, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return auditLogAction(userId, action, metadata);
  }, [getUserId]);

  /**
   * Log a document download action.
   *
   * @param {string} documentId - The document ID being downloaded
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logDocDownload = useCallback((documentId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logDocumentDownload(userId, documentId, metadata);
  }, [getUserId]);

  /**
   * Log a document viewed action.
   *
   * @param {string} documentId - The document ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logDocViewed = useCallback((documentId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logDocumentViewed(userId, documentId, metadata);
  }, [getUserId]);

  /**
   * Log an EOB download action.
   *
   * @param {string} documentId - The EOB document ID being downloaded
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logEob = useCallback((documentId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logEobDownload(userId, documentId, metadata);
  }, [getUserId]);

  /**
   * Log an ID card download action.
   *
   * @param {string} cardId - The ID card coverage ID being downloaded
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logCardDownload = useCallback((cardId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logIdCardDownload(userId, cardId, metadata);
  }, [getUserId]);

  /**
   * Log an ID card print action.
   *
   * @param {string} cardId - The ID card coverage ID being printed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logCardPrint = useCallback((cardId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logIdCardPrint(userId, cardId, metadata);
  }, [getUserId]);

  /**
   * Log an ID card viewed action.
   *
   * @param {string} cardId - The ID card coverage ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logCardViewed = useCallback((cardId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logIdCardViewed(userId, cardId, metadata);
  }, [getUserId]);

  /**
   * Log a claim opened/viewed action.
   *
   * @param {string} claimId - The claim ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logClaim = useCallback((claimId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logClaimOpened(userId, claimId, metadata);
  }, [getUserId]);

  /**
   * Log an external link click action.
   *
   * @param {string} url - The external URL being navigated to
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logExternalLink = useCallback((url, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logExternalLinkClick(userId, url, metadata);
  }, [getUserId]);

  /**
   * Log a new card request action.
   *
   * @param {string} cardId - The ID card coverage ID for the request
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logCardRequest = useCallback((cardId, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logNewCardRequest(userId, cardId, metadata);
  }, [getUserId]);

  /**
   * Log a page view action.
   *
   * @param {string} route - The route being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created audit log entry, or null if invalid
   */
  const logPage = useCallback((route, metadata = {}) => {
    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return logPageView(userId, route, metadata);
  }, [getUserId]);

  return {
    logAction,
    logDocDownload,
    logDocViewed,
    logEob,
    logCardDownload,
    logCardPrint,
    logCardViewed,
    logClaim,
    logExternalLink,
    logCardRequest,
    logPage,
    AUDIT_ACTIONS,
  };
};

export default useAuditLog;