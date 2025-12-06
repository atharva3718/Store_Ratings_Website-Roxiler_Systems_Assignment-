import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('auth', JSON.stringify({ user: data.user }));
            setLoading(false);
            return;
          }
        }
      } catch {}
      try {
        const raw = localStorage.getItem('auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.user) setUser(parsed.user);
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const login = async ({ email, password, role }) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role })
    });
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const msg = (data && data.message) || 'Login failed';
      throw new Error(msg);
    }
    const nextUser = data.user;
    setUser(nextUser);
    localStorage.setItem('auth', JSON.stringify({ user: nextUser }));
    return nextUser;
  };

  const logout = () => {
    fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' }).finally(() => {
      setUser(null);
      localStorage.removeItem('auth');
    });
  };

  const value = { user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);

