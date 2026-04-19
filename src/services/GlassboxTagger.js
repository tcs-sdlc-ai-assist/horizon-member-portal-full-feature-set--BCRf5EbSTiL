import { addTag, getTags, getTagsByType, getTagsByUser, getTagsByRoute } from '../stores/GlassboxTagStore.js';
import { GLASSBOX_EVENTS, APP } from '../utils/constants.js';

/**
 * GlassboxTagger - Glassbox analytics event tagging service
 * Implements the GlassboxTagger component from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7165
 *
 * Wraps GlassboxTagStore to provide a high-level API for recording tagged events
 * for Glassbox session replay masking and analytics. Checks VITE_GLASSBOX_ENABLED
 * before recording events. Event names align with GLASSBOX_EVENTS constants.
 */

/**
 * Supported Glassbox tag event names, re-exported for convenience.
 */
export const TAG_EVENTS = {
  PAGE_VIEW: GLASSBOX_EVENTS.PAGE_VIEW,
  LOGIN_SUCCESS: GLASSBOX_EVENTS.LOGIN_SUCCESS,
  LOGIN_FAILURE: GLASSBOX_EVENTS.LOGIN_FAILURE,
  LOGOUT: GLASSBOX_EVENTS.LOGOUT,
  SESSION_TIMEOUT: GLASSBOX_EVENTS.SESSION_TIMEOUT,
  SESSION_EXTENDED: GLASSBOX_EVENTS.SESSION_EXTENDED,
  CLAIM_OPENED: GLASSBOX_EVENTS.CLAIM_VIEWED,
  CLAIM_SEARCHED: GLASSBOX_EVENTS.CLAIM_SEARCHED,
  CLAIM_FILTERED: GLASSBOX_EVENTS.CLAIM_FILTERED,
  DOCUMENT_DOWNLOADED: GLASSBOX_EVENTS.DOCUMENT_DOWNLOADED,
  DOCUMENT_VIEWED: GLASSBOX_EVENTS.DOCUMENT_VIEWED,
  ID_CARD_VIEWED: GLASSBOX_EVENTS.ID_CARD_VIEWED,
  ID_CARD_DOWNLOADED: GLASSBOX_EVENTS.ID_CARD_DOWNLOADED,
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
};

/**
 * Check if Glassbox tagging is enabled via environment configuration.
 *
 * @returns {boolean} True if Glassbox is enabled
 */
export const isGlassboxEnabled = () => {
  return APP.GLASSBOX_ENABLED === true;
};

/**
 * Tag a Glassbox event for session replay masking and analytics.
 * Only records the tag if Glassbox is enabled via VITE_GLASSBOX_ENABLED.
 *
 * @param {string} eventName - The Glassbox event name (use TAG_EVENTS constants)
 * @param {object} [metadata={}] - Additional metadata for the tag
 * @param {number|string} [metadata.userId] - The user ID associated with the event
 * @param {string} [metadata.route] - The route where the event occurred
 * @param {string[]} [metadata.maskedFields] - Fields that should be masked for PHI/PII compliance
 * @param {string} [metadata.resourceId] - The resource ID related to the event
 * @returns {object|null} The created tag entry, or null if Glassbox is disabled or input is invalid
 */
export const tagAction = (eventName, metadata = {}) => {
  if (!isGlassboxEnabled()) {
    return null;
  }

  if (!eventName || typeof eventName !== 'string') {
    return null;
  }

  const tagEntry = addTag({
    eventName,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });

  return tagEntry;
};

