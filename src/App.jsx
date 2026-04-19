import { Component } from 'react';
import AppRouter from './AppRouter.jsx';
import { APP } from './utils/constants.js';

/**
 * ErrorFallback - Top-level error fallback UI component
 * Displays a user-friendly error message when an unhandled error occurs
 * in the application component tree. Provides a reload button to recover.
 *
 * @param {object} props
 * @param {Error} props.error - The error that was caught
 * @param {function} props.onReset - Callback to reset the error state
 * @returns {JSX.Element}
 */
const ErrorFallback = ({ error, onReset }) => {
  return (
    <div className="min-h-screen hb-flex-center bg-horizon-gray-50">
      <div className="w-full max-w-lg mx-4 text-center">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-horizon-primary mb-3">
          Something Went Wrong
        </h1>

        {/* Error Description */}
        <p className="hb-text-body text-horizon-gray-500 mb-6 max-w-md mx-auto">
          An unexpected error occurred in the {APP.NAME}. We apologize for the inconvenience.
          Please try reloading the page.
        </p>

        {/* Error Details (development only) */}
        {error && error.message && (
          <div className="hb-alert hb-alert-error mb-6 text-left">
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
              <p className="hb-alert-title">Error Details</p>
              <p className="text-sm font-medium mb-0">{error.message}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="hb-btn-primary hb-btn-lg"
          >
            <span className="hb-inline-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reload Page</span>
            </span>
          </button>
          <a
            href="/login"
            className="hb-btn-outline hb-btn-lg"
          >
            <span className="hb-inline-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Go to Login</span>
            </span>
          </a>
        </div>

        {/* Footer Information */}
        <div className="mt-8 text-center">
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

/**
 * App - Root application component with top-level error boundary
 * Implements the root application wrapper from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7164, SCRUM-7168, SCRUM-7169, SCRUM-7173
 *
 * Wraps the entire application with context providers (AuthContext, PreferencesContext,
 * NotificationsContext, GlassboxProvider) via AppRouter. Implements a top-level
 * React error boundary to catch unhandled errors in the component tree and display
 * a user-friendly fallback UI. All context providers are configured within AppRouter
 * to maintain proper provider nesting order.
 *
 * Provider hierarchy (managed by AppRouter):
 * - BrowserRouter
 *   - AuthProvider
 *     - NotificationsProvider
 *       - PreferencesProvider
 *         - GlassboxProvider
 *           - Routes
 *
 * @returns {JSX.Element}
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * React error boundary lifecycle method.
   * Called when an error is thrown during rendering, in a lifecycle method,
   * or in the constructor of any child component.
   *
   * @param {Error} error - The error that was thrown
   * @returns {object} Updated state to trigger fallback UI rendering
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * React error boundary lifecycle method for logging.
   * Called after an error has been thrown by a descendant component.
   *
   * @param {Error} error - The error that was thrown
   * @param {object} errorInfo - Object with componentStack property
   */
  componentDidCatch(error, errorInfo) {
    // Log the error for debugging purposes
    console.error('App Error Boundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  /**
   * Reset the error state and reload the page to recover.
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });

    // Reload the page to fully reset application state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return <AppRouter />;
  }
}

export default App;