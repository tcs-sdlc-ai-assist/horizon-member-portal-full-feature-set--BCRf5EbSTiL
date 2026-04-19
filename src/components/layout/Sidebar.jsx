import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import navigationData from '../../data/navigation.json';

/**
 * Icon component that renders an SVG icon based on the icon name.
 * Maps navigation icon identifiers to inline SVG elements.
 *
 * @param {object} props
 * @param {string} props.name - The icon identifier from navigation.json
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
const NavIcon = ({ name, className = 'w-5 h-5' }) => {
  const icons = {
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    get_care: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    facility: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    telehealth: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    urgent_care: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    id_card: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
    claims: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    list: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    document: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    upload: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    benefits: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    summary: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    details: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    prior_auth: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    spending: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    wellness: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    program: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    preventive: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    resources: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    prescriptions: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    history: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    formulary: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    pharmacy: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    mail_order: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    documents: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
    eob: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    plan_document: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    correspondence: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    tax_form: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  };

  return icons[name] || (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
};

/**
 * Chevron icon for expandable nav items.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the parent item is expanded
 * @returns {JSX.Element}
 */
const ChevronIcon = ({ isExpanded }) => {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
};

/**
 * Sidebar - Main sidebar navigation component
 * Implements the left sidebar navigation from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders navigation items from navigation.json with icons, labels, active state
 * highlighting, and collapsible sub-items. Uses HB layout classes. Responsive:
 * hidden on mobile with hamburger toggle. Highlights current route. Accessible
 * with ARIA navigation landmark and keyboard support.
 *
 * @param {object} props
 * @param {boolean} [props.isOpen] - Whether the sidebar is open on mobile
 * @param {function} [props.onClose] - Callback to close the sidebar on mobile
 * @param {boolean} [props.isMobile] - Whether the viewport is mobile-sized
 * @returns {JSX.Element}
 */
