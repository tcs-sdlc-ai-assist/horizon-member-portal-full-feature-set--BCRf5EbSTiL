import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { STORAGE_KEYS } from '../utils/constants.js';
import dashboardWidgets from '../data/dashboard-widgets.json';

/**
 * PreferencesContext - User preferences state context provider
 * Implements the PreferencesContext from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Provides preferences object, getPreferences(), setPreferences(prefs),
 * updateWidgetOrder(widgetIds), toggleWidgetVisibility(widgetId).
 * Persists preferences to localStorage keyed by userId.
 */

const PreferencesContext = createContext(null);

/**
 * Build default widget preferences from dashboard-widgets.json data.
 *
 * @returns {object} Default preferences object with widgetOrder and widgetVisibility
 */
const buildDefaultPreferences = () => {
  const sorted = [...dashboardWidgets].sort((a, b) => a.defaultOrder - b.defaultOrder);

  const widgetOrder = sorted.map((w) => w.id);

  const widgetVisibility = {};
  sorted.forEach((w) => {
    widgetVisibility[w.id] = w.defaultVisible;
  });

  return {
    widgetOrder,
    widgetVisibility,
    notificationPreferences: {
      email: true,
      sms: false,
      claimUpdates: true,
      documentReady: true,
      coverageChanges: true,
      priorAuthUpdates: true,
    },
  };
};

/**
 * Get the localStorage key for a given user ID.
 *
 * @param {number|string} userId - The user ID
 * @returns {string} The localStorage key
 */
const getStorageKey = (userId) => {
  return `${STORAGE_KEYS.WIDGET_LAYOUT}_${userId}`;
};

/**
 * Load preferences from localStorage for a given user ID.
 *
 * @param {number|string} userId - The user ID
 * @returns {object|null} The stored preferences, or null if not found
 */
const loadPreferencesFromStorage = (userId) => {
  if (!userId && userId !== 0) {
    return null;
  }

  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch (_e) {
    return null;
  }
};

/**
 * Save preferences to localStorage for a given user ID.
 *
 * @param {number|string} userId - The user ID
 * @param {object} preferences - The preferences object to persist
 */
const savePreferencesToStorage = (userId, preferences) => {
  if (!userId && userId !== 0) {
    return;
  }

  if (!preferences || typeof preferences !== 'object') {
    return;
  }

  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(preferences));
  } catch (_e) {
    // localStorage may not be available
  }
};

/**
 * Clear preferences from localStorage for a given user ID.
 *
 * @param {number|string} userId - The user ID
 */
const clearPreferencesFromStorage = (userId) => {
  if (!userId && userId !== 0) {
    return;
  }

  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
  } catch (_e) {
    // localStorage may not be available
  }
};

/**
 * Merge stored preferences with defaults to ensure all widgets are represented.
 * Handles cases where new widgets have been added since preferences were last saved.
 *
 * @param {object} stored - The stored preferences
 * @param {object} defaults - The default preferences
 * @returns {object} Merged preferences object
 */
const mergeWithDefaults = (stored, defaults) => {
  if (!stored) {
    return { ...defaults };
  }

  const merged = { ...defaults, ...stored };

  // Ensure all default widgets exist in widgetOrder
  if (Array.isArray(stored.widgetOrder) && Array.isArray(defaults.widgetOrder)) {
    const storedSet = new Set(stored.widgetOrder);
    const missingWidgets = defaults.widgetOrder.filter((id) => !storedSet.has(id));
    merged.widgetOrder = [...stored.widgetOrder, ...missingWidgets];
  }

  // Ensure all default widgets exist in widgetVisibility
  if (stored.widgetVisibility && defaults.widgetVisibility) {
    merged.widgetVisibility = { ...defaults.widgetVisibility, ...stored.widgetVisibility };
  }

  // Ensure notification preferences are merged
  if (stored.notificationPreferences && defaults.notificationPreferences) {
    merged.notificationPreferences = { ...defaults.notificationPreferences, ...stored.notificationPreferences };
  }

  return merged;
};

