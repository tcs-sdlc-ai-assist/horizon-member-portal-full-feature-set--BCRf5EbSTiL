import { APP } from '../../utils/constants.js';

/**
 * Footer - Application footer component
 * Implements the global footer from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders Horizon BCBSNJ branding, copyright notice, accessibility statement
 * link, and legal links. Uses HB styling classes. Responsive layout with
 * proper ARIA landmark role.
 *
 * @returns {JSX.Element}
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t border-horizon-gray-200 mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="hb-container-fluid py-6">
        {/* Top section: Logo and links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          {/* Horizon Branding */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-horizon-primary flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
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
            <span className="text-sm font-bold text-horizon-primary">
              {APP.NAME}
            </span>
          </div>

          {/* Footer Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-4 md:gap-6 list-none p-0 m-0">
              <li>
                <a
                  href="https://www.horizonblue.com/accessibility"
                  className="hb-text-body-sm text-horizon-gray-500 hover:text-horizon-primary transition-colors duration-200 no-underline hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Accessibility Statement (opens in new tab)"
                >
                  Accessibility
                </a>
              </li>
              <li>
                <a
                  href="https://www.horizonblue.com/privacy"
                  className="hb-text-body-sm text-horizon-gray-500 hover:text-horizon-primary transition-colors duration-200 no-underline hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Privacy Policy (opens in new tab)"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://www.horizonblue.com/terms"
                  className="hb-text-body-sm text-horizon-gray-500 hover:text-horizon-primary transition-colors duration-200 no-underline hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Terms of Use (opens in new tab)"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="https://www.horizonblue.com/nondiscrimination"
                  className="hb-text-body-sm text-horizon-gray-500 hover:text-horizon-primary transition-colors duration-200 no-underline hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Non-Discrimination Notice (opens in new tab)"
                >
                  Non-Discrimination Notice
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="hb-divider" />

        {/* Bottom section: Copyright and address */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-4">
          <p className="hb-text-caption text-horizon-gray-400 mb-0 text-center md:text-left">
            &copy; {currentYear} Horizon Blue Cross Blue Shield of New Jersey. All rights reserved.
          </p>
          <p className="hb-text-caption text-horizon-gray-400 mb-0 text-center md:text-right">
            Three Penn Plaza East, Newark, NJ 07105
          </p>
        </div>

        {/* Accessibility commitment statement */}
        <div className="mt-3 text-center">
          <p className="hb-text-caption text-horizon-gray-400 mb-0">
            Horizon BCBSNJ is committed to making our website accessible to all users, including those with disabilities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;