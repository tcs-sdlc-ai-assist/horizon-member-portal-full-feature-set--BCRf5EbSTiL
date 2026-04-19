import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import GetCareSection from '../components/getcare/GetCareSection.jsx';
import getCareContent from '../data/getCareContent.json';

/**
 * GetCarePage - Get Care page with sections and external links
 * Implements the Get Care page from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders three GetCareSection components for Find Care & Cost (with external
 * link to National Doctor & Hospital Finder), Telemedicine (guidance + FAQs),
 * and Behavioral Health (guidance + FAQs). Content loaded from getCareContent.json.
 * Logs page view via useAuditLog and tags via useGlassbox on mount.
 *
 * @returns {JSX.Element}
 */
const GetCarePage = () => {
  const { currentUser } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();

  /**
   * Log Get Care page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/find-care', {
        action: 'get_care_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/find-care', {
          action: 'get_care_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /**
   * Get the sections from getCareContent.json.
   */
  const sections = getCareContent.sections || [];

  /**
   * Find a specific section by its ID.
   *
   * @param {string} sectionId - The section ID to look up
   * @returns {object|null} The section object, or null if not found
   */
  const getSection = (sectionId) => {
    return sections.find((s) => s.id === sectionId) || null;
  };

  const findCareSection = getSection('find-care-cost');
  const telemedicineSection = getSection('telemedicine');
  const behavioralHealthSection = getSection('behavioral-health');

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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-horizon-primary mb-0">
              {getCareContent.pageTitle || 'Get Care'}
            </h1>
            <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
              {getCareContent.pageDescription || 'Find the care you need — from in-network providers and telehealth visits to behavioral health support.'}
            </p>
          </div>
        </div>
      </div>

      {/* Find Care & Cost Section */}
      {findCareSection && (
        <GetCareSection
          title={findCareSection.title}
          content={{
            description: findCareSection.description,
            guidanceText: findCareSection.guidanceText || null,
            features: findCareSection.features || [],
            crisisResources: findCareSection.crisisResources || [],
            tips: findCareSection.tips || [],
          }}
          faqs={findCareSection.faqs || []}
          externalLink={findCareSection.externalLink || null}
          icon={findCareSection.icon || 'search'}
          className="mb-6"
        />
      )}

      {/* Telemedicine Section */}
      {telemedicineSection && (
        <GetCareSection
          title={telemedicineSection.title}
          content={{
            description: telemedicineSection.description,
            guidanceText: telemedicineSection.guidanceText || null,
            features: telemedicineSection.features || [],
            crisisResources: telemedicineSection.crisisResources || [],
            tips: telemedicineSection.tips || [],
          }}
          faqs={telemedicineSection.faqs || []}
          externalLink={telemedicineSection.externalLink || null}
          icon={telemedicineSection.icon || 'telehealth'}
          className="mb-6"
        />
      )}

      {/* Behavioral Health Section */}
      {behavioralHealthSection && (
        <GetCareSection
          title={behavioralHealthSection.title}
          content={{
            description: behavioralHealthSection.description,
            guidanceText: behavioralHealthSection.guidanceText || null,
            features: behavioralHealthSection.features || [],
            crisisResources: behavioralHealthSection.crisisResources || [],
            tips: behavioralHealthSection.tips || [],
          }}
          faqs={behavioralHealthSection.faqs || []}
          externalLink={behavioralHealthSection.externalLink || null}
          icon={behavioralHealthSection.icon || 'wellness'}
          className="mb-6"
        />
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
            Always verify that your provider is in-network before scheduling an appointment. If you need help finding care,
            contact Member Services at 1-800-355-2583. In case of a medical emergency, call 911 or go to the nearest emergency room.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetCarePage;