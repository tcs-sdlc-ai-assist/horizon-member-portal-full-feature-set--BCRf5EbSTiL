import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import { ROUTES } from '../../utils/constants.js';

/**
 * UserMenu - User profile dropdown menu component
 * Implements the user profile dropdown from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Shows user display name and avatar with initials. Dropdown menu includes:
 * - Settings (visible to all authenticated users)
 * - Admin Panel (visible only if isAdmin from AuthContext)
 * - Log Out (calls AuthContext.logout())
 *
 * Uses HB popover/dropdown styling. Accessible with ARIA roles, keyboard
 * navigation, and focus management.
 *
 * @param {object} props
 * @param {string} [props.className] - Additional CSS classes for the wrapper
 * @returns {JSX.Element|null}
 */
const UserMenu = ({ className = '' }) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { tagUserLogout, isEnabled: isGlassboxEnabled } = useGlassbox();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const menuListRef = useRef(null);

  /**
   * Get the user's initials for the avatar.
   *
   * @returns {string} The user's initials (up to 2 characters)
   */
  const getUserInitials = useCallback(() => {
    if (!currentUser || !currentUser.displayName) {
      return '?';
    }

    const parts = currentUser.displayName.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    return parts[0].charAt(0).toUpperCase();
  }, [currentUser]);

  /**
   * Toggle the dropdown menu open/closed.
   */
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Close the dropdown menu.
   */
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Handle navigation to a route and close the menu.
   *
   * @param {string} path - The path to navigate to
   */
  const handleNavigate = useCallback((path) => {
    if (!path) {
      return;
    }

    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  /**
   * Handle logout action.
   */
  const handleLogout = useCallback(() => {
    setIsOpen(false);

    if (isGlassboxEnabled) {
      tagUserLogout({ route: window.location.pathname });
    }

    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [logout, navigate, isGlassboxEnabled, tagUserLogout]);

  /**
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handle keyboard events for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
      return;
    }

    if (!isOpen) {
      return;
    }

    if (e.key === 'Tab' && menuListRef.current) {
      const focusableElements = menuListRef.current.querySelectorAll(
        'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    if (e.key === 'ArrowDown' && menuListRef.current) {
      e.preventDefault();
      const items = menuListRef.current.querySelectorAll('[role="menuitem"]');
      const currentIndex = Array.from(items).indexOf(document.activeElement);

      if (currentIndex < items.length - 1) {
        items[currentIndex + 1].focus();
      } else {
        items[0].focus();
      }
    }

    if (e.key === 'ArrowUp' && menuListRef.current) {
      e.preventDefault();
      const items = menuListRef.current.querySelectorAll('[role="menuitem"]');
      const currentIndex = Array.from(items).indexOf(document.activeElement);

      if (currentIndex > 0) {
        items[currentIndex - 1].focus();
      } else {
        items[items.length - 1].focus();
      }
    }
  }, [isOpen]);

  /**
   * Focus the first menu item when the dropdown opens.
   */
  useEffect(() => {
    if (isOpen && menuListRef.current) {
      const timer = setTimeout(() => {
        const firstItem = menuListRef.current?.querySelector('[role="menuitem"]');
        if (firstItem) {
          firstItem.focus();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-horizon-gray-100 transition-all duration-200"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="hb-avatar hb-avatar-sm">
          {getUserInitials()}
        </div>
        <span className="text-sm font-medium text-horizon-gray-700 hidden lg:block max-w-[120px] truncate">
          {currentUser.displayName || 'User'}
        </span>
        <svg
          className={`w-4 h-4 text-horizon-gray-400 hidden lg:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuListRef}
          className="hb-dropdown-menu hb-dropdown-menu-right"
          role="menu"
          aria-label="User menu"
          style={{ zIndex: 9999 }}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-horizon-gray-200">
            <p className="text-sm font-medium text-horizon-gray-800 mb-0">
              {currentUser.displayName || 'User'}
            </p>
            <p className="text-xs text-horizon-gray-500 mb-0 truncate">
              {currentUser.email || ''}
            </p>
            {currentUser.memberId && (
              <p className="text-xs text-horizon-gray-400 mb-0 mt-0.5" data-phi="member-id">
                ID: {currentUser.memberId}
              </p>
            )}
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={() => handleNavigate(ROUTES.SETTINGS)}
            className="hb-dropdown-item"
            role="menuitem"
          >
            <span className="hb-inline-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </span>
          </button>

          {/* Admin Panel - visible only if isAdmin */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavigate('/admin')}
              className="hb-dropdown-item"
              role="menuitem"
            >
              <span className="hb-inline-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Admin Panel</span>
              </span>
            </button>
          )}

          <div className="hb-dropdown-divider" />

          {/* Log Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="hb-dropdown-item text-red-600 hover:text-red-700 hover:bg-red-50"
            role="menuitem"
          >
            <span className="hb-inline-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;