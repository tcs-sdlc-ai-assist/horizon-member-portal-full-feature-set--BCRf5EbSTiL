import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import SessionTimeoutModal from '../auth/SessionTimeoutModal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useSessionTimeout from '../../hooks/useSessionTimeout.js';
import useGlassbox from '../../hooks/useGlassbox.js';

/**
 * AppLayout - Authenticated application layout shell
 * Implements the main application layout from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders Header at top, Sidebar on left, and main content area (React Router Outlet)
 * on right. Uses HB page layout classes (fluid-wrapper, page-section, page-sidebar,
 * page-content). Includes SessionTimeoutModal for session timeout warnings.
 * Responsive: sidebar collapses on mobile with hamburger toggle.
 *
 * @returns {JSX.Element}
 */
const AppLayout = () => {
  const { isAuthenticated, extendSession, logout } = useAuth();
  const { tagTimeout, isEnabled: isGlassboxEnabled } = useGlassbox();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  /**
   * Handle session timeout warning callback.
   * Opens the session timeout modal when the warning period is reached.
   *
   * @param {number} _remaining - Time remaining in milliseconds
   */
  const handleSessionWarning = useCallback((_remaining) => {
    setIsSessionModalOpen(true);
  }, []);

  /**
   * Handle session timeout callback.
   * Tags the timeout event in Glassbox and triggers logout.
   */
  const handleSessionTimeout = useCallback(() => {
    if (isGlassboxEnabled) {
      tagTimeout({ route: window.location.pathname });
    }

    setIsSessionModalOpen(true);
  }, [isGlassboxEnabled, tagTimeout]);

  const {
    timeRemaining,
    isWarning,
    isTimedOut,
    resetTimer,
  } = useSessionTimeout({
    enabled: isAuthenticated,
    onWarning: handleSessionWarning,
    onTimeout: handleSessionTimeout,
  });

  /**
   * Detect mobile viewport on mount and resize.
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /**
   * Close mobile sidebar when viewport changes to desktop.
   */
  useEffect(() => {
    if (!isMobile && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobile, isMobileSidebarOpen]);

  /**
   * Toggle the mobile sidebar open/closed.
   */
  const handleMenuToggle = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Close the mobile sidebar.
   */
  const handleSidebarClose = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  /**
   * Handle extending the session from the timeout modal.
   */
  const handleExtendSession = useCallback(() => {
    extendSession();
    resetTimer();
    setIsSessionModalOpen(false);
  }, [extendSession, resetTimer]);

  /**
   * Handle logout from the session timeout modal.
   */
  const handleSessionLogout = useCallback(() => {
    setIsSessionModalOpen(false);
    logout();
  }, [logout]);

  /**
   * Handle closing the session timeout modal (same as extend).
   */
  const handleSessionModalClose = useCallback(() => {
    handleExtendSession();
  }, [handleExtendSession]);

  return (
    <div className="hb-layout-content min-h-screen bg-horizon-gray-50">
      {/* Header */}
      <Header
        onMenuToggle={handleMenuToggle}
        isMobile={isMobile}
      />

      {/* Main layout: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={handleSidebarClose}
          isMobile={isMobile}
        />

        {/* Main content area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto hb-scrollbar"
          role="main"
          aria-label="Main content"
        >
          <div className="hb-container-fluid py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Session Timeout Modal */}
      <SessionTimeoutModal
        isOpen={isSessionModalOpen || isTimedOut}
        timeRemaining={timeRemaining}
        onExtendSession={handleExtendSession}
        onLogout={handleSessionLogout}
        onClose={handleSessionModalClose}
      />
    </div>
  );
};

export default AppLayout;