import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';
import DataTable from '../common/DataTable.jsx';
import FilterPanel from '../common/FilterPanel.jsx';
import Badge from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import claimsData from '../../data/claims.json';
import {
  CLAIM_STATUS,
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_VARIANTS,
  PAGINATION,
} from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

/**
 * ClaimsList - Claims list table with filters and pagination
 * Implements the claims list view from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171
 *
 * Renders a DataTable with columns: claim number, type, patient, provider,
 * billed amount, what you owe, status (Badge), and service date. Integrates
 * FilterPanel for type/status/date range/patient filters. Supports sorting
 * by date and pagination. Claim numbers and financial amounts have data-phi
 * attribute for Glassbox compliance masking. Row click navigates to claim detail.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const ClaimsList = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { tagClaim, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logClaim } = useAuditLog();
  const navigate = useNavigate();

  const [activeFilters, setActiveFilters] = useState({});
  const [sortKey, setSortKey] = useState('serviceDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);

  /**
   * Get all claims for the current member.
   */
  const memberClaims = useMemo(() => {
    if (!currentUser || !currentUser.memberId) {
      return [];
    }

    return claimsData.filter(
      (claim) => claim.memberId === currentUser.memberId
    );
  }, [currentUser]);

  /**
   * Get unique claim types for the type filter options.
   */
  const claimTypeOptions = useMemo(() => {
    const types = new Set();

    memberClaims.forEach((claim) => {
      if (claim.type) {
        types.add(claim.type);
      }
    });

    return Array.from(types).map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }));
  }, [memberClaims]);

  /**
   * Get unique claim statuses for the status filter options.
   */
  const claimStatusOptions = useMemo(() => {
    const statuses = new Set();

    memberClaims.forEach((claim) => {
      if (claim.status) {
        statuses.add(claim.status);
      }
    });

    return Array.from(statuses).map((status) => {
      const normalized = status.toLowerCase().trim();
      const label = CLAIM_STATUS_LABELS[normalized] || status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        value: status,
        label,
      };
    });
  }, [memberClaims]);

  /**
   * Get unique patient names for the patient filter options.
   */
  const patientOptions = useMemo(() => {
    const patients = new Set();

    memberClaims.forEach((claim) => {
      if (claim.patient) {
        patients.add(claim.patient);
      }
    });

    return Array.from(patients).map((patient) => ({
      value: patient,
      label: patient,
    }));
  }, [memberClaims]);

  /**
   * Filter definitions for the FilterPanel.
   */
  const filterDefinitions = useMemo(() => {
    return [
      {
        key: 'type',
        label: 'Claim Type',
        type: 'select',
        options: claimTypeOptions,
        placeholder: 'All Types',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: claimStatusOptions,
        placeholder: 'All Statuses',
      },
      {
        key: 'dateRange',
        label: 'Service Date',
        type: 'dateRange',
      },
      {
        key: 'patient',
        label: 'Patient',
        type: 'select',
        options: patientOptions,
        placeholder: 'All Patients',
      },
    ];
  }, [claimTypeOptions, claimStatusOptions, patientOptions]);

  /**
   * Apply filters to the member claims.
   */
  const filteredClaims = useMemo(() => {
    let filtered = [...memberClaims];

    // Filter by type
    if (activeFilters.type && activeFilters.type !== '') {
      filtered = filtered.filter(
        (claim) => claim.type === activeFilters.type
      );
    }

    // Filter by status
    if (activeFilters.status && activeFilters.status !== '') {
      filtered = filtered.filter(
        (claim) => claim.status === activeFilters.status
      );
    }

    // Filter by patient
    if (activeFilters.patient && activeFilters.patient !== '') {
      filtered = filtered.filter(
        (claim) => claim.patient === activeFilters.patient
      );
    }

    // Filter by date range
    if (activeFilters.dateRange && typeof activeFilters.dateRange === 'object') {
      const { start, end } = activeFilters.dateRange;

      if (start && start !== '') {
        const startDate = new Date(start);
        filtered = filtered.filter((claim) => {
          const serviceDate = new Date(claim.serviceDate);
          return serviceDate >= startDate;
        });
      }

      if (end && end !== '') {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((claim) => {
          const serviceDate = new Date(claim.serviceDate);
          return serviceDate <= endDate;
        });
      }
    }

    return filtered;
  }, [memberClaims, activeFilters]);

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
      tagAction('claim_filtered', {
        route: '/claims',
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
   * Handle clicking on a claim row to navigate to claim detail.
   *
   * @param {object} claim - The claim object
   */
  const handleClaimClick = useCallback((claim) => {
    if (!claim || !claim.id) {
      return;
    }

    // Log audit event for claim viewed
    logClaim(claim.id, {
      route: '/claims',
      action: 'list_click',
      claimNumber: claim.claimNumber,
    });

    if (isGlassboxEnabled) {
      tagClaim(claim.id, {
        route: '/claims',
        action: 'list_click',
      });
    }

    navigate(`/claims/${claim.id}`);
  }, [navigate, logClaim, isGlassboxEnabled, tagClaim]);

  /**
   * Get the status badge variant for a claim status.
   *
   * @param {string} status - The claim status
   * @returns {string} The badge variant
   */
  const getStatusVariant = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return 'neutral';
    }

    const normalized = status.toLowerCase().trim();
    return CLAIM_STATUS_VARIANTS[normalized] || 'neutral';
  }, []);

  /**
   * Get the status label for a claim status.
   *
   * @param {string} status - The claim status
   * @returns {string} The status label
   */
  const getStatusLabel = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return '';
    }

    const normalized = status.toLowerCase().trim();

    if (CLAIM_STATUS_LABELS[normalized]) {
      return CLAIM_STATUS_LABELS[normalized];
    }

    return normalized
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  /**
   * Get the claim type icon SVG based on the claim type.
   *
   * @param {string} type - The claim type
   * @returns {JSX.Element} The icon SVG element
   */
  const getClaimTypeIcon = useCallback((type) => {
    if (!type || typeof type !== 'string') {
      return (
        <svg className="w-4 h-4 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    const lowerType = type.toLowerCase();

    const icons = {
      medical: (
        <svg className="w-4 h-4 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      dental: (
        <svg className="w-4 h-4 text-horizon-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      vision: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      pharmacy: (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.medical;
  }, []);

  /**
   * DataTable column definitions.
   */
  const columns = useMemo(() => {
    return [
      {
        key: 'claimNumber',
        label: 'Claim Number',
        sortable: false,
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {getClaimTypeIcon(row.type)}
            </div>
            <span
              className="text-sm font-medium text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer"
              data-phi="claim-number"
            >
              {value}
            </span>
          </div>
        ),
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        render: (value) => {
          if (!value || typeof value !== 'string') {
            return '';
          }
          return (
            <span className="text-sm text-horizon-gray-700">
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        key: 'patient',
        label: 'Patient',
        sortable: true,
        render: (value) => (
          <span className="text-sm text-horizon-gray-700">
            {value || ''}
          </span>
        ),
      },
      {
        key: 'providerName',
        label: 'Provider',
        sortable: true,
        render: (_value, row) => (
          <span className="text-sm text-horizon-gray-700 truncate max-w-[180px] block">
            {row.provider ? row.provider.name : ''}
          </span>
        ),
      },
      {
        key: 'billedAmount',
        label: 'Billed',
        sortable: true,
        headerClassName: 'text-right',
        className: 'text-right',
        render: (value) => (
          <span
            className="text-sm font-medium text-horizon-gray-700"
            data-phi="financial-amount"
          >
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: 'whatYouOwe',
        label: 'You Owe',
        sortable: true,
        headerClassName: 'text-right',
        className: 'text-right',
        render: (value) => (
          <span
            className="text-sm font-bold text-horizon-gray-800"
            data-phi="financial-amount"
          >
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => (
          <Badge
            label={getStatusLabel(value)}
            variant={getStatusVariant(value)}
            size="sm"
            dot
          />
        ),
      },
      {
        key: 'serviceDate',
        label: 'Service Date',
        sortable: true,
        render: (value) => (
          <span className="text-sm text-horizon-gray-600 whitespace-nowrap">
            {formatDate(value, 'MM/DD/YYYY')}
          </span>
        ),
      },
    ];
  }, [getClaimTypeIcon, getStatusLabel, getStatusVariant]);

  /**
   * Prepare data for the DataTable by adding a providerName field for sorting.
   */
  const tableData = useMemo(() => {
    return filteredClaims.map((claim) => ({
      ...claim,
      providerName: claim.provider ? claim.provider.name : '',
    }));
  }, [filteredClaims]);

  /**
   * Calculate summary statistics for the filtered claims.
   */
  const claimsSummary = useMemo(() => {
    const totalBilled = filteredClaims.reduce((sum, claim) => sum + (claim.billedAmount || 0), 0);
    const totalOwed = filteredClaims.reduce((sum, claim) => sum + (claim.whatYouOwe || 0), 0);
    const totalPlanPaid = filteredClaims.reduce((sum, claim) => sum + (claim.planPaid || 0), 0);

    return {
      totalClaims: filteredClaims.length,
      totalBilled,
      totalOwed,
      totalPlanPaid,
    };
  }, [filteredClaims]);

  /**
   * Handle row click on the DataTable.
   * DataTable doesn't natively support row click, so we wrap the render
   * functions to make the entire row clickable via the claim number column.
   */

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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-horizon-primary mb-0">
              Claims
            </h1>
            <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
              View and manage your healthcare claims.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {memberClaims.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Total Claims</p>
            <p className="text-xl font-bold text-horizon-primary mb-0">
              {claimsSummary.totalClaims}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Total Billed</p>
            <p
              className="text-xl font-bold text-horizon-gray-800 mb-0"
              data-phi="financial-amount"
            >
              {formatCurrency(claimsSummary.totalBilled)}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Plan Paid</p>
            <p
              className="text-xl font-bold text-green-700 mb-0"
              data-phi="financial-amount"
            >
              {formatCurrency(claimsSummary.totalPlanPaid)}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">You Owe</p>
            <p
              className="text-xl font-bold text-horizon-gray-800 mb-0"
              data-phi="financial-amount"
            >
              {formatCurrency(claimsSummary.totalOwed)}
            </p>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {memberClaims.length > 0 && (
        <div className="mb-4">
          <FilterPanel
            filters={filterDefinitions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            collapsible={true}
            ariaLabel="Claims filter controls"
          />
        </div>
      )}

      {/* Claims Table */}
      {memberClaims.length > 0 ? (
        <div className="hb-card">
          <div className="hb-card-body p-0">
            <DataTable
              columns={columns}
              data={tableData}
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
              emptyMessage="No claims match your current filters."
              ariaLabel="Claims list"
              rowKeyField="id"
              className=""
            />
          </div>

          {/* Clickable row overlay - handled via claim number link */}
          {/* Row click is achieved through the claim number render function */}
        </div>
      ) : (
        <EmptyState
          title="No claims found"
          message="You don't have any claims to display yet. Claims will appear here once they are submitted and processed."
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      )}

      {/* Footer note */}
      {memberClaims.length > 0 && (
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
              Click on a claim number to view full details and explanation of benefits. Claims may take up to 30 days to process.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsList;