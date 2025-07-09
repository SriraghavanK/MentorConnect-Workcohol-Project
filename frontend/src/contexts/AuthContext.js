"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, isAuthenticated, userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function extractUserProfile(profileData) {
  // Handles: array, results array, or single object
  if (Array.isArray(profileData) && profileData.length > 0) {
    return profileData[0];
  }
  if (profileData.results && Array.isArray(profileData.results) && profileData.results.length > 0) {
    return profileData.results[0];
  }
  return profileData;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // Fetch user profile to get user_type and other details
          const profileData = await userAPI.getProfile();
          const userProfile = extractUserProfile(profileData);
          setUser({ 
            isAuthenticated: true,
            ...userProfile
          });
        }
      } catch (error) {
        // Clear invalid tokens
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login(credentials);
      
      // Store refresh token
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }
      
      // Fetch user profile after successful login
      const profileData = await userAPI.getProfile();
      const userProfile = extractUserProfile(profileData);
      
      // Set user state with full profile data
      setUser({ 
        isAuthenticated: true,
        ...userProfile
      });
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register(userData);
      
      // Optionally auto-login after registration
      if (response.access) {
        // Fetch user profile after registration
        const profileData = await userAPI.getProfile();
        const userProfile = extractUserProfile(profileData);
        
        setUser({ 
          isAuthenticated: true,
          ...userProfile
        });
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 