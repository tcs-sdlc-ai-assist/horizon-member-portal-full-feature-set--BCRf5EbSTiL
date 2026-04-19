import { useState, useCallback, useRef, useEffect } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import Button from '../common/Button.jsx';
import dashboardWidgets from '../../data/dashboard-widgets.json';

/**
 * WidgetCustomizer - Dashboard widget customization panel component
 * Implements the widget customization controls from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Allows users to show/hide widgets via checkboxes and reorder via up/down buttons.
 * Saves preferences via PreferencesContext. Uses HB checkbox and button classes.
 * Accessible with keyboard reordering support and proper ARIA attributes.
 *
 * @param {object} props
 * @param {boolean} [props.isOpen=false] - Whether the customizer panel is visible
 * @param {function} [props.onClose] - Callback when the panel is closed
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element|null}
 */
const WidgetCustomizer = ({ isOpen = false, onClose, className = '' }) => {
  const {
    preferences,
    updateWidgetOrder,
    toggleWidgetVisibility,
    setWidgetVisibility,
    resetPreferences,
  } = usePreferences();
  const { tagWidget, isEnabled: isGlassboxEnabled } = useGlassbox();

  const [localOrder, setLocalOrder] = useState([]);
  const [localVisibility, setLocalVisibility] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const itemRefs = useRef([]);

  /**
   * Build a map of widget metadata keyed by widget ID for quick lookup.
   */
  const widgetMetaMap = useCallback(() => {
    const map = {};
    dashboardWidgets.forEach((w) => {
      map[w.id] = w;
    });
    return map;
  }, []);

  const metaMap = widgetMetaMap();

  /**
   * Sync local state from preferences when panel opens.
   */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      const order = preferences.widgetOrder || [];
      const visibility = preferences.widgetVisibility || {};

      setLocalOrder([...order]);
      setLocalVisibility({ ...visibility });
      setIsDirty(false);
      setFocusedIndex(-1);

      // Focus the panel after a short delay for animation
      const timer = setTimeout(() => {
        if (panelRef.current) {
          const firstFocusable = panelRef.current.querySelector(
            'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Restore focus when panel closes
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen, preferences]);

  /**
   * Handle toggling widget visibility via checkbox.
   *
   * @param {string} widgetId - The widget ID to toggle
   */
  const handleToggleVisibility = useCallback((widgetId) => {
    if (!widgetId) {
      return;
    }

    setLocalVisibility((prev) => {
      const current = prev[widgetId] !== undefined ? prev[widgetId] : true;
      return {
        ...prev,
        [widgetId]: !current,
      };
    });

    setIsDirty(true);
  }, []);

  /**
   * Move a widget up in the order list.
   *
   * @param {number} index - The current index of the widget to move
   */
  const handleMoveUp = useCallback((index) => {
    if (index <= 0) {
      return;
    }

    setLocalOrder((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });

    setFocusedIndex(index - 1);
    setIsDirty(true);
  }, []);

  /**
   * Move a widget down in the order list.
   *
   * @param {number} index - The current index of the widget to move
   */
  const handleMoveDown = useCallback((index) => {
    setLocalOrder((prev) => {
      if (index >= prev.length - 1) {
        return prev;
      }

      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });

    setFocusedIndex(index + 1);
    setIsDirty(true);
  }, []);

  /**
   * Focus the item at the given index after state update.
   */
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      const moveUpBtn = itemRefs.current[focusedIndex]?.querySelector('[data-action="move-up"]');
      const moveDownBtn = itemRefs.current[focusedIndex]?.querySelector('[data-action="move-down"]');

      if (moveUpBtn && !moveUpBtn.disabled) {
        moveUpBtn.focus();
      } else if (moveDownBtn && !moveDownBtn.disabled) {
        moveDownBtn.focus();
      }
    }
  }, [focusedIndex, localOrder]);

  /**
   * Handle keyboard events on widget items for accessible reordering.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {number} index - The index of the widget item
   */
  const handleItemKeyDown = useCallback((e, index) => {
    if (e.key === 'ArrowUp' && e.altKey) {
      e.preventDefault();
      handleMoveUp(index);
      return;
    }

    if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      handleMoveDown(index);
      return;
    }
  }, [handleMoveUp, handleMoveDown]);

  /**
   * Save the current local preferences to the PreferencesContext.
   */
  const handleSave = useCallback(() => {
    updateWidgetOrder(localOrder);

    // Apply visibility changes
    Object.entries(localVisibility).forEach(([widgetId, visible]) => {
      setWidgetVisibility(widgetId, visible);
    });

    setIsDirty(false);

    if (isGlassboxEnabled) {
      tagWidget('widget_customizer', {
        action: 'save_preferences',
        route: '/dashboard',
        widgetCount: localOrder.length,
        visibleCount: Object.values(localVisibility).filter(Boolean).length,
      });
    }

    if (onClose) {
      onClose();
    }
  }, [localOrder, localVisibility, updateWidgetOrder, setWidgetVisibility, isGlassboxEnabled, tagWidget, onClose]);

  /**
   * Cancel changes and close the panel.
   */
  const handleCancel = useCallback(() => {
    setIsDirty(false);

    if (onClose) {
      onClose();
    }
  }, [onClose]);

  /**
   * Reset all widget preferences to defaults.
   */
  const handleReset = useCallback(() => {
    resetPreferences();

    // Reload defaults from the reset preferences
    const defaultSorted = [...dashboardWidgets].sort((a, b) => a.defaultOrder - b.defaultOrder);
    const defaultOrder = defaultSorted.map((w) => w.id);
    const defaultVisibility = {};
    defaultSorted.forEach((w) => {
      defaultVisibility[w.id] = w.defaultVisible;
    });

    setLocalOrder(defaultOrder);
    setLocalVisibility(defaultVisibility);
    setIsDirty(false);

    if (isGlassboxEnabled) {
      tagWidget('widget_customizer', {
        action: 'reset_preferences',
        route: '/dashboard',
      });
    }
  }, [resetPreferences, isGlassboxEnabled, tagWidget]);

  /**
   * Handle Escape key to close the panel.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handlePanelKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [handleCancel]);

  /**
   * Get the widget title from metadata.
   *
   * @param {string} widgetId - The widget ID
   * @returns {string} The widget title
   */
  const getWidgetTitle = useCallback((widgetId) => {
    const meta = metaMap[widgetId];
    return meta ? meta.title : widgetId;
  }, [metaMap]);

  /**
   * Get the widget description from metadata.
   *
   * @param {string} widgetId - The widget ID
   * @returns {string} The widget description
   */
  const getWidgetDescription = useCallback((widgetId) => {
    const meta = metaMap[widgetId];
    return meta ? meta.description : '';
  }, [metaMap]);

  /**
   * Get the widget icon SVG based on widget type.
   *
   * @param {string} widgetId - The widget ID
   * @returns {JSX.Element} The icon SVG element
   */
  const getWidgetIcon = useCallback((widgetId) => {
    const iconMap = {
      coverage_overview: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      recent_claims: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      spending_tracker: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      id_card: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
      deductible_progress: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      quick_links: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      notifications: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      documents: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
      find_care: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      prior_auth_status: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      benefits_snapshot: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      message_center: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    };

    return iconMap[widgetId] || (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  }, []);

  /**
   * Count the number of visible widgets.
   *
   * @returns {number} The count of visible widgets
   */
  const visibleCount = Object.values(localVisibility).filter(Boolean).length;
  const totalCount = localOrder.length;

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={`hb-card ${className}`}
      role="dialog"
      aria-modal="false"
      aria-label="Customize Dashboard Widgets"
      onKeyDown={handlePanelKeyDown}
    >
      {/* Panel Header */}
      <div className="hb-card-header">
        <div className="flex items-center justify-between">
          <div className="hb-inline-sm">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
              <svg
                className="w-4 h-4 text-horizon-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-horizon-primary mb-0">
                Customize Dashboard
              </h3>
              <p className="hb-text-caption text-horizon-gray-500 mb-0">
                {visibleCount} of {totalCount} widgets visible
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-full text-horizon-gray-400 hover:text-horizon-gray-700 hover:bg-horizon-gray-100 transition-all duration-200 cursor-pointer"
            aria-label="Close customization panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel Body - Widget List */}
      <div className="hb-card-body p-0">
        <div className="px-4 py-3 border-b border-horizon-gray-200 bg-horizon-gray-50">
          <p className="hb-text-caption text-horizon-gray-500 mb-0">
            Use checkboxes to show or hide widgets. Use the arrow buttons or{' '}
            <kbd className="px-1 py-0.5 text-xxs bg-horizon-gray-200 rounded">Alt</kbd>+
            <kbd className="px-1 py-0.5 text-xxs bg-horizon-gray-200 rounded">↑</kbd>/
            <kbd className="px-1 py-0.5 text-xxs bg-horizon-gray-200 rounded">↓</kbd>{' '}
            to reorder.
          </p>
        </div>

        <ul
          role="listbox"
          aria-label="Dashboard widgets"
          className="divide-y divide-horizon-gray-100"
        >
          {localOrder.map((widgetId, index) => {
            const isVisible = localVisibility[widgetId] !== undefined
              ? localVisibility[widgetId]
              : true;
            const title = getWidgetTitle(widgetId);
            const description = getWidgetDescription(widgetId);
            const isFirst = index === 0;
            const isLast = index === localOrder.length - 1;

            return (
              <li
                key={widgetId}
                ref={(el) => { itemRefs.current[index] = el; }}
                role="option"
                aria-selected={isVisible}
                aria-label={`${title}, ${isVisible ? 'visible' : 'hidden'}, position ${index + 1} of ${localOrder.length}`}
                className={`px-4 py-3 transition-colors duration-150 ${
                  isVisible ? 'bg-white' : 'bg-horizon-gray-50 opacity-70'
                }`}
                onKeyDown={(e) => handleItemKeyDown(e, index)}
              >
                <div className="flex items-center gap-3">
                  {/* Drag handle indicator */}
                  <div className="flex-shrink-0 text-horizon-gray-300" aria-hidden="true">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                    </svg>
                  </div>

                  {/* Visibility checkbox */}
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      id={`widget-toggle-${widgetId}`}
                      checked={isVisible}
                      onChange={() => handleToggleVisibility(widgetId)}
                      className="hb-form-checkbox"
                      aria-label={`${isVisible ? 'Hide' : 'Show'} ${title} widget`}
                    />
                  </div>

                  {/* Widget icon */}
                  <div className={`flex-shrink-0 ${isVisible ? 'text-horizon-primary' : 'text-horizon-gray-400'}`}>
                    {getWidgetIcon(widgetId)}
                  </div>

                  {/* Widget info */}
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`widget-toggle-${widgetId}`}
                      className={`text-sm font-medium cursor-pointer block truncate ${
                        isVisible ? 'text-horizon-gray-800' : 'text-horizon-gray-500'
                      }`}
                    >
                      {title}
                    </label>
                    {description && (
                      <p className="hb-text-caption text-horizon-gray-400 mb-0 truncate">
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Reorder buttons */}
                  <div className="flex-shrink-0 hb-inline-sm">
                    <button
                      type="button"
                      data-action="move-up"
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      className={`p-1 rounded text-horizon-gray-400 transition-colors duration-150 cursor-pointer ${
                        isFirst
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:text-horizon-primary hover:bg-horizon-gray-100'
                      }`}
                      aria-label={`Move ${title} up`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      data-action="move-down"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      className={`p-1 rounded text-horizon-gray-400 transition-colors duration-150 cursor-pointer ${
                        isLast
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:text-horizon-primary hover:bg-horizon-gray-100'
                      }`}
                      aria-label={`Move ${title} down`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Panel Footer */}
      <div className="hb-card-footer">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-horizon-gray-500 hover:text-horizon-primary transition-colors duration-200 cursor-pointer"
            aria-label="Reset to default widget layout"
          >
            Reset to defaults
          </button>
          <div className="hb-inline-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save Layout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCustomizer;