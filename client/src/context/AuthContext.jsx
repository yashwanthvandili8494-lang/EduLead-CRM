import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edulead_token') || null);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user and demo accounts on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Fetch demo accounts for 1-click switcher
        const demoRes = await api.get('/auth/demo-accounts');
        if (demoRes.data.success) {
          setDemoAccounts(demoRes.data.data);
        }

        // If token exists, load current profile
        const storedToken = localStorage.getItem('edulead_token');
        if (storedToken) {
          const meRes = await api.get('/auth/me');
          if (meRes.data.success) {
            setUser(meRes.data.user);
          }
        } else if (demoRes.data.data && demoRes.data.data.length > 0) {
          // Default to Admin demo user for seamless first load
          const adminDemo = demoRes.data.data.find((d) => d.role === 'ADMIN') || demoRes.data.data[0];
          localStorage.setItem('edulead_token', adminDemo.token);
          setToken(adminDemo.token);
          const meRes = await api.get('/auth/me');
          if (meRes.data.success) {
            setUser(meRes.data.user);
          }
        }
      } catch (err) {
        console.warn('Auth init note:', err.message);
        localStorage.removeItem('edulead_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('edulead_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const switchDemoUser = async (demoAccount) => {
    localStorage.setItem('edulead_token', demoAccount.token);
    setToken(demoAccount.token);
    try {
      const meRes = await api.get('/auth/me');
      if (meRes.data.success) {
        setUser(meRes.data.user);
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('edulead_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoAccounts,
        login,
        logout,
        switchDemoUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isManager: user?.role === 'MANAGER' || user?.role === 'ADMIN',
        isCounsellor: user?.role === 'COUNSELLOR',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
