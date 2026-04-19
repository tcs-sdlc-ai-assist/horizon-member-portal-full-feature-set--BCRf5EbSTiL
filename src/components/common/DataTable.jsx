import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../../utils/constants.js';

/**
 * DataTable - Reusable sortable/paginated data table component
 * Implements the data table pattern from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171, SCRUM-7172
 *
 * Renders a data table with sorting, pagination, and responsive design using HB
 * table classes (hb-table, hb-table-wrapper, hb-table-striped, hb-table-hover).
 * Supports configurable columns with custom render functions, sortable headers,
 * page size selection, and pagination controls. Accessible with proper table
 * semantics, ARIA sort indicators, and keyboard navigation.
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, sortable?: boolean, render?: function, className?: string, headerClassName?: string}>} props.columns - Column definitions
 * @param {Array<object>} props.data - Array of data objects to display
 * @param {number} [props.pageSize] - Number of rows per page (default from PAGINATION config)
 * @param {function} [props.onSort] - External sort handler callback (sortKey, sortDirection)
 * @param {function} [props.onPageChange] - External page change handler callback (page)
 * @param {number} [props.currentPage] - Controlled current page (1-based)
 * @param {number} [props.totalItems] - Total number of items (for external pagination)
 * @param {boolean} [props.striped=true] - Whether to apply striped row styling
 * @param {boolean} [props.hoverable=true] - Whether to apply hover row styling
 * @param {boolean} [props.compact=false] - Whether to use compact table styling
 * @param {string} [props.sortKey] - Controlled sort column key
 * @param {string} [props.sortDirection] - Controlled sort direction ('asc' or 'desc')
 * @param {boolean} [props.loading=false] - Whether the table is in a loading state
 * @param {string} [props.emptyMessage='No data available.'] - Message to display when data is empty
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @param {string} [props.ariaLabel='Data table'] - Accessible label for the table
 * @param {boolean} [props.showPageSizeSelector=false] - Whether to show the page size selector
 * @param {function} [props.onPageSizeChange] - Callback when page size changes
 * @param {string} [props.rowKeyField='id'] - Field name to use as the unique key for each row
 * @returns {JSX.Element}
 */
