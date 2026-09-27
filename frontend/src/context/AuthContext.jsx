import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('uzhavan_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('uzhavan_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('uzhavan_admin');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('uzhavan_user', JSON.stringify(user));
    else localStorage.removeItem('uzhavan_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('uzhavan_token', token);
    else localStorage.removeItem('uzhavan_token');
  }, [token]);

  useEffect(() => {
    if (adminUser) localStorage.setItem('uzhavan_admin', JSON.stringify(adminUser));
    else localStorage.removeItem('uzhavan_admin');
  }, [adminUser]);

  const loginUser = async (phone, role, name) => {
    const data = await api.login({ phone, role, name });
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const switchRole = (newRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const loginAdmin = async (email, password) => {
    const data = await api.adminLogin({ email, password });
    setAdminUser(data.admin);
    setToken(data.token);
    return data.admin;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
  };

  const logout = () => {
    setUser(null);
    setAdminUser(null);
    setToken('');
    localStorage.removeItem('uzhavan_user');
    localStorage.removeItem('uzhavan_token');
    localStorage.removeItem('uzhavan_admin');
  };

  return (
    <AuthContext.Provider value={{ user, adminUser, token, setUser, loginUser, switchRole, loginAdmin, logoutAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
