import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getMaskingSelectors } from '../../utils/maskingUtils.js';
import { APP } from '../../utils/constants.js';
import {
  isGlassboxEnabled,
  tagAction,
  tagPageView,
  TAG_EVENTS,
} from '../../services/GlassboxTagger.js';

/**
 * GlassboxContext - Context for Glassbox SDK state and controls
 * Provides isInitialized, isEnabled, and SDK control functions to child components.
 */
const GlassboxContext = createContext(null);

/**
 * Mock Glassbox SDK implementation for MVP.
 * In production, this would be replaced with the actual Glassbox SDK.
 * Provides stub methods that mirror the real SDK API surface.
 */
const MockGlassboxSDK = {
  _initialized: false,
  _maskedSelectors: [],
  _sessionId: null,

  /**
   * Initialize the mock Glassbox SDK.
   *
   * @param {object} config - SDK configuration options
   * @returns {boolean} True if initialization succeeded
   */
  init(config = {}) {
    if (this._initialized) {
      return true;
    }

    this._sessionId = `gb_session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    this._initialized = true;
    this._maskedSelectors = [];

    return true;
  },

  /**
   * Check if the SDK is initialized.
   *
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this._initialized;
  },

  /**
   * Get the current session ID.
   *
   * @returns {string|null} The session ID or null if not initialized
   */
  getSessionId() {
    return this._sessionId;
  },

  /**
   * Register CSS selectors for PHI/PII masking in session replay.
   *
   * @param {string[]} selectors - Array of CSS selector strings to mask
   */
  setMaskingSelectors(selectors) {
    if (!Array.isArray(selectors)) {
      return;
    }

    this._maskedSelectors = [...selectors];
  },

  /**
   * Get the currently registered masking selectors.
   *
   * @returns {string[]} Array of registered CSS selectors
   */
  getMaskedSelectors() {
    return [...this._maskedSelectors];
  },

  /**
   * Apply masking to DOM elements matching the registered selectors.
   * In the real SDK, this would instruct Glassbox to redact these elements
   * from session replay recordings.
   */
  applyMasking() {
    if (!this._initialized) {
      return;
    }

    this._maskedSelectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          if (!el.hasAttribute('data-glassbox-mask')) {
            el.setAttribute('data-glassbox-mask', 'true');
          }
        });
      } catch (_e) {
        // Invalid selector - skip silently
      }
    });
  },

  /**
   * Tag a custom action event for analytics.
   *
   * @param {string} eventName - The event name
   * @param {object} metadata - Event metadata
   */
  tagAction(eventName, metadata = {}) {
    // Mock implementation - in production this would call the real SDK
  },

  /**
   * Tag a page view event.
   *
   * @param {string} pageName - The page name or route
   */
  tagPageView(pageName) {
    // Mock implementation - in production this would call the real SDK
  },

  /**
   * Destroy the SDK instance and clean up.
   */
  destroy() {
    this._initialized = false;
    this._maskedSelectors = [];
    this._sessionId = null;
  },
};

/**
 * Interval in milliseconds for re-applying masking selectors to the DOM.
 * This handles dynamically rendered content that may appear after initial load.
 */
const MASKING_INTERVAL_MS = 3000;

/**
 * GlassboxProvider - Glassbox SDK initialization and masking provider component
 * Implements GlassboxIntegration from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7173, SCRUM-7165
 *
 * Initializes the Glassbox SDK (mock implementation for MVP) on mount when
 * enabled via VITE_GLASSBOX_ENABLED environment variable. Applies PHI/PII
 * masking selectors to DOM elements with data-glassbox-mask attribute.
 * Wraps authenticated routes and provides context for Glassbox state.
 *
 * Masking selectors are sourced from maskingUtils.getMaskingSelectors() and
 * applied periodically to handle dynamically rendered content. All elements
 * matching the selectors receive a data-glassbox-mask="true" attribute,
 * instructing the Glassbox session replay to redact their content.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {boolean} [props.enableMasking=true] - Whether to enable PHI/PII masking
 * @param {number} [props.maskingIntervalMs] - Custom masking interval in milliseconds
 * @returns {JSX.Element}
 */
const GlassboxProvider = ({
  children,
  enableMasking = true,
  maskingIntervalMs,
}) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const maskingIntervalRef = useRef(null);
  const sdkRef = useRef(MockGlassboxSDK);
  const previousUserIdRef = useRef(null);

  const activeMaskingInterval = maskingIntervalMs || MASKING_INTERVAL_MS;

  /**
   * Initialize the Glassbox SDK when the provider mounts and Glassbox is enabled.
   * Re-initializes if the authenticated user changes.
   */
  useEffect(() => {
    const glassboxEnabled = isGlassboxEnabled();
    setIsEnabled(glassboxEnabled);

    if (!glassboxEnabled) {
      // Clean up if Glassbox was previously initialized but is now disabled
      if (isInitialized) {
        sdkRef.current.destroy();
        setIsInitialized(false);
        setSessionId(null);
      }
      return;
    }

    if (!isAuthenticated || !currentUser) {
      // Don't initialize until user is authenticated
      if (isInitialized && previousUserIdRef.current !== null) {
        sdkRef.current.destroy();
        setIsInitialized(false);
        setSessionId(null);
        previousUserIdRef.current = null;
      }
      return;
    }

    // Check if we need to re-initialize for a different user
    const currentUserId = currentUser.id;

    if (isInitialized && previousUserIdRef.current === currentUserId) {
      // Already initialized for this user
      return;
    }

    // Destroy previous instance if switching users
    if (isInitialized && previousUserIdRef.current !== currentUserId) {
      sdkRef.current.destroy();
    }

    // Initialize the SDK
    const initResult = sdkRef.current.init({
      enabled: true,
      userId: currentUserId,
      memberId: currentUser.memberId || null,
      role: currentUser.role || null,
    });

    if (initResult) {
      setIsInitialized(true);
      setSessionId(sdkRef.current.getSessionId());
      previousUserIdRef.current = currentUserId;

      // Tag initialization event
      tagAction('glassbox_initialized', {
        userId: currentUserId,
        route: window.location.pathname,
      });
    }
  }, [isAuthenticated, currentUser, isInitialized]);

  /**
   * Apply PHI/PII masking selectors to the DOM.
   * Retrieves selectors from maskingUtils and registers them with the SDK.
   * Sets up a periodic interval to re-apply masking for dynamically rendered content.
   */
  useEffect(() => {
    if (!isInitialized || !isEnabled || !enableMasking) {
      // Clear any existing masking interval
      if (maskingIntervalRef.current) {
        clearInterval(maskingIntervalRef.current);
        maskingIntervalRef.current = null;
      }
      return;
    }

    // Get masking selectors from the masking utilities
    const selectors = getMaskingSelectors();

    // Register selectors with the SDK
    sdkRef.current.setMaskingSelectors(selectors);

    /**
     * Apply masking to all matching DOM elements.
     * Called immediately and then periodically to catch dynamic content.
     */
    const applyMaskingToDOM = () => {
      if (!sdkRef.current.isInitialized()) {
        return;
      }

      sdkRef.current.applyMasking();
    };

    // Apply masking immediately
    applyMaskingToDOM();

    // Set up periodic re-application for dynamic content
    maskingIntervalRef.current = setInterval(applyMaskingToDOM, activeMaskingInterval);

    return () => {
      if (maskingIntervalRef.current) {
        clearInterval(maskingIntervalRef.current);
        maskingIntervalRef.current = null;
      }
    };
  }, [isInitialized, isEnabled, enableMasking, activeMaskingInterval]);

  /**
   * Also apply masking when the DOM changes via MutationObserver.
   * This catches content rendered after the periodic interval check.
   */
  useEffect(() => {
    if (!isInitialized || !isEnabled || !enableMasking) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (sdkRef.current.isInitialized()) {
        sdkRef.current.applyMasking();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [isInitialized, isEnabled, enableMasking]);

  /**
   * Clean up the SDK on unmount.
   */
  useEffect(() => {
    return () => {
      if (maskingIntervalRef.current) {
        clearInterval(maskingIntervalRef.current);
        maskingIntervalRef.current = null;
      }

      if (sdkRef.current.isInitialized()) {
        sdkRef.current.destroy();
      }
    };
  }, []);

  /**
   * Manually trigger masking re-application.
   * Useful when components know they've rendered new PHI/PII content.
   */
  const refreshMasking = useCallback(() => {
    if (!isInitialized || !isEnabled || !enableMasking) {
      return;
    }

    sdkRef.current.applyMasking();
  }, [isInitialized, isEnabled, enableMasking]);

  /**
   * Tag a custom Glassbox action event.
   *
   * @param {string} eventName - The event name
   * @param {object} [metadata={}] - Event metadata
   */
  const tagGlassboxAction = useCallback((eventName, metadata = {}) => {
    if (!isInitialized || !isEnabled) {
      return;
    }

    if (!eventName || typeof eventName !== 'string') {
      return;
    }

    sdkRef.current.tagAction(eventName, metadata);

    // Also record in the GlassboxTagger service
    tagAction(eventName, {
      userId: currentUser ? currentUser.id : null,
      ...metadata,
    });
  }, [isInitialized, isEnabled, currentUser]);

  /**
   * Tag a page view event.
   *
   * @param {string} route - The route being viewed
   * @param {object} [metadata={}] - Additional metadata
   */
  const tagGlassboxPageView = useCallback((route, metadata = {}) => {
    if (!isInitialized || !isEnabled) {
      return;
    }

    if (!route || typeof route !== 'string') {
      return;
    }

    sdkRef.current.tagPageView(route);

    // Also record in the GlassboxTagger service
    if (currentUser) {
      tagPageView(route, currentUser.id, metadata);
    }
  }, [isInitialized, isEnabled, currentUser]);

  /**
   * Get the current masking selectors registered with the SDK.
   *
   * @returns {string[]} Array of CSS selector strings
   */
  const getMaskedSelectors = useCallback(() => {
    if (!isInitialized || !isEnabled) {
      return [];
    }

    return sdkRef.current.getMaskedSelectors();
  }, [isInitialized, isEnabled]);

  const contextValue = {
    isInitialized,
    isEnabled,
    sessionId,
    refreshMasking,
    tagAction: tagGlassboxAction,
    tagPageView: tagGlassboxPageView,
    getMaskedSelectors,
  };

  return (
    <GlassboxContext.Provider value={contextValue}>
      {children}
    </GlassboxContext.Provider>
  );
};

/**
 * useGlassboxContext - Custom hook to access Glassbox provider context.
 *
 * @returns {object} Glassbox context value with SDK state and controls
 * @throws {Error} If used outside of GlassboxProvider
 */
export const useGlassboxContext = () => {
  const context = useContext(GlassboxContext);

  if (!context) {
    throw new Error('useGlassboxContext must be used within a GlassboxProvider.');
  }

  return context;
};

export default GlassboxProvider;