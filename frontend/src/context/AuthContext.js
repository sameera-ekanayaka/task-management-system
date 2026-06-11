import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    // Keep localStorage for UI state
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    // HTTP-only cookie is set automatically by the backend
  };

  const logout = async () => {
    try {
      // Clear server-side HTTP-only cookie
      await fetch(
        `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear local state
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);