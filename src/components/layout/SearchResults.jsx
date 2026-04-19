import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SearchResults - Global search results display component
 * Implements the search results dropdown from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Displays matching portal pages and documents below the global search bar.
 * Shows title, type badge, snippet, and navigation link for each result.
 * Shows 'No results found' message for empty results. Uses HB list and card styling.
 * Accessible with ARIA roles, keyboard navigation, and focus management.
 *
 * @param {object} props
 * @param {Array<{title: string, path: string, type: string, snippet: string}>} props.results - Search results array
 * @param {string} props.query - The current search query string
 * @param {boolean} [props.isSearching=false] - Whether a search is currently in progress
 * @param {boolean} [props.isVisible=false] - Whether the results dropdown is visible
 * @param {function} [props.onResultClick] - Callback when a result is clicked
 * @param {function} [props.onClose] - Callback to close the results dropdown
 * @param {React.Ref} [props.resultsRef] - Ref for the results container (for focus management)
 * @param {React.Ref} [props.inputRef] - Ref for the search input (for keyboard navigation)
 * @returns {JSX.Element|null}
 */
const SearchResults = ({
  results = [],
  query = '',
  isSearching = false,
  isVisible = false,
  onResultClick,
  onClose,
  resultsRef,
  inputRef,
}) => {
  const navigate = useNavigate();

  /**
   * Get the result type badge class.
   *
   * @param {string} type - The result type
   * @returns {string} The badge class
   */
  const getResultTypeBadgeClass = useCallback((type) => {
    const map = {
      navigation: 'hb-badge hb-badge-primary',
      document: 'hb-badge hb-badge-info',
      support: 'hb-badge hb-badge-success',
      care: 'hb-badge hb-badge-secondary',
      widget: 'hb-badge hb-badge-neutral',
    };

    return map[type] || 'hb-badge hb-badge-neutral';
  }, []);

  /**
   * Get the result type label.
   *
   * @param {string} type - The result type
   * @returns {string} The label
   */
  const getResultTypeLabel = useCallback((type) => {
    const labels = {
      navigation: 'Page',
      document: 'Document',
      support: 'Support',
      care: 'Get Care',
      widget: 'Dashboard',
    };

    return labels[type] || 'Result';
  }, []);

  /**
   * Get the result type icon SVG.
   *
   * @param {string} type - The result type
   * @returns {JSX.Element}
   */
  const getResultTypeIcon = useCallback((type) => {
    const icons = {
      navigation: (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      ),
      document: (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      support: (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      care: (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      widget: (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    };

    return icons[type] || icons.navigation;
  }, []);

  /**
   * Handle clicking on a search result.
   *
   * @param {object} result - The search result object
   */
  const handleResultClick = useCallback((result) => {
    if (!result || !result.path) {
      return;
    }

    if (onResultClick) {
      onResultClick(result);
    } else {
      navigate(result.path);

      if (onClose) {
        onClose();
      }
    }
  }, [onResultClick, navigate, onClose]);

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
      handleResultClick(result);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (onClose) {
        onClose();
      }
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    if (e.key === 'ArrowDown' && resultsRef && resultsRef.current) {
      e.preventDefault();
      const items = resultsRef.current.querySelectorAll('[role="option"]');
      if (index < items.length - 1) {
        items[index + 1].focus();
      }
      return;
    }

    if (e.key === 'ArrowUp' && resultsRef && resultsRef.current) {
      e.preventDefault();
      if (index === 0) {
        if (inputRef && inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        const items = resultsRef.current.querySelectorAll('[role="option"]');
        items[index - 1].focus();
      }
    }
  }, [handleResultClick, onClose, inputRef, resultsRef]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const trimmedQuery = query.trim();

  return (
    <div
      id="search-results-dropdown"
      ref={resultsRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-horizon-lg border border-horizon-gray-200 max-h-80 overflow-y-auto hb-scrollbar"
      role="listbox"
      aria-label="Search results"
      style={{ zIndex: 9999 }}
    >
      {isSearching && results.length === 0 ? (
        /* Loading state */
        <div className="px-4 py-6 text-center">
          <div className="hb-flex-center gap-2">
            <span className="hb-spinner hb-spinner-sm" aria-hidden="true" />
            <span className="text-sm text-horizon-gray-500">Searching...</span>
          </div>
        </div>
      ) : results.length > 0 ? (
        /* Results list */
        <>
          {/* Results count header */}
          <div className="px-4 py-2 border-b border-horizon-gray-100">
            <p className="hb-text-caption text-horizon-gray-400 mb-0">
              {results.length} result{results.length !== 1 ? 's' : ''} found
              {trimmedQuery ? ` for "${trimmedQuery}"` : ''}
            </p>
          </div>

          <ul className="py-1">
            {results.map((result, index) => (
              <li key={`${result.path}-${index}`} role="none">
                <div
                  role="option"
                  tabIndex={0}
                  onClick={() => handleResultClick(result)}
                  onKeyDown={(e) => handleResultKeyDown(e, result, index)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-horizon-gray-50 transition-colors duration-150 focus:bg-horizon-gray-50 focus:outline-none"
                  aria-selected={false}
                >
                  <div className="flex items-start gap-3">
                    {/* Result type icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getResultTypeIcon(result.type)}
                    </div>

                    {/* Result content */}
                    <div className="flex-1 min-w-0">
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

                    {/* Navigate arrow */}
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-horizon-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : trimmedQuery.length >= 2 ? (
        /* No results state */
        <div className="px-4 py-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-horizon-gray-100 mb-3">
            <svg
              className="w-5 h-5 text-horizon-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-horizon-gray-500 mb-1">
            No results found for &ldquo;{trimmedQuery}&rdquo;
          </p>
          <p className="hb-text-caption text-horizon-gray-400 mb-0">
            Try adjusting your search terms or browse the navigation menu.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default SearchResults;