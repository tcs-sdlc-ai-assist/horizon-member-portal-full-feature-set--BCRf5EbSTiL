# Changelog

All notable changes to the Horizon Member Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-25

### Added

#### Authentication & Session Management (SCRUM-7164, SCRUM-7167)
- Secure login form with username/password authentication and form validation
- Session timeout tracking with configurable inactivity threshold (default 15 minutes)
- Session timeout warning modal with countdown timer and "Stay Logged In" / "Log Out" actions
- Session extension via user activity detection (mouse, keyboard, touch events)
- Protected route guard with role-based access control for admin routes
- Automatic redirect to login page on session expiration with return-to-intended-destination support
- In-memory session store with token-based session management
- User store with mock credential validation against `users.json` data

#### Global Navigation & Layout (SCRUM-7169)
- Responsive application layout with sticky header, collapsible sidebar, and main content area
- Left sidebar navigation with expandable/collapsible menu items loaded from `navigation.json`
- Active route highlighting and auto-expansion of parent items with active children
- Mobile-responsive sidebar with hamburger toggle, overlay backdrop, and focus trap
- Global search bar with debounced input, portal-wide content search, and keyboard-navigable results dropdown
- Notification bell icon with unread count badge and dropdown preview of recent notifications
- User profile dropdown menu with navigation to Dashboard, Profile, Settings, and Sign Out
- Support quick-action dropdown with Email, Chat, and Call channels from `supportConfig.json`
- Skip-to-main-content accessibility link
- Application footer with Horizon BCBSNJ branding, legal links, and accessibility statement
- Top-level React error boundary with user-friendly fallback UI and reload action

#### Personalized Dashboard (SCRUM-7168)
- Personalized greeting banner with time-of-day message, member name, date, and member ID
- Find Care & Cost call-to-action widget with feature highlights and provider search button
- Recent Claims widget displaying the 3 most recent claims with status badges and amounts
- ID Card Summary widget with coverage type tabs, masked member ID, key copays, and quick view action
- Deductible & Out-of-Pocket progress widget with individual/family progress bars and coverage selector
- Learning Center widget with health tips, educational articles, and category badges
- Widget customization panel for showing/hiding and reordering dashboard widgets via checkboxes and arrow buttons
- Widget preferences persistence to localStorage keyed by user ID
- Responsive grid layout with full-width and half-width widget grouping

#### Get Care Page (SCRUM-7169)
- Find Care & Cost section with provider search features, tips, and external link to Horizon provider directory
- Telemedicine section with guidance text, video/phone/messaging features, and FAQ accordion
- Behavioral Health section with therapy, psychiatry, substance use, and crisis support resources
- Crisis resources display with 988 Suicide & Crisis Lifeline, Crisis Text Line, and Horizon Behavioral Health Line
- FAQ accordion with expand/collapse animation and keyboard accessibility
- Leaving Site Modal disclaimer for external links with destination URL display, Continue, and Cancel actions
- Content loaded from `getCareContent.json` data file

#### ID Cards (SCRUM-7170)
- Coverage type selector for switching between Medical, Dental, and Vision ID cards
- ID card front preview with plan name, member name, member ID, group number, effective date, copays, and Rx information
- ID card back preview with claims address, contact phone numbers, website, provider search URL, and emergency notice
- Flip button to toggle between front and back card views with side indicator dots
- Enlarge modal for full-size card viewing with flip navigation
- Print action via `window.print()` with audit logging
- Download as PDF action using jsPDF and html2canvas with front and back pages
- Request New Card action with confirmation alert (MVP stub)
- Dependent information display with masked member IDs
- Coverage-type-specific styling (Medical blue, Dental teal, Vision blue)
- All coverage cards summary list with selection indicator

#### Claims (SCRUM-7171)
- Claims list table with sortable columns: claim number, type, patient, provider, billed amount, you owe, status, service date
- Filter panel with claim type, status, date range, and patient dropdown filters
- Claims summary cards showing total claims, total billed, plan paid, and you owe
- Claim detail view with financial summary cards (billed, allowed, plan paid, you owe)
- Claim information card with claim number, type, service date, submitted date, processed date, status, patient, and diagnosis codes
- Provider information card with name, specialty, NPI, address, and network savings display
- Service line items table with procedure code, description, date, billed, allowed, plan paid, your cost, and status columns
- Explanation of Benefits (EOB) document section with download action
- Claim submission form (MVP stub) with claim type, provider name, service date, amount, and description fields
- Form validation with accessible error messages and field-level error clearing
- Claim status badges with color-coded variants (approved, denied, in review, pending, submitted, appealed, partially approved)
- Navigation between claims list, claim detail, and claim submission views via URL routing

