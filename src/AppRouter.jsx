import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NotificationsProvider } from './contexts/NotificationsContext.jsx';
import { PreferencesProvider } from './contexts/PreferencesContext.jsx';
import GlassboxProvider from './components/compliance/GlassboxProvider.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GetCarePage from './pages/GetCarePage.jsx';
import IDCardsPage from './pages/IDCardsPage.jsx';
import ClaimsPage from './pages/ClaimsPage.jsx';
import BenefitsPage from './pages/BenefitsPage.jsx';
import WellnessPage from './pages/WellnessPage.jsx';
import PrescriptionsPage from './pages/PrescriptionsPage.jsx';
import DocumentCenterPage from './pages/DocumentCenterPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdminPanelPage from './pages/AdminPanelPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ROUTES } from './utils/constants.js';

/**
 * AppRouter - Application routing configuration
 * Implements React Router v6 route definitions from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7164, SCRUM-7168, SCRUM-7169, SCRUM-7170, SCRUM-7171, SCRUM-7172
 *
 * Defines all application routes including public routes (login), protected
 * authenticated routes (dashboard, claims, benefits, etc.), and role-restricted
 * routes (admin panel). Wraps the application in context providers for
 * authentication, notifications, preferences, and Glassbox compliance.
 *
 * Route structure:
 * - /login → LoginPage (public)
 * - / → Redirect to /dashboard
 * - /dashboard → DashboardPage (protected)
 * - /find-care/* → GetCarePage (protected)
 * - /id-cards → IDCardsPage (protected)
 * - /claims → ClaimsPage (protected)
 * - /claims/submit → ClaimsPage (protected)
 * - /claims/:claimId → ClaimsPage (protected)
 * - /benefits → BenefitsPage (protected)
 * - /coverage → BenefitsPage (protected)
 * - /wellness/* → WellnessPage (protected)
 * - /prescriptions/* → PrescriptionsPage (protected)
 * - /documents → DocumentCenterPage (protected)
 * - /notifications → NotificationsPage (protected)
 * - /settings → SettingsPage (protected)
 * - /support → SettingsPage placeholder (protected)
 * - /profile → SettingsPage placeholder (protected)
 * - /spending → BenefitsPage placeholder (protected)
 * - /prior-authorization → SettingsPage placeholder (protected)
 * - /admin → AdminPanelPage (protected, admin role required)
 * - * → NotFoundPage (catch-all)
 *
 * @returns {JSX.Element}
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <PreferencesProvider>
            <GlassboxProvider>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />

                {/* Protected Routes - Authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    {/* Default redirect from / to /dashboard */}
                    <Route
                      index
                      element={<Navigate to={ROUTES.DASHBOARD} replace />}
                    />

                    {/* Dashboard */}
                    <Route path="dashboard" element={<DashboardPage />} />

                    {/* Get Care */}
                    <Route path="find-care" element={<GetCarePage />} />
                    <Route path="find-care/*" element={<GetCarePage />} />

                    {/* ID Cards */}
                    <Route path="id-cards" element={<IDCardsPage />} />

                    {/* Claims */}
                    <Route path="claims" element={<ClaimsPage />} />
                    <Route path="claims/submit" element={<ClaimsPage />} />
                    <Route path="claims/eob" element={<ClaimsPage />} />
                    <Route path="claims/:claimId" element={<ClaimsPage />} />

                    {/* Benefits & Coverage */}
                    <Route path="benefits" element={<BenefitsPage />} />
                    <Route path="coverage" element={<BenefitsPage />} />
                    <Route path="coverage/:planId" element={<BenefitsPage />} />
                    <Route path="spending" element={<BenefitsPage />} />

                    {/* Wellness */}
                    <Route path="wellness" element={<WellnessPage />} />
                    <Route path="wellness/*" element={<WellnessPage />} />

                    {/* Prescriptions */}
                    <Route path="prescriptions" element={<PrescriptionsPage />} />
                    <Route path="prescriptions/*" element={<PrescriptionsPage />} />

                    {/* Document Center */}
                    <Route path="documents" element={<DocumentCenterPage />} />

                    {/* Notifications */}
                    <Route path="notifications" element={<NotificationsPage />} />

                    {/* Settings */}
                    <Route path="settings" element={<SettingsPage />} />

                    {/* Support */}
                    <Route path="support" element={<SettingsPage />} />

                    {/* Profile */}
                    <Route path="profile" element={<SettingsPage />} />

                    {/* Prior Authorization */}
                    <Route path="prior-authorization" element={<SettingsPage />} />
                    <Route path="prior-authorization/:authId" element={<SettingsPage />} />

                    {/* Messages */}
                    <Route path="messages" element={<SettingsPage />} />
                    <Route path="messages/:messageId" element={<SettingsPage />} />

                    {/* Admin Panel - Admin role required */}
                    <Route
                      path="admin"
                      element={
                        <ProtectedRoute requiredRoles="admin">
                          <AdminPanelPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Route>

                {/* Catch-all 404 */}
                <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
              </Routes>
            </GlassboxProvider>
          </PreferencesProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;