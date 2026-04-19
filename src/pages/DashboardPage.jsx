import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePreferences } from '../contexts/PreferencesContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import GreetingBanner from '../components/dashboard/GreetingBanner.jsx';
import FindCareCTA from '../components/dashboard/FindCareCTA.jsx';
import RecentClaimsWidget from '../components/dashboard/RecentClaimsWidget.jsx';
import IDCardSummaryWidget from '../components/dashboard/IDCardSummaryWidget.jsx';
import DeductibleOOPWidget from '../components/dashboard/DeductibleOOPWidget.jsx';
import LearningCenterWidget from '../components/dashboard/LearningCenterWidget.jsx';
import WidgetCustomizer from '../components/dashboard/WidgetCustomizer.jsx';
import Button from '../components/common/Button.jsx';

/**
 * Widget component registry mapping widget IDs to their React components.
 * Used to dynamically render widgets based on user preferences.
 */
const WIDGET_COMPONENT_MAP = {
  find_care: FindCareCTA,
  recent_claims: RecentClaimsWidget,
  id_card: IDCardSummaryWidget,
  deductible_progress: DeductibleOOPWidget,
};

/**
 * Widgets that span the full width of the grid (single column).
 */
const FULL_WIDTH_WIDGETS = new Set([
  'find_care',
  'recent_claims',
]);

/**
 * Widgets that render in the two-column grid layout.
 */
const HALF_WIDTH_WIDGETS = new Set([
  'id_card',
  'deductible_progress',
]);

/**
 * DashboardPage - Main dashboard page component
 * Implements the Dashboard from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Renders GreetingBanner at the top, then a widget grid based on user
 * preferences from PreferencesContext. Widgets include FindCareCTA,
 * RecentClaimsWidget, IDCardSummaryWidget, DeductibleOOPWidget, and
 * LearningCenterWidget. Includes a WidgetCustomizer toggle button for
 * showing/hiding and reordering widgets. Uses HB grid classes for
 * responsive layout. Implements Dashboard exports (getWidgetConfig,
 * setWidgetConfig) from the LLD.
 *
 * @returns {JSX.Element}
 */
