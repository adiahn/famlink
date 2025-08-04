// API Configuration
export const API_BASE_URL = 'https://famlinkbackend-1.onrender.com/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    SIGNIN: '/auth/signin',
    VERIFY_PHONE: '/auth/verify-phone',
    RESEND_VERIFICATION: '/auth/resend-verification',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  
  // Family Management
  FAMILY: {
    CREATE: '/families',
    GET_MY_FAMILY: '/families/my-family',
    ADD_MEMBER: '/families/:familyId/members',
    UPDATE_MEMBER: '/families/:familyId/members/:memberId',
    DELETE_MEMBER: '/families/:familyId/members/:memberId',
    GENERATE_JOIN_ID: '/families/:familyId/join-ids',
    LINK_FAMILY: '/families/link',
    VALIDATE_JOIN_ID: '/families/validate-join-id/:joinId',
  },
  
  // User Management
  USER: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    GET_PRIVACY_SETTINGS: '/users/privacy-settings',
    UPDATE_PRIVACY_SETTINGS: '/users/privacy-settings',
    GET_STATISTICS: '/users/statistics',
  },
  
  // Search
  SEARCH: {
    USERS: '/search/users',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Request Timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
}; 