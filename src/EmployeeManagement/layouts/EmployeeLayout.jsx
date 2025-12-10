import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import EmployeeSidebar from '../EmployeeSidebar';
import { colors } from '../../AdminManagement/constants';
import { getToken } from '../services';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check authentication
    const token = getToken();
    if (!token) {
      navigate('/employee/login');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

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
    return null;
  }

  return (
    <Box sx={{ display: 'flex', backgroundColor: colors.black, minHeight: '100vh' }}>
      <EmployeeSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, direction: 'ltr', marginLeft: '280px' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

