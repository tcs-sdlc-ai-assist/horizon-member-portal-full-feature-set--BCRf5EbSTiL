import { useCallback } from 'react';

/**
 * LoadingSpinner - Reusable loading spinner/skeleton component
 * Implements the loading state indicator pattern from the Member Experience & Self-Service LLD.
 *
 * Displays an animated spinner with optional loading text using HB spinner classes
 * (hb-spinner, hb-spinner-sm, hb-spinner-md, hb-spinner-lg). Supports configurable
 * size, loading text, overlay mode, and full-page mode. Accessible with proper
 * ARIA role="status" and screen reader text.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Spinner size
 * @param {string} [props.text] - Optional loading text displayed below the spinner
 * @param {boolean} [props.overlay=false] - Whether to render as an overlay on top of content
 * @param {boolean} [props.fullPage=false] - Whether to render as a full-page centered spinner
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @param {string} [props.ariaLabel='Loading'] - Accessible label for the spinner
 * @param {'primary'|'white'} [props.color='primary'] - Spinner color variant
 * @returns {JSX.Element}
 */
const LoadingSpinner = ({
  size = 'md',
  text,
  overlay = false,
  fullPage = false,
  className = '',
  ariaLabel = 'Loading',
  color = 'primary',
}) => {
  /**
   * Get the HB CSS class for the spinner size.
   *
   * @param {string} spinnerSize - The size identifier
   * @returns {string} The HB spinner size CSS class
   */
  const getSizeClass = useCallback((spinnerSize) => {
    const sizeMap = {
      sm: 'hb-spinner-sm',
      md: 'hb-spinner-md',
      lg: 'hb-spinner-lg',
      xl: 'hb-spinner-xl',
    };

    return sizeMap[spinnerSize] || 'hb-spinner-md';
  }, []);

  /**
   * Get the color class for the spinner.
   *
   * @param {string} spinnerColor - The color variant
   * @returns {string} The HB spinner color CSS class
   */
  const getColorClass = useCallback((spinnerColor) => {
    if (spinnerColor === 'white') {
      return 'hb-spinner-white';
    }

    return '';
  }, []);

  /**
   * Get the text size class based on spinner size.
   *
   * @param {string} spinnerSize - The size identifier
   * @returns {string} The text size CSS class
   */
  const getTextSizeClass = useCallback((spinnerSize) => {
    const textSizeMap = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-base',
    };

    return textSizeMap[spinnerSize] || 'text-sm';
  }, []);

  const sizeClass = getSizeClass(size);
  const colorClass = getColorClass(color);
  const textSizeClass = getTextSizeClass(size);

  const spinnerClasses = [
    'hb-spinner',
    sizeClass,
    colorClass,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  /**
   * Render the spinner content (spinner + optional text).
   *
   * @returns {JSX.Element}
   */
  const renderSpinnerContent = () => {
    return (
      <div className="hb-flex-center flex-col gap-3">
        <span className={spinnerClasses} aria-hidden="true" />
        {text && (
          <p className={`${textSizeClass} text-horizon-gray-500 mb-0`}>
            {text}
          </p>
        )}
        <span className="hb-sr-only">{ariaLabel}</span>
      </div>
    );
  };

  // Full-page centered spinner
  if (fullPage) {
    return (
      <div
        className={`hb-flex-center min-h-screen-content ${className}`}
        role="status"
        aria-label={ariaLabel}
      >
        {renderSpinnerContent()}
      </div>
    );
  }

  // Overlay spinner (positioned over parent content)
  if (overlay) {
    return (
      <div
        className={`hb-loading-overlay ${className}`}
        role="status"
        aria-label={ariaLabel}
      >
        {renderSpinnerContent()}
      </div>
    );
  }

  // Default inline spinner
  return (
    <div
      className={`hb-flex-center py-8 ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      {renderSpinnerContent()}
    </div>
  );
};

export default LoadingSpinner;