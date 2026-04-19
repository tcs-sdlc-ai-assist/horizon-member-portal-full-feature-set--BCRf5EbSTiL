import { useCallback } from 'react';

/**
 * Badge - Reusable status badge/chip component
 * Implements the badge/chip pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171, SCRUM-7172
 *
 * Renders a badge/chip element using HB badge classes (hb-badge, hb-badge-success,
 * hb-badge-warning, hb-badge-error, hb-badge-info, hb-badge-neutral, hb-badge-primary,
 * hb-badge-secondary). Supports configurable variant, size, dot indicator, outline mode,
 * icon, and custom className. Used for claim statuses, notification types, and document
 * categories throughout the portal. Accessible with proper ARIA attributes.
 *
 * @param {object} props
 * @param {string} props.label - The text content displayed inside the badge
 * @param {'success'|'warning'|'error'|'info'|'neutral'|'primary'|'secondary'} [props.variant='neutral'] - Badge color variant
 * @param {'sm'|'md'} [props.size='md'] - Badge size
 * @param {boolean} [props.dot=false] - Whether to show a colored dot indicator before the label
 * @param {boolean} [props.outline=false] - Whether to render as an outline badge
 * @param {React.ReactNode} [props.icon] - Optional icon element to display before the label
 * @param {string} [props.className=''] - Additional CSS classes for the badge container
 * @param {string} [props.ariaLabel] - Custom accessible label for the badge
 * @returns {JSX.Element}
 */
const Badge = ({
  label,
  variant = 'neutral',
  size = 'md',
  dot = false,
  outline = false,
  icon,
  className = '',
  ariaLabel,
}) => {
  /**
   * Get the HB CSS class for the badge variant.
   *
   * @param {string} badgeVariant - The variant identifier
   * @returns {string} The HB badge CSS class
   */
  const getVariantClass = useCallback((badgeVariant) => {
    if (outline) {
      return 'hb-badge-outline';
    }

    const variantMap = {
      success: 'hb-badge-success',
      warning: 'hb-badge-warning',
      error: 'hb-badge-error',
      info: 'hb-badge-info',
      neutral: 'hb-badge-neutral',
      primary: 'hb-badge-primary',
      secondary: 'hb-badge-secondary',
    };

    return variantMap[badgeVariant] || 'hb-badge-neutral';
  }, [outline]);

  /**
   * Get the HB CSS class for the dot indicator based on variant.
   *
   * @param {string} badgeVariant - The variant identifier
   * @returns {string} The HB badge dot CSS class
   */
  const getDotClass = useCallback((badgeVariant) => {
    const dotMap = {
      success: 'hb-badge-dot-success',
      warning: 'hb-badge-dot-warning',
      error: 'hb-badge-dot-error',
      info: 'hb-badge-dot-info',
      neutral: 'hb-badge-dot bg-horizon-gray-400',
      primary: 'hb-badge-dot bg-horizon-primary',
      secondary: 'hb-badge-dot bg-horizon-secondary',
    };

    return dotMap[badgeVariant] || 'hb-badge-dot bg-horizon-gray-400';
  }, []);

  /**
   * Get the outline color class based on variant.
   *
   * @param {string} badgeVariant - The variant identifier
   * @returns {string} The outline color CSS class
   */
  const getOutlineColorClass = useCallback((badgeVariant) => {
    const colorMap = {
      success: 'text-green-800 border-green-800',
      warning: 'text-yellow-800 border-yellow-800',
      error: 'text-red-800 border-red-800',
      info: 'text-blue-800 border-blue-800',
      neutral: 'text-horizon-gray-700 border-horizon-gray-700',
      primary: 'text-horizon-primary border-horizon-primary',
      secondary: 'text-horizon-secondary-dark border-horizon-secondary-dark',
    };

    return colorMap[badgeVariant] || 'text-horizon-gray-700 border-horizon-gray-700';
  }, []);

  /**
   * Get the size class for the badge.
   *
   * @param {string} badgeSize - The size identifier
   * @returns {string} The size CSS class
   */
  const getSizeClass = useCallback((badgeSize) => {
    const sizeMap = {
      sm: 'text-xxs px-2 py-0',
      md: '',
    };

    return sizeMap[badgeSize] || '';
  }, []);

  const variantClass = getVariantClass(variant);
  const sizeClass = getSizeClass(size);
  const outlineColorClass = outline ? getOutlineColorClass(variant) : '';

  const badgeClasses = [
    'hb-badge',
    variantClass,
    sizeClass,
    outlineColorClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <span
      className={badgeClasses}
      role="status"
      aria-label={ariaLabel || label}
    >
      {dot && (
        <span className={getDotClass(variant)} aria-hidden="true" />
      )}
      {icon && !dot && (
        <span className="flex-shrink-0 mr-1" aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </span>
  );
};

export default Badge;