import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { ROUTES } from '../utils/constants.js';

/**
 * Mock wellness programs data.
 * Provides health programs and educational materials for the wellness page.
 */
const wellnessPrograms = [
  {
    id: 'wp-001',
    title: 'Healthy Living Rewards Program',
    description: 'Earn rewards for completing healthy activities like annual wellness visits, preventive screenings, and fitness challenges. Track your progress and redeem points for gift cards and discounts.',
    category: 'program',
    categoryLabel: 'Wellness Program',
    icon: 'rewards',
    featured: true,
  },
  {
    id: 'wp-002',
    title: 'Weight Management Support',
    description: 'Access personalized nutrition counseling, meal planning tools, and exercise programs designed to help you achieve and maintain a healthy weight.',
    category: 'program',
    categoryLabel: 'Wellness Program',
    icon: 'fitness',
    featured: true,
  },
  {
    id: 'wp-003',
    title: 'Tobacco Cessation Program',
    description: 'Get free support to quit smoking or using tobacco products. Includes counseling sessions, nicotine replacement therapy, and digital tools to help you stay on track.',
    category: 'program',
    categoryLabel: 'Wellness Program',
    icon: 'health',
    featured: true,
  },
  {
    id: 'wp-004',
    title: 'Diabetes Prevention Program',
    description: 'A CDC-recognized lifestyle change program for members at risk of developing type 2 diabetes. Includes coaching, group support, and educational resources.',
    category: 'program',
    categoryLabel: 'Wellness Program',
    icon: 'prevention',
    featured: false,
  },
  {
    id: 'wp-005',
    title: 'Stress Management & Mindfulness',
    description: 'Learn evidence-based techniques for managing stress, improving sleep, and building resilience. Includes guided meditation, breathing exercises, and cognitive behavioral strategies.',
    category: 'program',
    categoryLabel: 'Wellness Program',
    icon: 'mindfulness',
    featured: false,
  },
];

/**
 * Mock preventive care reminders data.
 */
const preventiveCareItems = [
  {
    id: 'pc-001',
    title: 'Annual Wellness Visit',
    description: 'Schedule your annual preventive care visit with your primary care physician. Covered at 100% with no member cost share.',
    frequency: 'Every 12 months',
    covered: true,
  },
  {
    id: 'pc-002',
    title: 'Flu Vaccination',
    description: 'Get your annual influenza vaccine to protect yourself and your family during flu season.',
    frequency: 'Annually (fall season)',
    covered: true,
  },
  {
    id: 'pc-003',
    title: 'Cholesterol Screening',
    description: 'A lipid panel blood test to check your cholesterol levels and assess cardiovascular risk.',
    frequency: 'Every 4-6 years (adults)',
    covered: true,
  },
  {
    id: 'pc-004',
    title: 'Blood Pressure Screening',
    description: 'Regular blood pressure checks to detect hypertension early and prevent complications.',
    frequency: 'At every doctor visit',
    covered: true,
  },
  {
    id: 'pc-005',
    title: 'Colorectal Cancer Screening',
    description: 'Recommended for adults age 45 and older. Multiple screening options available including colonoscopy and stool-based tests.',
    frequency: 'Starting at age 45',
    covered: true,
  },
  {
    id: 'pc-006',
    title: 'Mammogram',
    description: 'Breast cancer screening recommended for women age 40 and older. Talk to your doctor about when to start.',
    frequency: 'Every 1-2 years (age 40+)',
    covered: true,
  },
];

/**
 * Mock health resources data.
 */
const healthResources = [
  {
    id: 'hr-001',
    title: 'Understanding Your Health Plan',
    description: 'A comprehensive guide to your Horizon health plan benefits, including how to use your coverage, find providers, and manage costs.',
    category: 'education',
    categoryLabel: 'Education',
    readTime: '8 min read',
  },
  {
    id: 'hr-002',
    title: 'Nutrition & Healthy Eating Guide',
    description: 'Evidence-based nutrition tips, meal planning ideas, and dietary guidelines to support your overall health and wellness goals.',
    category: 'nutrition',
    categoryLabel: 'Nutrition',
    readTime: '6 min read',
  },
  {
    id: 'hr-003',
    title: 'Exercise & Physical Activity',
    description: 'Recommended physical activity guidelines, workout ideas for all fitness levels, and tips for staying active throughout the day.',
    category: 'fitness',
    categoryLabel: 'Fitness',
    readTime: '5 min read',
  },
  {
    id: 'hr-004',
    title: 'Mental Health & Well-Being',
    description: 'Resources for managing stress, anxiety, and depression. Learn about your behavioral health benefits and how to access support.',
    category: 'mental_health',
    categoryLabel: 'Mental Health',
    readTime: '7 min read',
  },
  {
    id: 'hr-005',
    title: 'Sleep Health Tips',
    description: 'Improve your sleep quality with evidence-based strategies for better sleep hygiene, managing insomnia, and understanding sleep disorders.',
    category: 'wellness',
    categoryLabel: 'Wellness',
    readTime: '4 min read',
  },
  {
    id: 'hr-006',
    title: 'Managing Chronic Conditions',
    description: 'Guidance for living well with chronic conditions like diabetes, heart disease, and asthma. Includes self-management tips and support resources.',
    category: 'chronic_care',
    categoryLabel: 'Chronic Care',
    readTime: '9 min read',
  },
];

