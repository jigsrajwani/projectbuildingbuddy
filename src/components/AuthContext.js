import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decodedUser = jwtDecode(storedToken);
      setUser({ _id: decodedUser.id, ...decodedUser });
      setIsAuthenticated(true);
      setToken(storedToken);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    const decodedUser = jwtDecode(newToken);
    setUser({ _id: decodedUser.id, ...decodedUser });
    setIsAuthenticated(true);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);