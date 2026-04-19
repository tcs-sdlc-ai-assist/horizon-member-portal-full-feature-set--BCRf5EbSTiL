import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { ROUTES } from '../utils/constants.js';
import { formatDate, formatCurrency } from '../utils/formatters.js';

/**
 * Mock prescription history data.
 * Provides recent prescriptions for the prescriptions page.
 */
const prescriptionHistory = [
  {
    id: 'RX-001',
    medicationName: 'Lisinopril 10mg Tablets',
    prescriber: 'Dr. Sarah Mitchell',
    pharmacy: 'CVS Pharmacy #4521',
    pharmacyAddress: '789 Broad St, Newark, NJ 07102',
    dateWritten: '2024-07-15',
    dateFilled: '2024-10-05',
    daysSupply: 90,
    quantity: 90,
    refillsRemaining: 2,
    status: 'filled',
    tier: 'Generic',
    copay: 15.00,
    ndc: 'NDC-12345',
  },
  {
    id: 'RX-002',
    medicationName: 'Atorvastatin 20mg Tablets',
    prescriber: 'Dr. Sarah Mitchell',
    pharmacy: 'CVS Pharmacy #4521',
    pharmacyAddress: '789 Broad St, Newark, NJ 07102',
    dateWritten: '2024-07-15',
    dateFilled: '2024-10-05',
    daysSupply: 90,
    quantity: 90,
    refillsRemaining: 2,
    status: 'filled',
    tier: 'Generic',
    copay: 15.00,
    ndc: 'NDC-67890',
  },
  {
    id: 'RX-003',
    medicationName: 'Cetirizine 10mg Tablets',
    prescriber: 'Dr. Sarah Mitchell',
    pharmacy: 'Walgreens Pharmacy #7832',
    pharmacyAddress: '456 Market St, Newark, NJ 07107',
    dateWritten: '2024-09-01',
    dateFilled: '2024-10-01',
    daysSupply: 30,
    quantity: 30,
    refillsRemaining: 5,
    status: 'filled',
    tier: 'Generic',
    copay: 10.00,
    ndc: 'NDC-11223',
  },
  {
    id: 'RX-004',
    medicationName: 'Metformin 500mg Tablets',
    prescriber: 'Dr. Angela Torres',
    pharmacy: 'CVS Pharmacy #4521',
    pharmacyAddress: '789 Broad St, Newark, NJ 07102',
    dateWritten: '2024-08-20',
    dateFilled: '2024-08-22',
    daysSupply: 90,
    quantity: 180,
    refillsRemaining: 3,
    status: 'filled',
    tier: 'Generic',
    copay: 10.00,
    ndc: 'NDC-44556',
  },
  {
    id: 'RX-005',
    medicationName: 'Omeprazole 20mg Capsules',
    prescriber: 'Dr. Sarah Mitchell',
    pharmacy: 'CVS Pharmacy #4521',
    pharmacyAddress: '789 Broad St, Newark, NJ 07102',
    dateWritten: '2024-09-15',
    dateFilled: null,
    daysSupply: 30,
    quantity: 30,
    refillsRemaining: 0,
    status: 'pending',
    tier: 'Preferred Brand',
    copay: 30.00,
    ndc: 'NDC-77889',
  },
];

/**
 * Mock pharmacy locations data.
 */
const pharmacyLocations = [
  {
    id: 'PH-001',
    name: 'CVS Pharmacy #4521',
    address: '789 Broad St, Newark, NJ 07102',
    phone: '973-555-0101',
    hours: 'Mon-Fri 8AM-10PM, Sat-Sun 9AM-6PM',
    type: 'retail',
    inNetwork: true,
  },
  {
    id: 'PH-002',
    name: 'Walgreens Pharmacy #7832',
    address: '456 Market St, Newark, NJ 07107',
    phone: '973-555-0202',
    hours: 'Mon-Fri 8AM-9PM, Sat-Sun 9AM-6PM',
    type: 'retail',
    inNetwork: true,
  },
  {
    id: 'PH-003',
    name: 'Rite Aid Pharmacy #2190',
    address: '900 Bergen Ave, Jersey City, NJ 07306',
    phone: '201-555-0303',
    hours: 'Mon-Fri 8AM-9PM, Sat 9AM-6PM, Sun 10AM-5PM',
    type: 'retail',
    inNetwork: true,
  },
  {
    id: 'PH-004',
    name: 'Horizon Mail Order Pharmacy',
    address: 'PO Box 820, Newark, NJ 07101',
    phone: '1-800-700-2583',
    hours: 'Mon-Fri 8AM-8PM ET',
    type: 'mail_order',
    inNetwork: true,
  },
];

