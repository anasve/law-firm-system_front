import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Avatar, IconButton, Grid, Button, Paper,
  InputAdornment, Tooltip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import axios from 'axios';

// --- Colors ---
const colors = {
  gold: '#D4AF37',
  black: '#141414',
  lightBlack: '#232323',
  white: '#FFFFFF',
  textSecondary: alpha('#FFFFFF', 0.7),
};

// --- Styled Components ---
const SectionCard = styled(Paper)(({ theme }) => ({
  backgroundColor: colors.lightBlack,
  padding: theme.spacing(4),
  borderRadius: '16px',
  border: `1px solid ${alpha(colors.white, 0.1)}`,
  color: colors.white,
  marginBottom: theme.spacing(4),
}));

const StyledTextField = styled(TextField)({
  '& label.Mui-focused': { color: colors.gold },
  '& .MuiOutlinedInput-root': {
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.2)',
    fontFamily: 'Arial, sans-serif',
    '& fieldset': { borderColor: alpha(colors.white, 0.2) },
    '&:hover fieldset': { borderColor: alpha(colors.gold, 0.7) },
    '&.Mui-focused fieldset': { borderColor: colors.gold },
    '& .MuiSvgIcon-root': { color: colors.textSecondary }
  },
  '& .MuiInputLabel-root': {
    color: colors.textSecondary,
    fontFamily: 'Arial, sans-serif',
  }
});

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  fontFamily: 'Cairo, sans-serif',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 24px',
  backgroundColor: variant === 'contained' ? colors.gold : 'transparent',
  color: variant === 'contained' ? colors.black : colors.textSecondary,
  border: variant === 'outlined' ? `1px solid ${colors.textSecondary}` : 'none',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#B4943C' : alpha(colors.white, 0.1),
  },
  '& .MuiButton-startIcon': {
    marginRight: -4,
    marginLeft: 8
  }
}));

