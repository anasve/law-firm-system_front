import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Link,
} from "@mui/material";
import { styled, alpha } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { colors } from '../../AdminManagement/constants';
import { api, API_BASE_URL_FULL } from '../services/api';

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    color: colors.white,
    borderRadius: '12px',
    backgroundColor: alpha(colors.black, 0.4),
    fontSize: '1rem',
    fontFamily: 'Arial, sans-serif',
    padding: '4px 0',
    transition: 'all 0.3s ease',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: alpha(colors.gold, 0.3),
      borderWidth: '1.5px',
      borderRadius: '12px',
    },
    '&:hover fieldset': {
      borderColor: alpha(colors.gold, 0.6),
      borderWidth: '2px',
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.gold,
      borderWidth: '2px',
      boxShadow: `0 0 0 3px ${alpha(colors.gold, 0.1)}`,
    },
    '& input': {
      color: colors.white,
      padding: '14px 16px',
      fontSize: '1rem',
      fontWeight: '400',
      '&:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0 1000px ${alpha(colors.black, 0.4)} inset !important`,
        WebkitTextFillColor: `${colors.white} !important`,
        caretColor: colors.white,
        borderRadius: '12px',
        transition: 'background-color 5000s ease-in-out 0s',
        backgroundColor: 'transparent !important',
      },
    },
  },
  '& label': {
    color: colors.textSecondary,
    fontSize: '0.95rem',
    fontWeight: '500',
    fontFamily: 'Arial, sans-serif',
    '&.Mui-required': {
      '&::after': {
        content: '" *"',
        color: colors.gold,
      },
    },
  },
  '& label.Mui-focused': {
    color: colors.gold,
    fontWeight: '600',
  },
});

