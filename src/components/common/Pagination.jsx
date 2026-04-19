import { useCallback, useMemo } from 'react';
import { PAGINATION } from '../../utils/constants.js';

/**
 * Pagination - Reusable pagination controls component
 * Implements the pagination pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171, SCRUM-7172
 *
 * Renders previous/next buttons, page number buttons with ellipsis for large
 * page counts, and an items-per-page display. Uses HB pagination classes
 * (hb-pagination, hb-pagination-item, hb-pagination-item-active,
 * hb-pagination-item-disabled). Accessible with ARIA navigation landmark,
 * aria-label, aria-current, and keyboard navigation.
 *
 * @param {object} props
 * @param {number} props.currentPage - The current active page (1-based)
 * @param {number} props.totalPages - The total number of pages
 * @param {function} props.onPageChange - Callback when the page changes (receives the new page number)
 * @param {number} [props.totalItems] - Total number of items (used for display range)
 * @param {number} [props.pageSize] - Number of items per page (default from PAGINATION config)
 * @param {boolean} [props.showPageSizeSelector=false] - Whether to show the page size selector
 * @param {function} [props.onPageSizeChange] - Callback when page size changes (receives the new page size)
 * @param {boolean} [props.showItemRange=true] - Whether to show the "Showing X to Y of Z" text
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @param {string} [props.ariaLabel='Pagination'] - Accessible label for the pagination nav
 * @param {number} [props.siblingCount=1] - Number of page buttons to show on each side of the current page
 * @returns {JSX.Element|null}
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  showPageSizeSelector = false,
  onPageSizeChange,
  showItemRange = true,
  className = '',
  ariaLabel = 'Pagination',
  siblingCount = 1,
}) => {
  const activePageSize = pageSize || PAGINATION.DEFAULT_PAGE_SIZE;

  /**
   * Handle page change.
   * Validates the page number before calling the callback.
   *
   * @param {number} page - The page number to navigate to (1-based)
   */
  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    if (onPageChange && typeof onPageChange === 'function') {
      onPageChange(page);
    }
  }, [currentPage, totalPages, onPageChange]);

  /**
   * Handle page size change from the selector.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handlePageSizeChange = useCallback((e) => {
    const newSize = Number(e.target.value);

    if (isNaN(newSize) || newSize <= 0) {
      return;
    }

    if (onPageSizeChange && typeof onPageSizeChange === 'function') {
      onPageSizeChange(newSize);
    }
  }, [onPageSizeChange]);

  /**
   * Generate pagination page numbers with ellipsis.
   *
   * @returns {Array<number|string>} Array of page numbers and ellipsis markers
   */
  const pageNumbers = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    // Always show first page
    pages.push(1);

    if (showLeftEllipsis) {
      pages.push('left-ellipsis');
    } else {
      // Show page 2 if no ellipsis needed
      if (leftSiblingIndex > 1) {
        for (let i = 2; i < leftSiblingIndex; i++) {
          pages.push(i);
        }
      }
    }

    // Show pages around current
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (showRightEllipsis) {
      pages.push('right-ellipsis');
    } else {
      // Show pages between right sibling and last page
      if (rightSiblingIndex < totalPages) {
        for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
          pages.push(i);
        }
      }
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, siblingCount]);

  /**
   * Calculate the range of items being displayed.
   *
   * @returns {{ start: number, end: number }} The start and end item numbers
   */
  const displayRange = useMemo(() => {
    if (!totalItems || totalItems === 0) {
      return { start: 0, end: 0 };
    }

    const start = (currentPage - 1) * activePageSize + 1;
    const end = Math.min(currentPage * activePageSize, totalItems);

    return { start, end };
  }, [currentPage, activePageSize, totalItems]);

  // Don't render if there's only one page or no pages
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Left section: Item range display or page size selector */}
      <div className="flex items-center gap-4">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="hb-inline-sm">
            <label
              htmlFor="pagination-page-size"
              className="hb-text-body-sm text-horizon-gray-600"
            >
              Show
            </label>
            <select
              id="pagination-page-size"
              value={activePageSize}
              onChange={handlePageSizeChange}
              className="hb-form-select py-1.5 px-2 text-sm w-auto min-w-[70px]"
              aria-label="Rows per page"
            >
              {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="hb-text-body-sm text-horizon-gray-600">
              entries
            </span>
          </div>
        )}

        {showItemRange && totalItems !== undefined && totalItems > 0 && (
          <p className="hb-text-caption text-horizon-gray-500 mb-0">
            Showing {displayRange.start} to {displayRange.end} of {totalItems} entries
          </p>
        )}
      </div>

      {/* Right section: Pagination controls */}
      <nav aria-label={ariaLabel}>
        <ul className="hb-pagination" role="list">
          {/* Previous button */}
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`hb-pagination-item ${currentPage <= 1 ? 'hb-pagination-item-disabled' : ''}`}
              aria-label="Go to previous page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </li>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => {
            if (page === 'left-ellipsis' || page === 'right-ellipsis') {
              return (
                <li key={page}>
                  <span
                    className="hb-pagination-item cursor-default"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                </li>
              );
            }

            const isActive = page === currentPage;

            return (
              <li key={page}>
                <button
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`hb-pagination-item ${isActive ? 'hb-pagination-item-active' : ''}`}
                  aria-label={`Go to page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page}
                </button>
              </li>
            );
          })}

          {/* Next button */}
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`hb-pagination-item ${currentPage >= totalPages ? 'hb-pagination-item-disabled' : ''}`}
              aria-label="Go to next page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;