const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { preferences, getPreferences, setPreferences } = usePreferences();
  const { tagPage, tagWidget, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  /**
   * Log dashboard page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/dashboard', {
        action: 'dashboard_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/dashboard', {
          action: 'dashboard_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /**
   * Get the current widget configuration from preferences.
   * Implements getWidgetConfig from the LLD.
   *
   * @returns {object} Widget configuration with order and visibility
   */
  const getWidgetConfig = useCallback(() => {
    const prefs = getPreferences();
    return {
      widgetOrder: prefs.widgetOrder || [],
      widgetVisibility: prefs.widgetVisibility || {},
    };
  }, [getPreferences]);

  /**
   * Set the widget configuration in preferences.
   * Implements setWidgetConfig from the LLD.
   *
   * @param {object} config - Widget configuration with order and visibility
   */
  const setWidgetConfig = useCallback((config) => {
    if (!config || typeof config !== 'object') {
      return;
    }

    const currentPrefs = getPreferences();
    const updatedPrefs = { ...currentPrefs };

    if (Array.isArray(config.widgetOrder)) {
      updatedPrefs.widgetOrder = config.widgetOrder;
    }

    if (config.widgetVisibility && typeof config.widgetVisibility === 'object') {
      updatedPrefs.widgetVisibility = {
        ...(currentPrefs.widgetVisibility || {}),
        ...config.widgetVisibility,
      };
    }

    setPreferences(updatedPrefs);
  }, [getPreferences, setPreferences]);

  /**
   * Get the ordered list of visible widgets based on user preferences.
   */
  const visibleWidgets = useMemo(() => {
    const widgetOrder = preferences.widgetOrder || [];
    const widgetVisibility = preferences.widgetVisibility || {};

    return widgetOrder.filter((widgetId) => {
      const isVisible = widgetVisibility[widgetId] !== undefined
        ? widgetVisibility[widgetId]
        : true;
      return isVisible;
    });
  }, [preferences]);

  /**
   * Separate visible widgets into those with dedicated components
   * and those that are handled by the LearningCenterWidget or other
   * non-mapped widgets.
   */
  const renderedWidgets = useMemo(() => {
    const mapped = [];
    let hasLearningCenter = false;

    visibleWidgets.forEach((widgetId) => {
      if (WIDGET_COMPONENT_MAP[widgetId]) {
        mapped.push({
          id: widgetId,
          Component: WIDGET_COMPONENT_MAP[widgetId],
          fullWidth: FULL_WIDTH_WIDGETS.has(widgetId),
        });
      }
    });

    // Check if any non-mapped widget types should trigger the learning center
    // The learning center is always shown at the bottom if there are visible widgets
    const nonMappedVisible = visibleWidgets.filter(
      (id) => !WIDGET_COMPONENT_MAP[id]
    );

    if (nonMappedVisible.length > 0 || mapped.length > 0) {
      hasLearningCenter = true;
    }

    return { mapped, hasLearningCenter };
  }, [visibleWidgets]);

  /**
   * Handle toggling the widget customizer panel.
   */
  const handleToggleCustomizer = useCallback(() => {
    setIsCustomizerOpen((prev) => {
      const newState = !prev;

      if (isGlassboxEnabled) {
        tagWidget('widget_customizer', {
          action: newState ? 'open' : 'close',
          route: '/dashboard',
        });
      }

      return newState;
    });
  }, [isGlassboxEnabled, tagWidget]);

  /**
   * Handle closing the widget customizer panel.
   */
  const handleCloseCustomizer = useCallback(() => {
    setIsCustomizerOpen(false);
  }, []);

  /**
   * Group half-width widgets into pairs for the two-column grid layout.
   *
   * @param {Array} widgets - Array of widget config objects
   * @returns {Array} Array of arrays, each containing 1-2 widgets for a row
   */
  const groupWidgetsForLayout = useCallback((widgets) => {
    const fullWidthItems = [];
    const halfWidthItems = [];

    widgets.forEach((widget) => {
      if (widget.fullWidth) {
        fullWidthItems.push(widget);
      } else {
        halfWidthItems.push(widget);
      }
    });

    // Build layout order: interleave full-width and half-width pairs
    // based on original order
    const layout = [];
    let halfIndex = 0;

    widgets.forEach((widget) => {
      if (widget.fullWidth) {
        layout.push({ type: 'full', widget });
      } else {
        // Only add half-width pair when we encounter the first of a pair
        if (halfWidthItems[halfIndex] === widget) {
          const pair = [widget];
          if (halfIndex + 1 < halfWidthItems.length) {
            pair.push(halfWidthItems[halfIndex + 1]);
            halfIndex += 2;
          } else {
            halfIndex += 1;
          }
          layout.push({ type: 'half', widgets: pair });
        }
      }
    });

    return layout;
  }, []);

  const layoutGroups = useMemo(() => {
    return groupWidgetsForLayout(renderedWidgets.mapped);
  }, [renderedWidgets.mapped, groupWidgetsForLayout]);

  /**
   * Count visible widgets for the customizer button label.
   */
  const visibleWidgetCount = visibleWidgets.length;
  const totalWidgetCount = (preferences.widgetOrder || []).length;

  return (
    <div>
      {/* Greeting Banner */}
      <GreetingBanner className="mb-6" />

      {/* Dashboard Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-horizon-primary mb-0">
            My Dashboard
          </h2>
          <p className="hb-text-caption text-horizon-gray-500 mb-0">
            {visibleWidgetCount} of {totalWidgetCount} widgets visible
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleCustomizer}
          ariaLabel={isCustomizerOpen ? 'Close dashboard customizer' : 'Customize dashboard widgets'}
          ariaExpanded={isCustomizerOpen}
          leftIcon={
            <svg
              className="w-4 h-4"
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
          }
        >
          {isCustomizerOpen ? 'Close Customizer' : 'Customize'}
        </Button>
      </div>

      {/* Widget Customizer Panel */}
      {isCustomizerOpen && (
        <div className="mb-6 hb-animate-fade-in">
          <WidgetCustomizer
            isOpen={isCustomizerOpen}
            onClose={handleCloseCustomizer}
          />
        </div>
      )}

      {/* Widget Grid */}
      {renderedWidgets.mapped.length > 0 ? (
        <div className="space-y-6">
          {layoutGroups.map((group, groupIndex) => {
            if (group.type === 'full') {
              const { widget } = group;
              const { Component } = widget;

              return (
                <div key={`full-${widget.id}-${groupIndex}`}>
                  <Component />
                </div>
              );
            }

            if (group.type === 'half') {
              return (
                <div
                  key={`half-group-${groupIndex}`}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {group.widgets.map((widget) => {
                    const { Component } = widget;

                    return (
                      <div key={widget.id}>
                        <Component />
                      </div>
                    );
                  })}
                </div>
              );
            }

            return null;
          })}

          {/* Learning Center Widget - always at the bottom */}
          {renderedWidgets.hasLearningCenter && (
            <LearningCenterWidget />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Show Learning Center even when no mapped widgets are visible */}
          <LearningCenterWidget />

          {/* Empty state hint */}
          <div className="hb-card">
            <div className="hb-card-body">
              <div className="hb-flex-center flex-col gap-3 py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-horizon-gray-100">
                  <svg
                    className="w-7 h-7 text-horizon-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-horizon-gray-700 mb-0">
                  No widgets visible
                </h3>
                <p className="hb-text-body-sm text-horizon-gray-500 mb-0 max-w-md text-center">
                  All dashboard widgets are currently hidden. Click the &ldquo;Customize&rdquo; button above to show widgets on your dashboard.
                </p>
                <div className="mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleToggleCustomizer}
                    ariaLabel="Open dashboard customizer to show widgets"
                    leftIcon={
                      <svg
                        className="w-4 h-4"
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
                    }
                  >
                    Customize Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-6">
        <div className="hb-inline-sm">
          <svg
            className="w-4 h-4 text-horizon-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="hb-text-caption text-horizon-gray-500 mb-0">
            Your dashboard layout is saved automatically. Use the Customize button to show, hide, or reorder widgets.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;