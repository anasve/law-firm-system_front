import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { colors } from '../../constants';
import { usersService } from '../../services/usersService';
import { StyledTextField } from '../StyledComponents';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: colors.lightBlack,
    borderRadius: '16px',
    border: `1px solid ${alpha(colors.gold, 0.2)}`,
    maxWidth: '600px',
    width: '100%',
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  background: `linear-gradient(135deg, ${colors.lightBlack} 0%, ${colors.black} 100%)`,
  color: colors.gold,
  fontWeight: 'bold',
  fontSize: '1.5rem',
  padding: '20px 24px',
  borderBottom: `1px solid ${alpha(colors.gold, 0.2)}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const StyledDialogContent = styled(DialogContent)({
  padding: '24px',
  backgroundColor: colors.lightBlack,
  color: colors.white,
});

const AvatarUploadBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  padding: '20px',
  borderRadius: '12px',
  backgroundColor: alpha(colors.black, 0.5),
  border: `2px dashed ${alpha(colors.gold, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: colors.gold,
    backgroundColor: alpha(colors.black, 0.7),
  },
});

const StyledAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  border: `3px solid ${colors.gold}`,
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const CameraIconButton = styled(IconButton)({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: colors.gold,
  color: colors.black,
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: colors.darkGold,
  },
});

const FileUploadBox = styled(Box)({
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: alpha(colors.black, 0.5),
  border: `1px solid ${alpha(colors.gold, 0.2)}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const StyledButton = styled(Button)(({ variant = 'contained' }) => ({
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 24px',
  textTransform: 'none',
  backgroundColor: variant === 'contained' ? colors.gold : 'transparent',
  color: variant === 'contained' ? colors.black : colors.textSecondary,
  border: variant === 'outlined' ? `1px solid ${colors.textSecondary}` : 'none',
  '&:hover': {
    backgroundColor: variant === 'contained' ? colors.darkGold : alpha(colors.white, 0.1),
  },
}));

export default function AddLawyerDialog({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    password: '',
    password_confirmation: '',
    specialization_ids: [],
    photo: null,
    certificate: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      usersService.getSpecializations()
        .then(res => setSpecializations(res.data || []))
        .catch(err => console.error('Failed to fetch specializations:', err));
    }
  }, [open]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, photo: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCertificate = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, certificate: file }));
    }
  };

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.age || !form.password) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    if (form.password !== form.password_confirmation) {
      showSnackbar('Passwords do not match!', 'error');
      return;
    }

    if (form.password.length < 6) {
      showSnackbar('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== '' && val !== undefined) {
          if (key === 'specialization_ids') {
            if (Array.isArray(val) && val.length > 0) {
              val.forEach(id => formData.append('specialization_ids[]', id));
            }
          } else {
            formData.append(key, val);
          }
        }
      });

      await usersService.createLawyer(formData);
      showSnackbar('Lawyer added successfully!', 'success');
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Failed to add lawyer';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: '',
      email: '',
      age: '',
      password: '',
      password_confirmation: '',
      specialization_ids: [],
      photo: null,
      certificate: null,
    });
    setImagePreview(null);
    onClose();
  };

  return (
    <>
      <StyledDialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <StyledDialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Add New Lawyer
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{ color: colors.textSecondary, '&:hover': { color: colors.white } }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Profile Picture Upload */}
            <AvatarUploadBox>
              <Box sx={{ position: 'relative' }}>
                <StyledAvatar
                  src={imagePreview}
                  alt="Profile"
                  onClick={() => document.getElementById('lawyer-photo-upload').click()}
                >
                  {!imagePreview && <PhotoCameraIcon sx={{ fontSize: 40, color: colors.gold }} />}
                </StyledAvatar>
                <input
                  id="lawyer-photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
                <CameraIconButton
                  onClick={() => document.getElementById('lawyer-photo-upload').click()}
                  size="small"
                >
                  <PhotoCameraIcon />
                </CameraIconButton>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                Click to upload profile picture
              </Typography>
            </AvatarUploadBox>

            <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />

            {/* Personal Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.gold, mb: 2, fontWeight: 'bold' }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <StyledTextField
                    name="name"
                    label="Full Name *"
                    value={form.name}
                    onChange={handleInput}
                    fullWidth
                    required
                    autoComplete="off"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="email"
                    label="Email Address *"
                    type="email"
                    value={form.email}
                    onChange={handleInput}
                    fullWidth
                    required
                    autoComplete="off"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="age"
                    label="Age *"
                    type="number"
                    value={form.age}
                    onChange={handleInput}
                    fullWidth
                    required
                    inputProps={{ min: 18, max: 100 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />

            {/* Security */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.gold, mb: 2, fontWeight: 'bold' }}>
                Security
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="password"
                    label="Password *"
                    type="password"
                    value={form.password}
                    onChange={handleInput}
                    fullWidth
                    required
                    helperText="Minimum 6 characters"
                    FormHelperTextProps={{ sx: { color: colors.textSecondary } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="password_confirmation"
                    label="Confirm Password *"
                    type="password"
                    value={form.password_confirmation}
                    onChange={handleInput}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />

            {/* Specializations */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.gold, mb: 2, fontWeight: 'bold' }}>
                Specializations
              </Typography>
              <StyledTextField
                select
                SelectProps={{ multiple: true }}
                name="specialization_ids"
                label="Select Specializations"
                value={form.specialization_ids || []}
                onChange={handleInput}
                fullWidth
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const spec = specializations.find(s => s.id === value);
                      return spec ? (
                        <Chip key={value} label={spec.name} size="small" sx={{ backgroundColor: alpha(colors.gold, 0.2), color: colors.gold }} />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {specializations.map((spec) => (
                  <MenuItem key={spec.id} value={spec.id} sx={{ color: colors.white }}>
                    {spec.name}
                  </MenuItem>
                ))}
              </StyledTextField>
            </Box>

            {/* Certificate Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.gold, mb: 2, fontWeight: 'bold' }}>
                Certificate
              </Typography>
              <FileUploadBox>
                <AttachFileIcon sx={{ color: colors.gold }} />
                <Box sx={{ flex: 1 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    sx={{
                      color: colors.gold,
                      borderColor: alpha(colors.gold, 0.5),
                      '&:hover': { borderColor: colors.gold, backgroundColor: alpha(colors.gold, 0.1) },
                    }}
                  >
                    {form.certificate ? 'Change Certificate' : 'Upload Certificate'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificate}
                    />
                  </Button>
                  {form.certificate && (
                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 1 }}>
                      Selected: {form.certificate.name}
                    </Typography>
                  )}
                </Box>
              </FileUploadBox>
            </Box>
          </Box>
        </StyledDialogContent>

        <DialogActions sx={{ padding: '16px 24px', backgroundColor: colors.black, borderTop: `1px solid ${alpha(colors.gold, 0.2)}` }}>
          <StyledButton onClick={handleClose} variant="outlined">
            Cancel
          </StyledButton>
          <StyledButton 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Lawyer'}
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: 'Arial, sans-serif' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
