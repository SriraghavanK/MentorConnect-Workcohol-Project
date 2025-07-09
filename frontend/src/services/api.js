// API Base URL - Update this to match your Django server
const API_BASE_URL = 'http://localhost:8000/api';

// Token management
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

// API request helper
const apiRequest = async (endpoint, options = {}, retry = true) => {
  const token = getToken();
  let headers = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  // If body is FormData, do not set Content-Type (browser will set it)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Read response body only once
      const responseText = await response.text();
      
      try {
        const errorData = JSON.parse(responseText);
        
        // Handle different error response formats
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Try to extract error from field-specific errors
          const fieldErrors = Object.values(errorData).flat();
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(', ');
          }
        }
      } catch (parseError) {
        if (responseText) {
          errorMessage = responseText;
        }
      }
      
      // Automatic token refresh logic
      if (
        (response.status === 401 || errorMessage.includes('Given token not valid')) &&
        retry &&
        localStorage.getItem('refresh_token')
      ) {
        try {
          await authAPI.refreshToken();
          return await apiRequest(endpoint, options, false); // retry once
        } catch (refreshError) {
          authAPI.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // For successful responses, parse as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await apiRequest('/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access) {
      setToken(response.access);
      // Also store refresh token if provided
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }
    }
    
    return response;
  },

  // Register
  register: async (userData) => {
    const response = await apiRequest('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response;
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await apiRequest('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.access) {
      setToken(response.access);
    }
    
    return response;
  },

  // Logout
  logout: () => {
    removeToken();
    localStorage.removeItem('refresh_token');
  },

  // Verify token
  verifyToken: async () => {
    return await apiRequest('/token/verify/', {
      method: 'POST',
      body: JSON.stringify({ token: getToken() }),
    });
  },
};

// Mentors API
export const mentorsAPI = {
  // Get all mentors
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiRequest(`/mentors/${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      // If no mentors exist, return empty data
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { results: [] };
      }
      throw error;
    }
  },

  // Get single mentor
  getById: async (id) => {
    return await apiRequest(`/mentors/${id}/`);
  },

  // Get mentor expertise
  getExpertise: async () => {
    try {
      return await apiRequest('/mentors/expertise/');
    } catch (error) {
      // If no expertise exists, return empty data
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { results: [] };
      }
      throw error;
    }
  },

  // Search mentors
  search: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return await mentorsAPI.getAll(params);
  },
};

// Bookings API
export const bookingsAPI = {
  // Get user's bookings
  getUserBookings: async () => {
    try {
      return await apiRequest('/bookings/');
    } catch (error) {
      // If no bookings exist, return empty data
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { results: [] };
      }
      throw error;
    }
  },

  // Get upcoming bookings
  getUpcoming: async () => {
    try {
      return await apiRequest('/bookings/upcoming/');
    } catch (error) {
      // If no bookings exist, return empty data
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { results: [] };
      }
      throw error;
    }
  },

  // Get past bookings
  getPast: async () => {
    try {
      return await apiRequest('/bookings/past/');
    } catch (error) {
      // If no bookings exist, return empty data
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { results: [] };
      }
      throw error;
    }
  },

  // Create new booking
  create: async (bookingData) => {
    return await apiRequest('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Create booking with payment intent (payment-first approach)
  createWithPayment: async (bookingData) => {
    return await apiRequest('/bookings/create-with-payment/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Confirm booking payment
  confirmPayment: async (paymentIntentId) => {
    return await apiRequest('/bookings/confirm-payment/', {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });
  },

  // Update booking
  update: async (id, bookingData) => {
    return await apiRequest(`/bookings/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },

  // Get booking by ID
  getById: async (id) => {
    return await apiRequest(`/bookings/${id}/`);
  },

  // Accept booking (mentor only)
  accept: async (id) => {
    return await apiRequest(`/bookings/${id}/accept/`, {
      method: 'POST',
    });
  },

  // Decline booking (mentor only)
  decline: async (id) => {
    return await apiRequest(`/bookings/${id}/decline/`, {
      method: 'POST',
    });
  },

  // Complete booking (mentor only)
  complete: async (id) => {
    return await apiRequest(`/bookings/${id}/complete/`, {
      method: 'POST',
    });
  },

  // Cancel booking (mentee or mentor)
  cancel: async (id) => {
    return await apiRequest(`/bookings/${id}/cancel/`, {
      method: 'POST',
    });
  },
};

// User Profile API
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    try {
      // The `me` action on the profiles endpoint returns the single profile
      const profile = await apiRequest('/users/profiles/me/');
      // The list endpoint for profiles returns all profiles for admins,
      // but only the user's own profile for regular users.
      // We wrap the single profile in the same format as the list endpoint
      // for component compatibility.
      return { results: [profile] };
    } catch (error) {
      // If no profile exists, return empty data
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { results: [] };
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      // First get the current profile to get the ID
      const profile = await apiRequest('/users/profiles/me/');
      if (!profile || !profile.id) {
        throw new Error('Profile not found');
      }
      // If profile_picture is a File or Blob, use FormData
      let hasFile = profileData.profile_picture instanceof File || profileData.profile_picture instanceof Blob;
      if (hasFile) {
        const formData = new FormData();
        for (const key in profileData) {
          if (profileData[key] !== undefined && profileData[key] !== null) {
            formData.append(key, profileData[key]);
          }
        }
        return await apiRequest(`/users/profiles/${profile.id}/`, {
          method: 'PATCH',
          body: formData,
        });
      } else {
        return await apiRequest(`/users/profiles/${profile.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(profileData),
        });
      }
    } catch (error) {
      // If profile doesn't exist, try to create it
      if (error.message.includes('404') || error.message.includes('not found')) {
        return await apiRequest('/users/profiles/', {
          method: 'POST',
          body: JSON.stringify(profileData),
        });
      }
      throw error;
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      return await apiRequest('/users/profiles/stats/');
    } catch (error) {
      // Return default stats if endpoint doesn't exist
      return {
        total_sessions: 0,
        total_hours: 0,
        unique_mentors: 0,
        average_rating: 0
      };
    }
  },
};

// Reviews API
export const reviewsAPI = {
  // Get reviews for a mentor
  getMentorReviews: async (mentorId) => {
    return await apiRequest(`/reviews/?mentor=${mentorId}`);
  },

  // Create review
  create: async (reviewData) => {
    return await apiRequest('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Update review
  update: async (id, reviewData) => {
    return await apiRequest(`/reviews/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  // Delete review
  delete: async (id) => {
    return await apiRequest(`/reviews/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const isAuthenticated = () => {
  return !!getToken();
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const paymentsAPI = {
  createPaymentIntent: async (bookingId, amount, currency) => {
    const payload = { booking_id: bookingId, amount, currency };
    return await apiRequest('/payments/create-payment-intent/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  confirmPayment: async (payment_intent_id) => {
    return await apiRequest('/payments/confirm-payment/', {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id }),
    });
  },
}; 