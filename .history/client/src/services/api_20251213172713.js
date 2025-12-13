// src/services/api.js
// Auto-detect environment for API base URL
const isProduction = window.location.hostname.includes('vercel.app');
const API_BASE_URL = isProduction 
  ? '/api'  // Relative path for Vercel production
  : 'http://localhost:8000/api';  // Local development

console.log(`🌐 API Base URL: ${API_BASE_URL} (${isProduction ? 'Production' : 'Development'})`);

// Helper function for API calls - NO OTHER CHANGES
const apiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API Services - NO CHANGES
export const apiService = {
  // Health check
  healthCheck: () => apiRequest('/health'),
  
  // Test endpoint
  test: () => apiRequest('/test'),
  
  // Authentication
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  checkEmail: (email) => apiRequest(`/auth/check-email/${email}`),
  
  // Bookings
  createBooking: (bookingData) => 
    apiRequest('/bookings', 'POST', bookingData),
  
  getBooking: (bookingId) => 
    apiRequest(`/bookings/${bookingId}`),
  
  getUserBookings: (token) => 
    apiRequest('/user/bookings', 'GET', null, token),
  
  // Admin endpoints (protected)
  getAllBookings: (token) => 
    apiRequest('/bookings', 'GET', null, token),
  
  updateBookingStatus: (bookingId, statusData, token) =>
    apiRequest(`/bookings/${bookingId}/status`, 'PATCH', statusData, token),
  
  getDashboardAnalytics: (token) =>
    apiRequest('/analytics/dashboard', 'GET', null, token),
};