/**
 * Mock formulary tier information.
 */
const formularyTiers = [
  {
    id: 'tier-1',
    name: 'Tier 1 - Generic',
    description: 'FDA-approved generic medications. Lowest cost option.',
    copayRetail: '$10',
    copayMailOrder: '$25',
    examples: 'Lisinopril, Atorvastatin, Metformin, Cetirizine',
  },
  {
    id: 'tier-2',
    name: 'Tier 2 - Preferred Brand',
    description: 'Preferred brand-name medications on the formulary.',
    copayRetail: '$30',
    copayMailOrder: '$75',
    examples: 'Omeprazole, Synthroid, Crestor',
  },
  {
    id: 'tier-3',
    name: 'Tier 3 - Non-Preferred Brand',
    description: 'Non-preferred brand-name medications. Higher cost.',
    copayRetail: '$50',
    copayMailOrder: '$125',
    examples: 'Nexium, Lipitor, Advair',
  },
  {
    id: 'tier-4',
    name: 'Tier 4 - Specialty',
    description: 'Specialty medications for complex conditions. May require prior authorization.',
    copayRetail: '30% coinsurance',
    copayMailOrder: '30% coinsurance',
    examples: 'Humira, Enbrel, Stelara',
  },
];

/**
 * PrescriptionsPage - Prescriptions page with history, pharmacy, and formulary info
 * Implements the Prescriptions page placeholder from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Displays page heading and content placeholder with prescription information
 * and pharmacy links (mock content). Includes prescription history table,
 * pharmacy locations, formulary tier information, and mail order details.
 * Logs page view via useAuditLog and tags via useGlassbox on mount.
 *
 * @returns {JSX.Element}
 */
