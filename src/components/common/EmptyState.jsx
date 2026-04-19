import { useCallback } from 'react';
import Button from './Button.jsx';

/**
 * EmptyState - Reusable empty state placeholder component
 * Implements the empty state pattern from the Member Experience & Self-Service LLD.
 *
 * Displays a centered icon, title, descriptive message, and optional call-to-action
 * button when no data is available. Uses HB styling classes for consistent branding.
 * Accessible with proper ARIA attributes and semantic structure.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon] - Custom icon element to display; if not provided, a default empty state icon is rendered
 * @param {string} [props.title='No data available'] - Title text displayed below the icon
 * @param {string|React.ReactNode} [props.message] - Descriptive message displayed below the title
 * @param {string} [props.actionLabel] - Label for the optional CTA button
 * @param {function} [props.onAction] - Callback when the CTA button is clicked
 * @param {string} [props.actionVariant='primary'] - Button variant for the CTA button
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @param {string} [props.size='md'] - Size of the empty state display: 'sm', 'md', 'lg'
 * @param {React.ReactNode} [props.children] - Optional children rendered after the message and before the action button
 * @returns {JSX.Element}
 */
const EmptyState = ({
  icon,
  title = 'No data available',
  message,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  className = '',
  size = 'md',
  children,
}) => {
  /**
   * Get the size classes for the empty state container.
   *
   * @param {string} emptySize - The size identifier
   * @returns {object} Object with icon, title, message, and padding classes
   */
  const getSizeClasses = useCallback((emptySize) => {
    const sizeMap = {
      sm: {
        padding: 'py-6 px-4',
        iconWrapper: 'w-10 h-10',
        iconSize: 'w-5 h-5',
        title: 'text-sm font-semibold',
        message: 'text-xs',
        gap: 'gap-2',
      },
      md: {
        padding: 'py-10 px-6',
        iconWrapper: 'w-14 h-14',
        iconSize: 'w-7 h-7',
        title: 'text-base font-semibold',
        message: 'text-sm',
        gap: 'gap-3',
      },
      lg: {
        padding: 'py-16 px-8',
        iconWrapper: 'w-20 h-20',
        iconSize: 'w-10 h-10',
        title: 'text-lg font-bold',
        message: 'text-base',
        gap: 'gap-4',
      },
    };

    return sizeMap[emptySize] || sizeMap.md;
  }, []);

  /**
   * Get the default empty state icon SVG.
   *
   * @param {string} iconSize - The icon size CSS class
   * @returns {JSX.Element} The default icon SVG element
   */
  const getDefaultIcon = useCallback((iconSize) => {
    return (
      <svg
        className={`${iconSize} text-horizon-gray-400`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    );
  }, []);

  /**
   * Handle CTA button click.
   */
  const handleAction = useCallback(() => {
    if (onAction && typeof onAction === 'function') {
      onAction();
    }
  }, [onAction]);

  const sizeClasses = getSizeClasses(size);

  return (
    <div
      className={`hb-flex-center flex-col ${sizeClasses.padding} ${sizeClasses.gap} text-center ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center ${sizeClasses.iconWrapper} rounded-full bg-horizon-gray-100 flex-shrink-0`}
      >
        {icon || getDefaultIcon(sizeClasses.iconSize)}
      </div>

      {/* Title */}
      {title && (
        <h3 className={`${sizeClasses.title} text-horizon-gray-700 mb-0`}>
          {title}
        </h3>
      )}

      {/* Message */}
      {message && (
        <p className={`${sizeClasses.message} text-horizon-gray-500 mb-0 max-w-md`}>
          {message}
        </p>
      )}

      {/* Children */}
      {children}

      {/* CTA Button */}
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button
            variant={actionVariant}
            size={size === 'sm' ? 'sm' : 'md'}
            onClick={handleAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;