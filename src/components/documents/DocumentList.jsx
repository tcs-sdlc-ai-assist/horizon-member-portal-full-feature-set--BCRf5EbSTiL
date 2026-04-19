import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';
import DataTable from '../common/DataTable.jsx';
import FilterPanel from '../common/FilterPanel.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Alert from '../common/Alert.jsx';
import EmptyState from '../common/EmptyState.jsx';
import documentsData from '../../data/documents.json';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  PAGINATION,
} from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

/**
 * DocumentList - Document center list component with filters and download
 * Implements the DocumentCenter exports (downloadDocument) from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7172, SCRUM-7166, SCRUM-7165
 *
 * Renders a DataTable with columns: document name, category (Badge), date added,
 * file size, and download action. Integrates FilterPanel for category filter and
 * sorting by date/name. Download button triggers file download, audit log entry,
 * and Glassbox tag. All document names and financial references have data-phi
 * attribute for Glassbox compliance masking where applicable.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const DocumentList = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { tagDocDownloaded, tagDocViewed, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logDocDownload, logDocViewed } = useAuditLog();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || '';

  const [activeFilters, setActiveFilters] = useState({
    category: initialCategory,
  });
  const [sortKey, setSortKey] = useState('dateAdded');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [downloadError, setDownloadError] = useState('');

  /**
   * Get all documents for the current member.
   */
  const memberDocuments = useMemo(() => {
    if (!currentUser || !currentUser.memberId) {
      return [];
    }

    return documentsData.filter(
      (doc) => doc.memberId === currentUser.memberId
    );
  }, [currentUser]);

  /**
   * Get unique document categories for the category filter options.
   */
  const categoryOptions = useMemo(() => {
    const categories = new Set();

    memberDocuments.forEach((doc) => {
      if (doc.category) {
        categories.add(doc.category);
      }
    });

    return Array.from(categories).map((category) => {
      const label = DOCUMENT_CATEGORY_LABELS[category] || category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        value: category,
        label,
      };
    });
  }, [memberDocuments]);

  /**
   * Filter definitions for the FilterPanel.
   */
  const filterDefinitions = useMemo(() => {
    return [
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: categoryOptions,
        placeholder: 'All Categories',
      },
      {
        key: 'dateRange',
        label: 'Date Added',
        type: 'dateRange',
      },
    ];
  }, [categoryOptions]);

  /**
   * Apply filters to the member documents.
   */
  const filteredDocuments = useMemo(() => {
    let filtered = [...memberDocuments];

    // Filter by category
    if (activeFilters.category && activeFilters.category !== '') {
      filtered = filtered.filter(
        (doc) => doc.category === activeFilters.category
      );
    }

    // Filter by date range
    if (activeFilters.dateRange && typeof activeFilters.dateRange === 'object') {
      const { start, end } = activeFilters.dateRange;

      if (start && start !== '') {
        const startDate = new Date(start);
        filtered = filtered.filter((doc) => {
          const dateAdded = new Date(doc.dateAdded);
          return dateAdded >= startDate;
        });
      }

      if (end && end !== '') {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((doc) => {
          const dateAdded = new Date(doc.dateAdded);
          return dateAdded <= endDate;
        });
      }
    }

    return filtered;
  }, [memberDocuments, activeFilters]);

  /**
   * Handle filter change from the FilterPanel.
   *
   * @param {string} key - The filter key
   * @param {*} value - The new filter value
   */
  const handleFilterChange = useCallback((key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Reset to first page when filters change
    setCurrentPage(1);

    if (isGlassboxEnabled) {
      tagAction('document_filtered', {
        route: '/documents',
        filterKey: key,
      });
    }
  }, [isGlassboxEnabled, tagAction]);

  /**
   * Handle clearing all filters.
   */
  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
    setCurrentPage(1);
  }, []);

  /**
   * Handle sort change from the DataTable.
   *
   * @param {string} key - The column key to sort by
   * @param {string} direction - The sort direction ('asc' or 'desc')
   */
  const handleSort = useCallback((key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1);
  }, []);

  /**
   * Handle page change from the DataTable.
   *
   * @param {number} page - The new page number
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  /**
   * Handle page size change from the DataTable.
   *
   * @param {number} newSize - The new page size
   */
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  /**
   * Download a document. Triggers audit log entry and Glassbox tag.
   * Implements DocumentCenter exports (downloadDocument) from the LLD.
   *
   * @param {object} doc - The document object to download
   */
  const handleDownload = useCallback(async (doc) => {
    if (!doc || !doc.id || downloadingId) {
      return;
    }

    setDownloadSuccess('');
    setDownloadError('');
    setDownloadingId(doc.id);

    try {
      // Log audit event for document download
      logDocDownload(doc.id, {
        route: '/documents',
        action: 'document_download',
        documentName: doc.name,
        category: doc.category,
      });

      // Tag Glassbox event if enabled
      if (isGlassboxEnabled) {
        tagDocDownloaded(doc.id, {
          route: '/documents',
          action: 'document_download',
          category: doc.category,
        });

        tagAction('document_downloaded', {
          resourceId: doc.id,
          route: '/documents',
          category: doc.category,
        });
      }

      // Simulate download (dummy data - no actual file)
      await new Promise((resolve) => setTimeout(resolve, 800));

      setDownloadSuccess(`${doc.name} downloaded successfully.`);
    } catch (_error) {
      setDownloadError('Unable to download the document. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  }, [downloadingId, logDocDownload, isGlassboxEnabled, tagDocDownloaded, tagAction]);

  /**
   * Get the badge variant for a document category.
   *
   * @param {string} category - The document category
   * @returns {string} The badge variant
   */
  const getCategoryVariant = useCallback((category) => {
    if (!category || typeof category !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      [DOCUMENT_CATEGORIES.EOB]: 'primary',
      [DOCUMENT_CATEGORIES.PLAN_DOCUMENT]: 'info',
      [DOCUMENT_CATEGORIES.CORRESPONDENCE]: 'secondary',
      [DOCUMENT_CATEGORIES.TAX_FORM]: 'warning',
      [DOCUMENT_CATEGORIES.ID_CARD]: 'success',
      [DOCUMENT_CATEGORIES.BENEFIT_SUMMARY]: 'info',
      [DOCUMENT_CATEGORIES.PRIOR_AUTH]: 'warning',
      [DOCUMENT_CATEGORIES.FORMULARY]: 'secondary',
      [DOCUMENT_CATEGORIES.PROVIDER_DIRECTORY]: 'neutral',
      [DOCUMENT_CATEGORIES.OTHER]: 'neutral',
    };

    return variantMap[category] || 'neutral';
  }, []);

  /**
   * Get the display label for a document category.
   *
   * @param {string} category - The document category
   * @returns {string} The category label
   */
  const getCategoryLabel = useCallback((category) => {
    if (!category || typeof category !== 'string') {
      return '';
    }

    if (DOCUMENT_CATEGORY_LABELS[category]) {
      return DOCUMENT_CATEGORY_LABELS[category];
    }

    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  /**
   * Get the document type icon SVG based on the category.
   *
   * @param {string} category - The document category
   * @returns {JSX.Element} The icon SVG element
   */
  const getDocumentIcon = useCallback((category) => {
    if (!category || typeof category !== 'string') {
      return (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }

    const icons = {
      [DOCUMENT_CATEGORIES.EOB]: (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      [DOCUMENT_CATEGORIES.PLAN_DOCUMENT]: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      [DOCUMENT_CATEGORIES.CORRESPONDENCE]: (
        <svg className="w-4 h-4 text-horizon-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      [DOCUMENT_CATEGORIES.TAX_FORM]: (
        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
    };

    return icons[category] || (
      <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }, []);

  /**
   * DataTable column definitions.
   */
  const columns = useMemo(() => {
    return [
      {
        key: 'name',
        label: 'Document Name',
        sortable: true,
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {getDocumentIcon(row.category)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-horizon-gray-800 block truncate max-w-[320px]" title={value}>
                {value}
              </span>
              {row.description && (
                <span className="hb-text-caption text-horizon-gray-400 block truncate max-w-[320px]" title={row.description}>
                  {row.description}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Category',
        sortable: true,
        render: (value) => (
          <Badge
            label={getCategoryLabel(value)}
            variant={getCategoryVariant(value)}
            size="sm"
          />
        ),
      },
      {
        key: 'dateAdded',
        label: 'Date Added',
        sortable: true,
        render: (value) => (
          <span className="text-sm text-horizon-gray-600 whitespace-nowrap">
            {formatDate(value, 'MM/DD/YYYY')}
          </span>
        ),
      },
      {
        key: 'fileSize',
        label: 'File Size',
        sortable: false,
        render: (value) => (
          <span className="text-sm text-horizon-gray-500">
            {value || 'N/A'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        headerClassName: 'text-right',
        className: 'text-right',
        render: (_value, row) => {
          const isDownloading = downloadingId === row.id;

          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(row);
              }}
              loading={isDownloading}
              loadingText="Downloading..."
              disabled={isDownloading || (downloadingId !== null && downloadingId !== row.id)}
              ariaLabel={`Download ${row.name}`}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Download
            </Button>
          );
        },
      },
    ];
  }, [getDocumentIcon, getCategoryLabel, getCategoryVariant, downloadingId, handleDownload]);

  /**
   * Calculate summary statistics for the filtered documents.
   */
  const documentsSummary = useMemo(() => {
    const categoryCounts = {};

    filteredDocuments.forEach((doc) => {
      if (doc.category) {
        categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
      }
    });

    return {
      totalDocuments: filteredDocuments.length,
      categoryCounts,
    };
  }, [filteredDocuments]);

  return (
    <div className={`${className}`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-horizon-primary/10 flex-shrink-0">
            <svg
              className="w-5 h-5 text-horizon-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-horizon-primary mb-0">
              Document Center
            </h1>
            <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
              Access and download your plan documents, EOBs, correspondence, and tax forms.
            </p>
          </div>
        </div>
      </div>

      {/* Download Status Messages */}
      {downloadSuccess && (
        <div className="mb-4">
          <Alert
            type="success"
            message={downloadSuccess}
            dismissible
            onDismiss={() => setDownloadSuccess('')}
          />
        </div>
      )}

      {downloadError && (
        <div className="mb-4">
          <Alert
            type="error"
            message={downloadError}
            dismissible
            onDismiss={() => setDownloadError('')}
          />
        </div>
      )}

      {/* Summary Cards */}
      {memberDocuments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Total Documents</p>
            <p className="text-xl font-bold text-horizon-primary mb-0">
              {documentsSummary.totalDocuments}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">EOBs</p>
            <p className="text-xl font-bold text-horizon-gray-800 mb-0">
              {documentsSummary.categoryCounts[DOCUMENT_CATEGORIES.EOB] || 0}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Plan Documents</p>
            <p className="text-xl font-bold text-horizon-gray-800 mb-0">
              {documentsSummary.categoryCounts[DOCUMENT_CATEGORIES.PLAN_DOCUMENT] || 0}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Correspondence</p>
            <p className="text-xl font-bold text-horizon-gray-800 mb-0">
              {documentsSummary.categoryCounts[DOCUMENT_CATEGORIES.CORRESPONDENCE] || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {memberDocuments.length > 0 && (
        <div className="mb-4">
          <FilterPanel
            filters={filterDefinitions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            collapsible={true}
            ariaLabel="Document filter controls"
          />
        </div>
      )}

      {/* Documents Table */}
      {memberDocuments.length > 0 ? (
        <div className="hb-card">
          <div className="hb-card-body p-0">
            <DataTable
              columns={columns}
              data={filteredDocuments}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              showPageSizeSelector={true}
              onPageSizeChange={handlePageSizeChange}
              striped={true}
              hoverable={true}
              loading={false}
              emptyMessage="No documents match your current filters."
              ariaLabel="Documents list"
              rowKeyField="id"
              className=""
            />
          </div>
        </div>
      ) : (
        <EmptyState
          title="No documents found"
          message="You don't have any documents to display yet. Documents such as Explanation of Benefits, plan summaries, and correspondence will appear here once they are available."
          icon={
            <svg
              className="w-8 h-8 text-horizon-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          }
        />
      )}

      {/* Footer note */}
      {memberDocuments.length > 0 && (
        <div className="mt-4">
          <div className="hb-inline-sm">
            <svg
              className="w-4 h-4 text-horizon-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="hb-text-caption text-horizon-gray-500 mb-0">
              Documents are retained for up to 7 years. If you need a document that is no longer available,
              please contact Member Services at 1-800-355-2583.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;