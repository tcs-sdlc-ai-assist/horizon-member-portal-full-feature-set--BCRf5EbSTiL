// Application-wide constants and enumerations
// Horizon Member Portal

// ============================================
// Route Paths
// ============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',
  DASHBOARD: '/dashboard',
  CLAIMS: '/claims',
  CLAIM_DETAIL: '/claims/:claimId',
  COVERAGE: '/coverage',
  COVERAGE_DETAIL: '/coverage/:planId',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: '/documents/:documentId',
  ID_CARDS: '/id-cards',
  BENEFITS: '/benefits',
  SPENDING: '/spending',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  NOTIFICATIONS: '/notifications',
  PRIOR_AUTH: '/prior-authorization',
  PRIOR_AUTH_DETAIL: '/prior-authorization/:authId',
  FIND_CARE: '/find-care',
  MESSAGE_CENTER: '/messages',
  MESSAGE_DETAIL: '/messages/:messageId',
  NOT_FOUND: '*',
};

// ============================================
// Session Configuration
// ============================================
export const SESSION = {
  TIMEOUT_MINUTES: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 15,
  WARNING_MINUTES: Number(import.meta.env.VITE_SESSION_WARNING_MINUTES) || 2,
  STORAGE_KEY: 'horizon_session',
  TOKEN_KEY: 'horizon_auth_token',
  REFRESH_TOKEN_KEY: 'horizon_refresh_token',
  LAST_ACTIVITY_KEY: 'horizon_last_activity',
};

// ============================================
// Notification Types
// ============================================
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CLAIM_UPDATE: 'claim_update',
  DOCUMENT_READY: 'document_ready',
  COVERAGE_CHANGE: 'coverage_change',
  PRIOR_AUTH_UPDATE: 'prior_auth_update',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

// ============================================
// Claim Statuses
// ============================================
export const CLAIM_STATUS = {
  SUBMITTED: 'submitted',
  RECEIVED: 'received',
  IN_REVIEW: 'in_review',
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  DENIED: 'denied',
  APPEALED: 'appealed',
  CLOSED: 'closed',
  VOIDED: 'voided',
};

export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUS.SUBMITTED]: 'Submitted',
  [CLAIM_STATUS.RECEIVED]: 'Received',
  [CLAIM_STATUS.IN_REVIEW]: 'In Review',
  [CLAIM_STATUS.PENDING]: 'Pending',
  [CLAIM_STATUS.APPROVED]: 'Approved',
  [CLAIM_STATUS.PARTIALLY_APPROVED]: 'Partially Approved',
  [CLAIM_STATUS.DENIED]: 'Denied',
  [CLAIM_STATUS.APPEALED]: 'Appealed',
  [CLAIM_STATUS.CLOSED]: 'Closed',
  [CLAIM_STATUS.VOIDED]: 'Voided',
};

export const CLAIM_STATUS_VARIANTS = {
  [CLAIM_STATUS.SUBMITTED]: 'info',
  [CLAIM_STATUS.RECEIVED]: 'info',
  [CLAIM_STATUS.IN_REVIEW]: 'warning',
  [CLAIM_STATUS.PENDING]: 'warning',
  [CLAIM_STATUS.APPROVED]: 'success',
  [CLAIM_STATUS.PARTIALLY_APPROVED]: 'warning',
  [CLAIM_STATUS.DENIED]: 'error',
  [CLAIM_STATUS.APPEALED]: 'info',
  [CLAIM_STATUS.CLOSED]: 'neutral',
  [CLAIM_STATUS.VOIDED]: 'neutral',
};

// ============================================
// Document Categories
// ============================================
export const DOCUMENT_CATEGORIES = {
  EOB: 'eob',
  ID_CARD: 'id_card',
  PLAN_DOCUMENT: 'plan_document',
  BENEFIT_SUMMARY: 'benefit_summary',
  PRIOR_AUTH: 'prior_auth',
  CORRESPONDENCE: 'correspondence',
  TAX_FORM: 'tax_form',
  FORMULARY: 'formulary',
  PROVIDER_DIRECTORY: 'provider_directory',
  OTHER: 'other',
};

export const DOCUMENT_CATEGORY_LABELS = {
  [DOCUMENT_CATEGORIES.EOB]: 'Explanation of Benefits',
  [DOCUMENT_CATEGORIES.ID_CARD]: 'ID Card',
  [DOCUMENT_CATEGORIES.PLAN_DOCUMENT]: 'Plan Document',
  [DOCUMENT_CATEGORIES.BENEFIT_SUMMARY]: 'Benefit Summary',
  [DOCUMENT_CATEGORIES.PRIOR_AUTH]: 'Prior Authorization',
  [DOCUMENT_CATEGORIES.CORRESPONDENCE]: 'Correspondence',
  [DOCUMENT_CATEGORIES.TAX_FORM]: 'Tax Form',
  [DOCUMENT_CATEGORIES.FORMULARY]: 'Formulary',
  [DOCUMENT_CATEGORIES.PROVIDER_DIRECTORY]: 'Provider Directory',
  [DOCUMENT_CATEGORIES.OTHER]: 'Other',
};

// ============================================
// Coverage Types
// ============================================
export const COVERAGE_TYPES = {
  MEDICAL: 'medical',
  DENTAL: 'dental',
  VISION: 'vision',
  PHARMACY: 'pharmacy',
  BEHAVIORAL_HEALTH: 'behavioral_health',
  SUPPLEMENTAL: 'supplemental',
};