const Sidebar = ({ isOpen = false, onClose, isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedItems, setExpandedItems] = useState({});
  const sidebarRef = useRef(null);
  const previousFocusRef = useRef(null);

  /**
   * Sort navigation items by their order property.
   */
  const sortedNavItems = [...navigationData].sort((a, b) => a.order - b.order);

  /**
   * Check if a path matches the current location.
   *
   * @param {string} path - The navigation path to check
   * @param {boolean} [exact=false] - Whether to match exactly or as a prefix
   * @returns {boolean} True if the path is active
   */
  const isActivePath = useCallback((path, exact = false) => {
    if (!path) {
      return false;
    }

    const currentPath = location.pathname;

    // Handle query-string paths (e.g., /documents?category=eob)
    const pathBase = path.split('?')[0];

    if (exact) {
      return currentPath === pathBase;
    }

    // For top-level items, check if current path starts with the nav path
    if (currentPath === pathBase) {
      return true;
    }

    return currentPath.startsWith(pathBase + '/');
  }, [location.pathname]);

  /**
   * Check if a parent nav item has an active child.
   *
   * @param {object} item - The navigation item to check
   * @returns {boolean} True if any child is active
   */
  const hasActiveChild = useCallback((item) => {
    if (!item.children || item.children.length === 0) {
      return false;
    }

    return item.children.some((child) => isActivePath(child.path, true));
  }, [isActivePath]);

  /**
   * Auto-expand parent items that have an active child on route change.
   */
  useEffect(() => {
    const newExpanded = {};

    sortedNavItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        if (hasActiveChild(item) || isActivePath(item.path)) {
          newExpanded[item.id] = true;
        }
      }
    });

    setExpandedItems((prev) => {
      // Merge: keep user-expanded items, add auto-expanded
      const merged = { ...prev };
      Object.keys(newExpanded).forEach((key) => {
        if (newExpanded[key]) {
          merged[key] = true;
        }
      });
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /**
   * Toggle the expanded state of a nav item with children.
   *
   * @param {string} itemId - The navigation item ID to toggle
   */
  const toggleExpanded = useCallback((itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  /**
   * Handle navigation to a path.
   *
   * @param {string} path - The path to navigate to
   * @param {React.MouseEvent} [e] - The click event
   */
  const handleNavigate = useCallback((path, e) => {
    if (e) {
      e.preventDefault();
    }

    if (!path) {
      return;
    }

    navigate(path);

    // Close sidebar on mobile after navigation
    if (isMobile && onClose) {
      onClose();
    }
  }, [navigate, isMobile, onClose]);

  /**
   * Handle click on a parent nav item.
   * If it has children, toggle expansion. If it also has a path, navigate.
   *
   * @param {object} item - The navigation item clicked
   * @param {React.MouseEvent} e - The click event
   */
  const handleParentClick = useCallback((item, e) => {
    e.preventDefault();

    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      handleNavigate(item.path, e);
    }
  }, [toggleExpanded, handleNavigate]);

  /**
   * Handle keyboard events on nav items for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} item - The navigation item
   * @param {boolean} isParent - Whether this is a parent item with children
   */
  const handleKeyDown = useCallback((e, item, isParent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      if (isParent && item.children && item.children.length > 0) {
        toggleExpanded(item.id);
      } else {
        handleNavigate(item.path);
      }
    }

    // Arrow key navigation for expanding/collapsing
    if (isParent && item.children && item.children.length > 0) {
      if (e.key === 'ArrowRight' && !expandedItems[item.id]) {
        e.preventDefault();
        setExpandedItems((prev) => ({ ...prev, [item.id]: true }));
      } else if (e.key === 'ArrowLeft' && expandedItems[item.id]) {
        e.preventDefault();
        setExpandedItems((prev) => ({ ...prev, [item.id]: false }));
      }
    }
  }, [toggleExpanded, handleNavigate, expandedItems]);

  /**
   * Focus trap and close on Escape for mobile sidebar.
   */
  useEffect(() => {
    if (!isMobile) {
      return;
    }

    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      const timer = setTimeout(() => {
        if (sidebarRef.current) {
          const firstFocusable = sidebarRef.current.querySelector(
            'button, [href], [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen, isMobile]);

  /**
   * Handle Escape key to close mobile sidebar.
   */
  useEffect(() => {
    if (!isMobile || !isOpen) {
      return;
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobile, isOpen, onClose]);

  /**
   * Prevent body scroll when mobile sidebar is open.
   */
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  /**
   * Render a single child navigation item.
   *
   * @param {object} child - The child navigation item
   * @param {string} parentId - The parent item ID
   * @returns {JSX.Element}
   */
  const renderChildItem = (child) => {
    const isActive = isActivePath(child.path, true);

    return (
      <li key={child.id} role="none">
        <a
          href={child.path}
          role="menuitem"
          onClick={(e) => handleNavigate(child.path, e)}
          onKeyDown={(e) => handleKeyDown(e, child, false)}
          className={`
            flex items-center gap-3 pl-11 pr-3 py-2 text-sm rounded-lg
            transition-all duration-200 cursor-pointer
            ${isActive
              ? 'bg-horizon-primary/10 text-horizon-primary font-medium'
              : 'text-horizon-gray-600 hover:bg-horizon-gray-100 hover:text-horizon-primary'
            }
          `}
          aria-current={isActive ? 'page' : undefined}
          tabIndex={0}
        >
          {child.icon && (
            <NavIcon name={child.icon} className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{child.label}</span>
        </a>
      </li>
    );
  };

  /**
   * Render a parent navigation item with optional children.
   *
   * @param {object} item - The navigation item
   * @returns {JSX.Element}
   */
  const renderNavItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id] || false;
    const isActive = hasChildren
      ? hasActiveChild(item) || isActivePath(item.path)
      : isActivePath(item.path, true);

    const sortedChildren = hasChildren
      ? [...item.children].sort((a, b) => a.order - b.order)
      : [];

    return (
      <li key={item.id} role="none">
        {hasChildren ? (
          <>
            <button
              type="button"
              role="menuitem"
              onClick={(e) => handleParentClick(item, e)}
              onKeyDown={(e) => handleKeyDown(e, item, true)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg
                transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-horizon-primary/5 text-horizon-primary font-medium'
                  : 'text-horizon-gray-700 hover:bg-horizon-gray-100 hover:text-horizon-primary'
                }
              `}
              aria-expanded={isExpanded}
              aria-haspopup="true"
              tabIndex={0}
            >
              <NavIcon
                name={item.icon}
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-horizon-primary' : 'text-horizon-gray-400'}`}
              />
              <span className="flex-1 text-left truncate">{item.label}</span>
              <ChevronIcon isExpanded={isExpanded} />
            </button>

            {isExpanded && (
              <ul
                role="menu"
                aria-label={`${item.label} submenu`}
                className="mt-1 mb-1 space-y-0.5 hb-animate-fade-in"
              >
                {sortedChildren.map((child) => renderChildItem(child))}
              </ul>
            )}
          </>
        ) : (
          <a
            href={item.path}
            role="menuitem"
            onClick={(e) => handleNavigate(item.path, e)}
            onKeyDown={(e) => handleKeyDown(e, item, false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg
              transition-all duration-200 cursor-pointer
              ${isActive
                ? 'bg-horizon-primary/10 text-horizon-primary font-medium'
                : 'text-horizon-gray-700 hover:bg-horizon-gray-100 hover:text-horizon-primary'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
            tabIndex={0}
          >
            <NavIcon
              name={item.icon}
              className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-horizon-primary' : 'text-horizon-gray-400'}`}
            />
            <span className="truncate">{item.label}</span>
          </a>
        )}
      </li>
    );
  };

  /**
   * The sidebar content (shared between mobile overlay and desktop).
   */
  const sidebarContent = (
    <div
      ref={sidebarRef}
      className={`
        flex flex-col h-full bg-white border-r border-horizon-gray-200
        ${isMobile ? 'w-72' : 'w-[280px]'}
      `}
    >
      {/* Mobile close button */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-horizon-gray-200">
          <span className="text-sm font-bold text-horizon-primary">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-horizon-gray-400 hover:text-horizon-gray-700 hover:bg-horizon-gray-100 transition-all duration-200"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation items */}
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto hb-scrollbar px-3 py-4"
      >
        <ul role="menubar" aria-label="Main navigation menu" className="space-y-1">
          {sortedNavItems.map((item) => renderNavItem(item))}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="px-4 py-3 border-t border-horizon-gray-200">
        <p className="hb-text-caption text-horizon-gray-400 text-center">
          &copy; {new Date().getFullYear()} Horizon BCBSNJ
        </p>
      </div>
    </div>
  );

  // Mobile: render as overlay
  if (isMobile) {
    if (!isOpen) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 z-40 flex"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50"
          aria-hidden="true"
          onClick={onClose}
          style={{ backdropFilter: 'blur(2px)' }}
        />

        {/* Sidebar panel */}
        <div className="relative z-50 h-full" style={{ animation: 'hb-slide-in-left 0.25s ease-out' }}>
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Desktop: render as static sidebar
  return (
    <aside
      className="hidden lg:block flex-shrink-0"
      aria-label="Main navigation"
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;