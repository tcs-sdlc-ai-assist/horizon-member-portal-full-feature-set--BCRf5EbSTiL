import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGlassbox from '../hooks/useGlassbox.js';
import useAuditLog from '../hooks/useAuditLog.js';
import Alert from '../components/common/Alert.jsx';

/**
 * SettingsPage - Settings placeholder page (MVP non-functional)
 * Implements the Settings page placeholder from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Displays 'Settings' heading and message: 'Available in a future release.'
 * Uses HB alert-system styling for the placeholder message. Accessible from
 * user menu. Logs page view via useAuditLog and tags via useGlassbox on mount.
 *
 * @returns {JSX.Element}
 */
const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { tagPage, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logPage } = useAuditLog();

  /**
   * Log settings page view on mount.
   */
  useMemo(() => {
    if (currentUser) {
      logPage('/settings', {
        action: 'settings_page_view',
      });

      if (isGlassboxEnabled) {
        tagPage('/settings', {
          action: 'settings_page_view',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-horizon-primary mb-0">
              Settings
            </h1>
            <p className="hb-text-body-sm text-horizon-gray-500 mb-0">
              Manage your account preferences and notification settings.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Alert */}
      <Alert
        type="system"
        title="Coming Soon"
        message="Available in a future release."
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        }
      />

      {/* Placeholder Settings Sections */}
      <div className="mt-6 space-y-6">
        {/* Account Preferences */}
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
              <h2 className="text-base font-bold text-horizon-primary mb-0">
                Account Preferences
              </h2>
            </div>
          </div>
          <div className="hb-card-body">
            <div className="hb-flex-center flex-col gap-3 py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-horizon-gray-100">
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
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <p className="hb-text-body-sm text-horizon-gray-500 mb-0 text-center max-w-md">
                Account preference settings including language, theme, and display options will be available in a future release.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-horizon-primary mb-0">
                Notification Preferences
              </h2>
            </div>
          </div>
          <div className="hb-card-body">
            <div className="hb-flex-center flex-col gap-3 py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-horizon-gray-100">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="hb-text-body-sm text-horizon-gray-500 mb-0 text-center max-w-md">
                Manage your email, SMS, and in-app notification preferences for claims, documents, and coverage updates in a future release.
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-horizon-primary mb-0">
                Security Settings
              </h2>
            </div>
          </div>
          <div className="hb-card-body">
            <div className="hb-flex-center flex-col gap-3 py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-horizon-gray-100">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <p className="hb-text-body-sm text-horizon-gray-500 mb-0 text-center max-w-md">
                Password management, two-factor authentication, and security preferences will be available in a future release.
              </p>
            </div>
          </div>
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
            Settings functionality is coming soon. For account changes or assistance, please contact Member Services at 1-800-355-2583.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;