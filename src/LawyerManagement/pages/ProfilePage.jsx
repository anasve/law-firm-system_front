import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { WelcomeBanner, StyledTextField, StyledButton } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { profileService } from '../services';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await profileService.getProfile();
      console.log('Profile response:', response);
      console.log('Profile data:', response.data);
      
      // Handle different response formats
      const profileData = response.data?.data || response.data?.lawyer || response.data || {};
      
      // Ensure all fields have default values to avoid controlled/uncontrolled warning
      setProfile({
        name: profileData.name || '',
        email: profileData.email || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await profileService.updateProfile(profile);
      setSuccess('Profile updated successfully');
      // Refresh profile after update
      await fetchProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography sx={{ color: colors.white }}>Loading profile...</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Name"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              sx={{ mb: 3 }}
              required
            />
            <StyledTextField
              fullWidth
              label="Email"
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              sx={{ mb: 3 }}
              required
            />
            <StyledButton type="submit">
              Update Profile
            </StyledButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