export default function ProfileEdit() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ fullName: "", email: "", image: null });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [imagePreview, setImagePreview] = useState(null);

  // --- Fetch profile data ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle different response structures
        const adminData = response.data.data || response.data.admin || response.data || {};
        
        console.log('Profile data received:', adminData);
        
        // Get image URL
        let imageUrl = adminData.image_url || adminData.image || adminData.photo || null;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          if (imageUrl.startsWith('/')) {
            imageUrl = `http://127.0.0.1:8000${imageUrl}`;
          } else {
            imageUrl = `http://127.0.0.1:8000/${imageUrl}`;
          }
        }
        
        setProfile({
          fullName: adminData.name || adminData.full_name || adminData.fullName || '',
          email: adminData.email || '',
          image: imageUrl
        });
        
        setImagePreview(imageUrl);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/');
        } else {
          alert('Failed to load profile data. Please try again.');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) =>
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e) =>
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClickShowPassword = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
      return;
    }

    // Validate password if provided
    if (passwords.new || passwords.confirm || passwords.current) {
      if (!passwords.current) {
        alert('Please enter your current password to change it.');
        return;
      }
      if (!passwords.new) {
        alert('Please enter a new password.');
        return;
      }
      if (passwords.new !== passwords.confirm) {
        alert('New password and confirm password do not match.');
        return;
      }
      if (passwords.new.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('name', profile.fullName || '');
      formData.append('email', profile.email || '');
      
      // Only add password fields if they are provided
      if (passwords.current && passwords.new) {
        formData.append('current_password', passwords.current);
        formData.append('password', passwords.new);
        formData.append('password_confirmation', passwords.confirm);
      }
      
      // Only add image if it's a new file
      if (profile.image && profile.image instanceof File) {
        formData.append('image', profile.image);
      }

      // Use POST with _method=PUT for Laravel compatibility
      formData.append('_method', 'PUT');

      console.log('Sending profile update:', {
        name: profile.fullName,
        email: profile.email,
        hasPassword: !!(passwords.current && passwords.new),
        hasImage: profile.image instanceof File
      });

      const response = await axios.post(
        'http://127.0.0.1:8000/api/admin/profile',
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      console.log('Profile update response:', response.data);

      alert("Changes saved successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      
      // Refresh profile data
      const refreshResponse = await axios.get('http://127.0.0.1:8000/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const adminData = refreshResponse.data.data || refreshResponse.data.admin || refreshResponse.data || {};
      console.log('Refreshed profile data:', adminData);
      
      let imageUrl = adminData.image_url || adminData.image || adminData.photo || null;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        if (imageUrl.startsWith('/')) {
          imageUrl = `http://127.0.0.1:8000${imageUrl}`;
        } else {
          imageUrl = `http://127.0.0.1:8000/${imageUrl}`;
        }
      }
      
      setProfile({
        fullName: adminData.name || adminData.full_name || adminData.fullName || '',
        email: adminData.email || '',
        image: imageUrl
      });
      setImagePreview(imageUrl);

    } catch (error) {
      console.error("Error saving changes:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Failed to save changes. Please check your data.";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          const errors = errorData.errors;
          const errorMessages = [];
          Object.keys(errors).forEach(key => {
            if (Array.isArray(errors[key])) {
              errorMessages.push(...errors[key]);
            } else {
              errorMessages.push(errors[key]);
            }
          });
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
        }
      }
      alert(errorMessage);
    }
  };

  const handleCancel = () => setPasswords({ current: "", new: "", confirm: "" });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, fontFamily: 'Arial, sans-serif', direction: 'ltr' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: colors.white, mb: 4, textAlign: 'center' }}>
        Edit Profile
      </Typography>

      <form onSubmit={handleSave}>
        <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* User Image */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box position="relative" display="inline-block" mb={2}>
              <Avatar 
                src={imagePreview || profile.image} 
                sx={{ width: 120, height: 120, bgcolor: colors.gold, fontSize: 48, color: colors.black }}
              >
                {profile.fullName ? profile.fullName.split(" ").map(w => w[0]).join("").slice(0, 2) : 'A'}
              </Avatar>
              <IconButton 
                component="label" 
                sx={{ position: 'absolute', bottom: 5, left: 5, bgcolor: alpha(colors.black, 0.7), '&:hover': { bgcolor: colors.black } }}
              >
                <PhotoCameraIcon sx={{ color: colors.gold }} />
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setProfile(prev => ({ ...prev, image: file }));
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </IconButton>
            </Box>
            <Typography fontWeight="bold" variant="h6" sx={{ color: colors.white }}>
              {profile.fullName || 'Admin User'}
            </Typography>
          </Box>

          {/* Personal Information */}
          <SectionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.gold, mb: 3 }}>Personal Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StyledTextField fullWidth label="Full Name" name="fullName" value={profile.fullName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField fullWidth label="Email Address" name="email" value={profile.email} onChange={handleChange} />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Change Password */}
          <SectionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.gold, mb: 3 }}>Change Password</Typography>
            <Grid container spacing={3}>
              {['current', 'new', 'confirm'].map((field, index) => (
                <Grid item xs={12} md={4} key={field}>
                  <StyledTextField
                    fullWidth
                    label={field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm Password'}
                    name={field}
                    type={showPassword[field] ? "text" : "password"}
                    value={passwords[field]}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => handleClickShowPassword(field)}>
                            {showPassword[field] ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            <Tooltip title="Password must contain at least 8 characters, including an uppercase letter, a number, and a special character.">
              <Box display="flex" alignItems="center" justifyContent="flex-end" mt={2} sx={{ color: colors.textSecondary, cursor: 'pointer' }}>
                <Typography variant="caption" sx={{ mr: 1 }}>Password Guidelines</Typography>
                <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
              </Box>
            </Tooltip>
          </SectionCard>

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
            <ActionButton type="submit" startIcon={<SaveIcon />}>Save Changes</ActionButton>
            <ActionButton variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}>Cancel</ActionButton>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
