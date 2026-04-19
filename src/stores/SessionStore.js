import { SESSION } from '../utils/constants.js';

/**
 * SessionStore - Session lifecycle management
 * Implements the SessionStore component from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164
 *
 * Manages in-memory session state with configurable TTL.
 */

const sessions = new Map();

const TIMEOUT_MS = SESSION.TIMEOUT_MINUTES * 60 * 1000;
const WARNING_MS = SESSION.WARNING_MINUTES * 60 * 1000;

/**
 * Generate a simple unique session token.
 * @returns {string} A 32-character hex string session token
 */
const generateSessionToken = () => {
  const chars = 'abcdef0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Create a new session for an authenticated user.
 * @param {object} user - The authenticated user object (without password)
 * @returns {object} The created session object containing token, userId, role, and timing info
 */
export const createSession = (user) => {
  if (!user || !user.id) {
    return null;
  }

  const now = Date.now();
  const sessionToken = generateSessionToken();

  const session = {
    sessionToken,
    userId: user.id,
    role: user.role || null,
    memberId: user.memberId || null,
    displayName: user.displayName || null,
    createdAt: now,
    lastActivity: now,
    expiresAt: now + TIMEOUT_MS,
  };

  sessions.set(sessionToken, session);

  // Store session token reference for persistence
  try {
    sessionStorage.setItem(SESSION.STORAGE_KEY, sessionToken);
    sessionStorage.setItem(SESSION.LAST_ACTIVITY_KEY, String(now));
  } catch (_e) {
    // sessionStorage may not be available in all environments
  }

  return {
    sessionToken: session.sessionToken,
    userId: session.userId,
    role: session.role,
    memberId: session.memberId,
    displayName: session.displayName,
    expiresIn: TIMEOUT_MS,
    status: 'active',
  };
};

/**
 * Retrieve a session by its token.
 * @param {string} sessionToken - The session token to look up
 * @returns {object|null} The session object if found, or null
 */
export const getSession = (sessionToken) => {
  if (!sessionToken) {
    return null;
  }

  const session = sessions.get(sessionToken);

  if (!session) {
    return null;
  }

  const now = Date.now();

  if (now >= session.expiresAt) {
    sessions.delete(sessionToken);
    clearStoredSession(sessionToken);
    return null;
  }

  const timeRemaining = session.expiresAt - now;
  const isWarning = timeRemaining <= WARNING_MS;

  return {
    sessionToken: session.sessionToken,
    userId: session.userId,
    role: session.role,
    memberId: session.memberId,
    displayName: session.displayName,
    expiresIn: timeRemaining,
    lastActivity: session.lastActivity,
    createdAt: session.createdAt,
    status: 'active',
    isWarning,
  };
};

/**
 * Destroy (invalidate) a session by its token.
 * @param {string} sessionToken - The session token to destroy
 * @returns {boolean} True if the session was found and destroyed, false otherwise
 */
export const destroySession = (sessionToken) => {
  if (!sessionToken) {
    return false;
  }

  const existed = sessions.has(sessionToken);

  if (existed) {
    sessions.delete(sessionToken);
    clearStoredSession(sessionToken);
  }

  return existed;
};

/**
 * Check if a session is still valid (exists and not expired).
 * @param {string} sessionToken - The session token to validate
 * @returns {boolean} True if the session is valid, false otherwise
 */
export const isSessionValid = (sessionToken) => {
  if (!sessionToken) {
    return false;
  }

  const session = sessions.get(sessionToken);

  if (!session) {
    return false;
  }

  const now = Date.now();

  if (now >= session.expiresAt) {
    sessions.delete(sessionToken);
    clearStoredSession(sessionToken);
    return false;
  }

  return true;
};

/**
 * Refresh a session by updating its last activity timestamp and extending expiration.
 * @param {string} sessionToken - The session token to refresh
 * @returns {object|null} The updated session info if valid, or null if session not found/expired
 */
export const refreshSession = (sessionToken) => {
  if (!sessionToken) {
    return null;
  }

  const session = sessions.get(sessionToken);

  if (!session) {
    return null;
  }

  const now = Date.now();

  if (now >= session.expiresAt) {
    sessions.delete(sessionToken);
    clearStoredSession(sessionToken);
    return null;
  }

  session.lastActivity = now;
  session.expiresAt = now + TIMEOUT_MS;

  sessions.set(sessionToken, session);

  try {
    sessionStorage.setItem(SESSION.LAST_ACTIVITY_KEY, String(now));
  } catch (_e) {
    // sessionStorage may not be available
  }

  const timeRemaining = session.expiresAt - now;

  return {
    sessionToken: session.sessionToken,
    userId: session.userId,
    role: session.role,
    memberId: session.memberId,
    displayName: session.displayName,
    expiresIn: timeRemaining,
    lastActivity: session.lastActivity,
    status: 'active',
    isWarning: false,
  };
};

/**
 * Get the currently stored session token from sessionStorage.
 * @returns {string|null} The stored session token, or null
 */
export const getStoredSessionToken = () => {
  try {
    return sessionStorage.getItem(SESSION.STORAGE_KEY) || null;
  } catch (_e) {
    return null;
  }
};

/**
 * Get the time remaining (in milliseconds) for a session.
 * @param {string} sessionToken - The session token
 * @returns {number} Time remaining in ms, or 0 if expired/not found
 */
export const getTimeRemaining = (sessionToken) => {
  if (!sessionToken) {
    return 0;
  }

  const session = sessions.get(sessionToken);

  if (!session) {
    return 0;
  }

  const now = Date.now();
  const remaining = session.expiresAt - now;

  if (remaining <= 0) {
    sessions.delete(sessionToken);
    clearStoredSession(sessionToken);
    return 0;
  }

  return remaining;
};

/**
 * Check if the session is in the warning period (near timeout).
 * @param {string} sessionToken - The session token
 * @returns {boolean} True if session is in warning period
 */
export const isSessionInWarningPeriod = (sessionToken) => {
  const remaining = getTimeRemaining(sessionToken);

  if (remaining <= 0) {
    return false;
  }

  return remaining <= WARNING_MS;
};

/**
 * Clear all sessions (useful for testing or global logout).
 */
export const clearAllSessions = () => {
  sessions.clear();

  try {
    sessionStorage.removeItem(SESSION.STORAGE_KEY);
    sessionStorage.removeItem(SESSION.LAST_ACTIVITY_KEY);
  } catch (_e) {
    // sessionStorage may not be available
  }
};

/**
 * Clear stored session data from sessionStorage for a given token.
 * @param {string} sessionToken - The session token to clear
 */
const clearStoredSession = (sessionToken) => {
  try {
    const storedToken = sessionStorage.getItem(SESSION.STORAGE_KEY);
    if (storedToken === sessionToken) {
      sessionStorage.removeItem(SESSION.STORAGE_KEY);
      sessionStorage.removeItem(SESSION.LAST_ACTIVITY_KEY);
    }
  } catch (_e) {
    // sessionStorage may not be available
  }
};

/**
 * Get the configured session timeout in milliseconds.
 * @returns {number} Session timeout in ms
 */
export const getSessionTimeoutMs = () => TIMEOUT_MS;

/**
 * Get the configured warning threshold in milliseconds.
 * @returns {number} Warning threshold in ms
 */
export const getWarningThresholdMs = () => WARNING_MS;