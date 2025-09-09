// Authentication helper functions for consistent user management

// Extract employee ID from JWT token payload
export const getEmployeeIdFromToken = () => {
  const token = localStorage.getItem('ams_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const employeeId = payload.employeeId;
    
    if (!employeeId) {
      throw new Error('No employee ID found in token');
    }
    
    return employeeId;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('Invalid authentication token');
  }
};

// Extract complete user info from JWT token payload
export const getUserInfoFromToken = () => {
  const token = localStorage.getItem('ams_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      employeeId: payload.employeeId,
      name: payload.name,
      email: payload.email || payload.sub,
      role: payload.role
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('Invalid authentication token');
  }
};

// Extract user role from JWT token (returns null if invalid)
export const getUserRoleFromToken = () => {
  const token = localStorage.getItem('ams_token');
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if user has valid authentication token
export const isAuthenticated = () => {
  try {
    getEmployeeIdFromToken();
    return true;
  } catch {
    return false;
  }
};

// Clear all auth data and redirect to login
export const clearAuth = () => {
  // Clear all auth-related data
  localStorage.removeItem('ams_token');
  localStorage.removeItem('ams_user');
  localStorage.removeItem('ams_role');
  
  // Force a hard redirect to login page to reset all state
  window.location.replace('/');
};
