import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * FilterPanel - Reusable filter controls panel component
 * Implements the filter panel pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171, SCRUM-7172
 *
 * Renders a configurable set of filter controls including dropdowns (select) and
 * date range pickers. Uses HB form classes (hb-form-group, hb-form-label,
 * hb-form-select, hb-form-input). Supports configurable filters array with
 * key, label, type, and options. Displays active filter count and clear all button.
 * Accessible with proper labels, ARIA attributes, and keyboard navigation.
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, type: 'select'|'dateRange', options?: Array<{value: string, label: string}>, placeholder?: string}>} props.filters - Array of filter definitions
 * @param {object} props.activeFilters - Object keyed by filter key with current filter values
 * @param {function} props.onFilterChange - Callback when a filter value changes (key, value)
 * @param {function} [props.onClearFilters] - Callback to clear all active filters
 * @param {string} [props.className=''] - Additional CSS classes for the panel wrapper
 * @param {boolean} [props.collapsible=false] - Whether the filter panel can be collapsed on mobile
 * @param {string} [props.ariaLabel='Filter controls'] - Accessible label for the filter panel
 * @returns {JSX.Element}
 */
const FilterPanel = ({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  className = '',
  collapsible = false,
  ariaLabel = 'Filter controls',
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const panelRef = useRef(null);

  /**
   * Count the number of active (non-empty) filters.
   *
   * @returns {number} The count of active filters
   */
  const getActiveFilterCount = useCallback(() => {
    if (!activeFilters || typeof activeFilters !== 'object') {
      return 0;
    }

    return Object.entries(activeFilters).reduce((count, [key, value]) => {
      if (value === null || value === undefined || value === '') {
        return count;
      }

      // For date range filters, check if at least one date is set
      if (typeof value === 'object' && value !== null) {
        const hasStart = value.start && value.start !== '';
        const hasEnd = value.end && value.end !== '';
        return hasStart || hasEnd ? count + 1 : count;
      }

      return count + 1;
    }, 0);
  }, [activeFilters]);

  /**
   * Handle select filter change.
   *
   * @param {string} filterKey - The filter key
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleSelectChange = useCallback((filterKey, e) => {
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(filterKey, e.target.value);
    }
  }, [onFilterChange]);

  /**
   * Handle date range filter change.
   *
   * @param {string} filterKey - The filter key
   * @param {'start'|'end'} dateField - Which date field changed
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleDateChange = useCallback((filterKey, dateField, e) => {
    if (onFilterChange && typeof onFilterChange === 'function') {
      const currentValue = activeFilters[filterKey] || { start: '', end: '' };
      const updatedValue = {
        ...currentValue,
        [dateField]: e.target.value,
      };
      onFilterChange(filterKey, updatedValue);
    }
  }, [onFilterChange, activeFilters]);

  /**
   * Handle clearing all filters.
   */
  const handleClearFilters = useCallback(() => {
    if (onClearFilters && typeof onClearFilters === 'function') {
      onClearFilters();
    }
  }, [onClearFilters]);

  /**
   * Toggle the expanded state of the filter panel.
   */
  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /**
   * Handle keyboard events on the toggle button.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleToggleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleExpanded();
    }
  }, [handleToggleExpanded]);

  /**
   * Get the current value for a select filter.
   *
   * @param {string} filterKey - The filter key
   * @returns {string} The current filter value
   */
  const getSelectValue = useCallback((filterKey) => {
    if (!activeFilters || activeFilters[filterKey] === null || activeFilters[filterKey] === undefined) {
      return '';
    }

    return String(activeFilters[filterKey]);
  }, [activeFilters]);

  /**
   * Get the current value for a date range filter field.
   *
   * @param {string} filterKey - The filter key
   * @param {'start'|'end'} dateField - Which date field
   * @returns {string} The current date value
   */
  const getDateValue = useCallback((filterKey, dateField) => {
    if (!activeFilters || !activeFilters[filterKey]) {
      return '';
    }

    const rangeValue = activeFilters[filterKey];

    if (typeof rangeValue === 'object' && rangeValue !== null) {
      return rangeValue[dateField] || '';
    }

    return '';
  }, [activeFilters]);

  /**
   * Check if a specific filter has an active value.
   *
   * @param {string} filterKey - The filter key
   * @returns {boolean} True if the filter has an active value
   */
  const isFilterActive = useCallback((filterKey) => {
    if (!activeFilters || activeFilters[filterKey] === null || activeFilters[filterKey] === undefined) {
      return false;
    }

    const value = activeFilters[filterKey];

    if (value === '') {
      return false;
    }

    if (typeof value === 'object' && value !== null) {
      return (value.start && value.start !== '') || (value.end && value.end !== '');
    }

    return true;
  }, [activeFilters]);

  const activeFilterCount = getActiveFilterCount();

  /**
   * Render a select filter control.
   *
   * @param {object} filter - The filter definition
   * @returns {JSX.Element}
   */
  const renderSelectFilter = (filter) => {
    const filterId = `filter-${filter.key}`;
    const currentValue = getSelectValue(filter.key);
    const isActive = isFilterActive(filter.key);

    return (
      <div key={filter.key} className="hb-form-group mb-0">
        <label
          htmlFor={filterId}
          className="hb-form-label mb-1"
        >
          {filter.label}
        </label>
        <select
          id={filterId}
          value={currentValue}
          onChange={(e) => handleSelectChange(filter.key, e)}
          className={`hb-form-select py-2 text-sm ${isActive ? 'border-horizon-primary ring-1 ring-horizon-primary/20' : ''}`}
          aria-label={`Filter by ${filter.label}`}
        >
          <option value="">
            {filter.placeholder || `All ${filter.label}`}
          </option>
          {Array.isArray(filter.options) && filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  /**
   * Render a date range filter control.
   *
   * @param {object} filter - The filter definition
   * @returns {JSX.Element}
   */
  const renderDateRangeFilter = (filter) => {
    const startId = `filter-${filter.key}-start`;
    const endId = `filter-${filter.key}-end`;
    const startValue = getDateValue(filter.key, 'start');
    const endValue = getDateValue(filter.key, 'end');
    const isActive = isFilterActive(filter.key);

    return (
      <div key={filter.key} className="hb-form-group mb-0">
        <span
          className="hb-form-label mb-1 block"
          id={`filter-${filter.key}-label`}
        >
          {filter.label}
        </span>
        <div
          className="flex items-center gap-2"
          role="group"
          aria-labelledby={`filter-${filter.key}-label`}
        >
          <div className="flex-1">
            <label htmlFor={startId} className="hb-sr-only">
              {filter.label} start date
            </label>
            <input
              id={startId}
              type="date"
              value={startValue}
              onChange={(e) => handleDateChange(filter.key, 'start', e)}
              max={endValue || undefined}
              className={`hb-form-input py-2 text-sm ${isActive ? 'border-horizon-primary ring-1 ring-horizon-primary/20' : ''}`}
              aria-label={`${filter.label} start date`}
            />
          </div>
          <span className="hb-text-caption text-horizon-gray-400 flex-shrink-0" aria-hidden="true">
            to
          </span>
          <div className="flex-1">
            <label htmlFor={endId} className="hb-sr-only">
              {filter.label} end date
            </label>
            <input
              id={endId}
              type="date"
              value={endValue}
              onChange={(e) => handleDateChange(filter.key, 'end', e)}
              min={startValue || undefined}
              className={`hb-form-input py-2 text-sm ${isActive ? 'border-horizon-primary ring-1 ring-horizon-primary/20' : ''}`}
              aria-label={`${filter.label} end date`}
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render a filter control based on its type.
   *
   * @param {object} filter - The filter definition
   * @returns {JSX.Element|null}
   */
  const renderFilter = (filter) => {
    if (!filter || !filter.key || !filter.type) {
      return null;
    }

    switch (filter.type) {
      case 'select':
        return renderSelectFilter(filter);
      case 'dateRange':
        return renderDateRangeFilter(filter);
      default:
        return null;
    }
  };

  // Don't render if no filters are defined
  if (!Array.isArray(filters) || filters.length === 0) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={`bg-white rounded-xl border border-horizon-gray-200 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-horizon-gray-200">
        <div className="hb-inline-sm">
          {collapsible ? (
            <button
              type="button"
              onClick={handleToggleExpanded}
              onKeyDown={handleToggleKeyDown}
              className="hb-inline-sm text-sm font-medium text-horizon-gray-700 hover:text-horizon-primary transition-colors duration-200 cursor-pointer"
              aria-expanded={isExpanded}
              aria-controls="filter-panel-content"
            >
              <svg
                className="w-4 h-4 text-horizon-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filters</span>
              <svg
                className={`w-4 h-4 text-horizon-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <span className="hb-inline-sm text-sm font-medium text-horizon-gray-700">
              <svg
                className="w-4 h-4 text-horizon-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filters</span>
            </span>
          )}

          {activeFilterCount > 0 && (
            <span
              className="hb-badge hb-badge-primary text-xxs"
              aria-label={`${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''}`}
            >
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-medium text-horizon-gray-500 hover:text-horizon-primary transition-colors duration-200 cursor-pointer"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Panel Content */}
      {isExpanded && (
        <div
          id="filter-panel-content"
          className="px-4 py-4 hb-animate-fade-in"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => renderFilter(filter))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;