const API_BASE_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:5000/api';

// Cookie utilities
const setCookie = (name, value, days = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};

const getCookie = (name) => {
  if (typeof window !== 'undefined') {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

const deleteCookie = (name) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};

// Get token from localStorage and cookies
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || getCookie('token');
  }
  return null;
};

// Set token to localStorage and cookies
const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    setCookie('token', token, 7); // 7 days expiry
  }
};

// Remove token from localStorage and cookies
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    deleteCookie('token');
  }
};

// Base API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle different types of body data
  if (options.body instanceof FormData) {
    // For FormData, don't set Content-Type (let browser set it with boundary)
    // Keep the FormData as is
  } else if (options.body && typeof options.body === 'object') {
    // For regular objects, stringify and set JSON content type
    config.body = JSON.stringify(options.body);
    config.headers['Content-Type'] = 'application/json';
  } else if (options.body) {
    // For other body types (like already stringified JSON), add JSON content type
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth API calls
export const auth = {
  login: async (email, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      setToken(response.data.token);
    }

    return response;
  },

  register: async (userData) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      setToken(response.data.token);
    }

    return response;
  },

  getCurrentUser: async () => {
    return await apiCall('/auth/me');
  },

  updateProfile: async (profileData) => {
    return await apiCall('/auth/profile', {
      method: 'PUT',
      body: profileData, // Let apiCall handle FormData vs JSON
    });
  },

  logout: () => {
    removeToken();
  },
};

// Users API calls (Admin only)
export const users = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return await apiCall(`/users?${queryParams}`);
  },

  getById: async (id) => {
    return await apiCall(`/users/${id}`);
  },

  create: async (userData) => {
    return await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: userData, // Let apiCall handle FormData vs JSON
    });
  },

  delete: async (id) => {
    return await apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  logoutAll: async () => {
    return await apiCall('/users/logout-all', {
      method: 'POST',
    });
  },
};

// Clients API calls
export const clients = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return await apiCall(`/clients?${params}`);
  },

  getById: async (id) => {
    return await apiCall(`/clients/${id}`);
  },

  create: async (clientData) => {
    return await apiCall('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  update: async (id, clientData) => {
    return await apiCall(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },

  delete: async (id) => {
    return await apiCall(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return await apiCall('/clients/stats/dashboard');
  },

  getDashboardMetrics: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await apiCall(`/clients/dashboard-metrics?${params}`);
  },
};

// Lead Forms API calls
export const leadForms = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    if (filters.bank && Array.isArray(filters.bank)) {
      params.set('bank', filters.bank.join(','));
    }
    if (filters.cardType && Array.isArray(filters.cardType)) {
      params.set('cardType', filters.cardType.join(','));
    }
    if (filters.status && Array.isArray(filters.status)) {
      params.set('status', filters.status.join(','));
    }

    return await apiCall(`/lead-forms?${params.toString()}`);
  },

  getById: async (id) => {
    return await apiCall(`/lead-forms/${id}`);
  },

  create: async (formData) => {
    return await apiCall('/lead-forms', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await apiCall('/lead-forms/bulk-upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  update: async (id, leadFormData) => {
    return await apiCall(`/lead-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadFormData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  delete: async (id) => {
    return await apiCall(`/lead-forms/${id}`, {
      method: 'DELETE',
    });
  },

  getUnstructured: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    if (filters.status && Array.isArray(filters.status)) {
      params.set('status', filters.status.join(','));
    }

    return await apiCall(
      `/lead-forms/unstructured-lead-forms?${params.toString()}`
    );
  },

  updateUnstructured: async (id, leadFormData) => {
    console.log(id);
    return await apiCall(`/lead-forms/unstructured-lead-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadFormData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await apiCall('/lead-forms/unstructured-lead-forms/upload-file', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  deleteUnstructured: async (id) => {
    return await apiCall(`/lead-forms/unstructured-lead-forms/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return await apiCall('/lead-forms/stats/dashboard');
  },

  downloadFile: async (filename, originalName) => {
    try {
      console.log(123, filename);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lead-forms/files/${filename}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('File download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  },
};

// lookups API calls
export const lookups = {
  lookup: async (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (!cleanNumber || cleanNumber.length < 4) {
      throw new Error('Card number must be at least 4 digits');
    }

    console.log(cardNumber);

    return await apiCall(`/lookups?number=${cleanNumber}`, {
      method: 'GET',
    });
  },
};

// userFiles API calls
export const userFiles = {
  // Upload file for a specific user
  upload: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await apiCall(
      `/user-files/upload/${userId}`,
      {
        method: 'POST',
        body: formData,
      },
      true
    );
  },

  getFiles: async (userId) => {
    return await apiCall(`/user-files/${userId}`, {
      method: 'GET',
    });
  },

  download: async (id, filename) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-files/download/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) throw new Error('File download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'downloaded-file';
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  },

  delete: async (id) => {
    return await apiCall(`/user-files/${id}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const utils = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated: () => !!getToken(),
};

export default {
  auth,
  users,
  clients,
  leadForms,
  lookups,
  userFiles,
  utils,
};
