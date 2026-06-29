'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { auth } from '@/lib/api';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [socket, setSocket] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        { withCredentials: true }
      );

      newSocket.on('connect', () => {
        console.log('Connected to socket:', newSocket.id);
        newSocket.emit('registerUser', user._id || user.id);
      });

      newSocket.on('forceLogout', ({ timestamp }) => {
        console.log('Received forceLogout at', timestamp);
        logout();
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await auth.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Invalid token, clear it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // Do NOT toggle the global `loading` here: it gates the whole app's render
    // (LayoutWrapper shows a full-screen spinner), which unmounts & remounts the
    // login page and wipes the OTP step state. The login page has its own local
    // button-loading state.
    try {
      const response = await auth.login(email, password);
      console.log('[AUTH] login() got response:', response);

      if (response.success) {
        // Agents must verify an OTP before they're authenticated
        if (response.otpRequired) {
          console.log('[AUTH] otpRequired TRUE -> returning otp result to page');
          return {
            success: true,
            otpRequired: true,
            email: response.data?.email || email,
            centralized: !!response.data?.centralized,
            message: response.message,
          };
        }

        console.log('[AUTH] no otpRequired -> admin/direct login path');
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        console.log('[AUTH] login failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.log('[AUTH] login() threw error:', error?.message, error);
      return { success: false, message: error.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    // Same as login(): keep the global loading flag untouched so the page
    // doesn't remount mid-flow.
    try {
      const response = await auth.verifyOtp(email, otp);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await auth.resendOtp(email);
      return {
        success: !!response.success,
        message: response.message,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await auth.register(userData);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    verifyOtp,
    resendOtp,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
