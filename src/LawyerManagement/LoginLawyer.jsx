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
} from "@mui/material";
import { styled, alpha } from '@mui/material/styles';
import GavelIcon from '@mui/icons-material/Gavel';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { colors } from '../AdminManagement/constants';
import { setToken } from './services/api';

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

export default function LoginLawyer() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Client-side validation
    if (!values.email || !values.email.trim()) {
      setError('Email is required.');
      return;
    }
    
    if (!values.email.includes('@') || !values.email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!values.password || values.password.length < 1) {
      setError('Password is required.');
      return;
    }
    
    setLoading(true);

    try {
      // Get CSRF cookie first
      await axios.get("/sanctum/csrf-cookie", {
        withCredentials: true,
        headers: {
          "Accept": "application/json",
        },
      });

      // Send login request
      const response = await axios.post(
        "/api/lawyer/login",
        {
          email: values.email.trim(),
          password: values.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      // Check if response has token
      if (response.data?.token) {
        setToken(response.data.token);
        navigate("/lawyer/dashboard");
      } else {
        setError('Login failed. No token received.');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle validation errors (422)
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors;
        if (errors) {
          // Format validation errors
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => {
              const fieldName = field === 'email' ? 'Email' : field === 'password' ? 'Password' : field;
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          setError(errorMessages || 'Validation failed. Please check your input.');
        } else {
          setError(err.response.data?.message || 'Validation failed. Please check your input.');
        }
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 403) {
        setError('Access forbidden. Please check your account status.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (!err.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials and try again.');
      }
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
            <GavelIcon sx={{ fontSize: 40, color: colors.black }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" fontFamily="Arial, sans-serif" sx={{ color: colors.white }}>
            Lawyer Login
          </Typography>
          <Typography variant="body1" sx={{ color: colors.gold }}>
            Lawyer Pro Platform
          </Typography>
        </Box>

        {error && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <StyledTextField
            fullWidth
            required
            id="email"
            label="Email Address"
            name="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            sx={{ mb: 2.5 }}
            autoComplete="off"
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
            sx={{ mb: 1 }}
            autoComplete="current-password"
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
          <StyledButton type="submit" fullWidth disabled={loading} sx={{ mt: 3, mb: 2 }}>
            {loading ? <CircularProgress size={26} sx={{ color: colors.black }} /> : "Login"}
          </StyledButton>
        </Box>

        <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />

        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', display: 'block' }}>
          &copy; {new Date().getFullYear()} Lawyer Pro. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