const StyledButton = styled(Button)({
  backgroundColor: colors.gold,
  color: colors.black,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '1rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
  '&:hover': {
    backgroundColor: colors.darkGold,
    transform: 'scale(1.02)',
  },
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [values, setValues] = useState({ 
    name: "", 
    email: "", 
    phone: "",
    address: "",
    password: "", 
    password_confirmation: "",
    image: null
  });

  const navigate = useNavigate();

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
      setValues({ ...values, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Fetch CSRF cookie from Laravel Sanctum
      const csrfUrl = `${API_BASE_URL_FULL}/sanctum/csrf-cookie`;
      try {
        await axios.get(csrfUrl, {
          withCredentials: true,
          headers: {
            "Accept": "application/json",
          },
        });
      } catch (csrfError) {
        console.warn('CSRF cookie fetch failed (may not be needed):', csrfError);
        // Continue anyway, some APIs don't need CSRF
      }

      // Register using the api instance
      // Note: API_BASE_URL already includes '/guest', so we use '/register' not '/guest/register'
      // If image is a File object, use FormData
      let response;
      if (values.image instanceof File) {
        const formData = new FormData();
        formData.append('name', values.name || '');
        formData.append('email', values.email || '');
        if (values.phone) formData.append('phone', values.phone);
        if (values.address) formData.append('address', values.address);
        formData.append('password', values.password);
        formData.append('password_confirmation', values.password_confirmation);
        formData.append('image', values.image);
        
        response = await api.post('/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Otherwise, use regular JSON
        response = await api.post('/register', values);
      }
      
      console.log('Register response:', response);

      setSuccess(response.data?.message || 
                response.data?.data?.message || 
                "Registered successfully. Please check your email for verification.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error('Register error:', err);
      console.error('Error response:', err.response);
      
      // Better error handling
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 422) {
          const errors = err.response.data?.errors;
          if (errors) {
            // Format validation errors
            const errorMessages = Object.entries(errors)
              .map(([field, messages]) => {
                const fieldName = field === 'email' ? 'Email' : 
                                 field === 'password' ? 'Password' : 
                                 field === 'name' ? 'Name' :
                                 field === 'phone' ? 'Phone' :
                                 field === 'address' ? 'Address' :
                                 field === 'image' ? 'Image' : field;
                return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
              })
              .join('\n');
            errorMessage = errorMessages || 'Validation failed. Please check your input.';
          } else {
            errorMessage = err.response.data?.message || 
                          err.response.data?.error || 
                          errorMessage;
          }
        } else if (err.response.status === 404) {
          errorMessage = "Registration endpoint not found. Please check API configuration.";
        } else if (err.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = err.response.data?.message || 
                        err.response.data?.error || 
                        errorMessage;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = "Cannot connect to server. Please check your connection.";
      } else {
        // Error in request setup
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.black} 0%, ${alpha('#1E1E1E', 0.8)} 100%)`,
      }}
    >
      <Box
        sx={{
          width: { xs: '90%', sm: 450 },
          p: { xs: 3, sm: 5 },
          background: '#1E1E1E',
          borderRadius: '16px',
          border: `1px solid ${alpha(colors.gold, 0.2)}`,
          boxShadow: `0px 10px 40px ${alpha(colors.black, 0.5)}`,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: colors.gold, width: 70, height: 70, mx: 'auto', mb: 2 }}>
            <PersonAddIcon sx={{ fontSize: 40, color: colors.black }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" fontFamily="Arial, sans-serif" sx={{ color: colors.white }}>
            Create Account
          </Typography>
          <Typography variant="body1" sx={{ color: colors.gold }}>
            Lawyer Pro Platform
          </Typography>
        </Box>

        {error && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" variant="filled" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Profile Image Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <label htmlFor="image-upload">
              <input
                accept="image/*"
                id="image-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={imagePreview}
                  alt="Profile"
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: colors.gold,
                    border: `3px solid ${colors.gold}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {!imagePreview && <PersonAddIcon sx={{ fontSize: 50, color: colors.black }} />}
                </Avatar>
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
              Click to upload profile picture (Optional)
            </Typography>
          </Box>

          <StyledTextField
            fullWidth
            required
            id="name"
            label="Full Name"
            name="name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            sx={{ mb: 2.5 }}
            autoComplete="name"
          />
          <StyledTextField
            fullWidth
            required
            id="email"
            label="Email Address"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            sx={{ mb: 2.5 }}
            autoComplete="email"
          />
          <StyledTextField
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
            sx={{ mb: 2.5 }}
            placeholder="+1234567890"
            autoComplete="tel"
          />
          <StyledTextField
            fullWidth
            id="address"
            label="Address"
            name="address"
            value={values.address}
            onChange={(e) => setValues({ ...values, address: e.target.value })}
            sx={{ mb: 2.5 }}
            multiline
            rows={2}
            autoComplete="street-address"
          />
          <StyledTextField
            fullWidth
            required
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            sx={{ mb: 2.5 }}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 1 }}>
                  <IconButton 
                    onClick={() => setShowPassword(!showPassword)} 
                    edge="end" 
                    size="small"
                    sx={{ 
                      color: colors.textSecondary,
                      padding: '8px',
                      borderRadius: '8px',
                      '&:hover': {
                        color: colors.gold,
                        backgroundColor: alpha(colors.gold, 0.15),
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ fontSize: '20px' }} />
                    ) : (
                      <Visibility sx={{ fontSize: '20px' }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <StyledTextField
            fullWidth
            required
            id="password_confirmation"
            name="password_confirmation"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={values.password_confirmation}
            onChange={(e) => setValues({ ...values, password_confirmation: e.target.value })}
            sx={{ mb: 1 }}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 1 }}>
                  <IconButton 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    edge="end" 
                    size="small"
                    sx={{ 
                      color: colors.textSecondary,
                      padding: '8px',
                      borderRadius: '8px',
                      '&:hover': {
                        color: colors.gold,
                        backgroundColor: alpha(colors.gold, 0.15),
                      },
                    }}
                  >
                    {showConfirmPassword ? (
                      <VisibilityOff sx={{ fontSize: '20px' }} />
                    ) : (
                      <Visibility sx={{ fontSize: '20px' }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <StyledButton type="submit" fullWidth disabled={loading} sx={{ mt: 3, mb: 2 }}>
            {loading ? <CircularProgress size={26} sx={{ color: colors.black }} /> : "Register"}
          </StyledButton>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ color: colors.gold, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Login here
            </Link>
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />

        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', display: 'block' }}>
          &copy; {new Date().getFullYear()} Lawyer Pro. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

