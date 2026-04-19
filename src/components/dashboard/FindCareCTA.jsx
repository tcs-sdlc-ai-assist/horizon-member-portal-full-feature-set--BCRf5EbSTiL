import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlassbox from '../../hooks/useGlassbox.js';
import { ROUTES } from '../../utils/constants.js';
import getCareContent from '../../data/getCareContent.json';

/**
 * FindCareCTA - Dashboard Find Care call-to-action widget component
 * Implements the Find Care CTA widget from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Displays a prominent card with 'Find Care & Cost' heading, brief description
 * from getCareContent data, and action button that navigates to the Get Care page.
 * Uses HB card and button styling. Tags Glassbox widget interaction on click.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the widget wrapper
 * @returns {JSX.Element}
 */
const FindCareCTA = ({ className = '' }) => {
  const navigate = useNavigate();
  const { tagWidget, isEnabled: isGlassboxEnabled } = useGlassbox();

  /**
   * Get the Find Care & Cost section data from getCareContent.
   */
  const findCareSection = (getCareContent.sections || []).find(
    (section) => section.id === 'find-care-cost'
  );

  const title = findCareSection ? findCareSection.title : 'Find Care & Cost';
  const description = findCareSection
    ? findCareSection.description
    : 'Search for in-network doctors, specialists, hospitals, and other healthcare providers. Compare costs and quality ratings to make informed decisions about your care.';

  /**
   * Get the search categories from the find care section features.
   */
  const features = findCareSection && Array.isArray(findCareSection.features)
    ? findCareSection.features.slice(0, 3)
    : [];

  /**
   * Handle navigation to the Get Care page.
   */
  const handleFindCare = useCallback(() => {
    if (isGlassboxEnabled) {
      tagWidget('find_care', {
        action: 'cta_click',
        route: '/dashboard',
      });
    }

    navigate(ROUTES.FIND_CARE);
  }, [navigate, isGlassboxEnabled, tagWidget]);

  /**
   * Get the icon SVG for a feature based on its ID.
   *
   * @param {string} featureId - The feature identifier
   * @returns {JSX.Element} The icon SVG element
   */
  const getFeatureIcon = useCallback((featureId) => {
    if (!featureId || typeof featureId !== 'string') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
    };

    return icons[featureId] || icons['fc-provider-search'];
  }, []);

  return (
    <div
      className={`hb-card overflow-hidden ${className}`}
      role="region"
      aria-label="Find Care & Cost"
    >
      {/* Card Header with gradient accent */}
      <div className="bg-gradient-to-r from-horizon-secondary to-horizon-secondary-light p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="hb-inline-sm mb-2">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-0">
                {title}
              </h3>
            </div>
            <p className="text-sm text-white/80 mb-0 max-w-lg hb-text-clamp-2">
              {description}
            </p>
          </div>

          {/* Decorative Icon */}
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 flex-shrink-0">
            <svg
              className="w-6 h-6 text-white/70"
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
        </div>
      </div>

      {/* Card Body with features */}
      <div className="hb-card-body">
        {features.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-horizon-gray-50"
              >
                <div className="flex-shrink-0 text-horizon-secondary mt-0.5">
                  {getFeatureIcon(feature.id)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-horizon-gray-700 mb-0.5">
                    {feature.title}
                  </p>
                  <p className="hb-text-caption text-horizon-gray-500 mb-0 hb-text-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleFindCare}
          className="hb-btn-primary hb-btn-block"
          aria-label="Find a doctor or provider"
        >
          <span className="hb-inline-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Find a Doctor or Provider</span>
          </span>
        </button>
      </div>

      {/* Card Footer with tips */}
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
            Always verify your provider is in-network before scheduling to avoid higher out-of-pocket costs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FindCareCTA;