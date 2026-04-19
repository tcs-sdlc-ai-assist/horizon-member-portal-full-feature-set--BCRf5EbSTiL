import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Alert from '../common/Alert.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import claimsData from '../../data/claims.json';
import documentsData from '../../data/documents.json';
import {
  ROUTES,
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_VARIANTS,
} from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

/**
 * ClaimDetail - Individual claim detail view component
 * Implements the claim detail view from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171, SCRUM-7166, SCRUM-7165
 *
 * Shows full claim information including financial summary (billed, plan paid,
 * you owe), line items table (service, code, billed, allowed, paid, your cost),
 * provider info, and EOB download link. All financial amounts and claim numbers
 * have data-phi attribute for Glassbox compliance masking. EOB download triggers
 * audit log and Glassbox tag. Back button returns to claims list.
 *
 * @returns {JSX.Element}
 */
const ClaimDetail = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tagClaim, tagDocDownloaded, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logClaim, logEob, logDocDownload } = useAuditLog();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [downloadError, setDownloadError] = useState('');

  /**
   * Find the claim by ID from mock data, ensuring it belongs to the current member.
   */
  const claim = useMemo(() => {
    if (!claimId || !currentUser || !currentUser.memberId) {
      return null;
    }

    return claimsData.find(
      (c) => c.id === claimId && c.memberId === currentUser.memberId
    ) || null;
  }, [claimId, currentUser]);

  /**
   * Find the associated EOB document for this claim.
   */
  const eobDocument = useMemo(() => {
    if (!claim || !claim.eobDocumentId) {
      return null;
    }

    return documentsData.find((doc) => doc.id === claim.eobDocumentId) || null;
  }, [claim]);

  /**
   * Log claim viewed on mount.
   */
  useMemo(() => {
    if (claim && currentUser) {
      logClaim(claim.id, {
        route: `/claims/${claim.id}`,
        action: 'detail_view',
        claimNumber: claim.claimNumber,
      });

      if (isGlassboxEnabled) {
        tagClaim(claim.id, {
          route: `/claims/${claim.id}`,
          action: 'detail_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claim?.id]);

  /**
   * Handle navigating back to the claims list.
   */
  const handleBackToClaims = useCallback(() => {
    navigate(ROUTES.CLAIMS);
  }, [navigate]);

  /**
   * Handle EOB document download.
   * Triggers audit log and Glassbox tag for compliance.
   */
  const handleEobDownload = useCallback(async () => {
    if (isDownloading || !eobDocument || !claim) {
      return;
    }

    setDownloadSuccess('');
    setDownloadError('');
    setIsDownloading(true);

    try {
      // Log audit event for EOB download
      logEob(eobDocument.id, {
        route: `/claims/${claim.id}`,
        action: 'eob_download',
        claimNumber: claim.claimNumber,
        documentName: eobDocument.name,
      });

      logDocDownload(eobDocument.id, {
        route: `/claims/${claim.id}`,
        action: 'eob_download',
        claimNumber: claim.claimNumber,
      });

      // Tag Glassbox event if enabled
      if (isGlassboxEnabled) {
        tagDocDownloaded(eobDocument.id, {
          route: `/claims/${claim.id}`,
          action: 'eob_download',
          claimNumber: claim.claimNumber,
        });

        tagAction('eob_download', {
          resourceId: eobDocument.id,
          route: `/claims/${claim.id}`,
          claimId: claim.id,
        });
      }

      // Simulate download (dummy data - no actual file)
      await new Promise((resolve) => setTimeout(resolve, 800));

      setDownloadSuccess(`${eobDocument.name} downloaded successfully.`);
    } catch (_error) {
      setDownloadError('Unable to download the Explanation of Benefits. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, eobDocument, claim, logEob, logDocDownload, isGlassboxEnabled, tagDocDownloaded, tagAction]);

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
        <svg className="w-5 h-5 text-horizon-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    const lowerType = type.toLowerCase();

    const icons = {
      medical: (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      dental: (
        <svg className="w-5 h-5 text-horizon-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      vision: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      pharmacy: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    };

    return icons[lowerType] || icons.medical;
  }, []);

  /**
   * Calculate the financial summary for the claim.
   */
  const financialSummary = useMemo(() => {
    if (!claim) {
      return null;
    }

    return {
      billedAmount: claim.billedAmount || 0,
      allowedAmount: claim.allowedAmount || 0,
      planPaid: claim.planPaid || 0,
      whatYouOwe: claim.whatYouOwe || 0,
      savings: (claim.billedAmount || 0) - (claim.allowedAmount || 0),
    };
  }, [claim]);

  // Show not found state if claim doesn't exist
  if (!claim) {
    return (
      <div>
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToClaims}
            ariaLabel="Back to claims list"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back to Claims
          </Button>
        </div>

        <EmptyState
          title="Claim not found"
          message="The claim you're looking for doesn't exist or you don't have permission to view it."
          actionLabel="View All Claims"
          onAction={handleBackToClaims}
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
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToClaims}
          ariaLabel="Back to claims list"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Back to Claims
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-horizon-primary/10 flex-shrink-0 mt-0.5">
              {getClaimTypeIcon(claim.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-horizon-primary mb-1">
                Claim Details
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-sm text-horizon-gray-500"
                  data-phi="claim-number"
                >
                  {claim.claimNumber}
                </span>
                <Badge
                  label={getStatusLabel(claim.status)}
                  variant={getStatusVariant(claim.status)}
                  size="sm"
                  dot
                />
              </div>
            </div>
          </div>

          {/* EOB Download Button */}
          {eobDocument && (
            <Button
              variant="primary"
              size="md"
              onClick={handleEobDownload}
              loading={isDownloading}
              loadingText="Downloading..."
              disabled={isDownloading}
              ariaLabel="Download Explanation of Benefits"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Download EOB
            </Button>
          )}
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

      {/* Claim notes/alerts */}
      {claim.notes && claim.notes.trim().length > 0 && (
        <div className="mb-6">
          <Alert
            type={claim.status === 'denied' ? 'error' : claim.status === 'in_review' || claim.status === 'pending' ? 'warning' : 'info'}
            title="Claim Note"
            message={claim.notes}
          />
        </div>
      )}

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Total Billed</p>
            <p
              className="text-xl font-bold text-horizon-gray-800 mb-0"
              data-phi="financial-amount"
            >
              {formatCurrency(financialSummary.billedAmount)}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Allowed Amount</p>
            <p
              className="text-xl font-bold text-horizon-gray-800 mb-0"
              data-phi="financial-amount"
            >
              {formatCurrency(financialSummary.allowedAmount)}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">Plan Paid</p>
            <p
              className="text-xl font-bold text-green-700 mb-0"
              data-phi="financial-amount"
            >
              {formatCurrency(financialSummary.planPaid)}
            </p>
          </div>
          <div className="hb-card-flat p-4">
            <p className="hb-text-caption text-horizon-gray-500 mb-1">You Owe</p>
            <p
              className="text-xl font-bold text-horizon-primary mb-0"
              data-phi="financial-amount"
            >
              {formatCurrency(financialSummary.whatYouOwe)}
            </p>
          </div>
        </div>
      )}

      {/* Claim Information & Provider Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Claim Information Card */}
        <div className="hb-card">
          <div className="hb-card-header">
            <div className="hb-inline-sm">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                <svg
                  className="w-4 h-4 text-horizon-primary"
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
              </div>
              <h3 className="text-base font-bold text-horizon-primary mb-0">
                Claim Information
              </h3>
            </div>
          </div>
          <div className="hb-card-body">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="hb-text-body-sm text-horizon-gray-500">Claim Number</span>
                <span
                  className="text-sm font-medium text-horizon-gray-800"
                  data-phi="claim-number"
                >
                  {claim.claimNumber}
                </span>
              </div>
              <div className="hb-divider my-0" />
              <div className="flex items-center justify-between">
                <span className="hb-text-body-sm text-horizon-gray-500">Claim Type</span>
                <span className="text-sm font-medium text-horizon-gray-800">
                  {claim.claimType || (claim.type ? claim.type.charAt(0).toUpperCase() + claim.type.slice(1) : '')}
                </span>
              </div>
              <div className="hb-divider my-0" />
              <div className="flex items-center justify-between">
                <span className="hb-text-body-sm text-horizon-gray-500">Service Date</span>
                <span className="text-sm font-medium text-horizon-gray-800">
                  {formatDate(claim.serviceDate, 'MM/DD/YYYY')}
                </span>
              </div>
              <div className="hb-divider my-0" />
              <div className="flex items-center justify-between">
                <span className="hb-text-body-sm text-horizon-gray-500">Submitted Date</span>
                <span className="text-sm font-medium text-horizon-gray-800">
                  {claim.submittedDate ? formatDate(claim.submittedDate, 'MM/DD/YYYY') : 'N/A'}
                </span>
              </div>
              <div className="hb-divider my-0" />
              <div className="flex items-center justify-between">
                <span className="hb-text-body-sm text-horizon-gray-500">Processed Date</span>
                <span className="text-sm font-medium text-horizon-gray-800">
                  {claim.processedDate ? formatDate(claim.processedDate, 'MM/DD/YYYY') : 'Pending'}
                </span>
              </div>
              <div className="hb-divider my-0" />
              <div className="flex items-center justify-between">
                <span className="hb-text-body-sm text-horizon-gray-500">Status</span>
                <Badge
                  label={getStatusLabel(claim.status)}
                  variant={getStatusVariant(claim.status)}
                  size="sm"
                  dot
                />
              </div>
              <div className="hb-divider my-0" />
              <div className="flex items-center justify-between">
                <span className="hb-text-body-sm text-horizon-gray-500">Patient</span>
                <span className="text-sm font-medium text-horizon-gray-800">
                  {claim.patient || ''}
                </span>
              </div>
              {claim.diagnosisCodes && claim.diagnosisCodes.length > 0 && (
                <>
                  <div className="hb-divider my-0" />
                  <div className="flex items-center justify-between">
                    <span className="hb-text-body-sm text-horizon-gray-500">Diagnosis Codes</span>
                    <span
                      className="text-sm font-medium text-horizon-gray-800"
                      data-phi="diagnosis-code"
                    >
                      {claim.diagnosisCodes.join(', ')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Provider Information Card */}
        {claim.provider && (
          <div className="hb-card">
            <div className="hb-card-header">
              <div className="hb-inline-sm">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-horizon-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-horizon-primary mb-0">
                  Provider Information
                </h3>
              </div>
            </div>
            <div className="hb-card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="hb-text-body-sm text-horizon-gray-500">Provider Name</span>
                  <span className="text-sm font-medium text-horizon-gray-800">
                    {claim.provider.name}
                  </span>
                </div>
                {claim.provider.specialty && (
                  <>
                    <div className="hb-divider my-0" />
                    <div className="flex items-center justify-between">
                      <span className="hb-text-body-sm text-horizon-gray-500">Specialty</span>
                      <span className="text-sm font-medium text-horizon-gray-800">
                        {claim.provider.specialty}
                      </span>
                    </div>
                  </>
                )}
                {claim.provider.npi && (
                  <>
                    <div className="hb-divider my-0" />
                    <div className="flex items-center justify-between">
                      <span className="hb-text-body-sm text-horizon-gray-500">NPI</span>
                      <span
                        className="text-sm font-medium text-horizon-gray-800"
                        data-phi="provider-npi"
                      >
                        {claim.provider.npi}
                      </span>
                    </div>
                  </>
                )}
                {claim.provider.address && (
                  <>
                    <div className="hb-divider my-0" />
                    <div className="flex items-start justify-between gap-4">
                      <span className="hb-text-body-sm text-horizon-gray-500 flex-shrink-0">Address</span>
                      <span className="text-sm font-medium text-horizon-gray-800 text-right">
                        {claim.provider.address}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Financial Breakdown within Provider Card */}
              {financialSummary && financialSummary.savings > 0 && (
                <div className="mt-4 pt-4 border-t border-horizon-gray-200">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="hb-inline-sm">
                      <svg
                        className="w-4 h-4 text-green-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-0">
                          Network Savings
                        </p>
                        <p className="hb-text-caption text-green-700 mb-0">
                          You saved{' '}
                          <span data-phi="financial-amount">
                            {formatCurrency(financialSummary.savings)}
                          </span>
                          {' '}through your plan&apos;s negotiated rates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Line Items Table */}
      {claim.lineItems && claim.lineItems.length > 0 && (
        <div className="hb-card mb-6">
          <div className="hb-card-header">
            <div className="hb-inline-sm">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                <svg
                  className="w-4 h-4 text-horizon-primary"
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
                <h3 className="text-base font-bold text-horizon-primary mb-0">
                  Service Line Items
                </h3>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  {claim.lineItems.length} service{claim.lineItems.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="hb-card-body p-0">
            <div className="hb-table-wrapper border-0 rounded-none">
              <table
                className="hb-table hb-table-striped hb-table-hover"
                role="table"
                aria-label="Claim line items"
              >
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Code</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="text-right">Billed</th>
                    <th scope="col" className="text-right">Allowed</th>
                    <th scope="col" className="text-right">Plan Paid</th>
                    <th scope="col" className="text-right">Your Cost</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claim.lineItems.map((lineItem) => (
                    <tr key={lineItem.id}>
                      <td>
                        <span className="text-sm text-horizon-gray-700 max-w-[220px] block truncate" title={lineItem.description}>
                          {lineItem.description}
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-sm font-mono text-horizon-gray-600"
                          data-phi="procedure-code"
                        >
                          {lineItem.procedureCode}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-horizon-gray-600 whitespace-nowrap">
                          {formatDate(lineItem.serviceDate, 'MM/DD/YYYY')}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className="text-sm text-horizon-gray-700"
                          data-phi="financial-amount"
                        >
                          {formatCurrency(lineItem.billedAmount)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className="text-sm text-horizon-gray-700"
                          data-phi="financial-amount"
                        >
                          {formatCurrency(lineItem.allowedAmount)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className="text-sm font-medium text-green-700"
                          data-phi="financial-amount"
                        >
                          {formatCurrency(lineItem.planPaid)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className="text-sm font-bold text-horizon-gray-800"
                          data-phi="financial-amount"
                        >
                          {formatCurrency(lineItem.memberResponsibility)}
                        </span>
                      </td>
                      <td>
                        <Badge
                          label={getStatusLabel(lineItem.status)}
                          variant={getStatusVariant(lineItem.status)}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-horizon-gray-50 font-semibold">
                    <td colSpan={3} className="text-sm text-horizon-gray-700">
                      Totals
                    </td>
                    <td className="text-right">
                      <span
                        className="text-sm font-bold text-horizon-gray-800"
                        data-phi="financial-amount"
                      >
                        {formatCurrency(claim.billedAmount)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className="text-sm font-bold text-horizon-gray-800"
                        data-phi="financial-amount"
                      >
                        {formatCurrency(claim.allowedAmount)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className="text-sm font-bold text-green-700"
                        data-phi="financial-amount"
                      >
                        {formatCurrency(claim.planPaid)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className="text-sm font-bold text-horizon-primary"
                        data-phi="financial-amount"
                      >
                        {formatCurrency(claim.whatYouOwe)}
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EOB Document Section */}
      {eobDocument && (
        <div className="hb-card mb-6">
          <div className="hb-card-header">
            <div className="hb-inline-sm">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-horizon-primary/10 flex-shrink-0">
                <svg
                  className="w-4 h-4 text-horizon-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-horizon-primary mb-0">
                Explanation of Benefits
              </h3>
            </div>
          </div>
          <div className="hb-card-body">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-horizon-gray-800 mb-0.5 truncate">
                    {eobDocument.name}
                  </p>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0">
                    {eobDocument.fileSize} • Added {formatDate(eobDocument.dateAdded, 'MM/DD/YYYY')}
                  </p>
                  {eobDocument.description && (
                    <p className="hb-text-caption text-horizon-gray-400 mb-0 mt-1 hb-text-clamp-2">
                      {eobDocument.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEobDownload}
                loading={isDownloading}
                loadingText="Downloading..."
                disabled={isDownloading}
                ariaLabel={`Download ${eobDocument.name}`}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No EOB available notice */}
      {!eobDocument && (
        <div className="hb-card mb-6">
          <div className="hb-card-body">
            <div className="hb-inline-sm">
              <svg
                className="w-5 h-5 text-horizon-gray-400 flex-shrink-0"
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
              <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
                The Explanation of Benefits (EOB) for this claim is not yet available.
                {claim.status === 'pending' || claim.status === 'submitted' || claim.status === 'in_review'
                  ? ' It will be available once the claim has been fully processed.'
                  : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
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
            If you have questions about this claim, please contact Member Services at 1-800-355-2583.
            You may appeal a denied claim within 180 days of the denial notice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;