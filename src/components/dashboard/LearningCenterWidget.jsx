import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlassbox from '../../hooks/useGlassbox.js';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Badge from '../common/Badge.jsx';
import { ROUTES } from '../../utils/constants.js';

/**
 * Mock learning center content data.
 * Provides health tips, articles, and educational resources for the widget.
 */
const learningCenterContent = [
  {
    id: 'lc-001',
    title: 'Understanding Your Explanation of Benefits (EOB)',
    description: 'Learn how to read your EOB statement, understand what your plan paid, and know what you owe for each healthcare service.',
    category: 'plan_education',
    categoryLabel: 'Plan Education',
    readTime: '5 min read',
    icon: 'document',
    path: '/wellness/resources',
    featured: true,
  },
  {
    id: 'lc-002',
    title: 'Preventive Care: What\'s Covered at No Cost',
    description: 'Discover which preventive screenings, vaccinations, and wellness visits are covered at 100% under your Horizon plan with no out-of-pocket cost.',
    category: 'wellness',
    categoryLabel: 'Wellness',
    readTime: '4 min read',
    icon: 'preventive',
    path: '/wellness/preventive-care',
    featured: true,
  },
  {
    id: 'lc-003',
    title: 'How to Save on Prescription Medications',
    description: 'Tips for reducing your prescription costs, including using generics, mail-order pharmacy, and checking the drug formulary before filling.',
    category: 'cost_savings',
    categoryLabel: 'Cost Savings',
    readTime: '3 min read',
    icon: 'pharmacy',
    path: '/prescriptions/formulary',
    featured: true,
  },
  {
    id: 'lc-004',
    title: 'Telehealth: When and How to Use Virtual Visits',
    description: 'Learn when telehealth is the right choice, how to start a virtual visit, and what conditions can be treated online.',
    category: 'get_care',
    categoryLabel: 'Get Care',
    readTime: '4 min read',
    icon: 'telehealth',
    path: '/find-care/telehealth',
    featured: false,
  },
  {
    id: 'lc-005',
    title: 'Managing Stress and Mental Health',
    description: 'Explore resources and strategies for managing stress, anxiety, and depression. Your plan includes behavioral health coverage at no extra cost.',
    category: 'wellness',
    categoryLabel: 'Wellness',
    readTime: '6 min read',
    icon: 'wellness',
    path: '/wellness/resources',
    featured: false,
  },
];

/**
 * LearningCenterWidget - Dashboard learning center content widget component
 * Implements the learning center widget from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Displays 2-3 content cards with health tips, articles, and educational resources.
 * Each card shows a title, brief description, category badge, read time, and a
 * 'Read More' link. Content is sourced from mock data. Uses HB card styling with
 * proper accessibility. Tags Glassbox widget interactions.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the widget wrapper
 * @param {number} [props.maxDisplay=3] - Maximum number of content cards to display
 * @returns {JSX.Element}
 */
const LearningCenterWidget = ({ className = '', maxDisplay = 3 }) => {
  const navigate = useNavigate();
  const { tagWidget, isEnabled: isGlassboxEnabled } = useGlassbox();

  const MAX_ITEMS = Math.max(1, Math.min(maxDisplay, learningCenterContent.length));

  /**
   * Get the content items to display, prioritizing featured items.
   */
  const displayContent = useMemo(() => {
    const sorted = [...learningCenterContent].sort((a, b) => {
      if (a.featured && !b.featured) {
        return -1;
      }
      if (!a.featured && b.featured) {
        return 1;
      }
      return 0;
    });

    return sorted.slice(0, MAX_ITEMS);
  }, [MAX_ITEMS]);

  /**
   * Handle clicking on a content card to navigate to the resource.
   *
   * @param {object} item - The learning center content item
   */
  const handleReadMore = useCallback((item) => {
    if (!item || !item.path) {
      return;
    }

    if (isGlassboxEnabled) {
      tagWidget('learning_center', {
        action: 'read_more_click',
        route: '/dashboard',
        resourceId: item.id,
        category: item.category,
      });
    }

    navigate(item.path);
  }, [navigate, isGlassboxEnabled, tagWidget]);

  /**
   * Handle keyboard events on content cards for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} item - The learning center content item
   */
  const handleCardKeyDown = useCallback((e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleReadMore(item);
    }
  }, [handleReadMore]);

  /**
   * Handle navigation to the full wellness resources page.
   */
  const handleViewAll = useCallback(() => {
    if (isGlassboxEnabled) {
      tagWidget('learning_center', {
        action: 'view_all_click',
        route: '/dashboard',
      });
    }

    navigate('/wellness/resources');
  }, [navigate, isGlassboxEnabled, tagWidget]);

  /**
   * Get the icon SVG for a content item based on its icon identifier.
   *
   * @param {string} iconName - The icon identifier
   * @returns {JSX.Element} The icon SVG element
   */
  const getContentIcon = useCallback((iconName) => {
    if (!iconName || typeof iconName !== 'string') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }

    const icons = {
      document: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preventive: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      pharmacy: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      telehealth: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      wellness: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    };

    return icons[iconName] || icons.document;
  }, []);

  /**
   * Get the badge variant for a content category.
   *
   * @param {string} category - The content category
   * @returns {string} The badge variant
   */
  const getCategoryVariant = useCallback((category) => {
    if (!category || typeof category !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      plan_education: 'primary',
      wellness: 'success',
      cost_savings: 'info',
      get_care: 'secondary',
    };

    return variantMap[category] || 'neutral';
  }, []);

  return (
    <div
      className={`hb-card ${className}`}
      role="region"
      aria-label="Learning Center"
    >
      {/* Card Header */}
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-horizon-primary mb-0">
              Learning Center
            </h3>
          </div>
          {displayContent.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleViewAll}
              ariaLabel="View all learning center resources"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              View All
            </Button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="hb-card-body p-0">
        {displayContent.length > 0 ? (
          <div className="divide-y divide-horizon-gray-100">
            {displayContent.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 hover:bg-horizon-gray-50 transition-colors duration-150 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleReadMore(item)}
                onKeyDown={(e) => handleCardKeyDown(e, item)}
                aria-label={`${item.title} - ${item.readTime}`}
              >
                <div className="flex items-start gap-3">
                  {/* Content icon */}
                  <div className="flex-shrink-0 mt-0.5 text-horizon-secondary">
                    {getContentIcon(item.icon)}
                  </div>

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <p className="text-sm font-medium text-horizon-gray-800 mb-1 hb-text-clamp-2">
                      {item.title}
                    </p>

                    {/* Description */}
                    <p className="hb-text-caption text-horizon-gray-500 mb-2 hb-text-clamp-2">
                      {item.description}
                    </p>

                    {/* Category badge and read time */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        label={item.categoryLabel}
                        variant={getCategoryVariant(item.category)}
                        size="sm"
                      />
                      <span className="hb-text-caption text-horizon-gray-400">
                        {item.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
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
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            size="sm"
            title="No resources available"
            message="Health tips and educational resources will appear here."
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* Card Footer */}
      {displayContent.length > 0 && (
        <div className="hb-card-footer">
          <div className="flex items-center justify-between">
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
                Stay informed about your health plan and wellness.
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewAll}
              className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium"
              aria-label="Browse all health resources"
            >
              Browse resources →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningCenterWidget;