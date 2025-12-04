import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, removeToken } from '../services/api';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    navigate('/');
  };

  const checkAuth = () => {
    const token = getToken();
    if (!token) {
      navigate('/');
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    loading,
    logout,
    checkAuth,
  };
};

