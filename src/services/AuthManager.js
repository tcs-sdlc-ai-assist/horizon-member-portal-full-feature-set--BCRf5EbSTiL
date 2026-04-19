import { findUserByCredentials, findUserById, getUserRoles } from '../stores/UserStore.js';
import {
  createSession,
  getSession as getSessionFromStore,
  destroySession,
  isSessionValid,
  refreshSession,
} from '../stores/SessionStore.js';
import { addLog } from '../stores/AuditLogStore.js';
import { addTag } from '../stores/GlassboxTagStore.js';
import { GLASSBOX_EVENTS, APP } from '../utils/constants.js';

/**
 * AuthManager - Authentication orchestration service
 * Implements the AuthManager component from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164, SCRUM-7167
 *
 * Orchestrates login/logout flows using UserStore and SessionStore.
 * Records audit log entries and Glassbox tags for authentication events.
 */

/**
 * Authenticate a user with username and password credentials.
 * Creates a session on success and logs the authentication event.
 *
 * @param {string} username - The username to authenticate
 * @param {string} password - The password to validate
 * @returns {object} Result object with status, session data, and user info on success, or error on failure
 */
export const login = (username, password) => {
  if (!username || !password) {
    logAuthFailure(username, 'Missing credentials');
    return {
      status: 'error',
      error_code: 'MISSING_CREDENTIALS',
      message: 'Username and password are required.',
    };
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    logAuthFailure(username, 'Invalid credential types');
    return {
      status: 'error',
      error_code: 'INVALID_CREDENTIALS',
      message: 'Username or password incorrect.',
    };
  }

  if (username.length > 64) {
    logAuthFailure(username, 'Username exceeds max length');
    return {
      status: 'error',
      error_code: 'INVALID_CREDENTIALS',
      message: 'Username or password incorrect.',
    };
  }

  if (password.length < 8) {
    logAuthFailure(username, 'Password below minimum length');
    return {
      status: 'error',
      error_code: 'INVALID_CREDENTIALS',
      message: 'Username or password incorrect.',
    };
  }

  const user = findUserByCredentials(username, password);

  if (!user) {
    logAuthFailure(username, 'Invalid credentials');
    return {
      status: 'error',
      error_code: 'INVALID_CREDENTIALS',
      message: 'Username or password incorrect.',
    };
  }

  const session = createSession(user);

  if (!session) {
    logAuthFailure(username, 'Session creation failed');
    return {
      status: 'error',
      error_code: 'SESSION_ERROR',
      message: 'Unable to create session. Please try again.',
    };
  }

  // Log successful authentication
  addLog({
    userId: user.id,
    action: GLASSBOX_EVENTS.LOGIN_SUCCESS,
    resourceId: null,
    metadata: {
      username: user.username,
      role: user.role,
    },
  });

  // Tag Glassbox event if enabled
  if (APP.GLASSBOX_ENABLED) {
    addTag({
      eventName: GLASSBOX_EVENTS.LOGIN_SUCCESS,
      metadata: {
        userId: user.id,
        route: '/login',
        maskedFields: ['password'],
      },
    });
  }

  return {
    status: 'success',
    user_id: user.id,
    role: user.role,
    memberId: user.memberId,
    displayName: user.displayName,
    session_token: session.sessionToken,
    expires_in: session.expiresIn,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      memberId: user.memberId,
      groupNumber: user.groupNumber,
      email: user.email,
      preferences: user.preferences || {},
    },
  };
};

/**
 * Log out a user by destroying their session.
 * Records audit log and Glassbox tag for the logout event.
 *
 * @param {string} sessionToken - The session token to invalidate
 * @returns {object} Result object with status indicating success or failure
 */
export const logout = (sessionToken) => {
  if (!sessionToken) {
    return {
      status: 'error',
      error_code: 'MISSING_SESSION',
      message: 'Session token is required.',
    };
  }

  // Retrieve session info before destroying for audit logging
  const sessionInfo = getSessionFromStore(sessionToken);
  const userId = sessionInfo ? sessionInfo.userId : null;

  const destroyed = destroySession(sessionToken);

  if (!destroyed) {
    return {
      status: 'error',
      error_code: 'INVALID_SESSION',
      message: 'Session not found or already expired.',
    };
  }

  // Log logout event
  if (userId) {
    addLog({
      userId,
      action: GLASSBOX_EVENTS.LOGOUT,
      resourceId: null,
      metadata: {
        sessionToken: sessionToken.substring(0, 8) + '...',
      },
    });

    if (APP.GLASSBOX_ENABLED) {
      addTag({
        eventName: GLASSBOX_EVENTS.LOGOUT,
        metadata: {
          userId,
          route: '/logout',
        },
      });
    }
  }

  return {
    status: 'success',
  };
};

/**
 * Retrieve the current session state for a given session token.
 * Returns session details including expiration and warning status.
 *
 * @param {string} sessionToken - The session token to look up
 * @returns {object} Result object with session status and details, or error if invalid/expired
 */
