import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  MailOutline,
  LockOutlined,
  Gavel,
  BadgeOutlined,
} from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

// A simple component to render a hidden <input> element for the file upload.
const Input = (props) => <input {...props} />;

function AddLawyer({ onLawyerAdded }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    specialization: '',
    password: '',
    profileImage: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Adding lawyer:', form);
    alert('تمت إضافة المحامي بنجاح (تجريبي)!');
    if (onLawyerAdded) onLawyerAdded(form);
  };

  // Centralized styling for all text fields to match the desired luxury theme.
  const inputStyles = {
    '& .MuiInputLabel-root': {
      color: '#C4A484', // A softer gold for the label
      transformOrigin: 'top right',
      right: '1.75rem',
      left: 'auto',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#E0C181', // Brighter gold on focus
    },
    '& .MuiInputLabel-asterisk': {
      color: '#E0C181',
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      color: '#E0C181',
      '& fieldset': {
        borderColor: '#C4A484',
        borderWidth: '1px',
        borderRadius: '8px',
      },
      '&:hover fieldset': {
        borderColor: '#E0C181',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#E0C181',
      },
      '& .MuiSvgIcon-root': {
        color: '#C4A484',
      },
    },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: '#141414',
        borderRadius: '16px',
        color: '#E0C181',
        maxWidth: '900px',
        margin: 'auto',
        mt: 4,
        direction: 'rtl',
        border: '1px solid #333',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: '#E0C181', textAlign: 'center', mb: 5, fontWeight: 'bold' }}>
        إضافة محامي جديد
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
          {/* Inputs Column */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="الاسم الكامل" name="name" onChange={handleChange} sx={inputStyles} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutline /></InputAdornment>) }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="البريد الإلكتروني" name="email" type="email" onChange={handleChange} sx={inputStyles} InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutline /></InputAdornment>) }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="العمر" name="age" type="number" onChange={handleChange} sx={inputStyles} InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeOutlined /></InputAdornment>) }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="التخصص" name="specialization" onChange={handleChange} sx={inputStyles} InputProps={{ startAdornment: (<InputAdornment position="start"><Gavel /></InputAdornment>) }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth required label="كلمة المرور" name="password" type={showPassword ? 'text' : 'password'} onChange={handleChange} sx={inputStyles}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><LockOutlined /></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                          {showPassword ? <VisibilityOff sx={{ color: '#C4A484' }}/> : <Visibility sx={{ color: '#C4A484' }}/>}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Image Uploader Column */}
          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: { xs: 4, md: 0 } }}>
             <Box sx={{ width: 180, height: 180, borderRadius: '50%', border: '2px dashed #C4A484', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
                backgroundImage: imagePreview ? `url(${imagePreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!imagePreview && (
                  <Typography variant="body2" sx={{ color: '#C4A484' }}>الصورة الشخصية</Typography>
                )}
                <label htmlFor="icon-button-file" style={{ position: 'absolute', bottom: 8, right: 8, cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%' }}>
                  <Input accept="image/*" id="icon-button-file" type="file" onChange={handleImageChange} style={{ display: 'none' }} />
                  <IconButton component="span">
                    <PhotoCamera sx={{ color: '#E0C181' }} />
                  </IconButton>
                </label>
             </Box>
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ textAlign: 'left', mt: 4 }}>
          <Button type="submit" variant="contained"
            sx={{
              backgroundColor: '#E0C181', color: '#141414', fontWeight: 'bold', borderRadius: '8px',
              fontSize: '1rem', px: 6, py: 1.5,
              '&:hover': { backgroundColor: '#C4A484' },
            }}>
            إضافة المحامي
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default AddLawyer;