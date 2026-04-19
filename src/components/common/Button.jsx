import { useCallback } from 'react';

/**
 * Button - Reusable branded button component
 * Implements the button system from the Member Experience & Self-Service LLD.
 *
 * Renders a button element using HB button classes (hb-btn-primary, hb-btn-secondary,
 * hb-btn-outline, hb-btn-ghost, hb-btn-danger, hb-btn-link). Supports configurable
 * variant, size, disabled state, loading state, full-width mode, icon-only mode,
 * and custom className. Handles hover/focus states and disabled styling.
 * Accessible with proper ARIA attributes and keyboard navigation.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'outline-secondary'|'ghost'|'danger'|'link'} [props.variant='primary'] - Button style variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Button size
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.loading=false] - Whether the button is in a loading state
 * @param {boolean} [props.block=false] - Whether the button should be full width
 * @param {boolean} [props.iconOnly=false] - Whether the button is an icon-only button
 * @param {function} [props.onClick] - Click handler callback
 * @param {React.ReactNode} props.children - Button content
 * @param {'button'|'submit'|'reset'} [props.type='button'] - HTML button type attribute
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.ariaLabel] - Accessible label for the button
 * @param {string} [props.ariaDescribedBy] - ID of element describing the button
 * @param {boolean} [props.ariaExpanded] - Whether an associated element is expanded
 * @param {boolean} [props.ariaHasPopup] - Whether the button triggers a popup
 * @param {string} [props.loadingText='Loading...'] - Text to display during loading state
 * @param {React.ReactNode} [props.leftIcon] - Icon element to render before children
 * @param {React.ReactNode} [props.rightIcon] - Icon element to render after children
 * @param {React.Ref} [props.buttonRef] - Ref forwarded to the button element
 * @returns {JSX.Element}
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  iconOnly = false,
  onClick,
  children,
  type = 'button',
  className = '',
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaHasPopup,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  buttonRef,
  ...restProps
}) => {
  /**
   * Get the HB CSS class for the button variant.
   *
   * @param {string} buttonVariant - The variant identifier
   * @returns {string} The HB button CSS class
   */
  const getVariantClass = (buttonVariant) => {
    const variantMap = {
      primary: 'hb-btn-primary',
      secondary: 'hb-btn-secondary',
      outline: 'hb-btn-outline',
      'outline-secondary': 'hb-btn-outline-secondary',
      ghost: 'hb-btn-ghost',
      danger: 'hb-btn-danger',
      link: 'hb-btn-link',
    };

    return variantMap[buttonVariant] || 'hb-btn-primary';
  };

  /**
   * Get the HB CSS class for the button size.
   *
   * @param {string} buttonSize - The size identifier
   * @returns {string} The HB button size CSS class
   */
  const getSizeClass = (buttonSize) => {
    const sizeMap = {
      xs: 'hb-btn-xs',
      sm: 'hb-btn-sm',
      md: '',
      lg: 'hb-btn-lg',
      xl: 'hb-btn-xl',
    };

    return sizeMap[buttonSize] || '';
  };

  /**
   * Get the HB CSS class for icon-only buttons based on size.
   *
   * @param {string} buttonSize - The size identifier
   * @returns {string} The HB icon button CSS class
   */
  const getIconOnlyClass = (buttonSize) => {
    const iconSizeMap = {
      xs: 'hb-btn-icon-sm',
      sm: 'hb-btn-icon-sm',
      md: 'hb-btn-icon',
      lg: 'hb-btn-icon-lg',
      xl: 'hb-btn-icon-lg',
    };

    return iconSizeMap[buttonSize] || 'hb-btn-icon';
  };

  /**
   * Handle button click events.
   * Prevents click when disabled or loading.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} e - The click event
   */
  const handleClick = useCallback((e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    if (onClick && typeof onClick === 'function') {
      onClick(e);
    }
  }, [disabled, loading, onClick]);

  const isDisabled = disabled || loading;

  // Build the complete class name
  const variantClass = getVariantClass(variant);
  const sizeClass = getSizeClass(size);
  const blockClass = block ? 'hb-btn-block' : '';
  const iconOnlyClass = iconOnly ? getIconOnlyClass(size) : '';

  // For icon-only buttons, use the icon class instead of variant + size
  const buttonClasses = iconOnly
    ? [iconOnlyClass, variantClass.replace('hb-btn-', 'bg-').length ? variantClass : '', blockClass, className]
        .filter(Boolean)
        .join(' ')
        .trim()
    : [variantClass, sizeClass, blockClass, className]
        .filter(Boolean)
        .join(' ')
        .trim();

  /**
   * Get the spinner size class based on button size.
   *
   * @returns {string} The spinner CSS class
   */
  const getSpinnerClass = () => {
    if (size === 'xs' || size === 'sm') {
      return 'hb-spinner hb-spinner-sm';
    }
    return 'hb-spinner hb-spinner-sm';
  };

  /**
   * Get the spinner color class based on variant.
   *
   * @returns {string} The spinner color CSS class
   */
  const getSpinnerColorClass = () => {
    const whiteSpinnerVariants = ['primary', 'secondary', 'danger'];

    if (whiteSpinnerVariants.includes(variant)) {
      return 'hb-spinner-white';
    }

    return '';
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded !== undefined ? ariaExpanded : undefined}
      aria-haspopup={ariaHasPopup !== undefined ? String(ariaHasPopup) : undefined}
      aria-busy={loading ? 'true' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      {...restProps}
    >
      {loading ? (
        <span className="hb-inline-sm">
          <span
            className={`${getSpinnerClass()} ${getSpinnerColorClass()}`}
            aria-hidden="true"
          />
          <span>{loadingText}</span>
        </span>
      ) : (
        <>
          {leftIcon && !iconOnly && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {iconOnly ? (
            <span aria-hidden={ariaLabel ? 'true' : undefined}>
              {children}
            </span>
          ) : (
            leftIcon || rightIcon ? (
              <span className="hb-inline-sm">
                {leftIcon && (
                  <span className="flex-shrink-0" aria-hidden="true">
                    {leftIcon}
                  </span>
                )}
                <span>{children}</span>
                {rightIcon && (
                  <span className="flex-shrink-0" aria-hidden="true">
                    {rightIcon}
                  </span>
                )}
              </span>
            ) : (
              children
            )
          )}
        </>
      )}
    </button>
  );
};

export default Button;