export const getSession = (sessionToken) => {
  if (!sessionToken) {
    return {
      status: 'error',
      error_code: 'MISSING_SESSION',
      message: 'Session token is required.',
    };
  }

  if (!isSessionValid(sessionToken)) {
    return {
      status: 'expired',
      message: 'Session expired due to inactivity.',
    };
  }

  const session = getSessionFromStore(sessionToken);

  if (!session) {
    return {
      status: 'expired',
      message: 'Session expired due to inactivity.',
    };
  }

  // Fetch user details for the session
  const user = findUserById(session.userId);
  const role = user ? user.role : session.role;

  return {
    status: session.status,
    session_token: session.sessionToken,
    user_id: session.userId,
    role,
    memberId: session.memberId,
    displayName: session.displayName,
    expires_in: session.expiresIn,
    lastActivity: session.lastActivity,
    isWarning: session.isWarning || false,
    user: user || null,
  };
};

/**
 * Refresh a session to extend its expiration.
 * Records audit log and Glassbox tag for the session extension event.
 *
 * @param {string} sessionToken - The session token to refresh
 * @returns {object} Result object with updated session info, or error if invalid/expired
 */
export const extendSession = (sessionToken) => {
  if (!sessionToken) {
    return {
      status: 'error',
      error_code: 'MISSING_SESSION',
      message: 'Session token is required.',
    };
  }

  const refreshed = refreshSession(sessionToken);

  if (!refreshed) {
    return {
      status: 'expired',
      message: 'Session expired due to inactivity.',
    };
  }

  // Log session extension
  addLog({
    userId: refreshed.userId,
    action: GLASSBOX_EVENTS.SESSION_EXTENDED,
    resourceId: null,
    metadata: {
      sessionToken: sessionToken.substring(0, 8) + '...',
    },
  });

  if (APP.GLASSBOX_ENABLED) {
    addTag({
      eventName: GLASSBOX_EVENTS.SESSION_EXTENDED,
      metadata: {
        userId: refreshed.userId,
        route: null,
      },
    });
  }

  return {
    status: 'success',
    session_token: refreshed.sessionToken,
    user_id: refreshed.userId,
    role: refreshed.role,
    memberId: refreshed.memberId,
    displayName: refreshed.displayName,
    expires_in: refreshed.expiresIn,
    isWarning: refreshed.isWarning || false,
  };
};

/**
 * Validate that a session token corresponds to a user with the required role.
 *
 * @param {string} sessionToken - The session token to validate
 * @param {string|string[]} requiredRoles - The role(s) required for access
 * @returns {object} Result object with authorization status
 */
export const authorize = (sessionToken, requiredRoles) => {
  const sessionResult = getSession(sessionToken);

  if (sessionResult.status !== 'active') {
    return {
      status: 'error',
      error_code: 'UNAUTHORIZED',
      message: 'Authentication required.',
    };
  }

  if (!requiredRoles) {
    return {
      status: 'success',
      user_id: sessionResult.user_id,
      role: sessionResult.role,
    };
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const userRole = sessionResult.role ? sessionResult.role.toLowerCase() : '';

  const hasRole = roles.some(
    (role) => role.toLowerCase() === userRole
  );

  if (!hasRole) {
    return {
      status: 'error',
      error_code: 'FORBIDDEN',
      message: 'Insufficient permissions for this action.',
    };
  }

  return {
    status: 'success',
    user_id: sessionResult.user_id,
    role: sessionResult.role,
  };
};

/**
 * Record a session timeout event for audit and compliance purposes.
 *
 * @param {string} sessionToken - The session token that timed out
 * @param {number|string} userId - The user ID associated with the session
 */
export const recordSessionTimeout = (sessionToken, userId) => {
  if (userId) {
    addLog({
      userId,
      action: GLASSBOX_EVENTS.SESSION_TIMEOUT,
      resourceId: null,
      metadata: {
        sessionToken: sessionToken ? sessionToken.substring(0, 8) + '...' : null,
      },
    });

    if (APP.GLASSBOX_ENABLED) {
      addTag({
        eventName: GLASSBOX_EVENTS.SESSION_TIMEOUT,
        metadata: {
          userId,
          route: null,
        },
      });
    }
  }

  // Ensure session is destroyed
  if (sessionToken) {
    destroySession(sessionToken);
  }
};

/**
 * Log a failed authentication attempt for audit and compliance.
 *
 * @param {string} username - The username that failed authentication
 * @param {string} reason - The reason for the failure
 */
const logAuthFailure = (username, reason) => {
  addLog({
    userId: username || 'unknown',
    action: GLASSBOX_EVENTS.LOGIN_FAILURE,
    resourceId: null,
    metadata: {
      username: username || 'unknown',
      reason,
    },
  });

  if (APP.GLASSBOX_ENABLED) {
    addTag({
      eventName: GLASSBOX_EVENTS.LOGIN_FAILURE,
      metadata: {
        username: username || 'unknown',
        route: '/login',
        maskedFields: ['password'],
      },
    });
  }
};