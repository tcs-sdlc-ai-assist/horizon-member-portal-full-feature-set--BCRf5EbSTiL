import { useCallback } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';

/**
 * ProgressBar - Reusable progress bar component for financial summaries
 * Implements the progress bar pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Renders a progress bar for deductible and out-of-pocket displays using HB
 * progress classes (hb-progress, hb-progress-bar). Shows filled portion with
 * percentage and formatted values (currency or percentage). Supports configurable
 * color class, size, label, and value formatting. Accessible with ARIA progressbar
 * role and proper labeling.
 *
 * @param {object} props
 * @param {number} props.current - The current/used value
 * @param {number} props.total - The total/maximum value
 * @param {string} [props.label] - Label text displayed above the progress bar
 * @param {'currency'|'percentage'|'number'} [props.formatValue='currency'] - How to format the displayed values
 * @param {string} [props.colorClass=''] - Custom color class for the progress bar fill (e.g., 'hb-progress-bar-success')
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Progress bar height size
 * @param {boolean} [props.showValues=true] - Whether to show the current/total values below the bar
 * @param {boolean} [props.showPercentage=true] - Whether to show the percentage text
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @param {string} [props.ariaLabel] - Custom accessible label for the progress bar
 * @returns {JSX.Element}
 */
const ProgressBar = ({
  current = 0,
  total = 0,
  label,
  formatValue = 'currency',
  colorClass = '',
  size = 'md',
  showValues = true,
  showPercentage = true,
  className = '',
  ariaLabel,
}) => {
  /**
   * Calculate the percentage of progress.
   *
   * @returns {number} The percentage value clamped between 0 and 100
   */
  const getPercentage = useCallback(() => {
    if (!total || total <= 0) {
      return 0;
    }

    const pct = (current / total) * 100;

    return Math.min(100, Math.max(0, pct));
  }, [current, total]);

  /**
   * Format a value based on the formatValue prop.
   *
   * @param {number} value - The value to format
   * @returns {string} The formatted value string
   */
  const formatDisplayValue = useCallback((value) => {
    if (value === null || value === undefined) {
      return '';
    }

    switch (formatValue) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value, 0);
      case 'number':
        return String(value);
      default:
        return formatCurrency(value);
    }
  }, [formatValue]);

  /**
   * Get the size class for the progress bar.
   *
   * @returns {string} The HB progress size CSS class
   */
  const getSizeClass = useCallback(() => {
    const sizeMap = {
      sm: 'hb-progress-sm',
      md: 'hb-progress-md',
      lg: 'hb-progress-lg',
    };

    return sizeMap[size] || 'hb-progress-md';
  }, [size]);

  /**
   * Get the fill color class for the progress bar.
   * If a custom colorClass is provided, use it. Otherwise, determine
   * the color based on the percentage filled.
   *
   * @param {number} percentage - The current percentage
   * @returns {string} The CSS class for the progress bar fill
   */
  const getFillColorClass = useCallback((percentage) => {
    if (colorClass) {
      return colorClass;
    }

    if (percentage >= 100) {
      return 'hb-progress-bar-error';
    }

    if (percentage >= 75) {
      return 'hb-progress-bar-warning';
    }

    return 'hb-progress-bar';
  }, [colorClass]);

  const percentage = getPercentage();
  const roundedPercentage = Math.round(percentage);
  const fillColor = getFillColorClass(percentage);
  const sizeClass = getSizeClass();

  const formattedCurrent = formatDisplayValue(current);
  const formattedTotal = formatDisplayValue(total);

  const accessibleLabel = ariaLabel || (label
    ? `${label}: ${formattedCurrent} of ${formattedTotal} (${roundedPercentage}%)`
    : `${formattedCurrent} of ${formattedTotal} (${roundedPercentage}%)`);

  return (
    <div className={`w-full ${className}`}>
      {/* Label and percentage header */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="hb-text-body-sm font-medium text-horizon-gray-700">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="hb-text-caption font-medium text-horizon-gray-600">
              {roundedPercentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`hb-progress ${sizeClass}`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={accessibleLabel}
      >
        <div
          className={`${fillColor} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Values display */}
      {showValues && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="hb-text-caption text-horizon-gray-500">
            {formattedCurrent} used
          </span>
          <span className="hb-text-caption text-horizon-gray-500">
            {formattedTotal} total
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;