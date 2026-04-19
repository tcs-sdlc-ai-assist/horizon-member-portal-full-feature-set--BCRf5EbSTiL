import { useState, useCallback, useRef, useEffect } from 'react';
import { searchPortalContent } from '../utils/searchUtils.js';

/**
 * useSearch - Custom hook for global search functionality
 * Implements global search across portal content from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Returns { query, setQuery, results, isSearching, clearSearch }.
 * Debounces search input and calls searchUtils.searchPortalContent.
 * Filters results to non-sensitive portal content only (navigation, documents,
 * support channels, care content, widget descriptions). No PHI/PII is included
 * in search results per FR-002 compliance requirements.
 *
 * @param {object} [options={}] - Configuration options
 * @param {number} [options.debounceMs=300] - Debounce delay in milliseconds
 * @param {number} [options.minQueryLength=2] - Minimum query length before searching
 * @param {number} [options.maxResults=20] - Maximum number of results to return
 * @returns {object} Search state and controls
 */
const useSearch = (options = {}) => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 20,
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimerRef = useRef(null);
  const latestQueryRef = useRef('');

  /**
   * Perform the search against portal content using searchUtils.
   * Only searches non-sensitive content (navigation, documents, support, care, widgets).
   *
   * @param {string} searchQuery - The search query string
   */
  const performSearch = useCallback((searchQuery) => {
    if (!searchQuery || typeof searchQuery !== 'string') {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const trimmed = searchQuery.trim();

    if (trimmed.length < minQueryLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Only process if this is still the latest query
    if (trimmed !== latestQueryRef.current.trim()) {
      return;
    }

    const searchResults = searchPortalContent(trimmed);

    // Limit results to maxResults
    const limitedResults = searchResults.slice(0, maxResults);

    setResults(limitedResults);
    setIsSearching(false);
  }, [minQueryLength, maxResults]);

  /**
   * Set the search query with debounced execution.
   * Updates the query state immediately for responsive UI,
   * but debounces the actual search execution.
   *
   * @param {string} newQuery - The new search query string
   */
  const setQuery = useCallback((newQuery) => {
    const queryValue = typeof newQuery === 'string' ? newQuery : '';

    setQueryState(queryValue);
    latestQueryRef.current = queryValue;

    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = queryValue.trim();

    // If query is too short, clear results immediately
    if (trimmed.length < minQueryLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Set searching state and debounce the actual search
    setIsSearching(true);

    debounceTimerRef.current = setTimeout(() => {
      performSearch(queryValue);
    }, debounceMs);
  }, [debounceMs, minQueryLength, performSearch]);

  /**
   * Clear the search query and results.
   * Resets all search state to initial values.
   */
  const clearSearch = useCallback(() => {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setQueryState('');
    latestQueryRef.current = '';
    setResults([]);
    setIsSearching(false);
  }, []);

  /**
   * Clean up debounce timer on unmount.
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
  };
};

export default useSearch;