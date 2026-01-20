import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, IconButton, Grid, Button, Paper,
  InputAdornment, Tooltip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { api, getToken, removeToken } from '../services/api';
import { colors } from '../constants';
import { SectionCard, StyledTextField, ActionButton } from '../components/StyledComponents';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await api.get('/profile');
        const adminData = response.data.data || response.data.admin || response.data || {};
        
        setProfile({
          fullName: adminData.name || adminData.full_name || adminData.fullName || '',
          email: adminData.email || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        if (error.response?.status === 401) {
          removeToken();
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
    const token = getToken();
    if (!token) {
      navigate('/');
      return;
    }

    const hasCurrentPassword = passwords.current && passwords.current.trim().length > 0;
    const hasNewPassword = passwords.new && passwords.new.trim().length > 0;
    const hasConfirmPassword = passwords.confirm && passwords.confirm.trim().length > 0;
    const wantsToChangePassword = hasCurrentPassword || hasNewPassword || hasConfirmPassword;
    
    if (wantsToChangePassword) {
      if (!hasCurrentPassword) {
        alert('Please enter your current password to change it.');
        return;
      }
      if (!hasNewPassword) {
        alert('Please enter a new password.');
        return;
      }
      if (!hasConfirmPassword) {
        alert('Please confirm your new password.');
        return;
      }
      if (passwords.new.trim() !== passwords.confirm.trim()) {
        alert('New password and confirm password do not match.');
        return;
      }
      if (passwords.new.trim().length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('name', profile.fullName || '');
      formData.append('email', profile.email || '');
      
      if (wantsToChangePassword && hasCurrentPassword && hasNewPassword && hasConfirmPassword) {
        formData.append('current_password', passwords.current.trim());
        formData.append('password', passwords.new.trim());
        formData.append('password_confirmation', passwords.confirm.trim());
      }

      formData.append('_method', 'PUT');

      await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Changes saved successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      
      // Dispatch event to update sidebar profile
      window.dispatchEvent(new Event('profileUpdated'));
      
      const refreshResponse = await api.get('/profile');
      const adminData = refreshResponse.data.data || refreshResponse.data.admin || refreshResponse.data || {};
      
      setProfile({
        fullName: adminData.name || adminData.full_name || adminData.fullName || '',
        email: adminData.email || ''
      });

    } catch (error) {
      console.error("Error saving changes:", error);
      
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
          <SectionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.gold, mb: 3 }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StyledTextField 
                  fullWidth 
                  label="Full Name" 
                  name="fullName" 
                  value={profile.fullName} 
                  onChange={handleChange} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField 
                  fullWidth 
                  label="Email Address" 
                  name="email" 
                  value={profile.email} 
                  onChange={handleChange} 
                />
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.gold, mb: 3 }}>
              Change Password
            </Typography>
            <Grid container spacing={3}>
              {['current', 'new', 'confirm'].map((field) => (
                <Grid item xs={12} md={4} key={field}>
                  <StyledTextField
                    fullWidth
                    label={
                      field === 'current' ? 'Current Password' : 
                      field === 'new' ? 'New Password' : 
                      'Confirm Password'
                    }
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
            <Tooltip title="Password must contain at least 6 characters.">
              <Box display="flex" alignItems="center" justifyContent="flex-end" mt={2} sx={{ color: colors.textSecondary, cursor: 'pointer' }}>
                <Typography variant="caption" sx={{ mr: 1 }}>Password Guidelines</Typography>
                <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
              </Box>
            </Tooltip>
          </SectionCard>

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
            <ActionButton type="submit" startIcon={<SaveIcon />}>Save Changes</ActionButton>
            <ActionButton variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}>
              Cancel
            </ActionButton>
          </Box>
        </Box>
      </form>
    </Box>
  );
}

