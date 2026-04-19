import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotifications } from '../../contexts/NotificationsContext.jsx';
import useSearch from '../../hooks/useSearch.js';
import useGlassbox from '../../hooks/useGlassbox.js';
import supportConfig from '../../data/supportConfig.json';
import { ROUTES, APP } from '../../utils/constants.js';

/**
 * Header - Global header component with search and actions
 * Implements the top header navigation from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders Horizon logo, global search bar (using useSearch hook), support action
 * buttons (Email/Chat/Call from supportConfig), notifications bell icon with
 * unread count badge, and user profile dropdown menu. Uses HB classes and z-index
 * 9999. Responsive layout. Accessible with ARIA roles and keyboard navigation.
 *
 * @param {object} props
 * @param {function} [props.onMenuToggle] - Callback to toggle mobile sidebar
 * @param {boolean} [props.isMobile] - Whether the viewport is mobile-sized
 * @returns {JSX.Element}
 */
const Header = ({ onMenuToggle, isMobile = false }) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { query, setQuery, results, isSearching, clearSearch } = useSearch({ debounceMs: 300, minQueryLength: 2, maxResults: 10 });
  const { tagSupport, tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const profileRef = useRef(null);
  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const supportRef = useRef(null);
  const supportMenuRef = useRef(null);

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
   * Handle profile dropdown toggle.
   */
  const handleProfileToggle = useCallback(() => {
    setIsProfileOpen((prev) => !prev);
    setIsSupportOpen(false);
  }, []);

  /**
   * Handle support dropdown toggle.
   */
  const handleSupportToggle = useCallback(() => {
    setIsSupportOpen((prev) => !prev);
    setIsProfileOpen(false);
  }, []);

  /**
   * Handle navigation to a route.
   *
   * @param {string} path - The path to navigate to
   */
  const handleNavigate = useCallback((path) => {
    if (!path) {
      return;
    }

    navigate(path);
    setIsProfileOpen(false);
    setIsSupportOpen(false);
    clearSearch();
  }, [navigate, clearSearch]);

  /**
   * Handle logout action.
   */
  const handleLogout = useCallback(() => {
    setIsProfileOpen(false);
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [logout, navigate]);

  /**
   * Handle search input change.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleSearchChange = useCallback((e) => {
    setQuery(e.target.value);
  }, [setQuery]);

  /**
   * Handle search result click.
   *
   * @param {object} result - The search result object
   */
  const handleSearchResultClick = useCallback((result) => {
    if (!result || !result.path) {
      return;
    }

    clearSearch();
    setIsSearchFocused(false);

    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    navigate(result.path);
  }, [clearSearch, navigate]);

  /**
   * Handle search input focus.
   */
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    setIsProfileOpen(false);
    setIsSupportOpen(false);
  }, []);

  /**
   * Handle search input blur with delay for click handling.
   */
  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  }, []);

  /**
   * Handle search clear button.
   */
  const handleSearchClear = useCallback(() => {
    clearSearch();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [clearSearch]);

  /**
   * Handle support channel click.
   *
   * @param {object} channel - The support channel object
   */
  const handleSupportClick = useCallback((channel) => {
    if (!channel) {
      return;
    }

    if (isGlassboxEnabled) {
      tagSupport(channel.id, { route: location.pathname });
    }

    if (channel.type === 'phone') {
      window.location.href = `tel:${channel.contact.replace(/\D/g, '')}`;
    } else if (channel.type === 'email') {
      window.location.href = `mailto:${channel.contact}`;
    } else if (channel.type === 'url') {
      window.open(channel.contact, '_blank', 'noopener,noreferrer');
    }

    setIsSupportOpen(false);
  }, [isGlassboxEnabled, tagSupport, location.pathname]);

  /**
   * Handle notifications bell click.
   */
  const handleNotificationsClick = useCallback(() => {
    navigate(ROUTES.NOTIFICATIONS);
    setIsProfileOpen(false);
    setIsSupportOpen(false);
  }, [navigate]);

  /**
   * Handle keyboard events on search results.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      clearSearch();
      setIsSearchFocused(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
      return;
    }

    if (e.key === 'ArrowDown' && results.length > 0 && searchResultsRef.current) {
      e.preventDefault();
      const firstItem = searchResultsRef.current.querySelector('[role="option"]');
      if (firstItem) {
        firstItem.focus();
      }
    }
  }, [clearSearch, results]);

  /**
   * Handle keyboard navigation within search results.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} result - The search result
   * @param {number} index - The result index
   */
  const handleResultKeyDown = useCallback((e, result, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchResultClick(result);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      clearSearch();
      setIsSearchFocused(false);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      return;
    }

    if (e.key === 'ArrowDown' && searchResultsRef.current) {
      e.preventDefault();
      const items = searchResultsRef.current.querySelectorAll('[role="option"]');
      if (index < items.length - 1) {
        items[index + 1].focus();
      }
      return;
    }

    if (e.key === 'ArrowUp' && searchResultsRef.current) {
      e.preventDefault();
      if (index === 0) {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else {
        const items = searchResultsRef.current.querySelectorAll('[role="option"]');
        items[index - 1].focus();
      }
    }
  }, [handleSearchResultClick, clearSearch]);

  /**
   * Close dropdowns when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }

      if (supportRef.current && !supportRef.current.contains(e.target)) {
        setIsSupportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Close dropdowns on route change.
   */
  useEffect(() => {
    setIsProfileOpen(false);
    setIsSupportOpen(false);
    clearSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /**
   * Handle keyboard events on profile dropdown.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleProfileKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsProfileOpen(false);
      if (profileRef.current) {
        const trigger = profileRef.current.querySelector('button');
        if (trigger) {
          trigger.focus();
        }
      }
    }
  }, []);

  /**
   * Handle keyboard events on support dropdown.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleSupportKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsSupportOpen(false);
      if (supportRef.current) {
        const trigger = supportRef.current.querySelector('button');
        if (trigger) {
          trigger.focus();
        }
      }
    }
  }, []);

  /**
   * Get the primary support channels for quick access buttons.
   */
  const primarySupportChannels = (supportConfig.supportChannels || []).filter(
    (ch) => ch.available && ['phone', 'chat', 'email'].includes(ch.id)
  );

  /**
   * Get the result type badge class.
   *
   * @param {string} type - The result type
   * @returns {string} The badge class
   */
  const getResultTypeBadgeClass = (type) => {
    const map = {
      navigation: 'hb-badge hb-badge-primary',
      document: 'hb-badge hb-badge-info',
      support: 'hb-badge hb-badge-success',
      care: 'hb-badge hb-badge-secondary',
      widget: 'hb-badge hb-badge-neutral',
    };

    return map[type] || 'hb-badge hb-badge-neutral';
  };

  /**
   * Get the result type label.
   *
   * @param {string} type - The result type
   * @returns {string} The label
   */
  const getResultTypeLabel = (type) => {
    const labels = {
      navigation: 'Page',
      document: 'Document',
      support: 'Support',
      care: 'Get Care',
      widget: 'Dashboard',
    };

    return labels[type] || 'Result';
  };

  /**
   * Get support channel icon SVG.
   *
   * @param {string} iconId - The icon identifier
   * @returns {JSX.Element}
   */
  const getSupportIcon = (iconId) => {
    const icons = {
      phone: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      chat: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    };

    return icons[iconId] || icons.phone;
  };

  if (!isAuthenticated) {
    return null;
  }

  const showSearchResults = isSearchFocused && query.trim().length >= 2 && (results.length > 0 || isSearching);

  return (
    <header
      className="sticky top-0 bg-white border-b border-horizon-gray-200 shadow-horizon-sm"
      style={{ zIndex: 9999 }}
      role="banner"
    >
      {/* Skip to main content link */}
      <a href="#main-content" className="hb-skip-link">
        Skip to main content
      </a>

      <div className="hb-container-fluid">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left section: Mobile menu toggle + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile hamburger menu */}
            {isMobile && (
              <button
                type="button"
                onClick={onMenuToggle}
                className="p-2 rounded-lg text-horizon-gray-500 hover:text-horizon-primary hover:bg-horizon-gray-100 transition-all duration-200 lg:hidden"
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Horizon Logo / Brand */}
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate(ROUTES.DASHBOARD);
              }}
              className="flex items-center gap-2 no-underline hover:no-underline"
              aria-label={`${APP.NAME} - Go to Dashboard`}
            >
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-lg font-bold text-horizon-primary hidden sm:block">
                {APP.NAME}
              </span>
            </a>
          </div>

          {/* Center section: Search bar */}
          <div
            ref={searchRef}
            className="flex-1 max-w-xl hidden md:block relative"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <span className="hb-spinner hb-spinner-sm" aria-hidden="true" />
                ) : (
                  <svg
                    className="w-4 h-4 text-horizon-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search portal..."
                className="hb-form-input pl-10 pr-10 py-2 text-sm rounded-full bg-horizon-gray-50 border-horizon-gray-200 focus:bg-white"
                role="combobox"
                aria-expanded={showSearchResults}
                aria-controls="header-search-results"
                aria-haspopup="listbox"
                aria-label="Search portal content"
                aria-autocomplete="list"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-horizon-gray-400 hover:text-horizon-gray-600 transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div
                id="header-search-results"
                ref={searchResultsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-horizon-lg border border-horizon-gray-200 max-h-80 overflow-y-auto hb-scrollbar"
                role="listbox"
                aria-label="Search results"
                style={{ zIndex: 9999 }}
              >
                {isSearching && results.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-horizon-gray-500 text-center">
                    <span className="hb-spinner hb-spinner-sm mr-2" aria-hidden="true" />
                    Searching...
                  </div>
                ) : results.length > 0 ? (
                  <ul className="py-1">
                    {results.map((result, index) => (
                      <li key={`${result.path}-${index}`} role="none">
                        <div
                          role="option"
                          tabIndex={0}
                          onClick={() => handleSearchResultClick(result)}
                          onKeyDown={(e) => handleResultKeyDown(e, result, index)}
                          className="px-4 py-2.5 cursor-pointer hover:bg-horizon-gray-50 transition-colors duration-150 focus:bg-horizon-gray-50 focus:outline-none"
                          aria-selected={false}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`${getResultTypeBadgeClass(result.type)} text-xxs`}>
                              {getResultTypeLabel(result.type)}
                            </span>
                            <span className="text-sm font-medium text-horizon-gray-800 truncate">
                              {result.title}
                            </span>
                          </div>
                          {result.snippet && (
                            <p className="text-xs text-horizon-gray-500 truncate mt-0.5 mb-0">
                              {result.snippet}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-horizon-gray-500 text-center">
                    No results found for &ldquo;{query.trim()}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right section: Support, Notifications, Profile */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Support Quick Actions */}
            <div ref={supportRef} className="relative hidden sm:block" onKeyDown={handleSupportKeyDown}>
              <button
                type="button"
                onClick={handleSupportToggle}
                className="p-2 rounded-lg text-horizon-gray-500 hover:text-horizon-primary hover:bg-horizon-gray-100 transition-all duration-200"
                aria-label="Support options"
                aria-expanded={isSupportOpen}
                aria-haspopup="true"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>

              {isSupportOpen && (
                <div
                  ref={supportMenuRef}
                  className="hb-dropdown-menu hb-dropdown-menu-right"
                  role="menu"
                  aria-label="Support channels"
                  style={{ zIndex: 9999 }}
                >
                  <div className="hb-dropdown-header">Contact Support</div>
                  {primarySupportChannels.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleSupportClick(channel)}
                      className="hb-dropdown-item"
                      role="menuitem"
                    >
                      <span className="hb-inline-sm">
                        {getSupportIcon(channel.icon || channel.id)}
                        <span>{channel.label}</span>
                      </span>
                    </button>
                  ))}
                  <div className="hb-dropdown-divider" />
                  <button
                    type="button"
                    onClick={() => handleNavigate(ROUTES.SUPPORT)}
                    className="hb-dropdown-item"
                    role="menuitem"
                  >
                    <span className="hb-inline-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>All Support Options</span>
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <button
              type="button"
              onClick={handleNotificationsClick}
              className="relative p-2 rounded-lg text-horizon-gray-500 hover:text-horizon-primary hover:bg-horizon-gray-100 transition-all duration-200"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-xxs font-bold text-white bg-red-500 rounded-full"
                  aria-hidden="true"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div ref={profileRef} className="relative" onKeyDown={handleProfileKeyDown}>
              <button
                type="button"
                onClick={handleProfileToggle}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-horizon-gray-100 transition-all duration-200"
                aria-label="User menu"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="hb-avatar hb-avatar-sm">
                  {getUserInitials()}
                </div>
                <span className="text-sm font-medium text-horizon-gray-700 hidden lg:block max-w-[120px] truncate">
                  {currentUser?.displayName || 'User'}
                </span>
                <svg
                  className={`w-4 h-4 text-horizon-gray-400 hidden lg:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div
                  ref={profileMenuRef}
                  className="hb-dropdown-menu hb-dropdown-menu-right"
                  role="menu"
                  aria-label="User menu"
                  style={{ zIndex: 9999 }}
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-horizon-gray-200">
                    <p className="text-sm font-medium text-horizon-gray-800 mb-0">
                      {currentUser?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-horizon-gray-500 mb-0 truncate">
                      {currentUser?.email || ''}
                    </p>
                    {currentUser?.memberId && (
                      <p className="text-xs text-horizon-gray-400 mb-0 mt-0.5" data-phi="member-id">
                        ID: {currentUser.memberId}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate(ROUTES.DASHBOARD)}
                    className="hb-dropdown-item"
                    role="menuitem"
                  >
                    <span className="hb-inline-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate(ROUTES.PROFILE)}
                    className="hb-dropdown-item"
                    role="menuitem"
                  >
                    <span className="hb-inline-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </span>
                  </button>

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

                  {/* Mobile-only support link */}
                  <button
                    type="button"
                    onClick={() => handleNavigate(ROUTES.SUPPORT)}
                    className="hb-dropdown-item sm:hidden"
                    role="menuitem"
                  >
                    <span className="hb-inline-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Support</span>
                    </span>
                  </button>

                  <div className="hb-dropdown-divider" />

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
                      <span>Sign Out</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;