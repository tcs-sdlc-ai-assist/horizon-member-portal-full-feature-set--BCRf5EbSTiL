import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * GreetingBanner - Personalized dashboard greeting banner component
 * Implements the dashboard greeting from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7168
 *
 * Displays a personalized greeting based on the current time of day and the
 * user's display name from AuthContext. Shows 'Good morning', 'Good afternoon',
 * or 'Good evening' along with a contextual subtitle message. Uses HB typography
 * and color classes for consistent Horizon branding.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes for the banner wrapper
 * @returns {JSX.Element}
 */
const GreetingBanner = ({ className = '' }) => {
  const { currentUser } = useAuth();

  /**
   * Determine the greeting text and icon based on the current time of day.
   *
   * @returns {{ greeting: string, subtitle: string, iconPath: string }} Greeting data
   */
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good morning',
        subtitle: 'Here\'s an overview of your health plan for today.',
        iconPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      };
    }

    if (hour >= 12 && hour < 18) {
      return {
        greeting: 'Good afternoon',
        subtitle: 'Stay on top of your health plan and benefits.',
        iconPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      };
    }

    return {
      greeting: 'Good evening',
      subtitle: 'Review your health plan details at your convenience.',
      iconPath: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    };
  }, []);

  /**
   * Get the user's first name from the display name for a more personal greeting.
   *
   * @returns {string} The user's first name or 'Member' as fallback
   */
  const firstName = useMemo(() => {
    if (!currentUser || !currentUser.displayName) {
      return 'Member';
    }

    const parts = currentUser.displayName.trim().split(/\s+/);

    if (parts.length > 0 && parts[0].length > 0) {
      return parts[0];
    }

    return 'Member';
  }, [currentUser]);

  /**
   * Get the current formatted date string for display.
   *
   * @returns {string} Formatted date (e.g., "Monday, January 15, 2024")
   */
  const formattedDate = useMemo(() => {
    const now = new Date();

    const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ];

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const dayName = dayNames[now.getDay()];
    const monthName = monthNames[now.getMonth()];
    const dayOfMonth = now.getDate();
    const year = now.getFullYear();

    return `${dayName}, ${monthName} ${dayOfMonth}, ${year}`;
  }, []);

  return (
    <div
      className={`bg-gradient-to-r from-horizon-primary to-horizon-primary-light rounded-xl p-6 sm:p-8 text-white shadow-horizon-md ${className}`}
      role="region"
      aria-label="Dashboard greeting"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Greeting Content */}
        <div className="flex-1 min-w-0">
          <div className="hb-inline-sm mb-2">
            <svg
              className="w-6 h-6 text-horizon-accent flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={greetingData.iconPath}
              />
            </svg>
            <p className="hb-text-caption text-horizon-accent mb-0">
              {formattedDate}
            </p>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
            {greetingData.greeting}, {firstName}
          </h1>

          <p className="text-sm md:text-base text-white/80 mb-0 max-w-xl">
            {greetingData.subtitle}
          </p>
        </div>

        {/* Decorative Icon */}
        <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-white/10 flex-shrink-0">
          <svg
            className="w-8 h-8 text-white/80"
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

      {/* Member ID Display */}
      {currentUser && currentUser.memberId && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="hb-text-caption text-white/60 mb-0">
            Member ID:{' '}
            <span className="text-white/80 font-medium" data-phi="member-id">
              {currentUser.memberId}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default GreetingBanner;