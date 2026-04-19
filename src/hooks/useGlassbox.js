import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  tagAction as glassboxTagAction,
  tagPageView,
  tagClaimViewed,
  tagDocumentDownloaded,
  tagDocumentViewed,
  tagIdCardViewed,
  tagIdCardDownloaded,
  tagCoverageViewed,
  tagBenefitsViewed,
  tagLoginSuccess,
  tagLoginFailure,
  tagLogout,
  tagSessionTimeout,
  tagSessionExtended,
  tagError,
  tagSupportContacted,
  tagNotificationClicked,
  tagWidgetInteracted,
  isGlassboxEnabled,
  TAG_EVENTS,
} from '../services/GlassboxTagger.js';
import { maskFields, maskField, getMaskingSelectors } from '../utils/maskingUtils.js';

/**
 * useGlassbox - Custom hook wrapping GlassboxTagger service
 * Implements GlassboxIntegration exports (maskFields, tagAction) from the LLD.
 * User Stories: SCRUM-7165, SCRUM-7173
 *
 * Returns { tagAction, isEnabled } along with convenience tagging functions
 * and masking utilities. Automatically includes the current user ID from
 * AuthContext in all tag events. Checks Glassbox enabled state from env
 * and applies masking utilities before tagging.
 *
 * @returns {object} Glassbox integration functions and state
 */
const useGlassbox = () => {
  const { currentUser } = useAuth();

  /**
   * Whether Glassbox tagging is currently enabled via environment configuration.
   */
  const isEnabled = isGlassboxEnabled();

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
   * Tag a Glassbox event with the current user's ID and optional metadata.
   * Applies masking to any sensitive fields specified in metadata.maskedFields
   * before forwarding to the GlassboxTagger service.
   *
   * @param {string} eventName - The Glassbox event name (use TAG_EVENTS constants)
   * @param {object} [metadata={}] - Additional metadata for the tag
   * @param {string[]} [metadata.maskedFields] - Fields that should be masked for PHI/PII compliance
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagAction = useCallback((eventName, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    if (!eventName || typeof eventName !== 'string') {
      return null;
    }

    const userId = getUserId();

    // Apply masking to any sensitive data in metadata before tagging
    let sanitizedMetadata = { ...metadata };

    if (Array.isArray(metadata.maskedFields) && metadata.maskedFields.length > 0) {
      sanitizedMetadata = maskFields(sanitizedMetadata, metadata.maskedFields);
    }

    return glassboxTagAction(eventName, {
      userId,
      ...sanitizedMetadata,
    });
  }, [isEnabled, getUserId]);

  /**
   * Tag a page view event for the current user.
   *
   * @param {string} route - The route being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagPage = useCallback((route, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagPageView(route, userId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a claim viewed event for the current user.
   *
   * @param {string} claimId - The claim ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagClaim = useCallback((claimId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagClaimViewed(userId, claimId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a document downloaded event for the current user.
   *
   * @param {string} documentId - The document ID being downloaded
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagDocDownloaded = useCallback((documentId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagDocumentDownloaded(userId, documentId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a document viewed event for the current user.
   *
   * @param {string} documentId - The document ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagDocViewed = useCallback((documentId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagDocumentViewed(userId, documentId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag an ID card viewed event for the current user.
   *
   * @param {string} cardId - The ID card coverage ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagCardViewed = useCallback((cardId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagIdCardViewed(userId, cardId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag an ID card downloaded event for the current user.
   *
   * @param {string} cardId - The ID card coverage ID being downloaded
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagCardDownloaded = useCallback((cardId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagIdCardDownloaded(userId, cardId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a coverage viewed event for the current user.
   *
   * @param {string} planId - The plan ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagCoverage = useCallback((planId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagCoverageViewed(userId, planId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a benefits viewed event for the current user.
   *
   * @param {string} planId - The plan ID being viewed
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagBenefits = useCallback((planId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagBenefitsViewed(userId, planId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a login success event for the current user.
   *
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagLogin = useCallback((metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagLoginSuccess(userId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a login failure event.
   *
   * @param {string} username - The username that failed authentication
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagLoginFail = useCallback((username, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    return tagLoginFailure(username, metadata);
  }, [isEnabled]);

  /**
   * Tag a logout event for the current user.
   *
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagUserLogout = useCallback((metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagLogout(userId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a session timeout event for the current user.
   *
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagTimeout = useCallback((metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagSessionTimeout(userId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a session extended event for the current user.
   *
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagExtended = useCallback((metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagSessionExtended(userId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag an error occurred event for the current user.
   *
   * @param {string} errorMessage - The error message
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagErrorEvent = useCallback((errorMessage, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagError(userId, errorMessage, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a support contacted event for the current user.
   *
   * @param {string} channel - The support channel used (phone, chat, email)
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagSupport = useCallback((channel, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagSupportContacted(userId, channel, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a notification clicked event for the current user.
   *
   * @param {string} notificationId - The notification ID being clicked
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagNotification = useCallback((notificationId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagNotificationClicked(userId, notificationId, metadata);
  }, [isEnabled, getUserId]);

  /**
   * Tag a widget interacted event for the current user.
   *
   * @param {string} widgetId - The widget ID being interacted with
   * @param {object} [metadata={}] - Additional metadata
   * @returns {object|null} The created tag entry, or null if disabled/invalid
   */
  const tagWidget = useCallback((widgetId, metadata = {}) => {
    if (!isEnabled) {
      return null;
    }

    const userId = getUserId();

    if (!userId && userId !== 0) {
      return null;
    }

    return tagWidgetInteracted(userId, widgetId, metadata);
  }, [isEnabled, getUserId]);

  return {
    isEnabled,
    tagAction,
    tagPage,
    tagClaim,
    tagDocDownloaded,
    tagDocViewed,
    tagCardViewed,
    tagCardDownloaded,
    tagCoverage,
    tagBenefits,
    tagLogin,
    tagLoginFail,
    tagUserLogout,
    tagTimeout,
    tagExtended,
    tagErrorEvent,
    tagSupport,
    tagNotification,
    tagWidget,
    maskFields,
    maskField,
    getMaskingSelectors,
    TAG_EVENTS,
  };
};

export default useGlassbox;