#### Benefits & Coverage (SCRUM-7168)
- Benefits summary with plan overview card showing plan name, type, effective date, and group number
- Coverage type selector for switching between Medical, Dental, and Vision plans
- Deductible progress display with individual and family progress bars and remaining amounts
- Out-of-pocket maximum progress display with individual and family progress bars and remaining amounts
- Financial summary cards showing deductible met percentage and OOP used amounts
- Coverage categories table with service name, in-network copay/coinsurance, and out-of-network copay/coinsurance
- Coverage details component with plan-specific table rendering and cost share formatting
- Quick action buttons for navigating to Claims and ID Cards pages
- Data loaded from `benefits.json` filtered by current member ID and active status

#### Document Center (SCRUM-7172, SCRUM-7166, SCRUM-7165)
- Document list table with sortable columns: document name, category, date added, file size, and download action
- Category filter with EOB, Plan Document, Correspondence, and Tax Form options
- Date range filter for filtering documents by date added
- Document summary cards showing total documents, EOBs, plan documents, and correspondence counts
- Document download action with simulated download, success/error alerts, and audit logging
- Category badges with color-coded variants for each document type
- Document type icons based on category
- URL query parameter support for initial category filter (e.g., `?category=eob`)
- Data loaded from `documents.json` filtered by current member ID

#### Notifications (SCRUM-7169)
- Notifications list with unread/read visual states (bold/normal text, background highlight, unread dot indicator)
- Mark as Read on notification click with navigation to related resource (claim detail, document center)
- Mark All as Read button with batch update
- Dismiss notification with removal from list
- Filter tabs for All, Unread, and category-based filtering (Claim Update, Document Ready, Coverage Change, System)
- Notification summary cards showing total, unread, and read counts
- Notification type icons and badges (info, success, warning, error, action, system)
- Relative timestamp formatting (just now, minutes ago, hours ago, days ago, date)
- Notification bell component with unread count badge and dropdown preview
- Data loaded from `notifications.json` filtered by current member ID and system-wide notifications

#### Prescriptions Page
- Prescription history table with medication name, prescriber, pharmacy, date filled, supply, tier, copay, and status
- Prescription summary cards showing total prescriptions, active, pending, and total copays
- Drug formulary tiers table with tier name, description, retail copay, mail order copay, and examples
- Nearby pharmacy locations with name, address, phone, hours, network status, and type badges
- Mail order pharmacy section with cost savings information and getting started CTA
- Prescription savings tips section with actionable recommendations
- Quick action buttons for prescription history, drug formulary, find a pharmacy, and mail order

#### Wellness Page
- Wellness programs section with featured program cards showing title, description, category badge, and icon
- Preventive care table with service name, description, frequency, and coverage status (covered at 100%)
- Health resources list with title, description, category badge, read time, and navigation
- Wellness banner with gradient styling and explore programs / find a provider CTAs
- Quick action buttons for preventive care schedule, find a provider, and view benefits

#### Placeholder Pages
- Settings page with Account Preferences, Notification Preferences, and Security Settings placeholder sections
- Admin Panel page with User Management, System Configuration, and Audit Logs placeholder sections (admin role required)
- 404 Not Found page with friendly error message, helpful navigation links, and go back action

#### Glassbox Integration & Compliance (SCRUM-7165, SCRUM-7173)
- Glassbox provider component with SDK initialization, session management, and PHI/PII masking
- Automatic DOM masking via `data-phi` attribute selectors applied to all sensitive elements
- Periodic masking re-application interval for dynamically rendered content
- MutationObserver-based masking for content rendered after interval checks
- Glassbox tagger service with event recording for page views, login/logout, claims, documents, ID cards, coverage, benefits, support, notifications, and widget interactions
- `useGlassbox` hook providing convenience tagging functions bound to current user context
- Environment-based enable/disable via `VITE_GLASSBOX_ENABLED` configuration
- Mock Glassbox SDK implementation for MVP with full API surface

