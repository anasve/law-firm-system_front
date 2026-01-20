import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Typography, MenuItem, CircularProgress, FormControl, InputLabel, Select,
  Checkbox, ListItemText, Chip
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { colors } from '../../constants';
import { buildImageUrl } from '../../utils/helpers';
import { usersService } from '../../services/usersService';
import { getToken } from '../../services/api';

const inputFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(0,0,0,0.15)',
    color: '#E0C181',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#C4A484',
      borderRadius: '8px',
    },
    '&:hover fieldset': {
      borderColor: '#E0C181',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#E0C181',
    },
    '& input, & textarea': {
      color: '#E0C181',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#C4A484',
    left: '1.5rem',
    right: 'auto',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#E0C181',
  },
  '& .MuiSelect-select': {
    color: '#E0C181',
  },
  '& .MuiSvgIcon-root': {
    color: '#C4A484',
  },
  // Hide number input spinners
  '& input[type=number]': {
    MozAppearance: 'textfield',
    '&::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
  },
};

export default function EditLawyerDialog({ open, onClose, lawyer, onSave }) {
  const [formData, setFormData] = useState({
    name: '', age: '', email: '', password: '', password_confirmation: '', specialization_ids: [], image: null, certificate: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [fullLawyerData, setFullLawyerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const token = getToken();
      if (token) {
        usersService.getSpecializations()
          .then(res => setSpecializations(res.data || []))
          .catch(err => console.error('Failed to fetch specializations:', err));

        if (lawyer && lawyer.id) {
          setLoading(true);
          usersService.getLawyerById(lawyer.id)
            .then(res => {
              setFullLawyerData(res.data);
              const lawyerData = res.data;
              
              let currentSpecIds = [];
              if (lawyerData.specialization_ids && Array.isArray(lawyerData.specialization_ids)) {
                currentSpecIds = lawyerData.specialization_ids;
              } else if (lawyerData.specializations && Array.isArray(lawyerData.specializations)) {
                currentSpecIds = lawyerData.specializations.map(s => s.id || s);
              }
              
              setFormData({
                name: lawyerData.name || '',
                age: lawyerData.age || '',
                email: lawyerData.email || '',
                password: '',
                password_confirmation: '',
                specialization_ids: currentSpecIds,
                image: null,
                certificate: null,
              });
              
              const imageUrl = buildImageUrl(lawyerData.photo || lawyerData.image_url || lawyerData.image || lawyerData.photo_path);
              setImagePreview(imageUrl);
            }).catch(err => {
              console.error('Failed to fetch lawyer data:', err);
              if (lawyer) {
                let currentSpecIds = [];
                if (lawyer.specialization_ids && Array.isArray(lawyer.specialization_ids)) {
                  currentSpecIds = lawyer.specialization_ids;
                } else if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
                  currentSpecIds = lawyer.specializations.map(s => s.id || s);
                }
                
                setFormData({
                  name: lawyer.name || '',
                  age: lawyer.age || '',
                  email: lawyer.email || '',
                  phone: lawyer.phone || '',
                  address: lawyer.address || '',
                  password: '',
                  password_confirmation: '',
                  specialization_ids: currentSpecIds,
                  image: null,
                  certificate: null,
                });
                
                const imageUrl = buildImageUrl(lawyer.photo || lawyer.image_url || lawyer.image || lawyer.photo_path);
                setImagePreview(imageUrl);
              }
            }).finally(() => {
              setLoading(false);
            });
        }
      }
    } else if (!open) {
      setFullLawyerData(null);
      setFormData({
        name: '', age: '', email: '', phone: '', address: '', password: '', password_confirmation: '', specialization_ids: [], image: null, certificate: null,
      });
      setImagePreview(null);
    }
  }, [open, lawyer]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'specialization_ids' && Array.isArray(value)) {
      setFormData(prev => ({ ...prev, [name]: value.map(id => Number(id)) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, photo: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCertificateChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, certificate: e.target.files[0] }));
    }
  };

  const handleSave = () => {
    const lawyerToSave = fullLawyerData || lawyer;
    if (!lawyerToSave || !lawyerToSave.id) {
      alert('Error: Lawyer ID is missing');
      return;
    }
    onSave({ ...lawyerToSave, ...formData });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { background: colors.black, borderRadius: 4 } }}>
      <DialogTitle sx={{ background: colors.black, color: '#E0C181', fontWeight: 'bold', borderRadius: 0 }}>
        Edit Lawyer Information
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, background: colors.black, color: '#E0C181', p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: '#E0C181' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '2px dashed #C4A484',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!imagePreview && (
                  <Typography sx={{ color: '#C4A484', fontSize: 13 }}>Profile Picture</Typography>
                )}
                <label htmlFor="lawyer-photo-upload-edit" style={{
                  position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', padding: 4, cursor: 'pointer'
                }}>
                  <input
                    id="lawyer-photo-upload-edit"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <PhotoCamera sx={{ color: '#E0C181' }} />
                </label>
              </Box>
            </Box>
            
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />
            <TextField
              name="age"
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
              inputProps={{ min: 18, max: 100 }}
            />
            <TextField
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
              placeholder="+1234567890"
            />
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              autoComplete="off"
              multiline
              rows={2}
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
              placeholder="Leave empty if you don't want to change it"
            />
            <TextField
              name="password_confirmation"
              label="Confirm Password"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />

            <FormControl fullWidth sx={inputFieldStyles}>
              <InputLabel sx={{ color: '#C4A484', left: '1.5rem', right: 'auto' }}>Specializations</InputLabel>
              <Select
                multiple
                name="specialization_ids"
                value={formData.specialization_ids || []}
                onChange={handleChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === 0 ? (
                      <Typography sx={{ color: '#C4A484', fontSize: '0.875rem' }}>
                        No specializations selected
                      </Typography>
                    ) : (
                      selected.map((value) => {
                        const spec = specializations.find(s => s.id === value);
                        return spec ? (
                          <Chip 
                            key={value} 
                            label={spec.name} 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'rgba(224, 193, 129, 0.2)', 
                              color: '#E0C181',
                              fontWeight: 'bold',
                              border: '1px solid rgba(224, 193, 129, 0.3)',
                            }} 
                          />
                        ) : null;
                      })
                    )}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      color: '#E0C181',
                      border: '1px solid rgba(224, 193, 129, 0.2)',
                      maxHeight: 300,
                      '& .MuiMenuItem-root': {
                        color: '#E0C181',
                        '&:hover': {
                          backgroundColor: 'rgba(224, 193, 129, 0.2)',
                          color: '#E0C181',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(224, 193, 129, 0.3)',
                          color: '#E0C181',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: 'rgba(224, 193, 129, 0.4)',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {specializations.length === 0 ? (
                  <MenuItem disabled sx={{ color: '#C4A484' }}>
                    No specializations available
                  </MenuItem>
                ) : (
                  specializations.map((spec) => (
                    <MenuItem key={spec.id} value={spec.id}>
                      <Checkbox
                        checked={(formData.specialization_ids || []).indexOf(spec.id) > -1}
                        sx={{
                          color: '#E0C181',
                          '&.Mui-checked': {
                            color: '#E0C181',
                          },
                        }}
                      />
                      <ListItemText primary={spec.name} sx={{ color: '#E0C181' }} />
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {formData.specialization_ids && formData.specialization_ids.length > 0 && (
              <Typography sx={{ color: '#C4A484', mt: 1, fontSize: 14 }}>
                {formData.specialization_ids.length} specialization{formData.specialization_ids.length > 1 ? 's' : ''} selected
              </Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: '#C4A484', mb: 1 }}>Lawyer Certificate</Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  color: '#E0C181',
                  borderColor: '#C4A484',
                  '&:hover': { borderColor: '#E0C181', backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                Upload Certificate
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleCertificateChange}
                />
              </Button>
              {formData.certificate && (
                <Typography sx={{ color: '#E0C181', mt: 1, fontSize: 14 }}>
                  Selected file: {formData.certificate.name}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ background: colors.black, m: 0, p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#C4A484' }} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading} sx={{
          backgroundColor: '#E0C181',
          color: colors.black,
          fontWeight: 'bold',
          borderRadius: '8px',
          px: 4,
          '&:hover': { backgroundColor: '#C4A484' },
          '&:disabled': { backgroundColor: '#555', color: '#999' }
        }}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}

