import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  login as authLogin,
  logout as authLogout,
  getSession,
  extendSession,
  recordSessionTimeout,
} from '../services/AuthManager.js';
import { getStoredSessionToken, getTimeRemaining, isSessionInWarningPeriod } from '../stores/SessionStore.js';
import { logAction, AUDIT_ACTIONS } from '../services/AuditLogger.js';
import { SESSION } from '../utils/constants.js';

/**
 * AuthContext - Authentication and session state context provider
 * Implements the SessionContext from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7164, SCRUM-7167, SCRUM-7169
 *
 * Provides authentication state, login/logout flows, session timeout management,
 * and user/role accessors to all child components via React Context.
 */

const AuthContext = createContext(null);

const SESSION_CHECK_INTERVAL_MS = 10000; // Check session every 10 seconds

/**
 * AuthProvider - Context provider component for authentication state.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {function} [props.onSessionWarning] - Callback when session enters warning period
 * @param {function} [props.onSessionTimeout] - Callback when session has timed out
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children, onSessionWarning, onSessionTimeout }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [isSessionWarning, setIsSessionWarning] = useState(false);

  const sessionCheckIntervalRef = useRef(null);
  const onSessionWarningRef = useRef(onSessionWarning);
  const onSessionTimeoutRef = useRef(onSessionTimeout);

  // Keep callback refs up to date
  useEffect(() => {
    onSessionWarningRef.current = onSessionWarning;
  }, [onSessionWarning]);

  useEffect(() => {
    onSessionTimeoutRef.current = onSessionTimeout;
  }, [onSessionTimeout]);

  /**
   * Clear session state and stop the session check timer.
   */
  const clearSessionState = useCallback(() => {
    setCurrentUser(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    setSessionTimeRemaining(0);
    setIsSessionWarning(false);

    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle session timeout event.
   */
  const handleSessionTimeout = useCallback((token, userId) => {
    recordSessionTimeout(token, userId);
    clearSessionState();

    if (onSessionTimeoutRef.current) {
      onSessionTimeoutRef.current();
    }
  }, [clearSessionState]);

  /**
   * Check the current session status and update state accordingly.
   */
  const checkSession = useCallback(() => {
    const token = sessionToken || getStoredSessionToken();

    if (!token) {
      if (isAuthenticated) {
        clearSessionState();
      }
      return;
    }

    const sessionResult = getSession(token);

    if (!sessionResult || sessionResult.status === 'expired' || sessionResult.status === 'error') {
      const userId = currentUser ? currentUser.id : null;
      handleSessionTimeout(token, userId);
      return;
    }

    const remaining = getTimeRemaining(token);
    setSessionTimeRemaining(remaining);

    const inWarning = isSessionInWarningPeriod(token);

    if (inWarning && !isSessionWarning) {
      setIsSessionWarning(true);

      if (onSessionWarningRef.current) {
        onSessionWarningRef.current(remaining);
      }
    } else if (!inWarning && isSessionWarning) {
      setIsSessionWarning(false);
    }
  }, [sessionToken, isAuthenticated, currentUser, isSessionWarning, clearSessionState, handleSessionTimeout]);

  /**
   * Start the periodic session check timer.
   */
  const startSessionCheck = useCallback(() => {
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
    }

    sessionCheckIntervalRef.current = setInterval(() => {
      checkSession();
    }, SESSION_CHECK_INTERVAL_MS);
  }, [checkSession]);

  /**
   * Restore session from stored token on mount.
   */
  useEffect(() => {
    const storedToken = getStoredSessionToken();

    if (storedToken) {
      const sessionResult = getSession(storedToken);

      if (sessionResult && sessionResult.status === 'active' && sessionResult.user) {
        setCurrentUser({
          id: sessionResult.user.id,
          username: sessionResult.user.username,
          displayName: sessionResult.user.displayName,
          role: sessionResult.user.role,
          memberId: sessionResult.user.memberId,
          groupNumber: sessionResult.user.groupNumber,
          email: sessionResult.user.email,
          preferences: sessionResult.user.preferences || {},
        });
        setSessionToken(storedToken);
        setIsAuthenticated(true);
        setSessionTimeRemaining(sessionResult.expires_in || 0);
        setIsSessionWarning(sessionResult.isWarning || false);
      }
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Start/stop session check timer based on authentication state.
   */
  useEffect(() => {
    if (isAuthenticated && sessionToken) {
      startSessionCheck();
    } else if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, sessionToken, startSessionCheck]);

  /**
   * Authenticate a user with username and password.
   *
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {object} Result object with status and user info on success, or error details on failure
   */
  const login = useCallback(async (username, password) => {
    const result = authLogin(username, password);

    if (result.status === 'success') {
      setCurrentUser({
        id: result.user.id,
        username: result.user.username,
        displayName: result.user.displayName,
        role: result.user.role,
        memberId: result.user.memberId,
        groupNumber: result.user.groupNumber,
        email: result.user.email,
        preferences: result.user.preferences || {},
      });
      setSessionToken(result.session_token);
      setIsAuthenticated(true);
      setSessionTimeRemaining(result.expires_in || 0);
      setIsSessionWarning(false);

      return {
        status: 'success',
        user: result.user,
      };
    }

    return {
      status: 'error',
      error_code: result.error_code,
      message: result.message,
    };
  }, []);

  /**
   * Log out the current user and destroy the session.
   *
   * @returns {object} Result object with status
   */
  const logout = useCallback(() => {
    const token = sessionToken || getStoredSessionToken();

    if (token) {
      authLogout(token);
    }

    clearSessionState();

    return { status: 'success' };
  }, [sessionToken, clearSessionState]);

  /**
   * Extend the current session to prevent timeout.
   *
   * @returns {object} Result object with status and updated session info
   */
  const extend = useCallback(() => {
    const token = sessionToken || getStoredSessionToken();

    if (!token) {
      return {
        status: 'error',
        message: 'No active session to extend.',
      };
    }

    const result = extendSession(token);

    if (result.status === 'success') {
      setSessionTimeRemaining(result.expires_in || 0);
      setIsSessionWarning(false);

      return {
        status: 'success',
        expires_in: result.expires_in,
      };
    }

    // Session could not be extended (expired)
    const userId = currentUser ? currentUser.id : null;
    handleSessionTimeout(token, userId);

    return result;
  }, [sessionToken, currentUser, handleSessionTimeout]);

  /**
   * Get the current user object.
   *
   * @returns {object|null} The current user or null if not authenticated
   */
  const getUser = useCallback(() => {
    return currentUser;
  }, [currentUser]);

  /**
   * Get the current user's role.
   *
   * @returns {string|null} The user's role or null if not authenticated
   */
  const getRoles = useCallback(() => {
    if (!currentUser) {
      return null;
    }
    return currentUser.role;
  }, [currentUser]);

  /**
   * Get the current session info.
   *
   * @returns {object|null} Session info or null if not authenticated
   */
  const getSessionInfo = useCallback(() => {
    const token = sessionToken || getStoredSessionToken();

    if (!token) {
      return null;
    }

    return getSession(token);
  }, [sessionToken]);

  /**
   * Check if the current user has the admin role.
   */
  const isAdmin = currentUser ? currentUser.role === 'admin' : false;

  const contextValue = {
    currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    sessionTimeRemaining,
    isSessionWarning,
    login,
    logout,
    extendSession: extend,
    getUser,
    getRoles,
    getSession: getSessionInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth - Custom hook to access authentication context.
 *
 * @returns {object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};

/**
 * useSessionContext - Alias for useAuth, implements SessionContext exports from the LLD.
 * Provides getSession, getUser, getRoles.
 *
 * @returns {object} Session context with user, roles, and authentication state
 */
export const useSessionContext = () => {
  const auth = useAuth();

  return {
    user: auth.currentUser,
    roles: auth.getRoles(),
    isAuthenticated: auth.isAuthenticated,
    getSession: auth.getSession,
    getUser: auth.getUser,
    getRoles: auth.getRoles,
  };
};

export default AuthContext;