const DataTable = ({
  columns = [],
  data = [],
  pageSize: pageSizeProp,
  onSort,
  onPageChange,
  currentPage: currentPageProp,
  totalItems: totalItemsProp,
  striped = true,
  hoverable = true,
  compact = false,
  sortKey: sortKeyProp,
  sortDirection: sortDirectionProp,
  loading = false,
  emptyMessage = 'No data available.',
  className = '',
  ariaLabel = 'Data table',
  showPageSizeSelector = false,
  onPageSizeChange,
  rowKeyField = 'id',
}) => {
  // Internal state for uncontrolled mode
  const [internalSortKey, setInternalSortKey] = useState(null);
  const [internalSortDirection, setInternalSortDirection] = useState('asc');
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(
    pageSizeProp || PAGINATION.DEFAULT_PAGE_SIZE
  );

  // Determine if controlled or uncontrolled
  const isControlledSort = sortKeyProp !== undefined;
  const isControlledPage = currentPageProp !== undefined;
  const isExternalPagination = totalItemsProp !== undefined;

  const activeSortKey = isControlledSort ? sortKeyProp : internalSortKey;
  const activeSortDirection = isControlledSort ? (sortDirectionProp || 'asc') : internalSortDirection;
  const activeCurrentPage = isControlledPage ? currentPageProp : internalCurrentPage;
  const activePageSize = pageSizeProp || internalPageSize;

  /**
   * Handle column header click for sorting.
   *
   * @param {string} columnKey - The column key to sort by
   */
  const handleSort = useCallback((columnKey) => {
    if (!columnKey) {
      return;
    }

    let newDirection = 'asc';

    if (activeSortKey === columnKey) {
      newDirection = activeSortDirection === 'asc' ? 'desc' : 'asc';
    }

    if (!isControlledSort) {
      setInternalSortKey(columnKey);
      setInternalSortDirection(newDirection);
    }

    // Reset to first page on sort change
    if (!isControlledPage) {
      setInternalCurrentPage(1);
    }

    if (onSort && typeof onSort === 'function') {
      onSort(columnKey, newDirection);
    }
  }, [activeSortKey, activeSortDirection, isControlledSort, isControlledPage, onSort]);

  /**
   * Handle keyboard events on sortable column headers.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {string} columnKey - The column key to sort by
   */
  const handleHeaderKeyDown = useCallback((e, columnKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(columnKey);
    }
  }, [handleSort]);

  /**
   * Sort data internally when not using external sort.
   */
  const sortedData = useMemo(() => {
    if (isControlledSort && onSort) {
      // External sorting: data is assumed to be pre-sorted
      return data;
    }

    if (!activeSortKey) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aVal = a[activeSortKey];
      const bVal = b[activeSortKey];

      if (aVal === null || aVal === undefined) {
        return 1;
      }
      if (bVal === null || bVal === undefined) {
        return -1;
      }

      let comparison = 0;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, 'en', { sensitivity: 'base' });
      } else {
        comparison = String(aVal).localeCompare(String(bVal), 'en', { sensitivity: 'base' });
      }

      return activeSortDirection === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [data, activeSortKey, activeSortDirection, isControlledSort, onSort]);

  /**
   * Calculate total items for pagination.
   */
  const totalItems = isExternalPagination ? totalItemsProp : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / activePageSize));

  /**
   * Paginate data internally when not using external pagination.
   */
  const paginatedData = useMemo(() => {
    if (isExternalPagination) {
      // External pagination: data is assumed to be pre-paginated
      return sortedData;
    }

    const startIndex = (activeCurrentPage - 1) * activePageSize;
    const endIndex = startIndex + activePageSize;

    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, activeCurrentPage, activePageSize, isExternalPagination]);

  /**
   * Handle page change.
   *
   * @param {number} page - The page number to navigate to (1-based)
   */
  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    if (!isControlledPage) {
      setInternalCurrentPage(page);
    }

    if (onPageChange && typeof onPageChange === 'function') {
      onPageChange(page);
    }
  }, [totalPages, isControlledPage, onPageChange]);

  /**
   * Handle page size change.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handlePageSizeChange = useCallback((e) => {
    const newSize = Number(e.target.value);

    if (isNaN(newSize) || newSize <= 0) {
      return;
    }

    setInternalPageSize(newSize);

    // Reset to first page on page size change
    if (!isControlledPage) {
      setInternalCurrentPage(1);
    }

    if (onPageSizeChange && typeof onPageSizeChange === 'function') {
      onPageSizeChange(newSize);
    }
  }, [isControlledPage, onPageSizeChange]);

  /**
   * Get the ARIA sort attribute value for a column.
   *
   * @param {string} columnKey - The column key
   * @returns {string|undefined} The aria-sort value
   */
  const getAriaSortValue = useCallback((columnKey) => {
    if (activeSortKey !== columnKey) {
      return 'none';
    }

    return activeSortDirection === 'asc' ? 'ascending' : 'descending';
  }, [activeSortKey, activeSortDirection]);

  /**
   * Generate pagination page numbers with ellipsis.
   *
   * @returns {Array<number|string>} Array of page numbers and ellipsis markers
   */
  const getPageNumbers = useCallback(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const current = activeCurrentPage;

    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, activeCurrentPage]);

  /**
   * Calculate the range of items being displayed.
   *
   * @returns {{ start: number, end: number }} The start and end item numbers
   */
  const getDisplayRange = useCallback(() => {
    if (totalItems === 0) {
      return { start: 0, end: 0 };
    }

    const start = (activeCurrentPage - 1) * activePageSize + 1;
    const end = Math.min(activeCurrentPage * activePageSize, totalItems);

    return { start, end };
  }, [activeCurrentPage, activePageSize, totalItems]);

  const displayRange = getDisplayRange();
  const pageNumbers = getPageNumbers();

  const tableClasses = [
    'hb-table',
    striped ? 'hb-table-striped' : '',
    hoverable ? 'hb-table-hover' : '',
    compact ? 'hb-table-compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`w-full ${className}`}>
      {/* Page size selector */}
      {showPageSizeSelector && (
        <div className="flex items-center justify-between mb-4">
          <div className="hb-inline-sm">
            <label
              htmlFor="datatable-page-size"
              className="hb-text-body-sm text-horizon-gray-600"
            >
              Show
            </label>
            <select
              id="datatable-page-size"
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

          {totalItems > 0 && (
            <p className="hb-text-caption text-horizon-gray-500 mb-0">
              Showing {displayRange.start} to {displayRange.end} of {totalItems} entries
            </p>
          )}
        </div>
      )}

      {/* Table wrapper */}
      <div className="hb-table-wrapper relative">
        {/* Loading overlay */}
        {loading && (
          <div className="hb-loading-overlay" role="status" aria-label="Loading data">
            <div className="hb-flex-center gap-2">
              <span className="hb-spinner hb-spinner-md" aria-hidden="true" />
              <span className="hb-text-body-sm text-horizon-gray-500">Loading...</span>
            </div>
          </div>
        )}

        <table
          className={tableClasses}
          role="table"
          aria-label={ariaLabel}
          aria-rowcount={totalItems}
        >
          {/* Table Header */}
          <thead>
            <tr>
              {columns.map((column) => {
                const isSortable = column.sortable !== false && column.sortable !== undefined ? column.sortable : false;
                const isActiveSort = activeSortKey === column.key;

                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={`${column.headerClassName || ''} ${isSortable ? 'cursor-pointer select-none hover:bg-horizon-gray-100 transition-colors duration-150' : ''}`}
                    aria-sort={isSortable ? getAriaSortValue(column.key) : undefined}
                    onClick={isSortable ? () => handleSort(column.key) : undefined}
                    onKeyDown={isSortable ? (e) => handleHeaderKeyDown(e, column.key) : undefined}
                    tabIndex={isSortable ? 0 : undefined}
                    role={isSortable ? 'columnheader button' : 'columnheader'}
                  >
                    <span className="hb-inline-sm">
                      <span>{column.label}</span>
                      {isSortable && (
                        <span className="inline-flex flex-col ml-1" aria-hidden="true">
                          <svg
                            className={`w-3 h-3 -mb-1 ${isActiveSort && activeSortDirection === 'asc' ? 'text-horizon-primary' : 'text-horizon-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6l-5 5h10l-5-5z" />
                          </svg>
                          <svg
                            className={`w-3 h-3 -mt-1 ${isActiveSort && activeSortDirection === 'desc' ? 'text-horizon-primary' : 'text-horizon-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 14l5-5H5l5 5z" />
                          </svg>
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => {
                const rowKey = row[rowKeyField] !== undefined && row[rowKeyField] !== null
                  ? String(row[rowKeyField])
                  : `row-${rowIndex}`;

                return (
                  <tr key={rowKey}>
                    {columns.map((column) => {
                      const cellValue = row[column.key];

                      return (
                        <td
                          key={`${rowKey}-${column.key}`}
                          className={column.className || ''}
                        >
                          {column.render
                            ? column.render(cellValue, row, rowIndex)
                            : (cellValue !== null && cellValue !== undefined ? String(cellValue) : '')
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  {!loading && (
                    <div className="hb-flex-center flex-col gap-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-horizon-gray-100">
                        <svg
                          className="w-6 h-6 text-horizon-gray-400"
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
                      </div>
                      <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                        {emptyMessage}
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && paginatedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          {/* Display range info */}
          {!showPageSizeSelector && (
            <p className="hb-text-caption text-horizon-gray-500 mb-0">
              Showing {displayRange.start} to {displayRange.end} of {totalItems} entries
            </p>
          )}

          {showPageSizeSelector && (
            <div />
          )}

          {/* Pagination controls */}
          <nav aria-label="Table pagination">
            <ul className="hb-pagination" role="list">
              {/* Previous button */}
              <li>
                <button
                  type="button"
                  onClick={() => handlePageChange(activeCurrentPage - 1)}
                  disabled={activeCurrentPage <= 1}
                  className={`hb-pagination-item ${activeCurrentPage <= 1 ? 'hb-pagination-item-disabled' : ''}`}
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
                if (page === '...') {
                  return (
                    <li key={`ellipsis-${index}`}>
                      <span
                        className="hb-pagination-item cursor-default"
                        aria-hidden="true"
                      >
                        &hellip;
                      </span>
                    </li>
                  );
                }

                const isActive = page === activeCurrentPage;

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
                  onClick={() => handlePageChange(activeCurrentPage + 1)}
                  disabled={activeCurrentPage >= totalPages}
                  className={`hb-pagination-item ${activeCurrentPage >= totalPages ? 'hb-pagination-item-disabled' : ''}`}
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
      )}

      {/* Bottom display range for page size selector mode */}
      {showPageSizeSelector && totalPages > 1 && paginatedData.length > 0 && (
        <div className="flex items-center justify-between mt-2">
          <p className="hb-text-caption text-horizon-gray-500 mb-0">
            Showing {displayRange.start} to {displayRange.end} of {totalItems} entries
          </p>
        </div>
      )}
    </div>
  );
};

export default DataTable;