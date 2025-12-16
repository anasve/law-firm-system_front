import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import PieChartIcon from '@mui/icons-material/PieChart';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import EventIcon from '@mui/icons-material/Event';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import GavelIcon from '@mui/icons-material/Gavel';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, removeToken, getToken } from './services/api';
import { colors } from '../AdminManagement/constants';
import NotificationBell from './components/NotificationBell';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '8px',
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1.5, 2),
  transition: 'background-color 0.3s ease, color 0.3s ease',
  color: alpha(colors.white, 0.6),
  '& .MuiListItemIcon-root': {
    color: alpha(colors.white, 0.6),
    transition: 'color 0.3s ease',
    minWidth: '40px',
  },
  '&:hover': {
    backgroundColor: alpha(colors.gold, 0.1),
    color: colors.gold,
    '& .MuiListItemIcon-root': { color: colors.gold },
  },
  '&.Mui-selected': {
    backgroundColor: '#2A2A2E',
    color: colors.white,
    fontWeight: 'bold',
    '& .MuiListItemIcon-root': { color: colors.white },
    '&:hover': { backgroundColor: '#2A2A2E' },
  },
}));

const menuItems = [
  { text: 'Dashboard', icon: <PieChartIcon />, path: '/lawyer/dashboard' },
  { text: 'Consultations', icon: <QuestionAnswerIcon />, path: '/lawyer/consultations' },
  { text: 'Appointments', icon: <EventIcon />, path: '/lawyer/appointments' },
  { text: 'Chat', icon: <ChatIcon />, path: '/lawyer/chat' },
  { text: 'Profile', icon: <AccountCircleIcon />, path: '/lawyer/profile' },
];

export default function LawyerSidebar() {
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPathActive = (path) => {
    if (path === '/lawyer/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = getToken();
      if (!token) {
        alert('Not logged in yet.');
        setLoggingOut(false);
        return;
      }

      await api.post('/logout', {});

      removeToken();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('An error occurred while logging out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        background: colors.black,
        boxShadow: '2px 0 16px 0 rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        flexShrink: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Avatar sx={{ bgcolor: colors.gold, width: 48, height: 48, mr: 2 }}>
            <GavelIcon sx={{ fontSize: 30, color: colors.black }} />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" color={colors.white} fontFamily="Arial, sans-serif">
            Lawyer Portal
          </Typography>
        </Box>
        <NotificationBell />
      </Box>

      <List component="nav" sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {menuItems.map((item) => (
          <StyledListItemButton
            key={item.text}
            selected={isPathActive(item.path)}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontFamily: 'Arial, sans-serif', fontWeight: 'medium' }}
            />
          </StyledListItemButton>
        ))}
      </List>

      <Box sx={{ flexShrink: 0, mt: 'auto' }}>
        <Divider sx={{ my: 1, borderColor: alpha(colors.gold, 0.2) }} />
        <StyledListItemButton onClick={handleLogout} disabled={loggingOut}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary={loggingOut ? 'Logging out...' : 'Logout'}
            primaryTypographyProps={{ fontFamily: 'Arial, sans-serif', fontWeight: 'medium' }}
          />
        </StyledListItemButton>
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          py: 2,
          color: alpha(colors.white, 0.5),
          fontFamily: 'Arial, sans-serif',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption">© {new Date().getFullYear()} All rights reserved</Typography>
      </Box>
    </Box>
  );
}

