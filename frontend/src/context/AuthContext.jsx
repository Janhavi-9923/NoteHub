import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('notehub_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('notehub_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('notehub_token', res.data.token);
    setUser(res.data.user);
  }

  async function signup(payload) {
    const res = await api.post('/auth/signup', payload);
    localStorage.setItem('notehub_token', res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('notehub_token');
    setUser(null);
  }

  function refreshUser(updated) {
    setUser((prev) => ({ ...prev, ...updated }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
