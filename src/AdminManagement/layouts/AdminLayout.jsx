import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import GoldenSidebar from '../GoldenSidebar';
import { colors } from '../constants';

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', backgroundColor: colors.black, minHeight: '100vh' }}>
      <GoldenSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, direction: 'ltr', marginLeft: '280px' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

