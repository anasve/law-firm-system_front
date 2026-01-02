import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { colors } from '../constants';
import { getToken } from '../services/api';

export default function ProtectedRoute({ children, redirectTo = '/admin/login' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: colors.black,
        }}
      >
        <CircularProgress sx={{ color: colors.gold }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}


