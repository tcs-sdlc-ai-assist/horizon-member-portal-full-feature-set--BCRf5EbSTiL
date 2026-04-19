# Horizon Member Portal

A comprehensive health insurance member portal built for Horizon Blue Cross Blue Shield of New Jersey. The portal enables members to manage their health plans, view claims, access ID cards, review benefits, and interact with wellness resources through a modern, accessible web interface.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Folder Structure](#folder-structure)
- [Features](#features)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)
- [License](#license)

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 18.3 | UI component library |
| [Vite](https://vitejs.dev/) | 5.4 | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Utility-first CSS framework |
| [React Router](https://reactrouter.com/) | 6.26 | Client-side routing |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5 | PDF generation for ID card downloads |
| [html2canvas](https://html2canvas.hertzen.com/) | 1.4 | DOM-to-canvas capture for PDF rendering |
| [PostCSS](https://postcss.org/) | 8.4 | CSS processing with Autoprefixer |
| [ESLint](https://eslint.org/) | 8.57 | JavaScript/JSX linting |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://www.npmjs.com/) >= 9.0.0

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd horizon-member-portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file and update values as needed:

   ```bash
   cp .env.example .env
   ```

   See [Environment Variables](#environment-variables) for details on each variable.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will open at [http://localhost:3000](http://localhost:3000).

5. **Build for production**

   ```bash
   npm run build
   ```

   The production build is output to the `dist/` directory.

6. **Preview the production build**

   ```bash
   npm run preview
   ```

## Environment Variables

Create a `.env` file in the project root (see `.env.example` for reference):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.example.com/v1` | Base URL for the backend API (not used in MVP; mock data is used) |
| `VITE_GLASSBOX_ENABLED` | `false` | Enable or disable Glassbox session replay and analytics tagging |
| `VITE_SESSION_TIMEOUT_MINUTES` | `15` | Session inactivity timeout in minutes |
| `VITE_SESSION_WARNING_MINUTES` | `2` | Minutes before timeout to show the session warning modal |
| `VITE_APP_NAME` | `Horizon Member Portal` | Application display name used in the header and branding |
| `VITE_SUPPORT_EMAIL` | `support@horizonblue.com` | Default support email address |
| `VITE_SUPPORT_CHAT` | `https://www.horizonblue.com/chat` | Default live chat URL |
| `VITE_SUPPORT_PHONE` | `1-800-355-2583` | Default support phone number |

All environment variables prefixed with `VITE_` are exposed to the client-side application at build time via Vite's built-in env handling.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server on port 3000 with hot module replacement |
| `npm run build` | Build the application for production to the `dist/` directory |
| `npm run preview` | Serve the production build locally for testing |
| `npm run lint` | Run ESLint across all `.js` and `.jsx` files with zero warning tolerance |

## Folder Structure

```
horizon-member-portal/
├── public/                          # Static assets served at root
│   └── favicon.ico                  # Application favicon
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginForm.jsx        # Login form with validation and branding
│   │   │   ├── ProtectedRoute.jsx   # Route guard with role-based access control
│   │   │   └── SessionTimeoutModal.jsx  # Session timeout warning with countdown
│   │   ├── benefits/                # Benefits & coverage components
│   │   │   ├── BenefitsSummary.jsx  # Plan overview, deductible/OOP progress, coverage table
│   │   │   └── CoverageDetails.jsx  # Coverage categories table with cost shares
│   │   ├── claims/                  # Claims management components
│   │   │   ├── ClaimDetail.jsx      # Individual claim detail with line items and EOB
│   │   │   ├── ClaimsList.jsx       # Claims list table with filters and pagination
│   │   │   └── ClaimSubmissionForm.jsx  # Claim submission form (MVP stub)
│   │   ├── common/                  # Shared reusable UI components
│   │   │   ├── Alert.jsx            # Alert banner (info, success, warning, error)
│   │   │   ├── Badge.jsx            # Status badge/chip with variants
│   │   │   ├── Button.jsx           # Branded button with variants and loading state
│   │   │   ├── CoverageSelector.jsx # Coverage type dropdown selector
│   │   │   ├── DataTable.jsx        # Sortable, paginated data table
│   │   │   ├── EmptyState.jsx       # Empty state placeholder with CTA
│   │   │   ├── FilterPanel.jsx      # Configurable filter controls panel
│   │   │   ├── LeavingSiteModal.jsx # External link disclaimer modal
│   │   │   ├── LoadingSpinner.jsx   # Loading spinner with overlay mode
│   │   │   ├── Modal.jsx            # Accessible modal dialog with focus trap
│   │   │   ├── Pagination.jsx       # Pagination controls with page size selector
│   │   │   └── ProgressBar.jsx      # Progress bar for financial summaries
│   │   ├── compliance/              # Compliance and analytics components
│   │   │   └── GlassboxProvider.jsx # Glassbox SDK initialization and PHI/PII masking
│   │   ├── dashboard/               # Dashboard widget components
│   │   │   ├── DeductibleOOPWidget.jsx  # Deductible & out-of-pocket progress
│   │   │   ├── FindCareCTA.jsx      # Find Care call-to-action card
│   │   │   ├── GreetingBanner.jsx   # Personalized greeting with time-of-day
│   │   │   ├── IDCardSummaryWidget.jsx  # ID card summary with coverage tabs
│   │   │   ├── LearningCenterWidget.jsx # Health tips and educational articles
│   │   │   ├── RecentClaimsWidget.jsx   # Recent claims summary list
│   │   │   └── WidgetCustomizer.jsx # Widget show/hide and reorder panel
│   │   ├── documents/               # Document center components
│   │   │   └── DocumentList.jsx     # Document list with filters and download
│   │   ├── getcare/                 # Get Care page components
│   │   │   └── GetCareSection.jsx   # Content section with FAQs and external links
│   │   ├── idcards/                 # ID card components
│   │   │   ├── IDCardActions.jsx    # Print, download PDF, and request new card
│   │   │   ├── IDCardEnlargeModal.jsx   # Enlarged card modal with flip
│   │   │   └── IDCardPreview.jsx    # Card front/back preview renderer
│   │   ├── layout/                  # Application layout components
│   │   │   ├── AppLayout.jsx        # Authenticated layout shell (header + sidebar + content)
│   │   │   ├── Footer.jsx           # Application footer with branding and legal links
│   │   │   ├── Header.jsx           # Global header with search, notifications, profile
│   │   │   ├── SearchResults.jsx    # Global search results dropdown
│   │   │   ├── Sidebar.jsx          # Left sidebar navigation with expandable items
│   │   │   └── UserMenu.jsx         # User profile dropdown menu
│   │   ├── notifications/           # Notification components
│   │   │   ├── NotificationBell.jsx # Header bell icon with unread badge and dropdown
│   │   │   └── NotificationsList.jsx    # Full notifications list with filters
│   │   └── support/                 # Support components
│   │       └── SupportActions.jsx   # Email, chat, and phone action buttons
│   ├── contexts/                    # React Context providers
│   │   ├── AuthContext.jsx          # Authentication state, login/logout, session management
│   │   ├── NotificationsContext.jsx # Notifications state, read/unread, dismiss
│   │   └── PreferencesContext.jsx   # User preferences, widget order, localStorage persistence
│   ├── data/                        # Mock JSON data files
│   │   ├── benefits.json            # Benefits plans (Medical, Dental, Vision) for 2 members
│   │   ├── claims.json              # 20 claims across medical, dental, vision, pharmacy
│   │   ├── dashboard-widgets.json   # 12 widget type configurations with defaults
│   │   ├── documents.json           # EOBs, plan documents, correspondence, tax forms
│   │   ├── getCareContent.json      # Get Care sections, features, FAQs, crisis resources
│   │   ├── idcards.json             # 6 ID cards (front/back) for 2 members
│   │   ├── navigation.json          # Sidebar navigation structure with nested items
│   │   ├── notifications.json       # Claim updates, document ready, system alerts
│   │   ├── supportConfig.json       # 6 support channels with contact details
│   │   └── users.json               # 3 mock users (2 members, 1 admin)
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuditLog.js           # Audit logging bound to current user
│   │   ├── useGlassbox.js           # Glassbox tagging bound to current user
│   │   ├── useSearch.js             # Debounced global search with portal content
│   │   └── useSessionTimeout.js     # Session inactivity timeout tracking
│   ├── pages/                       # Route-level page components
│   │   ├── AdminPanelPage.jsx       # Admin panel placeholder (admin role required)
│   │   ├── BenefitsPage.jsx         # Benefits & Coverage page
│   │   ├── ClaimsPage.jsx           # Claims list, detail, and submission views
│   │   ├── DashboardPage.jsx        # Personalized dashboard with widget grid
│   │   ├── DocumentCenterPage.jsx   # Document center with category filters
│   │   ├── GetCarePage.jsx          # Get Care with Find Care, Telehealth, Behavioral Health
│   │   ├── IDCardsPage.jsx          # ID cards with view, print, download, request
│   │   ├── LoginPage.jsx            # Login page wrapper
│   │   ├── NotFoundPage.jsx         # 404 error page with helpful links
│   │   ├── NotificationsPage.jsx    # Notifications management page
│   │   ├── PrescriptionsPage.jsx    # Prescriptions, formulary, pharmacy locations
│   │   ├── SettingsPage.jsx         # Settings placeholder page
│   │   └── WellnessPage.jsx         # Wellness programs, preventive care, resources
│   ├── services/                    # Business logic services
│   │   ├── AuditLogger.js           # Audit logging service for compliance
│   │   ├── AuthManager.js           # Authentication orchestration (login/logout/session)
│   │   └── GlassboxTagger.js        # Glassbox analytics event tagging service
│   ├── stores/                      # In-memory data stores
│   │   ├── AuditLogStore.js         # Audit log entry persistence
│   │   ├── GlassboxTagStore.js      # Glassbox event tag persistence
│   │   ├── SessionStore.js          # Session lifecycle management with TTL
│   │   └── UserStore.js             # User record data access layer
│   ├── utils/                       # Utility functions
│   │   ├── constants.js             # Routes, session config, enums, Glassbox events
│   │   ├── formatters.js            # Currency, date, phone, percentage formatting
│   │   ├── maskingUtils.js          # PHI/PII masking for Glassbox compliance
│   │   ├── pdfGenerator.js          # PDF generation for ID card downloads
│   │   └── searchUtils.js           # Portal content search (non-sensitive only)
│   ├── App.jsx                      # Root component with error boundary
│   ├── AppRouter.jsx                # React Router configuration with all routes
│   ├── index.css                    # Global styles, HB CSS framework, Tailwind layers
│   └── main.jsx                     # Application entry point
├── .env.example                     # Environment variable template
├── .eslintrc.cjs                    # ESLint configuration
├── CHANGELOG.md                     # Version history
├── index.html                       # HTML entry point with CSP and font preloads
├── package.json                     # Dependencies and scripts
├── postcss.config.js                # PostCSS with Tailwind and Autoprefixer
├── tailwind.config.js               # Tailwind CSS theme customization
├── vercel.json                      # Vercel deployment with SPA rewrites
└── vite.config.js                   # Vite build configuration with path aliases
```

## Features

### Authentication & Session Management
- Secure login form with username/password authentication and form validation
- Session timeout tracking with configurable inactivity threshold (default 15 minutes)
- Session timeout warning modal with countdown timer and "Stay Logged In" / "Log Out" actions
- Session extension via user activity detection (mouse, keyboard, touch events)
- Protected route guard with role-based access control for admin routes
- Automatic redirect to login page on session expiration with return-to-intended-destination support

### Global Navigation & Layout
- Responsive application layout with sticky header, collapsible sidebar, and main content area
- Left sidebar navigation with expandable/collapsible menu items loaded from `navigation.json`
- Active route highlighting and auto-expansion of parent items with active children
- Mobile-responsive sidebar with hamburger toggle, overlay backdrop, and focus trap
- Global search bar with debounced input, portal-wide content search, and keyboard-navigable results dropdown
- Notification bell icon with unread count badge and dropdown preview of recent notifications
- User profile dropdown menu with navigation to Dashboard, Profile, Settings, and Sign Out
- Support quick-action dropdown with Email, Chat, and Call channels

### Personalized Dashboard
- Personalized greeting banner with time-of-day message, member name, date, and member ID
- Find Care & Cost call-to-action widget with feature highlights and provider search button
- Recent Claims widget displaying the 3 most recent claims with status badges and amounts
- ID Card Summary widget with coverage type tabs, masked member ID, key copays, and quick view action
- Deductible & Out-of-Pocket progress widget with individual/family progress bars and coverage selector
- Learning Center widget with health tips, educational articles, and category badges
- Widget customization panel for showing/hiding and reordering dashboard widgets via checkboxes and arrow buttons
- Widget preferences persistence to localStorage keyed by user ID

### Get Care
- Find Care & Cost section with provider search features, tips, and external link to Horizon provider directory
- Telemedicine section with guidance text, video/phone/messaging features, and FAQ accordion
- Behavioral Health section with therapy, psychiatry, substance use, and crisis support resources
- Crisis resources display with 988 Suicide & Crisis Lifeline, Crisis Text Line, and Horizon Behavioral Health Line
- FAQ accordion with expand/collapse animation and keyboard accessibility
- Leaving Site Modal disclaimer for external links with destination URL display

### ID Cards
- Coverage type selector for switching between Medical, Dental, and Vision ID cards
- ID card front preview with plan name, member name, member ID, group number, effective date, copays, and Rx information
- ID card back preview with claims address, contact phone numbers, website, and emergency notice
- Flip button to toggle between front and back card views with side indicator dots
- Enlarge modal for full-size card viewing with flip navigation
- Print action via `window.print()` with audit logging
- Download as PDF action using jsPDF and html2canvas with front and back pages
- Request New Card action with confirmation alert (MVP stub)
- Dependent information display with masked member IDs

### Claims
- Claims list table with sortable columns: claim number, type, patient, provider, billed amount, you owe, status, service date
- Filter panel with claim type, status, date range, and patient dropdown filters
- Claims summary cards showing total claims, total billed, plan paid, and you owe
- Claim detail view with financial summary cards, claim information, provider information, and service line items table
- Explanation of Benefits (EOB) document section with download action
- Claim submission form (MVP stub) with claim type, provider name, service date, amount, and description fields
- Claim status badges with color-coded variants (approved, denied, in review, pending, submitted, appealed, partially approved)

### Benefits & Coverage
- Benefits summary with plan overview card showing plan name, type, effective date, and group number
- Coverage type selector for switching between Medical, Dental, and Vision plans
- Deductible and out-of-pocket maximum progress display with individual and family progress bars
- Coverage categories table with service name, in-network copay/coinsurance, and out-of-network copay/coinsurance
- Quick action buttons for navigating to Claims and ID Cards pages

### Document Center
- Document list table with sortable columns: document name, category, date added, file size, and download action
- Category filter with EOB, Plan Document, Correspondence, and Tax Form options
- Date range filter for filtering documents by date added
- Document summary cards showing total documents, EOBs, plan documents, and correspondence counts
- Document download action with simulated download, success/error alerts, and audit logging
- URL query parameter support for initial category filter (e.g., `?category=eob`)

### Notifications
- Notifications list with unread/read visual states (bold/normal text, background highlight, unread dot indicator)
- Mark as Read on notification click with navigation to related resource (claim detail, document center)
- Mark All as Read button with batch update
- Dismiss notification with removal from list
- Filter tabs for All, Unread, and category-based filtering
- Notification bell component with unread count badge and dropdown preview

### Prescriptions
- Prescription history table with medication name, prescriber, pharmacy, date filled, supply, tier, copay, and status
- Drug formulary tiers table with tier name, description, retail copay, mail order copay, and examples
- Nearby pharmacy locations with name, address, phone, hours, network status, and type badges
- Mail order pharmacy section with cost savings information and getting started CTA
- Prescription savings tips section with actionable recommendations

### Wellness
- Wellness programs section with featured program cards showing title, description, category badge, and icon
- Preventive care table with service name, description, frequency, and coverage status (covered at 100%)
- Health resources list with title, description, category badge, read time, and navigation
- Wellness banner with gradient styling and explore programs / find a provider CTAs

### Glassbox Integration & Compliance
- Glassbox provider component with SDK initialization, session management, and PHI/PII masking
- Automatic DOM masking via `data-phi` attribute selectors applied to all sensitive elements
- Periodic masking re-application interval for dynamically rendered content
- MutationObserver-based masking for content rendered after interval checks
- Glassbox tagger service with event recording for page views, login/logout, claims, documents, ID cards, coverage, benefits, support, notifications, and widget interactions
- Environment-based enable/disable via `VITE_GLASSBOX_ENABLED` configuration

### Audit Logging
- Audit logger service recording timestamped entries for document downloads, ID card downloads/prints/views, claim views, EOB downloads, external link clicks, new card requests, page views, login/logout, and session events
- In-memory audit log store with query functions by user, action, and resource

### PHI/PII Masking
- Member ID masking showing only last 4 characters
- Name masking showing only first initial of each name part
- Claim number masking showing only last 5 characters
- Group number masking showing only last 3 characters
- Financial amount masking with generic placeholder
- SSN, date of birth, email, phone, and address masking utilities
- CSS selector list for DOM elements containing PHI/PII (`data-phi` attributes)

## Accessibility

This application is built to meet **WCAG 2.1 Level AA** standards:

- **Focus Management**: Visible focus ring indicators for all interactive elements via `:focus-visible`. Focus trap implementation in modals and mobile sidebar.
- **Keyboard Navigation**: Full keyboard support for dropdowns, accordions, tabs, tables, search results, and all interactive components. Skip-to-main-content link for keyboard users.
- **Screen Readers**: ARIA roles, labels, and live regions throughout all components. Screen reader text (`sr-only`) for loading states and icon-only buttons. Semantic HTML structure with proper heading hierarchy.
- **Forms**: Form field labels, required indicators, error messages, and hint text with `aria-describedby`. Accessible error announcements via `role="alert"`.
- **Motion**: Reduced motion support via `prefers-reduced-motion` media query.
- **High Contrast**: High contrast mode support via `forced-colors` media query.
- **Color**: Status badges and alerts use both color and text/icon indicators to convey meaning, not relying on color alone.

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` configuration with SPA rewrites. To deploy:

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/dashboard).
3. Configure environment variables in the Vercel project settings.
4. Deploy. Vercel will automatically detect the Vite framework and apply the correct build settings.

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Serve the `dist/` directory with any static file server. Ensure all routes are rewritten to `index.html` for client-side routing support.

   Example with [serve](https://www.npmjs.com/package/serve):

   ```bash
   npx serve dist -s
   ```

### Content Security Policy

The application includes a Content Security Policy meta tag in `index.html`. When deploying behind a reverse proxy or CDN, ensure the CSP headers are configured to allow:

- `script-src 'self'`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src 'self' https://fonts.gstatic.com`
- `img-src 'self' data: https:`
- `connect-src 'self' https://api.example.com`

Update the `connect-src` directive to include your actual API domain in production.

## Demo Credentials

The application uses mock data with the following demo accounts:

| Username | Password | Role | Member ID |
|---|---|---|---|
| `jdoe` | `Password1!` | Member | HBM-100234567 |
| `msmith` | `Password2!` | Member | HBM-100987654 |
| `admin` | `Admin123!` | Admin | N/A |

> **Note**: These credentials are for demonstration purposes only. The MVP uses in-memory mock data with no backend API integration. All data is loaded from JSON files in `src/data/`.

## License

This project is private and proprietary. Unauthorized copying, distribution, or use of this software is strictly prohibited.

© 2024 Horizon Blue Cross Blue Shield of New Jersey. All rights reserved.