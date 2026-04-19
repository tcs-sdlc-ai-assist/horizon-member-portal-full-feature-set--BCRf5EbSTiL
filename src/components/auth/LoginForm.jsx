import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import { ROUTES, APP } from '../../utils/constants.js';

/**
 * LoginForm - Login page UI component
 * Implements the authentication login form from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164, SCRUM-7167
 *
 * Provides username and password fields with HB form classes, form validation,
 * error display, submit handler calling AuthContext.login(), loading state,
 * and Horizon branding. Accessible with proper labels, ARIA, and keyboard navigation.
 *
 * @returns {JSX.Element}
 */
const LoginForm = () => {
  const { login, isAuthenticated } = useAuth();
  const { tagLogin, tagLoginFail, isEnabled: isGlassboxEnabled } = useGlassbox();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const formRef = useRef(null);

  // Redirect destination after successful login
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  /**
   * Redirect if already authenticated.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  /**
   * Focus the username field on mount.
   */
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  /**
   * Validate form fields and return an errors object.
   *
   * @returns {object} Errors object keyed by field name
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      newErrors.username = 'Username is required.';
    } else if (trimmedUsername.length > 64) {
      newErrors.username = 'Username must be 64 characters or fewer.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    return newErrors;
  }, [username, password]);

  /**
   * Clear a specific field error when the user starts typing.
   *
   * @param {string} field - The field name to clear the error for
   */
  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });

    if (formError) {
      setFormError('');
    }
  }, [formError]);

  /**
   * Handle username input change.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
    clearFieldError('username');
  }, [clearFieldError]);

  /**
   * Handle password input change.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    clearFieldError('password');
  }, [clearFieldError]);

  /**
   * Toggle password visibility.
   */
  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Handle form submission.
   * Validates fields, calls AuthContext.login(), handles success/failure.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Clear previous errors
    setFormError('');
    setErrors({});

    // Validate form
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Focus the first field with an error
      if (validationErrors.username && usernameRef.current) {
        usernameRef.current.focus();
      } else if (validationErrors.password && passwordRef.current) {
        passwordRef.current.focus();
      }

      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);

      if (result.status === 'success') {
        // Tag Glassbox login success if enabled
        if (isGlassboxEnabled) {
          tagLogin({ route: '/login' });
        }

        // Navigate to the intended destination
        navigate(from, { replace: true });
      } else {
        // Tag Glassbox login failure if enabled
        if (isGlassboxEnabled) {
          tagLoginFail(username.trim(), {
            errorCode: result.error_code,
          });
        }

        // Map error codes to user-friendly messages
        let errorMessage = 'An unexpected error occurred. Please try again.';

        if (result.error_code === 'INVALID_CREDENTIALS') {
          errorMessage = 'The username or password you entered is incorrect. Please try again.';
        } else if (result.error_code === 'MISSING_CREDENTIALS') {
          errorMessage = 'Please enter both your username and password.';
        } else if (result.error_code === 'SESSION_ERROR') {
          errorMessage = 'Unable to create your session. Please try again later.';
        } else if (result.message) {
          errorMessage = result.message;
        }

        setFormError(errorMessage);

        // Focus the username field on error
        if (usernameRef.current) {
          usernameRef.current.focus();
        }
      }
    } catch (_error) {
      setFormError('An unexpected error occurred. Please try again later.');

      if (isGlassboxEnabled) {
        tagLoginFail(username.trim(), {
          errorCode: 'UNEXPECTED_ERROR',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, validateForm, login, navigate, from, isGlassboxEnabled, tagLogin, tagLoginFail]);

  /**
   * Handle key down events for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      // Allow default form submission behavior
    }
  }, [isSubmitting]);

  return (
    <div className="min-h-screen-content hb-flex-center bg-horizon-gray-50">
      <div className="w-full max-w-md mx-4">
        {/* Horizon Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-horizon-primary mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-horizon-primary mb-1">
            {APP.NAME}
          </h1>
          <p className="hb-text-body-sm text-horizon-gray-500">
            Sign in to manage your health plan, claims, and benefits.
          </p>
        </div>

        {/* Login Card */}
        <div className="hb-card" role="region" aria-label="Sign in form">
          <div className="hb-card-body p-6 sm:p-8">
            <h2 className="text-xl font-bold text-horizon-primary mb-6 text-center">
              Sign In
            </h2>

            {/* Form-level error alert */}
            {formError && (
              <div
                className="hb-alert hb-alert-error mb-6"
                role="alert"
                aria-live="assertive"
              >
                <div className="hb-alert-icon" aria-hidden="true">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{formError}</p>
                </div>
              </div>
            )}

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              noValidate
              aria-label="Login form"
            >
              {/* Username Field */}
              <div className="hb-form-group">
                <label
                  htmlFor="login-username"
                  className={`hb-form-label hb-form-label-required`}
                >
                  Username
                </label>
                <input
                  ref={usernameRef}
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  maxLength={64}
                  value={username}
                  onChange={handleUsernameChange}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={errors.username ? 'true' : 'false'}
                  aria-describedby={errors.username ? 'login-username-error' : undefined}
                  placeholder="Enter your username"
                  className={`hb-form-input ${errors.username ? 'hb-form-input-error' : ''}`}
                />
                {errors.username && (
                  <p
                    id="login-username-error"
                    className="hb-form-error"
                    role="alert"
                  >
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="hb-form-group">
                <label
                  htmlFor="login-password"
                  className={`hb-form-label hb-form-label-required`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isSubmitting}
                    aria-required="true"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'login-password-error' : 'login-password-hint'}
                    placeholder="Enter your password"
                    className={`hb-form-input pr-12 ${errors.password ? 'hb-form-input-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-horizon-gray-400 hover:text-horizon-gray-600 transition-colors duration-200 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p
                    id="login-password-error"
                    className="hb-form-error"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                ) : (
                  <p id="login-password-hint" className="hb-form-hint">
                    Minimum 8 characters
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hb-btn-primary hb-btn-block hb-btn-lg"
                  aria-busy={isSubmitting ? 'true' : 'false'}
                >
                  {isSubmitting ? (
                    <span className="hb-inline-sm">
                      <span className="hb-spinner hb-spinner-sm hb-spinner-white" aria-hidden="true" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card Footer */}
          <div className="hb-card-footer text-center">
            <p className="hb-text-body-sm text-horizon-gray-500">
              Need help?{' '}
              <a
                href="/support"
                className="hb-text-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.SUPPORT);
                }}
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-6 text-center">
          <p className="hb-text-caption text-horizon-gray-400">
            &copy; {new Date().getFullYear()} Horizon Blue Cross Blue Shield of New Jersey.
          </p>
          <p className="hb-text-caption text-horizon-gray-400 mt-1">
            Three Penn Plaza East, Newark, NJ 07105
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;