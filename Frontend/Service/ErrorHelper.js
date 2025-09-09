// Error handling utilities for consistent error message extraction

// Extract user-friendly error message from Axios error response
export const extractError = (error, fallback = 'An unexpected error occurred') => {
  // If error.response.data is a string, use it directly
  if (error.response?.data && typeof error.response.data === 'string') {
    return error.response.data;
  }
  
  // If error.response.data is an object with message property, use that
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // If error.response.data is an object but no message, try to extract from other common fields
  if (error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.description) return data.description;
  }
  
  // Fall back to error.message or provided fallback
  return error.message || fallback;
};

// Check if error is 404 (not found)
export const isNotFoundError = (error) => {
  return error.response?.status === 404;
};

// Check if error is 400 (bad request)
export const isBadRequestError = (error) => {
  return error.response?.status === 400;
};

// Check if error is 401 (unauthorized)
export const isUnauthorizedError = (error) => {
  return error.response?.status === 401;
};

// Check if error is 500+ (server error)
export const isServerError = (error) => {
  return error.response?.status >= 500;
};