#### Audit Logging (SCRUM-7166)
- Audit logger service recording timestamped entries for document downloads, ID card downloads/prints/views, claim views, EOB downloads, external link clicks, new card requests, page views, login/logout, and session events
- In-memory audit log store with query functions by user, action, and resource
- `useAuditLog` hook providing logging functions automatically bound to current user ID
- Glassbox tag store for analytics event persistence with query functions by type, user, and route

#### PHI/PII Masking Utilities (SCRUM-7165, SCRUM-7173)
- Member ID masking showing only last 4 characters
- Name masking showing only first initial of each name part
- Claim number masking showing only last 5 characters
- Group number masking showing only last 3 characters
- Financial amount masking with generic placeholder
- SSN masking showing only last 4 digits
- Date of birth masking showing only year
- Email masking showing only first character and domain
- Phone number masking showing only last 4 digits
- Address masking showing only city and state
- CSS selector list for DOM elements containing PHI/PII (`data-phi` attributes)
- Field-level and batch masking utility functions

#### Reusable UI Components
- Alert component with info, success, warning, error, and neutral variants with optional dismiss
- Badge component with color variants, dot indicator, outline mode, and size options
- Button component with primary, secondary, outline, ghost, danger, and link variants with loading state
- Coverage Selector dropdown for switching between plan types
- DataTable component with sortable columns, pagination, page size selector, and empty state
- EmptyState component with icon, title, message, and optional CTA button
- FilterPanel component with select and date range filter controls, active filter count, and clear all
- LeavingSiteModal for external link disclaimers with destination URL display
- LoadingSpinner component with size variants, overlay mode, and full-page mode
- Modal component with focus trap, escape key handler, backdrop click, and ARIA attributes
- Pagination component with page numbers, ellipsis, previous/next buttons, and page size selector
- ProgressBar component with currency/percentage formatting, color thresholds, and ARIA progressbar role
- SearchResults dropdown component with type badges, snippets, and keyboard navigation

#### Accessibility (WCAG 2.1 AA)
- Visible focus ring indicators for all interactive elements via `:focus-visible`
- Skip-to-main-content link for keyboard users
- ARIA roles, labels, and live regions throughout all components
- Focus trap implementation in modals and mobile sidebar
- Keyboard navigation support for dropdowns, accordions, tabs, tables, and search results
- Screen reader text (`sr-only`) for loading states and icon-only buttons
- Reduced motion support via `prefers-reduced-motion` media query
- High contrast mode support via `forced-colors` media query
- Semantic HTML structure with proper heading hierarchy
- Form field labels, required indicators, error messages, and hint text with `aria-describedby`

#### Styling & Branding
- Horizon Blue Cross Blue Shield of New Jersey brand colors (primary blue, secondary teal, accent)
- Roboto font family with weight variants (300, 400, 500, 700)
- Tailwind CSS utility-first styling with custom HB component classes
- Responsive design with mobile-first breakpoints
- Print stylesheet with non-printable element hiding and card border preservation
- Custom scrollbar styling for overflow containers
- Animation keyframes for fade, slide, scale, and bounce transitions
- CSS custom properties for consistent shadow, border radius, and spacing values

#### Data & Configuration
- Mock user data with member and admin roles (`users.json`)
- Mock claims data with 20 claims across medical, dental, vision, and pharmacy types (`claims.json`)
- Mock benefits data with Medical, Dental, and Vision plans for two members (`benefits.json`)
- Mock ID cards data with front/back fields for 6 coverage cards (`idcards.json`)
- Mock documents data with EOBs, plan documents, correspondence, and tax forms (`documents.json`)
- Mock notifications data with claim updates, document ready, coverage changes, and system alerts (`notifications.json`)
- Dashboard widget configuration with 12 widget types and default order/visibility (`dashboard-widgets.json`)
- Navigation structure with nested menu items and icons (`navigation.json`)
- Get Care content with sections, features, FAQs, and crisis resources (`getCareContent.json`)
- Support configuration with 6 contact channels and emergency notice (`supportConfig.json`)
- Environment configuration via `.env` with API URL, Glassbox toggle, session timeout, and support contacts

#### Build & Tooling
- Vite 5 build configuration with React plugin and path aliases
- Tailwind CSS 3 with PostCSS and Autoprefixer
- ESLint configuration with React, React Hooks, and React Refresh plugins
- Vercel deployment configuration with SPA rewrites
- Content Security Policy meta tag in `index.html`