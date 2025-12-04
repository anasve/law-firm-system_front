import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Typography
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { colors } from '../../constants';
import { buildImageUrl } from '../../utils/helpers';

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
  '& .MuiSvgIcon-root': {
    color: '#C4A484',
  },
};

export default function EditEmployeeDialog({ open, onClose, employee, onSave }) {
  const [formData, setFormData] = useState({
    name: '', age: '', email: '', password: '', password_confirmation: '', image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        age: employee.age || '',
        email: employee.email || '',
        password: '',
        password_confirmation: '',
        image: null,
      });
      const imageUrl = buildImageUrl(employee.image_url || employee.photo || employee.image);
      setImagePreview(imageUrl);
    }
  }, [employee]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onSave({ ...employee, ...formData });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { background: colors.black, borderRadius: 4 } }}>
      <DialogTitle sx={{ background: colors.black, color: '#E0C181', fontWeight: 'bold', borderRadius: 0 }}>
        Edit Employee Information
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, background: colors.black, color: '#E0C181', p: 3 }}>
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
            <label htmlFor="employee-photo-upload-edit" style={{
              position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', padding: 4, cursor: 'pointer'
            }}>
              <input
                id="employee-photo-upload-edit"
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
      </DialogContent>
      <DialogActions sx={{ background: colors.black, m: 0, p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#C4A484' }}>Cancel</Button>
        <Button onClick={handleSave} sx={{
          backgroundColor: '#E0C181',
          color: colors.black,
          fontWeight: 'bold',
          borderRadius: '8px',
          px: 4,
          '&:hover': { backgroundColor: '#C4A484' }
        }}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}

