import { useState, useCallback } from 'react';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import LeavingSiteModal from '../common/LeavingSiteModal.jsx';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';

/**
 * GetCareSection - Reusable Get Care content section with FAQs
 * Implements the Get Care content section from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders section heading, content-managed guidance text, FAQ accordion
 * (using HB accordion classes), and optional external link button with
 * LeavingSiteModal integration. Used for Find Care & Cost, Telemedicine,
 * and Behavioral Health sections.
 *
 * @param {object} props
 * @param {string} props.title - Section heading title
 * @param {object} props.content - Content object containing description, guidanceText, features, crisisResources, etc.
 * @param {Array<{id: string, question: string, answer: string}>} [props.faqs=[]] - Array of FAQ items for the accordion
 * @param {object} [props.externalLink] - External link configuration with url, label, description, and isExternal flag
 * @param {string} [props.icon] - Icon identifier for the section header
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const GetCareSection = ({
  title,
  content,
  faqs = [],
  externalLink,
  icon,
  className = '',
}) => {
  const { tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logAction, logExternalLink } = useAuditLog();

  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [isLeavingSiteOpen, setIsLeavingSiteOpen] = useState(false);

  /**
   * Handle toggling a FAQ accordion item.
   *
   * @param {string} faqId - The FAQ item ID to toggle
   */
  const handleFaqToggle = useCallback((faqId) => {
    setExpandedFaqId((prev) => (prev === faqId ? null : faqId));

    if (isGlassboxEnabled) {
      tagAction('faq_toggled', {
        route: '/find-care',
        action: 'faq_toggle',
        resourceId: faqId,
        sectionTitle: title,
      });
    }
  }, [isGlassboxEnabled, tagAction, title]);

  /**
   * Handle keyboard events on FAQ accordion headers for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {string} faqId - The FAQ item ID
   */
  const handleFaqKeyDown = useCallback((e, faqId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFaqToggle(faqId);
    }
  }, [handleFaqToggle]);

  /**
   * Handle clicking the external link button.
   * Opens the LeavingSiteModal if the link is external.
   */
  const handleExternalLinkClick = useCallback(() => {
    if (!externalLink || !externalLink.url) {
      return;
    }

    if (externalLink.isExternal) {
      setIsLeavingSiteOpen(true);
    } else {
      window.open(externalLink.url, '_blank', 'noopener,noreferrer');
    }

    if (isGlassboxEnabled) {
      tagAction('get_care_external_link', {
        route: '/find-care',
        action: 'external_link_click',
        resourceId: externalLink.url,
        sectionTitle: title,
      });
    }
  }, [externalLink, isGlassboxEnabled, tagAction, title]);

  /**
   * Handle closing the LeavingSiteModal.
   */
  const handleLeavingSiteClose = useCallback(() => {
    setIsLeavingSiteOpen(false);
  }, []);

  /**
   * Get the section icon SVG based on the icon identifier.
   *
   * @param {string} iconName - The icon identifier
   * @returns {JSX.Element} The icon SVG element
   */
  const getSectionIcon = useCallback((iconName) => {
    if (!iconName || typeof iconName !== 'string') {
      return (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    }

    const icons = {
      search: (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      telehealth: (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      wellness: (
        <svg className="w-5 h-5 text-horizon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    };

    return icons[iconName] || icons.wellness;
  }, []);

  /**
   * Get the feature icon SVG based on the feature ID.
   *
   * @param {string} featureId - The feature identifier
   * @returns {JSX.Element} The icon SVG element
   */
  const getFeatureIcon = useCallback((featureId) => {
    if (!featureId || typeof featureId !== 'string') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    const icons = {
      'fc-provider-search': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      'fc-facility-search': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      'fc-cost-estimator': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'fc-quality-ratings': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      'tm-video-visit': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      'tm-phone-visit': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      'tm-messaging': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      'bh-therapy': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      'bh-psychiatry': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      'bh-substance-use': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      'bh-crisis': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    };

    return icons[featureId] || (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }, []);

  /**
   * Get the crisis resource icon SVG based on the resource type.
   *
   * @param {string} type - The resource type (phone, text)
   * @returns {JSX.Element} The icon SVG element
   */
  const getCrisisIcon = useCallback((type) => {
    if (type === 'text') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    );
  }, []);

  const description = content ? content.description : '';
  const guidanceText = content ? content.guidanceText : '';
  const features = content && Array.isArray(content.features) ? content.features : [];
  const crisisResources = content && Array.isArray(content.crisisResources) ? content.crisisResources : [];
  const tips = content && Array.isArray(content.tips) ? content.tips : [];

  return (
    <div className={`${className}`}>
      {/* Section Header */}
      <div className="hb-card mb-6">
        <div className="hb-card-header">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-horizon-primary/10 flex-shrink-0">
              {getSectionIcon(icon)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-horizon-primary mb-0">
                {title}
              </h2>
              {description && (
                <p className="hb-text-body-sm text-horizon-gray-500 mb-0 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="hb-card-body">
          {/* Guidance Text */}
          {guidanceText && (
            <div className="mb-6">
              <p className="hb-text-body text-horizon-gray-700 mb-0">
                {guidanceText}
              </p>
            </div>
          )}

          {/* External Link Button */}
          {externalLink && externalLink.url && (
            <div className="mb-6">
              <div className="bg-horizon-gray-50 rounded-xl border border-horizon-gray-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-horizon-gray-800 mb-1">
                      {externalLink.label || 'Visit External Resource'}
                    </p>
                    {externalLink.description && (
                      <p className="hb-text-caption text-horizon-gray-500 mb-0">
                        {externalLink.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleExternalLinkClick}
                      ariaLabel={externalLink.label || 'Visit external resource'}
                      rightIcon={
                        externalLink.isExternal ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        ) : undefined
                      }
                    >
                      {externalLink.label || 'Visit Resource'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Grid */}
          {features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-horizon-primary mb-4">
                Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-3 p-4 rounded-xl bg-horizon-gray-50 border border-horizon-gray-200"
                  >
                    <div className="flex-shrink-0 text-horizon-secondary mt-0.5">
                      {getFeatureIcon(feature.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-horizon-gray-800 mb-1">
                        {feature.title}
                      </p>
                      <p className="hb-text-caption text-horizon-gray-500 mb-0">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crisis Resources */}
          {crisisResources.length > 0 && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <h3 className="text-base font-bold text-red-800 mb-0">
                    Crisis Resources
                  </h3>
                </div>
                <div className="space-y-3">
                  {crisisResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-100"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getCrisisIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-red-800 mb-0.5">
                          {resource.name}
                        </p>
                        <p className="text-sm font-medium text-red-700 mb-0.5">
                          {resource.type === 'phone' ? (
                            <a
                              href={`tel:${resource.contact.replace(/\D/g, '')}`}
                              className="text-red-700 hover:text-red-900 underline transition-colors duration-200"
                              aria-label={`Call ${resource.name} at ${resource.contact}`}
                            >
                              {resource.contact}
                            </a>
                          ) : (
                            <span>{resource.contact}</span>
                          )}
                        </p>
                        {resource.description && (
                          <p className="hb-text-caption text-red-600 mb-0">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-horizon-primary mb-3">
                Tips
              </h3>
              <div className="space-y-2">
                {tips.map((tip, index) => (
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
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      {faqs.length > 0 && (
        <div className="hb-card mb-6" role="region" aria-label={`${title} frequently asked questions`}>
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-horizon-primary mb-0">
                  Frequently Asked Questions
                </h3>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  {faqs.length} question{faqs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="hb-card-body p-0">
            <div className="divide-y divide-horizon-gray-100">
              {faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;

                return (
                  <div key={faq.id} className="overflow-hidden">
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => handleFaqToggle(faq.id)}
                      onKeyDown={(e) => handleFaqKeyDown(e, faq.id)}
                      className={`
                        w-full flex items-center justify-between gap-3 px-6 py-4 text-left
                        transition-colors duration-150 cursor-pointer
                        ${isExpanded
                          ? 'bg-horizon-primary/5'
                          : 'hover:bg-horizon-gray-50'
                        }
                      `}
                      aria-expanded={isExpanded}
                      aria-controls={`faq-panel-${faq.id}`}
                      id={`faq-header-${faq.id}`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isExpanded ? 'text-horizon-primary' : 'text-horizon-gray-800'
                        }`}
                      >
                        {faq.question}
                      </span>
                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                          isExpanded
                            ? 'rotate-180 text-horizon-primary'
                            : 'text-horizon-gray-400'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Accordion Panel */}
                    {isExpanded && (
                      <div
                        id={`faq-panel-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-header-${faq.id}`}
                        className="px-6 pb-4 hb-animate-fade-in"
                      >
                        <p className="text-sm text-horizon-gray-700 leading-relaxed mb-0">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Leaving Site Modal */}
      {externalLink && externalLink.isExternal && (
        <LeavingSiteModal
          isOpen={isLeavingSiteOpen}
          onClose={handleLeavingSiteClose}
          url={externalLink.url}
          linkLabel={externalLink.label}
        />
      )}
    </div>
  );
};

export default GetCareSection;