const PrescriptionsPage = () => {
  const { currentUser } = useAuth();
  const { tagPage, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Log prescriptions page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/prescriptions', {
        action: 'prescriptions_page_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/prescriptions', {
          action: 'prescriptions_page_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /**
   * Handle navigation to the drug formulary page.
   */
  const handleViewFormulary = useCallback(() => {
    if (isGlassboxEnabled) {
      tagAction('prescriptions_view_formulary', {
        route: '/prescriptions',
        action: 'view_formulary',
      });
    }

    navigate('/prescriptions/formulary');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle navigation to the find a pharmacy page.
   */
  const handleFindPharmacy = useCallback(() => {
    if (isGlassboxEnabled) {
      tagAction('prescriptions_find_pharmacy', {
        route: '/prescriptions',
        action: 'find_pharmacy',
      });
    }

    navigate('/prescriptions/pharmacy');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle navigation to the mail order page.
   */
  const handleMailOrder = useCallback(() => {
    if (isGlassboxEnabled) {
      tagAction('prescriptions_mail_order', {
        route: '/prescriptions',
        action: 'mail_order',
      });
    }

    navigate('/prescriptions/mail-order');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle navigation to the prescription history page.
   */
  const handleViewHistory = useCallback(() => {
    if (isGlassboxEnabled) {
      tagAction('prescriptions_view_history', {
        route: '/prescriptions',
        action: 'view_history',
      });
    }

    navigate('/prescriptions/history');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle clicking on a prescription row.
   *
   * @param {object} prescription - The prescription object
   */
  const handlePrescriptionClick = useCallback((prescription) => {
    if (!prescription || !prescription.id) {
      return;
    }

    if (isGlassboxEnabled) {
      tagAction('prescription_clicked', {
        route: '/prescriptions',
        action: 'prescription_click',
        resourceId: prescription.id,
      });
    }

    navigate('/prescriptions/history');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle keyboard events on prescription rows for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} prescription - The prescription object
   */
  const handlePrescriptionKeyDown = useCallback((e, prescription) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePrescriptionClick(prescription);
    }
  }, [handlePrescriptionClick]);

  /**
   * Handle clicking on a pharmacy location.
   *
   * @param {object} pharmacy - The pharmacy object
   */
  const handlePharmacyClick = useCallback((pharmacy) => {
    if (!pharmacy || !pharmacy.id) {
      return;
    }

    if (isGlassboxEnabled) {
      tagAction('pharmacy_clicked', {
        route: '/prescriptions',
        action: 'pharmacy_click',
        resourceId: pharmacy.id,
      });
    }

    navigate('/prescriptions/pharmacy');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle keyboard events on pharmacy cards for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} pharmacy - The pharmacy object
   */
  const handlePharmacyKeyDown = useCallback((e, pharmacy) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePharmacyClick(pharmacy);
    }
  }, [handlePharmacyClick]);

  /**
   * Get the status badge variant for a prescription status.
   *
   * @param {string} status - The prescription status
   * @returns {string} The badge variant
   */
  const getStatusVariant = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      filled: 'success',
      pending: 'warning',
      expired: 'neutral',
      cancelled: 'error',
      on_hold: 'warning',
    };

    return variantMap[status.toLowerCase()] || 'neutral';
  }, []);

  /**
   * Get the status label for a prescription status.
   *
   * @param {string} status - The prescription status
   * @returns {string} The status label
   */
  const getStatusLabel = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return '';
    }

    const labelMap = {
      filled: 'Filled',
      pending: 'Pending',
      expired: 'Expired',
      cancelled: 'Cancelled',
      on_hold: 'On Hold',
    };

    return labelMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  }, []);

  /**
   * Get the tier badge variant for a formulary tier.
   *
   * @param {string} tier - The tier name
   * @returns {string} The badge variant
   */
  const getTierVariant = useCallback((tier) => {
    if (!tier || typeof tier !== 'string') {
      return 'neutral';
    }

    const lowerTier = tier.toLowerCase();

    if (lowerTier.includes('generic')) {
      return 'success';
    }
    if (lowerTier.includes('preferred')) {
      return 'info';
    }
    if (lowerTier.includes('non-preferred')) {
      return 'warning';
    }
    if (lowerTier.includes('specialty')) {
      return 'error';
    }

    return 'neutral';
  }, []);

  /**
   * Get the pharmacy type icon SVG.
   *
   * @param {string} type - The pharmacy type
   * @returns {JSX.Element} The icon SVG element
   */
  const getPharmacyIcon = useCallback((type) => {
    if (type === 'mail_order') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }, []);

  /**
   * Calculate prescription summary statistics.
   */
  const prescriptionSummary = useMemo(() => {
    const totalPrescriptions = prescriptionHistory.length;
    const activePrescriptions = prescriptionHistory.filter((rx) => rx.status === 'filled').length;
    const pendingPrescriptions = prescriptionHistory.filter((rx) => rx.status === 'pending').length;
    const totalCopays = prescriptionHistory
      .filter((rx) => rx.status === 'filled')
      .reduce((sum, rx) => sum + (rx.copay || 0), 0);

    return {
      totalPrescriptions,
      activePrescriptions,
      pendingPrescriptions,
      totalCopays,
    };
  }, []);

  return (
    <div>
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
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-horizon-primary mb-0">
              Prescriptions
            </h1>
            <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
              View your prescription history, find a pharmacy, and manage your medications.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="hb-card-flat p-4">
          <p className="hb-text-caption text-horizon-gray-500 mb-1">Total Prescriptions</p>
          <p className="text-xl font-bold text-horizon-primary mb-0">
            {prescriptionSummary.totalPrescriptions}
          </p>
        </div>
        <div className="hb-card-flat p-4">
          <p className="hb-text-caption text-horizon-gray-500 mb-1">Active</p>
          <p className="text-xl font-bold text-green-700 mb-0">
            {prescriptionSummary.activePrescriptions}
          </p>
        </div>
        <div className="hb-card-flat p-4">
          <p className="hb-text-caption text-horizon-gray-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-yellow-700 mb-0">
            {prescriptionSummary.pendingPrescriptions}
          </p>
        </div>
        <div className="hb-card-flat p-4">
          <p className="hb-text-caption text-horizon-gray-500 mb-1">Total Copays (YTD)</p>
          <p
            className="text-xl font-bold text-horizon-gray-800 mb-0"
            data-phi="financial-amount"
          >
            {formatCurrency(prescriptionSummary.totalCopays)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hb-card mb-6">
        <div className="hb-card-body">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleViewHistory}
              ariaLabel="View prescription history"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Prescription History
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleViewFormulary}
              ariaLabel="View drug formulary"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            >
              Drug Formulary
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleFindPharmacy}
              ariaLabel="Find a pharmacy"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              Find a Pharmacy
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleMailOrder}
              ariaLabel="Mail order pharmacy"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            >
              Mail Order
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Prescriptions Table */}
      <div className="hb-card mb-6">
        <div className="hb-card-header">
          <div className="flex items-center justify-between">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-horizon-primary mb-0">
                  Recent Prescriptions
                </h2>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  {prescriptionHistory.length} prescription{prescriptionHistory.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={handleViewHistory}
              ariaLabel="View full prescription history"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              View All
            </Button>
          </div>
        </div>
        <div className="hb-card-body p-0">
          {prescriptionHistory.length > 0 ? (
            <div className="hb-table-wrapper border-0 rounded-none">
              <table
                className="hb-table hb-table-striped hb-table-hover"
                role="table"
                aria-label="Recent prescriptions"
              >
                <thead>
                  <tr>
                    <th scope="col">Medication</th>
                    <th scope="col">Prescriber</th>
                    <th scope="col">Pharmacy</th>
                    <th scope="col">Date Filled</th>
                    <th scope="col">Supply</th>
                    <th scope="col">Tier</th>
                    <th scope="col" className="text-right">Copay</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionHistory.map((rx) => (
                    <tr
                      key={rx.id}
                      className="cursor-pointer"
                      onClick={() => handlePrescriptionClick(rx)}
                      onKeyDown={(e) => handlePrescriptionKeyDown(e, rx)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${rx.medicationName}, ${getStatusLabel(rx.status)}`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-horizon-gray-800">
                            {rx.medicationName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-horizon-gray-700">
                          {rx.prescriber}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-horizon-gray-700 truncate max-w-[160px] block">
                          {rx.pharmacy}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-horizon-gray-600 whitespace-nowrap">
                          {rx.dateFilled ? formatDate(rx.dateFilled, 'MM/DD/YYYY') : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-horizon-gray-600">
                          {rx.daysSupply} days
                        </span>
                      </td>
                      <td>
                        <Badge
                          label={rx.tier}
                          variant={getTierVariant(rx.tier)}
                          size="sm"
                        />
                      </td>
                      <td className="text-right">
                        <span
                          className="text-sm font-medium text-horizon-gray-700"
                          data-phi="financial-amount"
                        >
                          {formatCurrency(rx.copay)}
                        </span>
                      </td>
                      <td>
                        <Badge
                          label={getStatusLabel(rx.status)}
                          variant={getStatusVariant(rx.status)}
                          size="sm"
                          dot
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              size="sm"
              title="No prescriptions found"
              message="You don't have any prescription records to display."
              icon={
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              }
            />
          )}
        </div>
      </div>

      {/* Formulary Tiers Section */}
      <div className="hb-card mb-6" role="region" aria-label="Drug Formulary Tiers">
        <div className="hb-card-header">
          <div className="flex items-center justify-between">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-horizon-primary mb-0">
                  Drug Formulary Tiers
                </h2>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  Understanding your prescription drug costs
                </p>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={handleViewFormulary}
              ariaLabel="View full drug formulary"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              View Formulary
            </Button>
          </div>
        </div>
        <div className="hb-card-body p-0">
          <div className="hb-table-wrapper border-0 rounded-none">
            <table
              className="hb-table hb-table-striped hb-table-hover"
              role="table"
              aria-label="Drug formulary tiers"
            >
              <thead>
                <tr>
                  <th scope="col">Tier</th>
                  <th scope="col">Description</th>
                  <th scope="col">Retail Copay (30-day)</th>
                  <th scope="col">Mail Order (90-day)</th>
                  <th scope="col">Examples</th>
                </tr>
              </thead>
              <tbody>
                {formularyTiers.map((tier) => (
                  <tr key={tier.id}>
                    <td>
                      <span className="text-sm font-medium text-horizon-gray-800">
                        {tier.name}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-horizon-gray-600 max-w-[250px] block">
                        {tier.description}
                      </span>
                    </td>
                    <td>
                      <span
                        className="text-sm font-medium text-horizon-gray-700"
                        data-phi="financial-amount"
                      >
                        {tier.copayRetail}
                      </span>
                    </td>
                    <td>
                      <span
                        className="text-sm font-medium text-horizon-gray-700"
                        data-phi="financial-amount"
                      >
                        {tier.copayMailOrder}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-horizon-gray-500 max-w-[200px] block">
                        {tier.examples}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="hb-card-footer">
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
              Copay amounts shown are for in-network pharmacies. Out-of-network pharmacies may have higher costs.
              Some medications may require prior authorization or step therapy.
            </p>
          </div>
        </div>
      </div>

      {/* Pharmacy Locations Section */}
      <div className="hb-card mb-6">
        <div className="hb-card-header">
          <div className="flex items-center justify-between">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-horizon-primary mb-0">
                  Nearby Pharmacies
                </h2>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  In-network pharmacy locations
                </p>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={handleFindPharmacy}
              ariaLabel="Find more pharmacies"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Find More
            </Button>
          </div>
        </div>
        <div className="hb-card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pharmacyLocations.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-horizon-gray-50 border border-horizon-gray-200 hover:shadow-horizon-md transition-shadow duration-200 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handlePharmacyClick(pharmacy)}
                onKeyDown={(e) => handlePharmacyKeyDown(e, pharmacy)}
                aria-label={`${pharmacy.name} - ${pharmacy.address}`}
              >
                <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-horizon-primary/10 text-horizon-primary mt-0.5">
                  {getPharmacyIcon(pharmacy.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-horizon-gray-800 mb-0 truncate">
                      {pharmacy.name}
                    </p>
                    {pharmacy.inNetwork && (
                      <Badge
                        label="In-Network"
                        variant="success"
                        size="sm"
                      />
                    )}
                  </div>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0.5">
                    {pharmacy.address}
                  </p>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0.5">
                    <a
                      href={`tel:${pharmacy.phone.replace(/\D/g, '')}`}
                      className="text-horizon-blue hover:text-horizon-primary transition-colors duration-200 no-underline"
                      aria-label={`Call ${pharmacy.name} at ${pharmacy.phone}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {pharmacy.phone}
                    </a>
                  </p>
                  <p className="hb-text-caption text-horizon-gray-400 mb-0">
                    {pharmacy.hours}
                  </p>
                  {pharmacy.type === 'mail_order' && (
                    <Badge
                      label="Mail Order"
                      variant="info"
                      size="sm"
                      className="mt-1"
                    />
                  )}
                </div>
                <div className="flex-shrink-0 mt-1">
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
            ))}
          </div>
        </div>
      </div>

      {/* Mail Order Pharmacy Section */}
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-horizon-primary mb-0">
                Mail Order Pharmacy
              </h2>
              <p className="hb-text-caption text-horizon-gray-500 mb-0">
                Save money with 90-day supplies delivered to your door
              </p>
            </div>
          </div>
        </div>
        <div className="hb-card-body">
          <div className="bg-horizon-gray-50 rounded-xl border border-horizon-gray-200 p-5 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-horizon-gray-800 mb-1">
                  Get 90-day supplies for the price of two retail copays
                </p>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  Mail order pharmacy is a convenient and cost-effective way to get your maintenance medications
                  delivered directly to your home. You can save up to 33% compared to filling 30-day supplies at a retail pharmacy.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleMailOrder}
                  ariaLabel="Get started with mail order pharmacy"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-horizon-gray-50">
              <div className="flex-shrink-0 text-horizon-secondary mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-horizon-gray-700 mb-0.5">
                  Save Money
                </p>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  Pay only 2.5x your retail copay for a 90-day supply.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-horizon-gray-50">
              <div className="flex-shrink-0 text-horizon-secondary mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-horizon-gray-700 mb-0.5">
                  Home Delivery
                </p>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  Medications delivered right to your doorstep.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-horizon-gray-50">
              <div className="flex-shrink-0 text-horizon-secondary mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-horizon-gray-700 mb-0.5">
                  Auto Refills
                </p>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  Set up automatic refills so you never miss a dose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Tips Section */}
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-horizon-primary mb-0">
              Tips to Save on Prescriptions
            </h2>
          </div>
        </div>
        <div className="hb-card-body">
          <div className="space-y-2">
            {[
              'Ask your doctor about generic alternatives — they can save you up to 80% compared to brand-name medications.',
              'Use mail order pharmacy for maintenance medications to get a 90-day supply at a lower cost.',
              'Check the drug formulary before filling a prescription to understand your tier and copay amount.',
              'Compare prices between in-network pharmacies — costs can vary by location.',
              'Ask your pharmacist about manufacturer discount programs and patient assistance programs.',
              'Review your Explanation of Benefits (EOB) after each pharmacy claim to verify charges.',
            ].map((tip, index) => (
              <div
                key={`tip-${index}`}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-horizon-gray-50"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-horizon-secondary"
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
                </div>
                <p className="text-sm text-horizon-gray-700 mb-0">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
            Prescription information shown is for demonstration purposes. For questions about your prescription coverage,
            contact the Pharmacy Help Desk at 1-800-700-2583. Always consult your healthcare provider before making changes
            to your medications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsPage;