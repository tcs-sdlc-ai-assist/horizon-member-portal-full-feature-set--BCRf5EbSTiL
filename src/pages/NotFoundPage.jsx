import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import { ROUTES, APP } from '../utils/constants.js';

/**
 * NotFoundPage - 404 Not Found error page component
 * Implements the 404 error page from the Member Experience & Self-Service LLD.
 *
 * Displays a friendly error message indicating the requested page was not found,
 * with a prominent link back to the dashboard (if authenticated) or login page
 * (if not authenticated). Uses HB styling classes for consistent Horizon branding.
 * Accessible with proper ARIA attributes and semantic structure.
 *
 * @returns {JSX.Element}
 */
const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle navigation back to the dashboard or login page.
   */
  const handleGoHome = useCallback(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handle navigation back to the previous page.
   */
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  }, [navigate, handleGoHome]);

  return (
    <div className="min-h-screen-content hb-flex-center bg-horizon-gray-50">
      <div className="w-full max-w-lg mx-4 text-center">
        {/* Horizon Branding */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-horizon-primary/10 mb-6">
            <svg
              className="w-10 h-10 text-horizon-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Code */}
          <h1 className="text-6xl md:text-7xl font-bold text-horizon-primary mb-4">
            404
          </h1>

          {/* Error Title */}
          <h2 className="text-xl md:text-2xl font-bold text-horizon-gray-800 mb-3">
            Page Not Found
          </h2>

          {/* Error Description */}
          <p className="hb-text-body text-horizon-gray-500 mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Please check the URL or navigate back to a known page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoHome}
            ariaLabel={isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            leftIcon={
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
            }
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleGoBack}
            ariaLabel="Go back to previous page"
            leftIcon={
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            }
          >
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        {isAuthenticated && (
          <div className="hb-card">
            <div className="hb-card-header">
              <div className="hb-inline-sm justify-center">
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <h3 className="text-sm font-bold text-horizon-primary mb-0">
                  Helpful Links
                </h3>
              </div>
            </div>
            <div className="hb-card-body p-0">
              <div className="divide-y divide-horizon-gray-100">
                <a
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(ROUTES.DASHBOARD);
                  }}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-horizon-gray-50 transition-colors duration-150 no-underline hover:no-underline"
                  aria-label="Go to Dashboard"
                >
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-horizon-gray-700">Dashboard</span>
                  <svg
                    className="w-4 h-4 text-horizon-gray-300 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/claims"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(ROUTES.CLAIMS);
                  }}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-horizon-gray-50 transition-colors duration-150 no-underline hover:no-underline"
                  aria-label="Go to Claims"
                >
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-horizon-gray-700">Claims</span>
                  <svg
                    className="w-4 h-4 text-horizon-gray-300 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/benefits"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(ROUTES.BENEFITS);
                  }}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-horizon-gray-50 transition-colors duration-150 no-underline hover:no-underline"
                  aria-label="Go to Benefits"
                >
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-horizon-gray-700">Benefits & Coverage</span>
                  <svg
                    className="w-4 h-4 text-horizon-gray-300 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/support"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(ROUTES.SUPPORT);
                  }}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-horizon-gray-50 transition-colors duration-150 no-underline hover:no-underline"
                  aria-label="Go to Support"
                >
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
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-horizon-gray-700">Contact Support</span>
                  <svg
                    className="w-4 h-4 text-horizon-gray-300 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

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

export default NotFoundPage;