export const COVERAGE_TYPE_LABELS = {
  [COVERAGE_TYPES.MEDICAL]: 'Medical',
  [COVERAGE_TYPES.DENTAL]: 'Dental',
  [COVERAGE_TYPES.VISION]: 'Vision',
  [COVERAGE_TYPES.PHARMACY]: 'Pharmacy',
  [COVERAGE_TYPES.BEHAVIORAL_HEALTH]: 'Behavioral Health',
  [COVERAGE_TYPES.SUPPLEMENTAL]: 'Supplemental',
};

export const COVERAGE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  TERMINATED: 'terminated',
};

export const COVERAGE_STATUS_LABELS = {
  [COVERAGE_STATUS.ACTIVE]: 'Active',
  [COVERAGE_STATUS.INACTIVE]: 'Inactive',
  [COVERAGE_STATUS.PENDING]: 'Pending',
  [COVERAGE_STATUS.TERMINATED]: 'Terminated',
};

// ============================================
// Support Contact Defaults
// ============================================
export const SUPPORT_CONTACT = {
  EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@horizonblue.com',
  CHAT_URL: import.meta.env.VITE_SUPPORT_CHAT || 'https://www.horizonblue.com/chat',
  PHONE: import.meta.env.VITE_SUPPORT_PHONE || '1-800-355-2583',
  HOURS: 'Monday - Friday, 8:00 AM - 8:00 PM ET',
  EMERGENCY: '911',
  NURSE_LINE: '1-800-624-2212',
};

// ============================================
// User Roles
// ============================================
export const ROLES = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
  DEPENDENT: 'DEPENDENT',
  BROKER: 'BROKER',
};

// ============================================
// Widget Type Identifiers
// ============================================
export const WIDGET_TYPES = {
  CLAIMS_SUMMARY: 'claims_summary',
  COVERAGE_OVERVIEW: 'coverage_overview',
  SPENDING_TRACKER: 'spending_tracker',
  RECENT_CLAIMS: 'recent_claims',
  ID_CARD: 'id_card',
  QUICK_LINKS: 'quick_links',
  NOTIFICATIONS: 'notifications',
  DEDUCTIBLE_PROGRESS: 'deductible_progress',
  FIND_CARE: 'find_care',
  DOCUMENTS: 'documents',
  PRIOR_AUTH_STATUS: 'prior_auth_status',
  BENEFITS_SNAPSHOT: 'benefits_snapshot',
  MESSAGE_CENTER: 'message_center',
};

// ============================================
// Glassbox Event Names
// ============================================
export const GLASSBOX_EVENTS = {
  PAGE_VIEW: 'page_view',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  SESSION_TIMEOUT: 'session_timeout',
  SESSION_EXTENDED: 'session_extended',
  CLAIM_VIEWED: 'claim_viewed',
  CLAIM_SEARCHED: 'claim_searched',
  CLAIM_FILTERED: 'claim_filtered',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_VIEWED: 'document_viewed',
  ID_CARD_VIEWED: 'id_card_viewed',
  ID_CARD_DOWNLOADED: 'id_card_downloaded',
  COVERAGE_VIEWED: 'coverage_viewed',
  BENEFITS_VIEWED: 'benefits_viewed',
  SPENDING_VIEWED: 'spending_viewed',
  PROFILE_UPDATED: 'profile_updated',
  SUPPORT_CONTACTED: 'support_contacted',
  FIND_CARE_SEARCHED: 'find_care_searched',
  PRIOR_AUTH_SUBMITTED: 'prior_auth_submitted',
  PRIOR_AUTH_VIEWED: 'prior_auth_viewed',
  NOTIFICATION_CLICKED: 'notification_clicked',
  NOTIFICATION_DISMISSED: 'notification_dismissed',
  ERROR_OCCURRED: 'error_occurred',
  WIDGET_INTERACTED: 'widget_interacted',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
};

// ============================================
// Prior Authorization Statuses
// ============================================
export const PRIOR_AUTH_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  DENIED: 'denied',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const PRIOR_AUTH_STATUS_LABELS = {
  [PRIOR_AUTH_STATUS.DRAFT]: 'Draft',
  [PRIOR_AUTH_STATUS.SUBMITTED]: 'Submitted',
  [PRIOR_AUTH_STATUS.IN_REVIEW]: 'In Review',
  [PRIOR_AUTH_STATUS.APPROVED]: 'Approved',
  [PRIOR_AUTH_STATUS.DENIED]: 'Denied',
  [PRIOR_AUTH_STATUS.EXPIRED]: 'Expired',
  [PRIOR_AUTH_STATUS.CANCELLED]: 'Cancelled',
};

// ============================================
// API Configuration
// ============================================
export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ============================================
// Application Configuration
// ============================================
export const APP = {
  NAME: import.meta.env.VITE_APP_NAME || 'Horizon Member Portal',
  GLASSBOX_ENABLED: import.meta.env.VITE_GLASSBOX_ENABLED === 'true',
};

// ============================================
// Pagination Defaults
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// ============================================
// Date Formats
// ============================================
export const DATE_FORMATS = {
  DISPLAY: 'MM/DD/YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'MM/DD/YYYY h:mm A',
  MONTH_YEAR: 'MMMM YYYY',
  SHORT_MONTH_DAY: 'MMM D',
  FULL: 'MMMM D, YYYY',
};

// ============================================
// Local Storage Keys
// ============================================
export const STORAGE_KEYS = {
  THEME: 'horizon_theme',
  LANGUAGE: 'horizon_language',
  WIDGET_LAYOUT: 'horizon_widget_layout',
  NOTIFICATION_PREFERENCES: 'horizon_notification_prefs',
  RECENT_SEARCHES: 'horizon_recent_searches',
  DISMISSED_ALERTS: 'horizon_dismissed_alerts',
};