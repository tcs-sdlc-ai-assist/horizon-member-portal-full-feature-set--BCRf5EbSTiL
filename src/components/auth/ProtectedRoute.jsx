import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import { ROUTES } from '../../utils/constants.js';

/**
 * ProtectedRoute - Authentication route guard component
 * Implements route protection from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164, SCRUM-7173
 *
 * Checks AuthContext for authenticated state. Redirects to /login if not
 * authenticated. Renders children or Outlet if authenticated. Initializes
 * Glassbox page view tagging on authenticated routes per FR-010.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children] - Child components to render when authenticated
 * @param {string|string[]} [props.requiredRoles] - Optional role(s) required for access
 * @param {string} [props.redirectTo] - Optional custom redirect path (defaults to /login)
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, requiredRoles, redirectTo }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const location = useLocation();

  const loginPath = redirectTo || ROUTES.LOGIN;

  /**
   * Tag Glassbox page view on authenticated route changes per FR-010.
   * Only fires when Glassbox is enabled and user is authenticated.
   */
  useEffect(() => {
    if (isAuthenticated && isGlassboxEnabled && currentUser) {
      tagPage(location.pathname, {
        search: location.search,
        hash: location.hash,
      });
    }
  }, [isAuthenticated, isGlassboxEnabled, currentUser, location.pathname, location.search, location.hash, tagPage]);

  // Show nothing while authentication state is loading to prevent flash
  if (isLoading) {
    return (
      <div className="hb-flex-center min-h-screen-content" role="status" aria-label="Loading">
        <div className="hb-spinner hb-spinner-lg" />
        <span className="hb-sr-only">Verifying authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles && currentUser) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const userRole = currentUser.role ? currentUser.role.toLowerCase() : '';

    const hasRequiredRole = roles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasRequiredRole) {
      // Redirect to dashboard if authenticated but lacking required role
      return (
        <Navigate
          to={ROUTES.DASHBOARD}
          replace
        />
      );
    }
  }

  // Render children if provided, otherwise render Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;