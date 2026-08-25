/**
 * Django REST Framework API Endpoints & Configuration
 * Base URL is configurable and not hardcoded across screens.
 */

export const API_CONFIG = {
  // Can be configured via environment variable or runtime config
  BASE_URL:'http://127.0.0.1:8000/api',
  TIMEOUT_MS: 10000,
  VERSION: 'v1'
};

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login/',
  AUTH_VERIFY_OTP: '/auth/verify-otp/',
  AUTH_PROFILE: '/auth/profile/',

  // Vehicles & Pricing
  VEHICLES_LIST: '/vehicles/',
  RIDE_ESTIMATE: '/rides/estimate/',

  // Customer Rides
  RIDE_REQUEST: '/rides/request/',
  RIDE_CURRENT: '/rides/current/',
  RIDE_CANCEL: (id: string) => `/rides/${id}/cancel/`,
  RIDE_RATE: (id: string) => `/rides/${id}/rate/`,
  RIDE_HISTORY: '/rides/history/',

  // Driver Operations
  DRIVER_STATUS: '/driver/status/',
  DRIVER_PENDING_REQUESTS: '/driver/requests/',
  DRIVER_ACCEPT_RIDE: (id: string) => `/driver/rides/${id}/accept/`,
  DRIVER_DECLINE_RIDE: (id: string) => `/driver/rides/${id}/decline/`,
  DRIVER_ARRIVED: (id: string) => `/driver/rides/${id}/arrived/`,
  DRIVER_START_RIDE: (id: string) => `/driver/rides/${id}/start/`,
  DRIVER_COMPLETE_RIDE: (id: string) => `/driver/rides/${id}/complete/`,
  DRIVER_EARNINGS: '/driver/earnings/'
};
