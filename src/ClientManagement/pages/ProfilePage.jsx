import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert, Avatar, IconButton, Grid } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { WelcomeBanner, StyledTextField, StyledButton } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { profileService } from '../services';
import { API_BASE_URL_FULL } from '../services/api';

const StyledAvatar = styled(Avatar)({
  width: 150,
  height: 150,
  border: `3px solid ${colors.gold}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    opacity: 0.8,
    transform: 'scale(1.05)',
  },
});

const HiddenInput = styled('input')({
  display: 'none',
});

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', image: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      const profileData = response.data?.data || response.data?.client || response.data || {};
      setProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        image: profileData.image || profileData.photo || '',
      });
      if (profileData.image || profileData.photo) {
        const imageUrl = (profileData.image || profileData.photo).startsWith('http') 
          ? (profileData.image || profileData.photo)
          : `${API_BASE_URL_FULL}${(profileData.image || profileData.photo).replace(/^\/storage/, '/storage')}`;
        setImagePreview(imageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setProfile({ ...profile, image: file });
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
      await fetchProfile(); // Refresh profile after update
      // Dispatch event to update sidebar profile image
      window.dispatchEvent(new Event('profileUpdated'));
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
          {/* Profile Image */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <label htmlFor="image-upload">
              <input
                accept="image/*"
                id="image-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <StyledAvatar
                  src={imagePreview || profile.image}
                  alt={profile.name || 'Profile'}
                >
                  {!imagePreview && !profile.image && profile.name?.[0]?.toUpperCase()}
                </StyledAvatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: colors.gold,
                    color: colors.black,
                    '&:hover': { bgcolor: colors.darkGold },
                  }}
                  component="span"
                >
                  <PhotoCameraIcon />
                </IconButton>
              </Box>
            </label>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
              Click to upload profile picture
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <StyledButton type="submit" disabled={loading}>
              Update Profile
            </StyledButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

