import { useState, useEffect, useCallback, useRef } from 'react';
import { SESSION } from '../utils/constants.js';

/**
 * useSessionTimeout - Custom hook for session inactivity timeout tracking
 * Implements session timeout monitoring from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164
 *
 * Tracks mouse, keyboard, and touch events to detect user activity.
 * Returns timeRemaining, isWarning, resetTimer, and isTimedOut state.
 * Triggers warning state when configurable warning threshold is reached.
 * Calls onTimeout callback when session expires due to inactivity.
 *
 * @param {object} [options={}] - Configuration options
 * @param {number} [options.timeoutMinutes] - Session timeout in minutes (default from SESSION config)
 * @param {number} [options.warningMinutes] - Warning threshold in minutes (default from SESSION config)
 * @param {function} [options.onTimeout] - Callback invoked when session times out
 * @param {function} [options.onWarning] - Callback invoked when session enters warning period
 * @param {boolean} [options.enabled=true] - Whether timeout tracking is enabled
 * @returns {object} Session timeout state and controls
 */
const useSessionTimeout = (options = {}) => {
  const {
    timeoutMinutes = SESSION.TIMEOUT_MINUTES,
    warningMinutes = SESSION.WARNING_MINUTES,
    onTimeout,
    onWarning,
    enabled = true,
  } = options;

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  const [timeRemaining, setTimeRemaining] = useState(timeoutMs);
  const [isWarning, setIsWarning] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  const onWarningRef = useRef(onWarning);
  const warningFiredRef = useRef(false);

  // Keep callback refs up to date
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  /**
   * Reset the inactivity timer by updating the last activity timestamp.
   * Clears the timed out and warning states if previously triggered.
   */
  const resetTimer = useCallback(() => {
    if (!enabled) {
      return;
    }

    lastActivityRef.current = Date.now();
    warningFiredRef.current = false;

    setTimeRemaining(timeoutMs);
    setIsWarning(false);
    setIsTimedOut(false);
  }, [enabled, timeoutMs]);

  /**
   * Handle user activity events (mouse, keyboard, touch).
   * Updates the last activity timestamp to prevent timeout.
   */
  const handleActivity = useCallback(() => {
    if (!enabled || isTimedOut) {
      return;
    }

    lastActivityRef.current = Date.now();
  }, [enabled, isTimedOut]);

  /**
   * Set up the interval that checks remaining time and updates state.
   */
  useEffect(() => {
    if (!enabled) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Initialize last activity
    lastActivityRef.current = Date.now();
    warningFiredRef.current = false;

    const checkTimeout = () => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const remaining = Math.max(0, timeoutMs - elapsed);

      setTimeRemaining(remaining);

      // Check if session has timed out
      if (remaining <= 0) {
        setIsTimedOut(true);
        setIsWarning(false);

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }

        return;
      }

      // Check if session is in warning period
      if (remaining <= warningMs) {
        if (!warningFiredRef.current) {
          warningFiredRef.current = true;
          setIsWarning(true);

          if (onWarningRef.current) {
            onWarningRef.current(remaining);
          }
        }
      } else {
        if (warningFiredRef.current) {
          warningFiredRef.current = false;
          setIsWarning(false);
        }
      }
    };

    timerIntervalRef.current = setInterval(checkTimeout, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [enabled, timeoutMs, warningMs]);

  /**
   * Set up DOM event listeners for user activity tracking.
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'keypress',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, handleActivity]);

  return {
    timeRemaining,
    isWarning,
    isTimedOut,
    resetTimer,
  };
};

export default useSessionTimeout;