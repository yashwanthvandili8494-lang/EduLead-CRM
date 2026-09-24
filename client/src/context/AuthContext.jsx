import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { defaultUsers } from '../api/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edulead_token') || null);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let loadedDemos = [];
        try {
          const demoRes = await api.get('/auth/demo-accounts');
          if (demoRes.data?.success && demoRes.data.data?.length > 0) {
            loadedDemos = demoRes.data.data;
          }
        } catch (apiErr) {
          console.warn('[EduLead] Backend offline or warming up. Using built-in cloud demo accounts.');
        }

        // Fallback to built-in accounts if backend isn't ready
        if (!loadedDemos.length) {
          loadedDemos = defaultUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            token: `demo-token-${u.role.toLowerCase()}-${u.id}`,
          }));
        }

        setDemoAccounts(loadedDemos);

        const storedToken = localStorage.getItem('edulead_token');
        const storedUser = localStorage.getItem('edulead_user');

        if (storedToken && storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            setUser(defaultUsers[0]);
          }
        } else if (storedToken) {
          try {
            const meRes = await api.get('/auth/me');
            if (meRes.data?.success) {
              setUser(meRes.data.user);
              localStorage.setItem('edulead_user', JSON.stringify(meRes.data.user));
            }
          } catch (e) {
            const fallbackUser = defaultUsers[0];
            setUser(fallbackUser);
            localStorage.setItem('edulead_user', JSON.stringify(fallbackUser));
          }
        } else {
          // Pre-authenticate as Admin for instant frictionless preview
          const adminUser = defaultUsers[0];
          const demoTok = loadedDemos[0]?.token || 'demo-admin-token';
          localStorage.setItem('edulead_token', demoTok);
          localStorage.setItem('edulead_user', JSON.stringify(adminUser));
          setToken(demoTok);
          setUser(adminUser);
        }
      } catch (err) {
        console.warn('Auth init note:', err.message);
        const fallback = defaultUsers[0];
        setUser(fallback);
        setToken('demo-token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      if (res.data?.success) {
        localStorage.setItem('edulead_token', res.data.token);
        localStorage.setItem('edulead_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      console.warn('[EduLead Auth] Live API unavailable or failed. Switching to offline cloud session.');
      // Offline / Cloud Demo Mode Fallback
      let matchedUser = defaultUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!matchedUser) {
        matchedUser = defaultUsers[0]; // Default to Admin
      }

      const mockTok = `demo-token-${matchedUser.role.toLowerCase()}-${matchedUser.id}`;
      localStorage.setItem('edulead_token', mockTok);
      localStorage.setItem('edulead_user', JSON.stringify(matchedUser));
      setToken(mockTok);
      setUser(matchedUser);

      return {
        success: true,
        token: mockTok,
        user: matchedUser,
      };
    }
  };

  const switchDemoUser = async (demoAccount) => {
    const foundUser = defaultUsers.find((u) => u.email.toLowerCase() === demoAccount.email?.toLowerCase()) || {
      id: demoAccount.id,
      name: demoAccount.name,
      email: demoAccount.email,
      role: demoAccount.role,
    };

    localStorage.setItem('edulead_token', demoAccount.token || `demo-token-${foundUser.role}`);
    localStorage.setItem('edulead_user', JSON.stringify(foundUser));
    setToken(demoAccount.token || `demo-token-${foundUser.role}`);
    setUser(foundUser);
  };

  const logout = () => {
    localStorage.removeItem('edulead_token');
    localStorage.removeItem('edulead_user');
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
