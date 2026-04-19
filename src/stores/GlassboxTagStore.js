import { GLASSBOX_EVENTS } from '../utils/constants.js';

/**
 * GlassboxTagStore - Glassbox event tag persistence layer
 * Implements the GlassboxTagStore component from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7165
 *
 * Maintains an in-memory array of tagged events for Glassbox masking/tagging.
 * Each tag records an event name, timestamp, and associated metadata
 * such as route, masked fields, and user context.
 */

const tags = [];

let nextTagId = 1;

/**
 * Valid Glassbox event names that can be tagged.
 */
const VALID_EVENT_NAMES = [
  GLASSBOX_EVENTS.PAGE_VIEW,
  GLASSBOX_EVENTS.LOGIN_SUCCESS,
  GLASSBOX_EVENTS.LOGIN_FAILURE,
  GLASSBOX_EVENTS.LOGOUT,
  GLASSBOX_EVENTS.SESSION_TIMEOUT,
  GLASSBOX_EVENTS.SESSION_EXTENDED,
  GLASSBOX_EVENTS.CLAIM_VIEWED,
  GLASSBOX_EVENTS.CLAIM_SEARCHED,
  GLASSBOX_EVENTS.CLAIM_FILTERED,
  GLASSBOX_EVENTS.DOCUMENT_DOWNLOADED,
  GLASSBOX_EVENTS.DOCUMENT_VIEWED,
  GLASSBOX_EVENTS.ID_CARD_VIEWED,
  GLASSBOX_EVENTS.ID_CARD_DOWNLOADED,
  GLASSBOX_EVENTS.COVERAGE_VIEWED,
  GLASSBOX_EVENTS.BENEFITS_VIEWED,
  GLASSBOX_EVENTS.SPENDING_VIEWED,
  GLASSBOX_EVENTS.PROFILE_UPDATED,
  GLASSBOX_EVENTS.SUPPORT_CONTACTED,
  GLASSBOX_EVENTS.FIND_CARE_SEARCHED,
  GLASSBOX_EVENTS.PRIOR_AUTH_SUBMITTED,
  GLASSBOX_EVENTS.PRIOR_AUTH_VIEWED,
  GLASSBOX_EVENTS.NOTIFICATION_CLICKED,
  GLASSBOX_EVENTS.NOTIFICATION_DISMISSED,
  GLASSBOX_EVENTS.ERROR_OCCURRED,
  GLASSBOX_EVENTS.WIDGET_INTERACTED,
  GLASSBOX_EVENTS.MESSAGE_SENT,
  GLASSBOX_EVENTS.MESSAGE_READ,
];

/**
 * Generate a unique tag ID.
 * @returns {string} A unique tag ID string
 */
const generateTagId = () => {
  const id = `tag_${String(nextTagId).padStart(6, '0')}`;
  nextTagId++;
  return id;
};

/**
 * Add a new Glassbox event tag.
 * @param {object} tag - The tag entry to add
 * @param {string} tag.eventName - The Glassbox event name
 * @param {object} [tag.metadata] - Additional metadata (route, maskedFields, userId, action, etc.)
 * @param {string} [tag.timestamp] - ISO timestamp; defaults to current time
 * @returns {object|null} The created tag entry with id and timestamp, or null if invalid
 */
export const addTag = (tag) => {
  if (!tag || !tag.eventName) {
    return null;
  }

  if (typeof tag.eventName !== 'string') {
    return null;
  }

  const tagEntry = {
    id: generateTagId(),
    eventName: tag.eventName,
    timestamp: tag.timestamp || new Date().toISOString(),
    metadata: tag.metadata || {},
  };

  tags.push(tagEntry);

  return { ...tagEntry };
};

/**
 * Get all Glassbox event tags.
 * @returns {Array<object>} A copy of all tag entries, sorted by timestamp descending
 */
export const getTags = () => {
  return [...tags]
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .map((tag) => ({ ...tag }));
};

/**
 * Get Glassbox event tags filtered by event name (type).
 * @param {string} type - The event name to filter by
 * @returns {Array<object>} Tag entries for the specified event name, sorted by timestamp descending
 */
export const getTagsByType = (type) => {
  if (!type || typeof type !== 'string') {
    return [];
  }

  return tags
    .filter((tag) => tag.eventName === type)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .map((tag) => ({ ...tag }));
};

/**
 * Get Glassbox event tags filtered by user ID in metadata.
 * @param {number|string} userId - The user ID to filter by
 * @returns {Array<object>} Tag entries for the specified user, sorted by timestamp descending
 */
export const getTagsByUser = (userId) => {
  if (userId === undefined || userId === null) {
    return [];
  }

  return tags
    .filter((tag) => tag.metadata && tag.metadata.userId === userId)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .map((tag) => ({ ...tag }));
};

/**
 * Get Glassbox event tags filtered by route in metadata.
 * @param {string} route - The route to filter by
 * @returns {Array<object>} Tag entries for the specified route, sorted by timestamp descending
 */
export const getTagsByRoute = (route) => {
  if (!route || typeof route !== 'string') {
    return [];
  }

  return tags
    .filter((tag) => tag.metadata && tag.metadata.route === route)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .map((tag) => ({ ...tag }));
};

/**
 * Get the total count of Glassbox event tags.
 * @returns {number} The total number of tag entries
 */
export const getTagCount = () => {
  return tags.length;
};

/**
 * Clear all Glassbox event tags (useful for testing).
 */
export const clearTags = () => {
  tags.length = 0;
  nextTagId = 1;
};

/**
 * Get the list of valid Glassbox event names.
 * @returns {Array<string>} Array of valid event name strings
 */
export const getValidEventNames = () => {
  return [...VALID_EVENT_NAMES];
};