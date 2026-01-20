import React, { useState, useEffect } from 'react';
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
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GavelIcon from '@mui/icons-material/Gavel';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import ClassIcon from '@mui/icons-material/Class';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, removeToken, getToken } from './services/api';
import { API_BASE_URL_FULL } from './constants/api';
import { colors } from './constants';
import NotificationBell from './components/notifications/NotificationBell';

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
  { text: 'Home', icon: <PieChartIcon />, path: '/dashboard' },
  { text: 'Lawyers', icon: <GavelIcon />, path: '/lawyers' },
  { text: 'Employees', icon: <BusinessCenterOutlinedIcon />, path: '/employees' },
  { text: 'Job Applications', icon: <WorkOutlineIcon />, path: '/job-applications' },
  { text: 'Laws Management', icon: <GavelIcon />, path: '/laws-management' },
  { text: 'Specializations', icon: <ClassIcon />, path: '/specializations' },
  { text: 'Edit Profile', icon: <AccountCircleIcon />, path: '/profile-edit' },
];

export default function GoldenSidebar() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAdminProfile();
    
    // Listen for profile update events
    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await api.get('/profile');
      const profileData = response.data?.admin || response.data?.data || response.data || {};
      setAdminProfile({
        name: profileData.name || '',
        photo: profileData.photo || null,
      });
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
    }
  };

  const getProfileImageUrl = () => {
    if (!adminProfile?.photo) return null;
    // If it's already a full URL, return as is
    if (adminProfile.photo.startsWith('http')) {
      return adminProfile.photo;
    }
    // Otherwise, build the full URL
    const baseUrl = API_BASE_URL_FULL || 'http://localhost:8000';
    return `${baseUrl.replace('/api', '')}${adminProfile.photo.startsWith('/') ? '' : '/'}${adminProfile.photo.replace(/^\/storage/, 'storage')}`;
  };

  const isPathActive = (path) => {
    if (path === '/') {
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
      navigate('/');
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
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: `linear-gradient(180deg, ${colors.gold} 0%, ${alpha(colors.gold, 0.7)} 100%)`,
          borderRadius: '10px',
          border: `2px solid ${colors.black}`,
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: colors.gold,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Avatar 
            src={getProfileImageUrl()} 
            sx={{ 
              bgcolor: colors.gold, 
              width: 48, 
              height: 48, 
              mr: 2,
              border: `2px solid ${alpha(colors.gold, 0.3)}`,
            }}
          >
            {!getProfileImageUrl() && (
              <SchoolIcon sx={{ fontSize: 30, color: colors.black }} />
            )}
            {getProfileImageUrl() && adminProfile?.name && (
              <Typography sx={{ color: colors.black, fontWeight: 'bold', fontSize: '1.2rem' }}>
                {adminProfile.name.charAt(0).toUpperCase()}
              </Typography>
            )}
          </Avatar>
          <Typography variant="h6" fontWeight="bold" color={colors.white} fontFamily="Arial, sans-serif">
            Admin Dashboard
          </Typography>
        </Box>
        <NotificationBell />
      </Box>

      <List 
        component="nav" 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${colors.gold} 0%, ${alpha(colors.gold, 0.7)} 100%)`,
            borderRadius: '10px',
            border: `2px solid ${colors.black}`,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: colors.gold,
          },
        }}
      >
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
