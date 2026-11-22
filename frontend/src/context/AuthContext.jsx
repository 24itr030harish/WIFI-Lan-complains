import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('netcare_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('netcare_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync / verify profile on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('netcare_token');
      if (savedToken) {
        try {
          const res = await authService.getProfile();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('netcare_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response.data && response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('netcare_token', receivedToken);
      localStorage.setItem('netcare_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(response.data?.message || 'Login failed.');
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response.data && response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('netcare_token', receivedToken);
      localStorage.setItem('netcare_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(response.data?.message || 'Registration failed.');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('netcare_token');
    localStorage.removeItem('netcare_user');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
