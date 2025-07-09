import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('parkingUser');
    
    if (savedToken && savedUser) {
      try {
        // Verify token is still valid by fetching user profile
        const userProfile = await ApiService.getUserProfile();
        if (userProfile && userProfile.id) {
          const userWithFormattedRole = {
            ...userProfile,
            role: userProfile.role.toLowerCase()
          };
          setUser(userWithFormattedRole);
          localStorage.setItem('parkingUser', JSON.stringify(userWithFormattedRole));
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('parkingUser');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('parkingUser');
        setUser(null);
      }
    }
    
    setIsLoading(false);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email });
      
      const response = await ApiService.loginUser({ 
        email: email.trim(), 
        password: password 
      });
      
      console.log('Login response:', response);
      
      if (response && response.token && response.user) {
        // Store token
        localStorage.setItem('authToken', response.token);
        
        // Convert backend role format to frontend format and store user
        const userWithFormattedRole = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone || '',
          role: response.user.role.toLowerCase()
        };
        
        setUser(userWithFormattedRole);
        localStorage.setItem('parkingUser', JSON.stringify(userWithFormattedRole));
        
        console.log('Login successful, user set:', userWithFormattedRole);
        setIsLoading(false);
        return { success: true };
      } else {
        console.error('Invalid response structure:', response);
        setIsLoading(false);
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      setIsLoading(false);
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid email or password.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Please check your email and password.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting registration with:', { 
        name: userData.name, 
        email: userData.email 
      });
      
      const response = await ApiService.registerUser({
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password,
        phone: userData.phone || '',
        role: 'CUSTOMER' // Default role for registration
      });
      
      console.log('Registration response:', response);
      
      if (response && response.user) {
        // Auto-login after successful registration
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      } else {
        setIsLoading(false);
        return { success: false, error: 'Registration failed. Please try again.' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      setIsLoading(false);
      
      // Provide more specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        errorMessage = 'Please check your information and try again.';
      } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setError(null);
    localStorage.removeItem('parkingUser');
    localStorage.removeItem('authToken');
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};