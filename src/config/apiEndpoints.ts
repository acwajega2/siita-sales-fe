// src/config/apiEndpoints.ts

const API_BASE_URL = 'http://51.20.115.225:8008/api'; // Base URL for all API endpoints

// Authentication-related endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  VALIDATE: `${API_BASE_URL}/auth/validate`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  // Additional authentication-related endpoints can be added here
};

// Branch-related endpoints
export const BRANCH_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/v1/branches`,
  GET_BY_ID: (branchId: number) => `${API_BASE_URL}/v1/branches/${branchId}`,
  LIST: `${API_BASE_URL}/v1/branches`,
  UPDATE: (branchId: number) => `${API_BASE_URL}/v1/branches/${branchId}`,
  DELETE: (branchId: number) => `${API_BASE_URL}/v1/branches/${branchId}`,
  PROFITS: `${API_BASE_URL}/v1/branches/profits`,
};

// Staff-related endpoints
export const STAFF_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/v1/staff`,
  GET_BY_ID: (staffId: number) => `${API_BASE_URL}/v1/staff/${staffId}`,
  LIST: `${API_BASE_URL}/v1/staff`,
  UPDATE: (staffId: number) => `${API_BASE_URL}/v1/staff/${staffId}`,
  DELETE: (staffId: number) => `${API_BASE_URL}/v1/staff/${staffId}`,
  BY_BRANCH_CODE: (branchCode: string) => `${API_BASE_URL}/v1/staff/by-branch-code/${branchCode}`,
  BY_PHONE: (phoneNumber: string) => `${API_BASE_URL}/v1/staff/by-phone/${phoneNumber}`,
};

// Daily expenses-related endpoints
export const EXPENSES_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/v1/dailyExpenses`,
  GET_BY_ID: (expenseId: number) => `${API_BASE_URL}/v1/dailyExpenses/${expenseId}`,
  LIST: `${API_BASE_URL}/v1/dailyExpenses`,
  UPDATE: (expenseId: number) => `${API_BASE_URL}/v1/dailyExpenses/${expenseId}`,
  DELETE: (expenseId: number) => `${API_BASE_URL}/v1/dailyExpenses/${expenseId}`,
  BY_BRANCH_CODE: (branchCode: string) => `${API_BASE_URL}/v1/dailyExpenses/branch-expenses/${branchCode}`,
  BRANCH_EXPENSES: `${API_BASE_URL}/v1/dailyExpenses/branch-expenses`,
  BRANCH_EXPENSES_PERFORMANCE: `${API_BASE_URL}/v1/dailyExpenses/branch-expenses-performance`,
};

// Sales-related endpoints
export const SALES_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/v1/dailySales`,
  GET_BY_ID: (salesId: number) => `${API_BASE_URL}/v1/dailySales/${salesId}`,
  LIST: `${API_BASE_URL}/v1/dailySales`,
  UPDATE: (salesId: number) => `${API_BASE_URL}/v1/dailySales/${salesId}`,
  DELETE: (salesId: number) => `${API_BASE_URL}/v1/dailySales/${salesId}`,
  BRANCH_SALES: `${API_BASE_URL}/v1/dailySales/branch-sales`,
  SALES_BY_PHONE: (phoneNumber: string) => `${API_BASE_URL}/v1/dailySales/sales-by-phone?phoneNumber=${phoneNumber}`,
  BRANCH_SALES_BY_CODE: (branchCode: string) => `${API_BASE_URL}/v1/dailySales/branch-sales/${branchCode}`, // New endpoint for fetching sales by branch code
  BRANCH_PERFORMANCE: `${API_BASE_URL}/v1/dailySales/branch-performance`,
  BEST_PERFORMING_STAFF: `${API_BASE_URL}/v1/dailySales/best-performing-staff`,
};

// Health-related endpoints
export const HEALTH_ENDPOINTS = {
  CHECK: `/health`,
};

// User-related endpoints (adjusted based on the typical use cases)
export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/user/profile`,
  UPDATE: `${API_BASE_URL}/user/update`,
  // Additional user-related endpoints can be added here
};

// Product-related endpoints (not mentioned in the backend but kept for completeness)
export const PRODUCT_ENDPOINTS = {
  LIST: `${API_BASE_URL}/products/list`,
  DETAIL: `${API_BASE_URL}/products/detail`,
  // Additional product-related endpoints can be added here
};

// Exporting all endpoints together
const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  BRANCH: BRANCH_ENDPOINTS,
  STAFF: STAFF_ENDPOINTS,
  EXPENSES: EXPENSES_ENDPOINTS,
  SALES: SALES_ENDPOINTS,
  HEALTH: HEALTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  PRODUCT: PRODUCT_ENDPOINTS,
};

export default ENDPOINTS;
