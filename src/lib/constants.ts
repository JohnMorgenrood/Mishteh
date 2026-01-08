// Constants used throughout the application

export const APP_NAME = 'MISHTEH';
export const APP_DESCRIPTION = 'Connecting donors with people in need';

// Legacy categories (for backward compatibility with existing requests)
export const LEGACY_CATEGORIES = [
  { value: 'FOOD', label: 'Food (Legacy)' },
  { value: 'RENT', label: 'Rent (Legacy)' },
  { value: 'BILLS', label: 'Bills (Legacy)' },
  { value: 'FAMILY_SUPPORT', label: 'Family Support (Legacy)' },
  { value: 'MEDICAL', label: 'Medical (Legacy)' },
  { value: 'EDUCATION', label: 'Education (Legacy)' },
  { value: 'OTHER', label: 'Other (Legacy)' },
];

// Request categories organized by main category
export const REQUEST_CATEGORY_GROUPS = [
  {
    group: 'Legacy Categories',
    description: 'Original categories (for existing requests)',
    categories: [
      { value: 'FOOD', label: 'Food' },
      { value: 'RENT', label: 'Rent' },
      { value: 'BILLS', label: 'Bills' },
      { value: 'FAMILY_SUPPORT', label: 'Family Support' },
      { value: 'MEDICAL', label: 'Medical' },
      { value: 'EDUCATION', label: 'Education' },
    ],
  },
  {
    group: 'Basic Needs',
    description: 'Essential support for daily living',
    categories: [
      { value: 'FOOD_GROCERIES', label: 'Food & Groceries' },
      { value: 'RENT_HOUSING', label: 'Rent / Housing Support' },
      { value: 'UTILITIES', label: 'Utilities (Water, Electricity, Gas)' },
      { value: 'CLOTHING_ESSENTIALS', label: 'Clothing & Essentials' },
      { value: 'TRANSPORTATION', label: 'Transportation (Bus Fare, Gas, Repairs)' },
    ],
  },
  {
    group: 'Family & Children',
    description: 'Support for families facing hardship',
    categories: [
      { value: 'SINGLE_PARENTS', label: 'Single Parents' },
      { value: 'CHILDCARE_SCHOOL', label: 'Childcare / School Supplies' },
      { value: 'NEWBORN_BABY', label: 'Newborn / Baby Needs' },
      { value: 'ADOPTION_FOSTER', label: 'Adoption & Foster Care Support' },
      { value: 'FAMILY_EMERGENCY', label: 'Family Emergencies' },
    ],
  },
  {
    group: 'Health & Medical',
    description: 'Physical, mental, and emotional well-being',
    categories: [
      { value: 'MEDICAL_BILLS', label: 'Medical Bills & Treatment' },
      { value: 'PRESCRIPTION_MEDS', label: 'Prescription Medications' },
      { value: 'DISABILITY_SUPPORT', label: 'Disability Support' },
      { value: 'MENTAL_HEALTH', label: 'Mental Health Care / Counseling' },
      { value: 'THERAPY_REHAB', label: 'Therapy or Rehabilitation' },
    ],
  },
  {
    group: 'Education & Career',
    description: 'Helping people grow, learn, or find work',
    categories: [
      { value: 'TUITION_FEES', label: 'Tuition / School Fees' },
      { value: 'BOOKS_SUPPLIES', label: 'Books & Supplies' },
      { value: 'VOCATIONAL_TRAINING', label: 'Vocational Training / Courses' },
      { value: 'JOB_ASSISTANCE', label: 'Job Search & Interview Assistance' },
      { value: 'TECHNOLOGY_LEARNING', label: 'Technology for Learning' },
    ],
  },
  {
    group: 'Elderly & Retired',
    description: 'Special support for seniors',
    categories: [
      { value: 'RETIREMENT_SUPPORT', label: 'Retirement Support / Living Expenses' },
      { value: 'MOBILITY_EQUIPMENT', label: 'Medical & Mobility Equipment' },
      { value: 'HOME_CARE', label: 'Home Care & Assistance' },
      { value: 'SENIOR_SOCIAL_SUPPORT', label: 'Social Support / Companionship' },
    ],
  },
  {
    group: 'Emergency & Crisis Relief',
    description: 'Urgent and unexpected life events',
    categories: [
      { value: 'NATURAL_DISASTER', label: 'Natural Disasters (Flood, Fire, Storm)' },
      { value: 'ACCIDENT_INJURY', label: 'Accidents or Injuries' },
      { value: 'DOMESTIC_VIOLENCE', label: 'Domestic Violence & Safe Housing' },
      { value: 'FUNERAL_SUPPORT', label: 'Funeral or Bereavement Support' },
      { value: 'LEGAL_AID_CRISIS', label: 'Legal Aid for Crisis Situations' },
    ],
  },
  {
    group: 'Community & Social Causes',
    description: 'Requests that benefit groups',
    categories: [
      { value: 'NEIGHBORHOOD_PROJECT', label: 'Neighborhood Improvement Projects' },
      { value: 'COMMUNITY_FOOD_DRIVE', label: 'Community Food Drives / Pantries' },
      { value: 'YOUTH_PROGRAMS', label: 'Youth & After-School Programs' },
      { value: 'CULTURAL_RELIGIOUS', label: 'Cultural / Religious Initiatives' },
      { value: 'VOLUNTEER_NONPROFIT', label: 'Volunteer & Nonprofit Support' },
    ],
  },
  {
    group: 'Animals & Pets',
    description: 'Support for pets and animals',
    categories: [
      { value: 'PET_FOOD_SUPPLIES', label: 'Pet Food & Supplies' },
      { value: 'EMERGENCY_VET_CARE', label: 'Emergency Vet Care' },
      { value: 'ANIMAL_RESCUE', label: 'Animal Rescue / Adoption Programs' },
      { value: 'FARM_ANIMAL_AID', label: 'Farm Animal Assistance' },
    ],
  },
  {
    group: 'Disabled & Special Needs',
    description: 'Inclusivity and accessibility support',
    categories: [
      { value: 'ADAPTIVE_EQUIPMENT', label: 'Adaptive Equipment (Wheelchairs, Hearing Aids)' },
      { value: 'HOME_MODIFICATIONS', label: 'Accessible Home Modifications' },
      { value: 'DISABLED_TRANSPORT', label: 'Transportation for Disabled Persons' },
      { value: 'SUPPORT_ANIMALS', label: 'Support Animals & Training' },
    ],
  },
  {
    group: 'Veterans & Service Members',
    description: 'Honoring those who served',
    categories: [
      { value: 'VETERAN_HOUSING', label: 'Reintegration & Housing Assistance' },
      { value: 'PTSD_COUNSELING', label: 'PTSD & Counseling Support' },
      { value: 'VETERAN_JOB_PLACEMENT', label: 'Job Placement & Education' },
      { value: 'VETERAN_FAMILY_AID', label: 'Veteran Family Aid' },
    ],
  },
  {
    group: 'Entrepreneurship & Small Business',
    description: 'Helping people become self-sufficient',
    categories: [
      { value: 'STARTUP_GRANT', label: 'Startup / Business Grants' },
      { value: 'BUSINESS_TOOLS', label: 'Tools or Equipment Purchase' },
      { value: 'BUSINESS_LICENSING', label: 'Licensing / Registration Fees' },
      { value: 'BUSINESS_TRAINING', label: 'Marketing & Business Training' },
    ],
  },
  {
    group: 'Housing & Homelessness',
    description: 'Shelter and safety focus',
    categories: [
      { value: 'EMERGENCY_SHELTER', label: 'Emergency Shelter' },
      { value: 'HOME_REPAIRS', label: 'Home Repairs / Maintenance' },
      { value: 'MOVING_ASSISTANCE', label: 'Moving Assistance' },
      { value: 'EVICTION_PREVENTION', label: 'Rent Deposits / Eviction Prevention' },
    ],
  },
  {
    group: 'Immigrants & Refugees',
    description: 'Helping newcomers find stability',
    categories: [
      { value: 'RELOCATION_COSTS', label: 'Relocation & Resettlement Costs' },
      { value: 'LEGAL_DOCUMENTATION', label: 'Legal Documentation Fees' },
      { value: 'LANGUAGE_INTEGRATION', label: 'Language Classes / Integration Support' },
      { value: 'REFUGEE_EMERGENCY', label: 'Emergency Housing / Food for Refugees' },
    ],
  },
  {
    group: 'Special Situations',
    description: 'Unique or custom requests',
    categories: [
      { value: 'JOB_LOSS_HARDSHIP', label: 'Lost Job / Temporary Financial Hardship' },
      { value: 'TRAVEL_EMERGENCY', label: 'Travel for Medical or Family Emergencies' },
      { value: 'UNEXPECTED_EXPENSES', label: 'Unexpected Expenses (Repairs, Theft, etc.)' },
    ],
  },
] as const;

// Flat list of all categories for backward compatibility
export const REQUEST_CATEGORIES: Array<{ value: string; label: string }> = REQUEST_CATEGORY_GROUPS.flatMap(group => 
  group.categories.map(cat => ({ value: cat.value, label: cat.label }))
);

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