/**
 * PreferencesProvider - Context provider component for user preferences.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export const PreferencesProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [preferences, setPreferencesState] = useState(() => buildDefaultPreferences());
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Load preferences when user changes or authenticates.
   */
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const defaults = buildDefaultPreferences();

      // Check if user has preferences in their profile data
      const userPrefs = currentUser.preferences || {};
      const userWidgetPrefs = {
        widgetOrder: userPrefs.widgetOrder || null,
        widgetVisibility: userPrefs.widgetVisibility || null,
        notificationPreferences: userPrefs.notificationPreferences || null,
      };

      // Try loading from localStorage first (takes priority)
      const storedPrefs = loadPreferencesFromStorage(currentUser.id);

      if (storedPrefs) {
        const merged = mergeWithDefaults(storedPrefs, defaults);
        setPreferencesState(merged);
      } else if (userWidgetPrefs.widgetOrder || userWidgetPrefs.widgetVisibility) {
        // Fall back to user profile preferences
        const profilePrefs = {};
        if (userWidgetPrefs.widgetOrder) {
          profilePrefs.widgetOrder = userWidgetPrefs.widgetOrder;
        }
        if (userWidgetPrefs.widgetVisibility) {
          profilePrefs.widgetVisibility = userWidgetPrefs.widgetVisibility;
        }
        if (userWidgetPrefs.notificationPreferences) {
          profilePrefs.notificationPreferences = userWidgetPrefs.notificationPreferences;
        }

        const merged = mergeWithDefaults(profilePrefs, defaults);
        setPreferencesState(merged);

        // Persist to localStorage for future loads
        savePreferencesToStorage(currentUser.id, merged);
      } else {
        setPreferencesState(defaults);
      }

      setIsLoaded(true);
    } else {
      // Reset to defaults when not authenticated
      setPreferencesState(buildDefaultPreferences());
      setIsLoaded(false);
    }
  }, [isAuthenticated, currentUser]);

  /**
   * Get the current preferences object.
   *
   * @returns {object} The current preferences
   */
  const getPreferences = useCallback(() => {
    return { ...preferences };
  }, [preferences]);

  /**
   * Set the entire preferences object and persist to localStorage.
   *
   * @param {object} newPreferences - The new preferences object
   */
  const setPreferences = useCallback((newPreferences) => {
    if (!newPreferences || typeof newPreferences !== 'object') {
      return;
    }

    const defaults = buildDefaultPreferences();
    const merged = mergeWithDefaults(newPreferences, defaults);

    setPreferencesState(merged);

    if (currentUser && currentUser.id) {
      savePreferencesToStorage(currentUser.id, merged);
    }
  }, [currentUser]);

  /**
   * Update the widget display order.
   *
   * @param {string[]} widgetIds - Array of widget IDs in the desired order
   */
  const updateWidgetOrder = useCallback((widgetIds) => {
    if (!Array.isArray(widgetIds)) {
      return;
    }

    setPreferencesState((prev) => {
      const updated = {
        ...prev,
        widgetOrder: [...widgetIds],
      };

      if (currentUser && currentUser.id) {
        savePreferencesToStorage(currentUser.id, updated);
      }

      return updated;
    });
  }, [currentUser]);

  /**
   * Toggle the visibility of a specific widget.
   *
   * @param {string} widgetId - The widget ID to toggle
   */
  const toggleWidgetVisibility = useCallback((widgetId) => {
    if (!widgetId || typeof widgetId !== 'string') {
      return;
    }

    setPreferencesState((prev) => {
      const currentVisibility = prev.widgetVisibility || {};
      const isCurrentlyVisible = currentVisibility[widgetId] !== undefined
        ? currentVisibility[widgetId]
        : true;

      const updated = {
        ...prev,
        widgetVisibility: {
          ...currentVisibility,
          [widgetId]: !isCurrentlyVisible,
        },
      };

      if (currentUser && currentUser.id) {
        savePreferencesToStorage(currentUser.id, updated);
      }

      return updated;
    });
  }, [currentUser]);

  /**
   * Set the visibility of a specific widget to a specific value.
   *
   * @param {string} widgetId - The widget ID to update
   * @param {boolean} visible - Whether the widget should be visible
   */
  const setWidgetVisibility = useCallback((widgetId, visible) => {
    if (!widgetId || typeof widgetId !== 'string') {
      return;
    }

    setPreferencesState((prev) => {
      const currentVisibility = prev.widgetVisibility || {};

      const updated = {
        ...prev,
        widgetVisibility: {
          ...currentVisibility,
          [widgetId]: Boolean(visible),
        },
      };

      if (currentUser && currentUser.id) {
        savePreferencesToStorage(currentUser.id, updated);
      }

      return updated;
    });
  }, [currentUser]);

  /**
   * Update notification preferences.
   *
   * @param {object} notificationPrefs - The notification preferences to update
   */
  const updateNotificationPreferences = useCallback((notificationPrefs) => {
    if (!notificationPrefs || typeof notificationPrefs !== 'object') {
      return;
    }

    setPreferencesState((prev) => {
      const updated = {
        ...prev,
        notificationPreferences: {
          ...(prev.notificationPreferences || {}),
          ...notificationPrefs,
        },
      };

      if (currentUser && currentUser.id) {
        savePreferencesToStorage(currentUser.id, updated);
      }

      return updated;
    });
  }, [currentUser]);

  /**
   * Reset preferences to defaults and clear localStorage.
   */
  const resetPreferences = useCallback(() => {
    const defaults = buildDefaultPreferences();
    setPreferencesState(defaults);

    if (currentUser && currentUser.id) {
      clearPreferencesFromStorage(currentUser.id);
    }
  }, [currentUser]);

  const contextValue = {
    preferences,
    isLoaded,
    getPreferences,
    setPreferences,
    updateWidgetOrder,
    toggleWidgetVisibility,
    setWidgetVisibility,
    updateNotificationPreferences,
    resetPreferences,
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

/**
 * usePreferences - Custom hook to access preferences context.
 *
 * @returns {object} Preferences context value
 * @throws {Error} If used outside of PreferencesProvider
 */
export const usePreferences = () => {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider.');
  }

  return context;
};

export default PreferencesContext;