/**
 * WellnessPage - Wellness page with programs, preventive care, and resources
 * Implements the Wellness page placeholder from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Displays page heading and content placeholder with wellness resources and tips
 * (mock content). Includes links to health programs and educational materials.
 * Logs page view via useAuditLog and tags via useGlassbox on mount.
 *
 * @returns {JSX.Element}
 */
const WellnessPage = () => {
  const { currentUser } = useAuth();
  const { tagPage, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Log wellness page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/wellness', {
        action: 'wellness_page_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/wellness', {
          action: 'wellness_page_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /**
   * Handle clicking on a wellness program card.
   *
   * @param {object} program - The wellness program object
   */
  const handleProgramClick = useCallback((program) => {
    if (!program || !program.id) {
      return;
    }

    if (isGlassboxEnabled) {
      tagAction('wellness_program_click', {
        route: '/wellness',
        action: 'program_click',
        resourceId: program.id,
        programTitle: program.title,
      });
    }

    navigate('/wellness/programs');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle keyboard events on program cards for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} program - The wellness program object
   */
  const handleProgramKeyDown = useCallback((e, program) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleProgramClick(program);
    }
  }, [handleProgramClick]);

  /**
   * Handle clicking on a health resource card.
   *
   * @param {object} resource - The health resource object
   */
  const handleResourceClick = useCallback((resource) => {
    if (!resource || !resource.id) {
      return;
    }

    if (isGlassboxEnabled) {
      tagAction('wellness_resource_click', {
        route: '/wellness',
        action: 'resource_click',
        resourceId: resource.id,
        resourceTitle: resource.title,
      });
    }

    navigate('/wellness/resources');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle keyboard events on resource cards for accessibility.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   * @param {object} resource - The health resource object
   */
  const handleResourceKeyDown = useCallback((e, resource) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleResourceClick(resource);
    }
  }, [handleResourceClick]);

  /**
   * Handle navigation to preventive care page.
   */
  const handleViewPreventiveCare = useCallback(() => {
    if (isGlassboxEnabled) {
      tagAction('wellness_preventive_care_click', {
        route: '/wellness',
        action: 'view_preventive_care',
      });
    }

    navigate('/wellness/preventive-care');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle navigation to wellness programs page.
   */
  const handleViewAllPrograms = useCallback(() => {
    if (isGlassboxEnabled) {
      tagAction('wellness_view_all_programs', {
        route: '/wellness',
        action: 'view_all_programs',
      });
    }

    navigate('/wellness/programs');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle navigation to health resources page.
   */
  const handleViewAllResources = useCallback(() => {
    if (isGlassboxEnabled) {
      tagAction('wellness_view_all_resources', {
        route: '/wellness',
        action: 'view_all_resources',
      });
    }

    navigate('/wellness/resources');
  }, [navigate, isGlassboxEnabled, tagAction]);

  /**
   * Handle navigation to find care page.
   */
  const handleFindCare = useCallback(() => {
    navigate(ROUTES.FIND_CARE);
  }, [navigate]);

  /**
   * Get the icon SVG for a wellness program based on its icon identifier.
   *
   * @param {string} iconName - The icon identifier
   * @returns {JSX.Element} The icon SVG element
   */
  const getProgramIcon = useCallback((iconName) => {
    if (!iconName || typeof iconName !== 'string') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    }

    const icons = {
      rewards: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      fitness: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      health: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      prevention: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      mindfulness: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    };

    return icons[iconName] || icons.health;
  }, []);

  /**
   * Get the badge variant for a resource category.
   *
   * @param {string} category - The resource category
   * @returns {string} The badge variant
   */
  const getResourceCategoryVariant = useCallback((category) => {
    if (!category || typeof category !== 'string') {
      return 'neutral';
    }

    const variantMap = {
      education: 'primary',
      nutrition: 'success',
      fitness: 'secondary',
      mental_health: 'info',
      wellness: 'warning',
      chronic_care: 'error',
    };

    return variantMap[category] || 'neutral';
  }, []);

  const featuredPrograms = wellnessPrograms.filter((p) => p.featured);

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
              Wellness
            </h1>
            <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
              Explore wellness programs, preventive care reminders, and health resources to support your well-being.
            </p>
          </div>
        </div>
      </div>

      {/* Wellness Banner */}
      <div className="bg-gradient-to-r from-horizon-secondary to-horizon-secondary-light rounded-xl p-6 sm:p-8 text-white shadow-horizon-md mb-6">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-0">
                Your Health, Your Way
              </h2>
            </div>
            <p className="text-sm text-white/80 mb-4 max-w-xl">
              Take charge of your health with Horizon&apos;s wellness programs and resources. From preventive care to
              fitness programs, we&apos;re here to support your journey to better health.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleViewAllPrograms}
                ariaLabel="Explore wellness programs"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              >
                Explore Programs
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleFindCare}
                ariaLabel="Find a provider"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              >
                Find a Provider
              </Button>
            </div>
          </div>

          {/* Decorative Icon */}
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-white/10 flex-shrink-0">
            <svg
              className="w-8 h-8 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Wellness Programs Section */}
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-horizon-primary mb-0">
                  Wellness Programs
                </h2>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  {wellnessPrograms.length} programs available
                </p>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={handleViewAllPrograms}
              ariaLabel="View all wellness programs"
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
        <div className="hb-card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPrograms.map((program) => (
              <div
                key={program.id}
                className="flex flex-col p-4 rounded-xl bg-horizon-gray-50 border border-horizon-gray-200 hover:shadow-horizon-md transition-shadow duration-200 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleProgramClick(program)}
                onKeyDown={(e) => handleProgramKeyDown(e, program)}
                aria-label={program.title}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-horizon-secondary/10 text-horizon-secondary">
                    {getProgramIcon(program.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-horizon-gray-800 mb-1">
                      {program.title}
                    </p>
                    <Badge
                      label={program.categoryLabel}
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                </div>
                <p className="hb-text-caption text-horizon-gray-500 mb-0 hb-text-clamp-3 flex-1">
                  {program.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preventive Care Section */}
      <div className="hb-card mb-6" role="region" aria-label="Preventive Care Reminders">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-horizon-primary mb-0">
                  Preventive Care
                </h2>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  Covered at 100% — no member cost share
                </p>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={handleViewPreventiveCare}
              ariaLabel="View all preventive care details"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              View Details
            </Button>
          </div>
        </div>
        <div className="hb-card-body p-0">
          <div className="hb-table-wrapper border-0 rounded-none">
            <table
              className="hb-table hb-table-striped hb-table-hover"
              role="table"
              aria-label="Preventive care services"
            >
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Description</th>
                  <th scope="col">Frequency</th>
                  <th scope="col">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {preventiveCareItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="text-sm font-medium text-horizon-gray-800">
                        {item.title}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-horizon-gray-600 max-w-[300px] block">
                        {item.description}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-horizon-gray-600 whitespace-nowrap">
                        {item.frequency}
                      </span>
                    </td>
                    <td>
                      {item.covered ? (
                        <Badge
                          label="Covered at 100%"
                          variant="success"
                          size="sm"
                          dot
                        />
                      ) : (
                        <Badge
                          label="Subject to cost share"
                          variant="neutral"
                          size="sm"
                        />
                      )}
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
            <p className="hb-text-caption text-horizon-gray-500 mb-0">
              All preventive care services listed above are covered at 100% with no member cost share when received from an in-network provider.
            </p>
          </div>
        </div>
      </div>

      {/* Health Resources Section */}
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-horizon-primary mb-0">
                  Health Resources
                </h2>
                <p className="hb-text-caption text-horizon-gray-500 mb-0">
                  Educational materials and health tips
                </p>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={handleViewAllResources}
              ariaLabel="View all health resources"
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
          <div className="divide-y divide-horizon-gray-100">
            {healthResources.map((resource) => (
              <div
                key={resource.id}
                className="px-6 py-4 hover:bg-horizon-gray-50 transition-colors duration-150 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleResourceClick(resource)}
                onKeyDown={(e) => handleResourceKeyDown(e, resource)}
                aria-label={`${resource.title} - ${resource.readTime}`}
              >
                <div className="flex items-start gap-3">
                  {/* Content icon */}
                  <div className="flex-shrink-0 mt-0.5 text-horizon-secondary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-horizon-gray-800 mb-1 hb-text-clamp-2">
                      {resource.title}
                    </p>
                    <p className="hb-text-caption text-horizon-gray-500 mb-2 hb-text-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        label={resource.categoryLabel}
                        variant={getResourceCategoryVariant(resource.category)}
                        size="sm"
                      />
                      <span className="hb-text-caption text-horizon-gray-400">
                        {resource.readTime}
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
        </div>
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
                {healthResources.length} resources available
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewAllResources}
              className="hb-text-caption text-horizon-blue hover:text-horizon-primary transition-colors duration-200 cursor-pointer font-medium"
              aria-label="Browse all health resources"
            >
              Browse resources →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hb-card mb-6">
        <div className="hb-card-body">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleViewPreventiveCare}
              ariaLabel="View preventive care schedule"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Preventive Care Schedule
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleFindCare}
              ariaLabel="Find a provider"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            >
              Find a Provider
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(ROUTES.BENEFITS)}
              ariaLabel="View your benefits"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            >
              View Benefits
            </Button>
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
            Wellness programs and resources are provided for informational purposes and are not a substitute for professional medical advice.
            Always consult your healthcare provider before starting any new health program. For questions about your wellness benefits,
            contact Member Services at 1-800-355-2583.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WellnessPage;