# Deployment Guide

This document provides step-by-step instructions for deploying the Horizon Member Portal to Vercel, including environment variable configuration, CI/CD integration, preview deployments, and a production deployment checklist.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Project Configuration](#vercel-project-configuration)
- [Environment Variables](#environment-variables)
- [SPA Rewrite Rules](#spa-rewrite-rules)
- [Build Configuration](#build-configuration)
- [CI/CD with GitHub Integration](#cicd-with-github-integration)
- [Preview Deployments](#preview-deployments)
- [Production Deployment Checklist](#production-deployment-checklist)
- [Manual Deployment](#manual-deployment)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure the following are in place:

- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://www.npmjs.com/) >= 9.0.0
- A [Vercel](https://vercel.com/) account
- The repository hosted on GitHub, GitLab, or Bitbucket
- All environment variables documented and ready for configuration
- A successful local build (`npm run build`) with no errors

## Vercel Project Configuration

### 1. Import the Project

1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** → **Project**.
3. Select the Git provider where the repository is hosted (GitHub, GitLab, or Bitbucket).
4. Authorize Vercel to access the repository if prompted.
5. Select the `horizon-member-portal` repository from the list.

### 2. Configure Framework and Build Settings

Vercel will automatically detect the Vite framework. Verify the following settings on the project configuration screen:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x (or latest LTS) |
| **Root Directory** | `.` (repository root) |

> **Note**: Vercel's automatic framework detection should populate these values correctly. Only override if the defaults are incorrect.

### 3. Configure Environment Variables

Add all required environment variables before the first deployment. See the [Environment Variables](#environment-variables) section below for the complete list.

### 4. Deploy

Click **Deploy** to trigger the initial deployment. Vercel will install dependencies, run the build command, and deploy the output from the `dist` directory.

## Environment Variables

All environment variables prefixed with `VITE_` are exposed to the client-side application at build time via Vite's built-in env handling. These must be configured in the Vercel project settings under **Settings** → **Environment Variables**.

### Required Variables

| Variable | Description | Production Value | Preview Value | Development Value |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | Base URL for the backend API. Not used in MVP (mock data is used), but should be set for future integration. | `https://api.horizonblue.com/v1` | `https://api-staging.horizonblue.com/v1` | `https://api.example.com/v1` |
| `VITE_GLASSBOX_ENABLED` | Enable or disable Glassbox session replay and analytics tagging. Set to `true` in production to activate PHI/PII masking and event tagging. | `true` | `false` | `false` |
| `VITE_SESSION_TIMEOUT_MINUTES` | Session inactivity timeout in minutes. After this period of inactivity, the user is logged out. | `15` | `15` | `15` |
| `VITE_SESSION_WARNING_MINUTES` | Minutes before session timeout to display the warning modal. Must be less than `VITE_SESSION_TIMEOUT_MINUTES`. | `2` | `2` | `2` |
| `VITE_APP_NAME` | Application display name used in the header, branding, and page titles. | `Horizon Member Portal` | `Horizon Member Portal (Preview)` | `Horizon Member Portal` |

### Optional Variables

| Variable | Description | Default Value |
|---|---|---|
| `VITE_SUPPORT_EMAIL` | Default support email address displayed in support components. | `support@horizonblue.com` |
| `VITE_SUPPORT_CHAT` | Default live chat URL for the support chat channel. | `https://www.horizonblue.com/chat` |
| `VITE_SUPPORT_PHONE` | Default support phone number displayed in support components. | `1-800-355-2583` |

### Setting Environment Variables in Vercel

1. Navigate to the Vercel project dashboard.
2. Go to **Settings** → **Environment Variables**.
3. For each variable:
   - Enter the **Key** (e.g., `VITE_GLASSBOX_ENABLED`).
   - Enter the **Value** (e.g., `true`).
   - Select the target **Environments**: Production, Preview, and/or Development.
4. Click **Save**.

> **Important**: Environment variables are embedded at build time. Changing a variable requires a redeployment for the change to take effect. Vercel does not inject environment variables at runtime for static sites.

### Environment-Specific Configuration

Vercel supports setting different values per environment (Production, Preview, Development). Use this to:

- Enable Glassbox only in Production (`VITE_GLASSBOX_ENABLED=true`).
- Point to different API endpoints per environment.
- Differentiate the app name for Preview deployments to avoid confusion.

| Variable | Production | Preview | Development |
|---|---|---|---|
| `VITE_GLASSBOX_ENABLED` | `true` | `false` | `false` |
| `VITE_API_BASE_URL` | `https://api.horizonblue.com/v1` | `https://api-staging.horizonblue.com/v1` | `https://api.example.com/v1` |
| `VITE_APP_NAME` | `Horizon Member Portal` | `Horizon Member Portal (Preview)` | `Horizon Member Portal` |

## SPA Rewrite Rules

The Horizon Member Portal is a single-page application (SPA) using React Router for client-side routing. All routes must be rewritten to `index.html` so that React Router can handle navigation.

The project includes a `vercel.json` configuration file at the repository root that handles this:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration ensures that:

- Direct URL access to any route (e.g., `/dashboard`, `/claims/CLM-001`) serves `index.html`.
- React Router handles all client-side routing after the initial page load.
- Refreshing the browser on any route does not result in a 404 error.
- Static assets in the `dist/assets/` directory are served directly by Vercel's CDN.

> **Note**: The `vercel.json` file is automatically picked up by Vercel during deployment. No additional configuration is needed for SPA rewrites.

## Build Configuration

### Build Command

```bash
npm run build
```

This runs `vite build`, which:

1. Processes all JavaScript/JSX files with the React plugin.
2. Compiles Tailwind CSS via PostCSS with Autoprefixer.
3. Bundles and tree-shakes all dependencies.
4. Outputs optimized production assets to the `dist/` directory.
5. Generates hashed file names for cache busting.

### Output Directory

```
dist/
```

The `dist` directory contains:

- `index.html` — The entry HTML file with Content Security Policy meta tag and font preloads.
- `assets/` — Hashed JavaScript bundles, CSS files, and other static assets.
- `favicon.ico` — The application favicon copied from `public/`.

### Lint Check

Before deploying, ensure the codebase passes linting:

```bash
npm run lint
```

This runs ESLint across all `.js` and `.jsx` files with zero warning tolerance. The build will not fail on lint warnings, but the lint script enforces `--max-warnings 0`.

### Local Build Verification

To verify the production build locally before deploying:

```bash
npm run build
npm run preview
```

The `preview` command serves the `dist` directory locally using Vite's preview server, allowing you to test the production build at `http://localhost:4173`.

## CI/CD with GitHub Integration

### Automatic Deployments

When the Vercel project is connected to a GitHub repository, Vercel automatically:

1. **Deploys on push to the production branch** (typically `main` or `master`).
2. **Creates preview deployments** for every pull request.
3. **Adds deployment status checks** to pull requests on GitHub.
4. **Posts preview URLs** as comments on pull requests.

### Recommended Branch Strategy

| Branch | Vercel Environment | Purpose |
|---|---|---|
| `main` | Production | Stable production releases |
| `develop` | Preview | Integration branch for feature work |
| Feature branches (`feature/*`) | Preview | Individual feature development |
| Hotfix branches (`hotfix/*`) | Preview | Urgent production fixes |

### Configuring the Production Branch

1. Navigate to the Vercel project dashboard.
2. Go to **Settings** → **Git**.
3. Under **Production Branch**, set the branch name to `main` (or your production branch).
4. Vercel will only trigger production deployments from this branch.

### Build Caching

Vercel caches `node_modules` and build artifacts between deployments to speed up subsequent builds. If you encounter stale build issues:

1. Navigate to the Vercel project dashboard.
2. Go to **Settings** → **General**.
3. Scroll to **Build & Development Settings**.
4. Click **Clear Build Cache** and redeploy.

### GitHub Actions (Optional)

If you need additional CI steps (e.g., running tests, security scans) before Vercel deploys, you can add a GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run lint

  build:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build
```

> **Note**: Vercel deployments are triggered independently of GitHub Actions. The workflow above provides an additional quality gate but does not replace Vercel's build process.

## Preview Deployments

Vercel automatically creates a unique preview deployment for every push to a non-production branch and every pull request.

### How Preview Deployments Work

1. A developer pushes a commit or opens a pull request.
2. Vercel detects the push and triggers a build using the Preview environment variables.
3. A unique URL is generated (e.g., `horizon-member-portal-abc123.vercel.app`).
4. The preview URL is posted as a comment on the pull request (GitHub integration).
5. Team members can review the deployment at the preview URL.

### Preview Environment Variables

Preview deployments use the environment variables configured for the **Preview** environment in Vercel. This allows you to:

- Disable Glassbox in preview (`VITE_GLASSBOX_ENABLED=false`).
- Point to a staging API endpoint.
- Differentiate the app name to indicate it is a preview build.

### Protecting Preview Deployments

To restrict access to preview deployments:

1. Navigate to the Vercel project dashboard.
2. Go to **Settings** → **Deployment Protection**.
3. Enable **Vercel Authentication** to require Vercel account login for preview URLs.
4. Optionally, configure **Password Protection** for additional security.

> **Recommendation**: Enable deployment protection for preview environments to prevent unauthorized access to pre-release features and mock member data.

## Production Deployment Checklist

Complete the following checklist before deploying to production:

### Pre-Deployment

- [ ] All feature branches have been merged into the production branch (`main`).
- [ ] `npm run lint` passes with zero warnings and zero errors.
- [ ] `npm run build` completes successfully with no build errors.
- [ ] Local preview (`npm run preview`) has been tested and verified.
- [ ] All environment variables are configured in Vercel for the Production environment.
- [ ] `VITE_GLASSBOX_ENABLED` is set to `true` for production.
- [ ] `VITE_API_BASE_URL` points to the correct production API endpoint.
- [ ] `VITE_SESSION_TIMEOUT_MINUTES` is set to `15` (or the approved value).
- [ ] `VITE_SESSION_WARNING_MINUTES` is set to `2` (or the approved value).
- [ ] Content Security Policy in `index.html` has been reviewed and updated for production domains.
- [ ] The `connect-src` CSP directive includes the production API domain.

### Content Security Policy

The application includes a Content Security Policy meta tag in `index.html`. Before production deployment, verify the CSP allows:

| Directive | Required Sources |
|---|---|
| `default-src` | `'self'` |
| `script-src` | `'self'` |
| `style-src` | `'self'` `'unsafe-inline'` `https://fonts.googleapis.com` |
| `font-src` | `'self'` `https://fonts.gstatic.com` |
| `img-src` | `'self'` `data:` `https:` |
| `connect-src` | `'self'` `https://api.horizonblue.com` (update to actual production API domain) |

Update the `connect-src` directive in `index.html` to include the actual production API domain before deploying.

### Deployment

- [ ] Push the production branch to trigger the Vercel deployment.
- [ ] Monitor the Vercel build logs for any errors or warnings.
- [ ] Verify the deployment completes successfully in the Vercel dashboard.

### Post-Deployment Verification

- [ ] Access the production URL and verify the login page loads correctly.
- [ ] Log in with demo credentials (`jdoe` / `Password1!`) and verify the dashboard renders.
- [ ] Verify navigation between all major pages (Dashboard, Claims, Benefits, ID Cards, Documents, Get Care, Wellness, Prescriptions, Notifications).
- [ ] Verify the session timeout warning modal appears after the configured inactivity period.
- [ ] Verify Glassbox PHI/PII masking is active (check for `data-glassbox-mask` attributes on sensitive elements).
- [ ] Verify the Content Security Policy is not blocking any required resources (check browser console for CSP violations).
- [ ] Verify responsive layout on mobile, tablet, and desktop viewports.
- [ ] Verify accessibility: keyboard navigation, focus indicators, and screen reader compatibility.
- [ ] Verify the SPA rewrite rules work by directly navigating to a deep link (e.g., `/claims/CLM-001`).
- [ ] Verify static assets (fonts, favicon) load correctly.

### Post-Deployment Communication

- [ ] Notify the team that the deployment is complete.
- [ ] Update the CHANGELOG.md with the release version and date.
- [ ] Tag the release in Git (e.g., `git tag v1.0.0`).

## Manual Deployment

If you need to deploy without Vercel's Git integration (e.g., from a local machine):

### Using the Vercel CLI

1. Install the Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. Log in to your Vercel account:

   ```bash
   vercel login
   ```

3. Build the application locally:

   ```bash
   npm run build
   ```

4. Deploy the `dist` directory:

   ```bash
   vercel --prod
   ```

   For a preview deployment (non-production):

   ```bash
   vercel
   ```

5. Follow the CLI prompts to select the project and confirm the deployment.

### Using a Static File Server

If deploying to a non-Vercel environment:

1. Build the application:

   ```bash
   npm run build
   ```

2. Serve the `dist/` directory with any static file server that supports SPA rewrites (all routes rewritten to `index.html`).

   Example with [serve](https://www.npmjs.com/package/serve):

   ```bash
   npx serve dist -s
   ```

   Example with Nginx:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

> **Important**: Ensure all routes are rewritten to `index.html` for client-side routing support. Without this, direct URL access to any route other than `/` will result in a 404 error.

## Rollback Procedure

If a production deployment introduces issues, you can roll back to a previous deployment:

### Using the Vercel Dashboard

1. Navigate to the Vercel project dashboard.
2. Go to the **Deployments** tab.
3. Find the last known good deployment in the list.
4. Click the three-dot menu (⋯) on that deployment.
5. Select **Promote to Production**.
6. Confirm the rollback.

The previous deployment will be instantly promoted to production with no rebuild required.

### Using the Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|---|---|---|
| Blank page after deployment | SPA rewrite rules not applied | Verify `vercel.json` exists at the repository root with the correct rewrite configuration. |
| Environment variables not working | Variables not set for the correct environment | Check that variables are configured for the **Production** environment in Vercel settings. Redeploy after changes. |
| Fonts not loading | CSP blocking Google Fonts | Verify the `style-src` and `font-src` directives in the CSP meta tag include `https://fonts.googleapis.com` and `https://fonts.gstatic.com`. |
| API requests blocked | CSP `connect-src` missing API domain | Update the `connect-src` directive in `index.html` to include the production API domain. |
| Build fails with JSX errors | Vite requires `.jsx` extension for JSX files | Ensure all files containing JSX syntax use the `.jsx` file extension. |
| Stale build artifacts | Vercel build cache | Clear the build cache in Vercel project settings and redeploy. |
| 404 on direct URL access | Missing SPA rewrite rules | Verify `vercel.json` is present and contains the catch-all rewrite rule. |
| Session timeout not working | `VITE_SESSION_TIMEOUT_MINUTES` not set | Verify the environment variable is configured in Vercel. The default is `15` minutes. |
| Glassbox not masking PHI/PII | `VITE_GLASSBOX_ENABLED` set to `false` | Set `VITE_GLASSBOX_ENABLED=true` in the Production environment and redeploy. |

### Viewing Build Logs

1. Navigate to the Vercel project dashboard.
2. Go to the **Deployments** tab.
3. Click on the deployment to view its build logs.
4. Review the **Building** phase for any errors or warnings.

### Vercel Support

For Vercel-specific issues, refer to the [Vercel Documentation](https://vercel.com/docs) or contact [Vercel Support](https://vercel.com/support).

---

© 2024 Horizon Blue Cross Blue Shield of New Jersey. All rights reserved.