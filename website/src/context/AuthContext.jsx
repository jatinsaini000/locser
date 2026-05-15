import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('appMode') || 'consumer';
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('appMode');
    setUser(null);
    setAppMode('consumer');
  };

  const toggleAppMode = () => {
    const newMode = appMode === 'consumer' ? 'provider' : 'consumer';
    setAppMode(newMode);
    localStorage.setItem('appMode', newMode);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, appMode, toggleAppMode }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
