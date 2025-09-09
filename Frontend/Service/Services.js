import axios from 'axios';

// Central axios client: backend API base URL + JWT from localStorage
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8092/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to each request so protected endpoints work
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auto-redirect to login when token expires (401 response)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ams_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// HTTP method wrappers for consistent API calls
export const getRequest = (url, config = {}) => {
  return axiosInstance.get(url, config);
};

export const postRequest = (url, data, config = {}) => {
  return axiosInstance.post(url, data, config);
};

export const putRequest = (url, data, config = {}) => {
  return axiosInstance.put(url, data, config);
};

export const deleteRequest = (url, config = {}) => {
  return axiosInstance.delete(url, config);
};

export default axiosInstance;