/**
 * Tag a page view event.
 *
 * @param {string} route - The route being viewed
 * @param {number|string} userId - The user ID viewing the page
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagPageView = (route, userId, metadata = {}) => {
  return tagAction(TAG_EVENTS.PAGE_VIEW, {
    route,
    userId,
    ...metadata,
  });
};

/**
 * Tag a claim viewed event.
 *
 * @param {number|string} userId - The user ID viewing the claim
 * @param {string} claimId - The claim ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagClaimViewed = (userId, claimId, metadata = {}) => {
  return tagAction(TAG_EVENTS.CLAIM_OPENED, {
    userId,
    resourceId: claimId,
    maskedFields: ['memberId', 'claimNumber', 'diagnosisCodes'],
    ...metadata,
  });
};

/**
 * Tag a document downloaded event.
 *
 * @param {number|string} userId - The user ID downloading the document
 * @param {string} documentId - The document ID being downloaded
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagDocumentDownloaded = (userId, documentId, metadata = {}) => {
  return tagAction(TAG_EVENTS.DOCUMENT_DOWNLOADED, {
    userId,
    resourceId: documentId,
    maskedFields: ['memberId', 'claimNumber'],
    ...metadata,
  });
};

/**
 * Tag a document viewed event.
 *
 * @param {number|string} userId - The user ID viewing the document
 * @param {string} documentId - The document ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagDocumentViewed = (userId, documentId, metadata = {}) => {
  return tagAction(TAG_EVENTS.DOCUMENT_VIEWED, {
    userId,
    resourceId: documentId,
    ...metadata,
  });
};

/**
 * Tag an ID card viewed event.
 *
 * @param {number|string} userId - The user ID viewing the ID card
 * @param {string} cardId - The ID card coverage ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagIdCardViewed = (userId, cardId, metadata = {}) => {
  return tagAction(TAG_EVENTS.ID_CARD_VIEWED, {
    userId,
    resourceId: cardId,
    maskedFields: ['memberId', 'groupNumber', 'subscriberName', 'dateOfBirth'],
    ...metadata,
  });
};

/**
 * Tag an ID card downloaded event.
 *
 * @param {number|string} userId - The user ID downloading the ID card
 * @param {string} cardId - The ID card coverage ID being downloaded
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagIdCardDownloaded = (userId, cardId, metadata = {}) => {
  return tagAction(TAG_EVENTS.ID_CARD_DOWNLOADED, {
    userId,
    resourceId: cardId,
    maskedFields: ['memberId', 'groupNumber', 'subscriberName', 'dateOfBirth'],
    ...metadata,
  });
};

/**
 * Tag a coverage viewed event.
 *
 * @param {number|string} userId - The user ID viewing coverage
 * @param {string} planId - The plan ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagCoverageViewed = (userId, planId, metadata = {}) => {
  return tagAction(TAG_EVENTS.COVERAGE_VIEWED, {
    userId,
    resourceId: planId,
    ...metadata,
  });
};

/**
 * Tag a benefits viewed event.
 *
 * @param {number|string} userId - The user ID viewing benefits
 * @param {string} planId - The plan ID being viewed
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagBenefitsViewed = (userId, planId, metadata = {}) => {
  return tagAction(TAG_EVENTS.BENEFITS_VIEWED, {
    userId,
    resourceId: planId,
    ...metadata,
  });
};

/**
 * Tag a login success event.
 *
 * @param {number|string} userId - The user ID that logged in
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagLoginSuccess = (userId, metadata = {}) => {
  return tagAction(TAG_EVENTS.LOGIN_SUCCESS, {
    userId,
    route: '/login',
    maskedFields: ['password'],
    ...metadata,
  });
};

/**
 * Tag a login failure event.
 *
 * @param {string} username - The username that failed authentication
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagLoginFailure = (username, metadata = {}) => {
  return tagAction(TAG_EVENTS.LOGIN_FAILURE, {
    username: username || 'unknown',
    route: '/login',
    maskedFields: ['password'],
    ...metadata,
  });
};

/**
 * Tag a logout event.
 *
 * @param {number|string} userId - The user ID that logged out
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagLogout = (userId, metadata = {}) => {
  return tagAction(TAG_EVENTS.LOGOUT, {
    userId,
    route: '/logout',
    ...metadata,
  });
};

/**
 * Tag a session timeout event.
 *
 * @param {number|string} userId - The user ID whose session timed out
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagSessionTimeout = (userId, metadata = {}) => {
  return tagAction(TAG_EVENTS.SESSION_TIMEOUT, {
    userId,
    ...metadata,
  });
};

/**
 * Tag a session extended event.
 *
 * @param {number|string} userId - The user ID that extended their session
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagSessionExtended = (userId, metadata = {}) => {
  return tagAction(TAG_EVENTS.SESSION_EXTENDED, {
    userId,
    ...metadata,
  });
};

/**
 * Tag an error occurred event.
 *
 * @param {number|string} userId - The user ID who encountered the error
 * @param {string} errorMessage - The error message
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagError = (userId, errorMessage, metadata = {}) => {
  return tagAction(TAG_EVENTS.ERROR_OCCURRED, {
    userId,
    errorMessage,
    ...metadata,
  });
};

/**
 * Tag a support contacted event.
 *
 * @param {number|string} userId - The user ID contacting support
 * @param {string} channel - The support channel used (phone, chat, email)
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagSupportContacted = (userId, channel, metadata = {}) => {
  return tagAction(TAG_EVENTS.SUPPORT_CONTACTED, {
    userId,
    channel,
    ...metadata,
  });
};

/**
 * Tag a notification clicked event.
 *
 * @param {number|string} userId - The user ID clicking the notification
 * @param {string} notificationId - The notification ID being clicked
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagNotificationClicked = (userId, notificationId, metadata = {}) => {
  return tagAction(TAG_EVENTS.NOTIFICATION_CLICKED, {
    userId,
    resourceId: notificationId,
    ...metadata,
  });
};

/**
 * Tag a widget interacted event.
 *
 * @param {number|string} userId - The user ID interacting with the widget
 * @param {string} widgetId - The widget ID being interacted with
 * @param {object} [metadata={}] - Additional metadata
 * @returns {object|null} The created tag entry, or null if disabled/invalid
 */
export const tagWidgetInteracted = (userId, widgetId, metadata = {}) => {
  return tagAction(TAG_EVENTS.WIDGET_INTERACTED, {
    userId,
    resourceId: widgetId,
    ...metadata,
  });
};

/**
 * Retrieve all Glassbox event tags.
 *
 * @returns {Array<object>} All tag entries sorted by timestamp descending
 */
export const getAllTags = () => {
  return getTags();
};

/**
 * Retrieve Glassbox event tags filtered by event type.
 *
 * @param {string} eventType - The event name to filter by
 * @returns {Array<object>} Tag entries for the specified event type
 */
export const getTagsByEventType = (eventType) => {
  return getTagsByType(eventType);
};

/**
 * Retrieve Glassbox event tags filtered by user ID.
 *
 * @param {number|string} userId - The user ID to filter by
 * @returns {Array<object>} Tag entries for the specified user
 */
export const getTagsForUser = (userId) => {
  return getTagsByUser(userId);
};

/**
 * Retrieve Glassbox event tags filtered by route.
 *
 * @param {string} route - The route to filter by
 * @returns {Array<object>} Tag entries for the specified route
 */
export const getTagsForRoute = (route) => {
  return getTagsByRoute(route);
};