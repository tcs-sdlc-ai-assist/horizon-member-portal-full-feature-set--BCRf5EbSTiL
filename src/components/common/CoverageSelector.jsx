import { useCallback } from 'react';

/**
 * CoverageSelector - Reusable coverage/plan selector dropdown component
 * Implements the coverage selector pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7170
 *
 * Renders a styled select dropdown using HB form classes (hb-form-group, hb-form-label,
 * hb-form-select). Accepts an array of coverage options and fires onChange when the
 * user selects a different plan. Used on ID Cards and Benefits pages to switch between
 * Medical, Dental, Vision, and other coverage types.
 *
 * @param {object} props
 * @param {Array<{id: string, label: string}>} props.coverages - Array of coverage options with id and label
 * @param {string} [props.selectedCoverageId] - The currently selected coverage ID
 * @param {function} props.onChange - Callback when the selected coverage changes (receives the new coverage ID)
 * @param {string} [props.label='Select Coverage'] - Label text displayed above the dropdown
 * @param {string} [props.placeholder='Choose a coverage plan'] - Placeholder option text
 * @param {boolean} [props.showLabel=true] - Whether to show the label above the dropdown
 * @param {boolean} [props.disabled=false] - Whether the dropdown is disabled
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @param {string} [props.size='md'] - Dropdown size: 'sm', 'md', 'lg'
 * @param {string} [props.ariaLabel] - Custom accessible label for the dropdown
 * @param {string} [props.id] - Custom HTML id attribute for the select element
 * @returns {JSX.Element}
 */
const CoverageSelector = ({
  coverages = [],
  selectedCoverageId,
  onChange,
  label = 'Select Coverage',
  placeholder = 'Choose a coverage plan',
  showLabel = true,
  disabled = false,
  className = '',
  size = 'md',
  ariaLabel,
  id,
}) => {
  /**
   * Get the size class for the select element.
   *
   * @param {string} selectSize - The size identifier
   * @returns {string} The size CSS class
   */
  const getSizeClass = useCallback((selectSize) => {
    const sizeMap = {
      sm: 'py-1.5 text-xs',
      md: 'py-2.5 text-sm',
      lg: 'py-3 text-base',
    };

    return sizeMap[selectSize] || sizeMap.md;
  }, []);

  /**
   * Handle select change event.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleChange = useCallback((e) => {
    if (onChange && typeof onChange === 'function') {
      onChange(e.target.value);
    }
  }, [onChange]);

  /**
   * Get the coverage type icon SVG based on the label text.
   *
   * @param {string} coverageLabel - The coverage label
   * @returns {JSX.Element|null} The icon SVG element or null
   */
  const getCoverageIcon = useCallback((coverageLabel) => {
    if (!coverageLabel || typeof coverageLabel !== 'string') {
      return null;
    }

    const lowerLabel = coverageLabel.toLowerCase();

    if (lowerLabel.includes('medical') || lowerLabel.includes('health')) {
      return (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    }

    if (lowerLabel.includes('dental')) {
      return (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    if (lowerLabel.includes('vision') || lowerLabel.includes('eye')) {
      return (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }, []);

  const selectId = id || 'coverage-selector';
  const sizeClass = getSizeClass(size);
  const currentValue = selectedCoverageId || '';

  // Find the currently selected coverage for displaying the icon
  const selectedCoverage = coverages.find((c) => c.id === currentValue);

  // Don't render if no coverages are provided
  if (!Array.isArray(coverages) || coverages.length === 0) {
    return null;
  }

  // If only one coverage, render as a static display instead of a dropdown
  if (coverages.length === 1) {
    const singleCoverage = coverages[0];

    return (
      <div className={`${className}`}>
        {showLabel && (
          <span className="hb-form-label mb-1">
            {label}
          </span>
        )}
        <div className="hb-inline-sm">
          {getCoverageIcon(singleCoverage.label)}
          <span className="text-sm font-medium text-horizon-gray-700">
            {singleCoverage.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`hb-form-group mb-0 ${className}`}>
      {showLabel && (
        <label
          htmlFor={selectId}
          className="hb-form-label mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {/* Coverage type icon */}
        {selectedCoverage && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getCoverageIcon(selectedCoverage.label)}
          </div>
        )}
        <select
          id={selectId}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={`hb-form-select ${sizeClass} ${selectedCoverage ? 'pl-9' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={ariaLabel || label}
        >
          {!selectedCoverageId && (
            <option value="">
              {placeholder}
            </option>
          )}
          {coverages.map((coverage) => (
            <option key={coverage.id} value={coverage.id}>
              {coverage.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CoverageSelector;