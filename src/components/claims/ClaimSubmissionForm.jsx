import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';
import Button from '../common/Button.jsx';
import Alert from '../common/Alert.jsx';
import { ROUTES } from '../../utils/constants.js';

/**
 * ClaimSubmissionForm - Claim submission form component (MVP stub)
 * Implements the claim submission form from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7171
 *
 * Includes fields for claim type, provider name, service date, amount, and
 * description using HB form classes. Submit creates a stub record, shows
 * confirmation alert, and logs audit event. Form validation with accessible
 * error messages. MVP stub — no actual backend submission.
 *
 * @returns {JSX.Element}
 */
const ClaimSubmissionForm = () => {
  const { currentUser } = useAuth();
  const { tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logAction, AUDIT_ACTIONS } = useAuditLog();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    claimType: '',
    providerName: '',
    serviceDate: '',
    amount: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const claimTypeRef = useRef(null);
  const providerNameRef = useRef(null);
  const serviceDateRef = useRef(null);
  const amountRef = useRef(null);
  const descriptionRef = useRef(null);
  const formRef = useRef(null);

  /**
   * Focus the claim type field on mount.
   */
  useEffect(() => {
    if (claimTypeRef.current) {
      claimTypeRef.current.focus();
    }
  }, []);

  /**
   * Claim type options for the select dropdown.
   */
  const claimTypeOptions = [
    { value: 'medical', label: 'Medical' },
    { value: 'dental', label: 'Dental' },
    { value: 'vision', label: 'Vision' },
    { value: 'pharmacy', label: 'Pharmacy' },
  ];

  /**
   * Validate form fields and return an errors object.
   *
   * @returns {object} Errors object keyed by field name
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.claimType) {
      newErrors.claimType = 'Claim type is required.';
    }

    const trimmedProvider = formData.providerName.trim();
    if (!trimmedProvider) {
      newErrors.providerName = 'Provider name is required.';
    } else if (trimmedProvider.length < 2) {
      newErrors.providerName = 'Provider name must be at least 2 characters.';
    } else if (trimmedProvider.length > 200) {
      newErrors.providerName = 'Provider name must be 200 characters or fewer.';
    }

    if (!formData.serviceDate) {
      newErrors.serviceDate = 'Service date is required.';
    } else {
      const serviceDate = new Date(formData.serviceDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (isNaN(serviceDate.getTime())) {
        newErrors.serviceDate = 'Please enter a valid date.';
      } else if (serviceDate > today) {
        newErrors.serviceDate = 'Service date cannot be in the future.';
      }
    }

    const trimmedAmount = formData.amount.trim();
    if (!trimmedAmount) {
      newErrors.amount = 'Amount is required.';
    } else {
      const numAmount = parseFloat(trimmedAmount.replace(/[^0-9.]/g, ''));
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Please enter a valid amount greater than $0.00.';
      } else if (numAmount > 999999.99) {
        newErrors.amount = 'Amount must be less than $1,000,000.00.';
      }
    }

    const trimmedDescription = formData.description.trim();
    if (trimmedDescription.length > 500) {
      newErrors.description = 'Description must be 500 characters or fewer.';
    }

    return newErrors;
  }, [formData]);

  /**
   * Clear a specific field error when the user starts typing.
   *
   * @param {string} field - The field name to clear the error for
   */
  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });

    if (formError) {
      setFormError('');
    }
  }, [formError]);

  /**
   * Handle input change for form fields.
   *
   * @param {string} field - The field name
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>} e - The change event
   */
  const handleChange = useCallback((field, e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    clearFieldError(field);
  }, [clearFieldError]);

  /**
   * Get the ref for a given field name.
   *
   * @param {string} field - The field name
   * @returns {React.Ref} The ref for the field
   */
  const getFieldRef = useCallback((field) => {
    const refMap = {
      claimType: claimTypeRef,
      providerName: providerNameRef,
      serviceDate: serviceDateRef,
      amount: amountRef,
      description: descriptionRef,
    };
    return refMap[field] || null;
  }, []);

  /**
   * Handle form submission.
   * Validates fields, creates a stub record, shows confirmation, and logs audit event.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setFormError('');
    setErrors({});
    setSubmitSuccess('');

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Focus the first field with an error
      const fieldOrder = ['claimType', 'providerName', 'serviceDate', 'amount', 'description'];
      for (const field of fieldOrder) {
        if (validationErrors[field]) {
          const ref = getFieldRef(field);
          if (ref && ref.current) {
            ref.current.focus();
          }
          break;
        }
      }

      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate submission delay (MVP stub)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create stub claim record
      const stubClaimId = `CLM-STUB-${Date.now()}`;
      const stubClaimNumber = `HZN-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;

      // Log audit event for claim submission
      logAction('claim_submitted', {
        route: '/claims/submit',
        action: 'claim_submission',
        claimId: stubClaimId,
        claimType: formData.claimType,
        providerName: formData.providerName.trim(),
        serviceDate: formData.serviceDate,
      });

      // Tag Glassbox event if enabled
      if (isGlassboxEnabled) {
        tagAction('claim_submitted', {
          route: '/claims/submit',
          action: 'claim_submission',
          resourceId: stubClaimId,
          claimType: formData.claimType,
        });
      }

      setSubmitSuccess(
        `Your claim ${stubClaimNumber} has been submitted successfully. ` +
        'Please note this is a demonstration — no actual claim has been filed. ' +
        'You will receive a confirmation once the claim is processed.'
      );

      // Reset form
      setFormData({
        claimType: '',
        providerName: '',
        serviceDate: '',
        amount: '',
        description: '',
      });
    } catch (_error) {
      setFormError('An unexpected error occurred while submitting your claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, getFieldRef, logAction, isGlassboxEnabled, tagAction]);

  /**
   * Handle navigating back to the claims list.
   */
  const handleBackToClaims = useCallback(() => {
    navigate(ROUTES.CLAIMS);
  }, [navigate]);

  /**
   * Get today's date in YYYY-MM-DD format for the max date attribute.
   *
   * @returns {string} Today's date string
   */
  const getTodayDateString = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-horizon-primary mb-0">
              Submit a Claim
            </h1>
            <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
              Submit a new claim for reimbursement of healthcare services.
            </p>
          </div>
        </div>
      </div>

      {/* MVP Notice */}
      <div className="mb-6">
        <Alert
          type="info"
          title="Demonstration Only"
          message="This is a demonstration form. No actual claim will be submitted or processed. In a production environment, this form would submit your claim to Horizon for processing."
        />
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6">
          <Alert
            type="success"
            title="Claim Submitted"
            message={submitSuccess}
            dismissible
            onDismiss={() => setSubmitSuccess('')}
          />
        </div>
      )}

      {/* Submission Form Card */}
      <div className="hb-card" role="region" aria-label="Claim submission form">
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
            <h2 className="text-base font-bold text-horizon-primary mb-0">
              Claim Information
            </h2>
          </div>
        </div>

        <div className="hb-card-body p-6 sm:p-8">
          {/* Form-level error alert */}
          {formError && (
            <div
              className="hb-alert hb-alert-error mb-6"
              role="alert"
              aria-live="assertive"
            >
              <div className="hb-alert-icon" aria-hidden="true">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">{formError}</p>
              </div>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            aria-label="Claim submission form"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
              {/* Claim Type Field */}
              <div className="hb-form-group">
                <label
                  htmlFor="claim-type"
                  className="hb-form-label hb-form-label-required"
                >
                  Claim Type
                </label>
                <select
                  ref={claimTypeRef}
                  id="claim-type"
                  name="claimType"
                  value={formData.claimType}
                  onChange={(e) => handleChange('claimType', e)}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={errors.claimType ? 'true' : 'false'}
                  aria-describedby={errors.claimType ? 'claim-type-error' : undefined}
                  className={`hb-form-select ${errors.claimType ? 'hb-form-input-error' : ''}`}
                >
                  <option value="">Select claim type</option>
                  {claimTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.claimType && (
                  <p
                    id="claim-type-error"
                    className="hb-form-error"
                    role="alert"
                  >
                    {errors.claimType}
                  </p>
                )}
              </div>

              {/* Provider Name Field */}
              <div className="hb-form-group">
                <label
                  htmlFor="provider-name"
                  className="hb-form-label hb-form-label-required"
                >
                  Provider Name
                </label>
                <input
                  ref={providerNameRef}
                  id="provider-name"
                  name="providerName"
                  type="text"
                  autoComplete="off"
                  maxLength={200}
                  value={formData.providerName}
                  onChange={(e) => handleChange('providerName', e)}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={errors.providerName ? 'true' : 'false'}
                  aria-describedby={errors.providerName ? 'provider-name-error' : undefined}
                  placeholder="Enter provider or facility name"
                  className={`hb-form-input ${errors.providerName ? 'hb-form-input-error' : ''}`}
                />
                {errors.providerName && (
                  <p
                    id="provider-name-error"
                    className="hb-form-error"
                    role="alert"
                  >
                    {errors.providerName}
                  </p>
                )}
              </div>

              {/* Service Date Field */}
              <div className="hb-form-group">
                <label
                  htmlFor="service-date"
                  className="hb-form-label hb-form-label-required"
                >
                  Service Date
                </label>
                <input
                  ref={serviceDateRef}
                  id="service-date"
                  name="serviceDate"
                  type="date"
                  max={getTodayDateString()}
                  value={formData.serviceDate}
                  onChange={(e) => handleChange('serviceDate', e)}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={errors.serviceDate ? 'true' : 'false'}
                  aria-describedby={errors.serviceDate ? 'service-date-error' : 'service-date-hint'}
                  className={`hb-form-input ${errors.serviceDate ? 'hb-form-input-error' : ''}`}
                />
                {errors.serviceDate ? (
                  <p
                    id="service-date-error"
                    className="hb-form-error"
                    role="alert"
                  >
                    {errors.serviceDate}
                  </p>
                ) : (
                  <p id="service-date-hint" className="hb-form-hint">
                    Date the service was provided
                  </p>
                )}
              </div>

              {/* Amount Field */}
              <div className="hb-form-group">
                <label
                  htmlFor="claim-amount"
                  className="hb-form-label hb-form-label-required"
                >
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-sm text-horizon-gray-400">$</span>
                  </div>
                  <input
                    ref={amountRef}
                    id="claim-amount"
                    name="amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e)}
                    disabled={isSubmitting}
                    aria-required="true"
                    aria-invalid={errors.amount ? 'true' : 'false'}
                    aria-describedby={errors.amount ? 'claim-amount-error' : 'claim-amount-hint'}
                    placeholder="0.00"
                    className={`hb-form-input pl-8 ${errors.amount ? 'hb-form-input-error' : ''}`}
                  />
                </div>
                {errors.amount ? (
                  <p
                    id="claim-amount-error"
                    className="hb-form-error"
                    role="alert"
                  >
                    {errors.amount}
                  </p>
                ) : (
                  <p id="claim-amount-hint" className="hb-form-hint">
                    Total billed amount for the service
                  </p>
                )}
              </div>
            </div>

            {/* Description Field (full width) */}
            <div className="hb-form-group">
              <label
                htmlFor="claim-description"
                className="hb-form-label"
              >
                Description
              </label>
              <textarea
                ref={descriptionRef}
                id="claim-description"
                name="description"
                rows={4}
                maxLength={500}
                value={formData.description}
                onChange={(e) => handleChange('description', e)}
                disabled={isSubmitting}
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={errors.description ? 'claim-description-error' : 'claim-description-hint'}
                placeholder="Provide a brief description of the service or reason for the claim (optional)"
                className={`hb-form-input resize-y min-h-[100px] ${errors.description ? 'hb-form-input-error' : ''}`}
              />
              {errors.description ? (
                <p
                  id="claim-description-error"
                  className="hb-form-error"
                  role="alert"
                >
                  {errors.description}
                </p>
              ) : (
                <p id="claim-description-hint" className="hb-form-hint">
                  {formData.description.length}/500 characters
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-6 border-t border-horizon-gray-200">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                loading={isSubmitting}
                loadingText="Submitting..."
                ariaLabel="Submit claim"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                }
              >
                Submit Claim
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleBackToClaims}
                disabled={isSubmitting}
                ariaLabel="Cancel and return to claims"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-6">
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
            Claims typically take 15-30 business days to process. You will receive a notification
            and Explanation of Benefits (EOB) once your claim has been reviewed. For questions,
            contact Member Services at 1-800-355-2583.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimSubmissionForm;