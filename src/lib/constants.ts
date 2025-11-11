// Constants used throughout the application

export const APP_NAME = 'MISHTEH';
export const APP_DESCRIPTION = 'Connecting donors with people in need';

// Request categories
export const REQUEST_CATEGORIES = [
  { value: 'FOOD', label: 'Food' },
  { value: 'RENT', label: 'Rent' },
  { value: 'BILLS', label: 'Bills' },
  { value: 'FAMILY_SUPPORT', label: 'Family Support' },
  { value: 'JOB_ASSISTANCE', label: 'Job Assistance' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' },
] as const;

// Urgency levels
export const URGENCY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'green' },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
  { value: 'HIGH', label: 'High', color: 'orange' },
  { value: 'CRITICAL', label: 'Critical', color: 'red' },
] as const;

// Request statuses
export const REQUEST_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PARTIALLY_FUNDED', label: 'Partially Funded' },
  { value: 'FUNDED', label: 'Funded' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
  { value: 'REJECTED', label: 'Rejected' },
] as const;

// Donation statuses
export const DONATION_STATUSES = [
  { value: 'PLEDGED', label: 'Pledged' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REFUNDED', label: 'Refunded' },
] as const;

// Document statuses
export const DOCUMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
] as const;

// User types
export const USER_TYPES = [
  { value: 'DONOR', label: 'Donor' },
  { value: 'REQUESTER', label: 'Requester' },
  { value: 'ADMIN', label: 'Admin' },
] as const;

// File upload constraints
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Quick donation amounts
export const QUICK_DONATION_AMOUNTS = [10, 25, 50, 100, 250, 500];

// Social links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/mishteh',
  twitter: 'https://twitter.com/mishteh',
  instagram: 'https://instagram.com/mishteh',
  linkedin: 'https://linkedin.com/company/mishteh',
};

// API endpoints
export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
  },
  REQUESTS: {
    LIST: '/api/requests',
    CREATE: '/api/requests',
    DETAIL: (id: string) => `/api/requests/${id}`,
    UPDATE: (id: string) => `/api/requests/${id}`,
    DELETE: (id: string) => `/api/requests/${id}`,
  },
  DONATIONS: {
    LIST: '/api/donations',
    CREATE: '/api/donations',
  },
  DOCUMENTS: {
    UPLOAD: '/api/documents',
    LIST: '/api/documents',
  },
  USER: {
    PROFILE: '/api/user/profile',
  },
  ADMIN: {
    REQUESTS: (id: string) => `/api/admin/requests/${id}`,
    DOCUMENTS: (id: string) => `/api/admin/documents/${id}`,
  },
};

// Navigation links
export const NAV_LINKS = {
  PUBLIC: [
    { href: '/', label: 'Home' },
    { href: '/requests', label: 'Requests' },
    { href: '/about', label: 'About' },
  ],
  AUTHENTICATED: [
    { href: '/dashboard', label: 'Dashboard' },
  ],
  ADMIN: [
    { href: '/admin', label: 'Admin' },
  ],
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  REGISTRATION: 'Registration successful! Please log in.',
  LOGIN: 'Logged in successfully!',
  LOGOUT: 'Logged out successfully!',
  REQUEST_CREATED: 'Request created successfully!',
  REQUEST_UPDATED: 'Request updated successfully!',
  DONATION_CREATED: 'Thank you for your donation!',
  DOCUMENT_UPLOADED: 'Document uploaded successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  TITLE_MIN_LENGTH: 5,
  DESCRIPTION_MIN_LENGTH: 20,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
