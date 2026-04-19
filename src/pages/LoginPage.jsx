import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import LoginForm from '../components/auth/LoginForm.jsx';
import { ROUTES } from '../utils/constants.js';

/**
 * LoginPage - Login page wrapper component
 * Implements the login page from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164, SCRUM-7167
 *
 * Full-page layout without sidebar/header. Centers LoginForm component
 * with Horizon branding (logo, tagline). Redirects to dashboard if
 * already authenticated. Logs page view via useAuditLog and tags via
 * useGlassbox on mount when not authenticated.
 *
 * @returns {JSX.Element}
 */
const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();
  const navigate = useNavigate();

  /**
   * Redirect to dashboard if already authenticated.
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  /**
   * Log login page view on mount when not authenticated.
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      logPage('/login', {
        action: 'login_page_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/login', {
          action: 'login_page_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  // Show nothing while authentication state is loading to prevent flash
  if (isLoading) {
    return (
      <div className="hb-flex-center min-h-screen bg-horizon-gray-50" role="status" aria-label="Loading">
        <div className="hb-spinner hb-spinner-lg" />
        <span className="hb-sr-only">Loading...</span>
      </div>
    );
  }

  // Don't render login form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-horizon-gray-50">
      <LoginForm />
    </div>
  );
};

export default LoginPage;