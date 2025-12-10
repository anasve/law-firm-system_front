import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert } from '@mui/material';
import { WelcomeBanner, StyledTextField, StyledButton } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { profileService } from '../services';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await profileService.updateProfile(profile);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Typography variant="h4" fontWeight="bold">
          My Profile
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          Manage your account information
        </Typography>
      </WelcomeBanner>

      <Paper sx={{ p: 4, backgroundColor: colors.lightBlack, color: colors.white }}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label="Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            sx={{ mb: 3 }}
          />
          <StyledTextField
            fullWidth
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            sx={{ mb: 3 }}
          />
          <StyledButton type="submit" disabled={loading}>
            Update Profile
          </StyledButton>
        </Box>
      </Paper>
    </Box>
  );
}

