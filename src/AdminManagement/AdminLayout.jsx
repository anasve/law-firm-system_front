import React from 'react';
import { Outlet } from 'react-router-dom';
import GoldenSidebar from './GoldenSidebar';
import { Box } from '@mui/material';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', backgroundColor: '#141414', minHeight: '100vh' }}>
      <GoldenSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, direction: 'ltr', marginLeft: '280px' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;