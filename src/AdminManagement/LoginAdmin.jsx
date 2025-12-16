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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { colors } from './constants';
import { setToken, api } from './services/api';
import { API_BASE_URL_FULL } from './constants/api';

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
      // Autofill styles - matches the background
      '&:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0 1000px ${alpha(colors.black, 0.4)} inset !important`,
        WebkitTextFillColor: `${colors.white} !important`,
        caretColor: colors.white,
        borderRadius: '12px',
        transition: 'background-color 5000s ease-in-out 0s',
        backgroundColor: 'transparent !important',
      },
      '&:-webkit-autofill:hover': {
        WebkitBoxShadow: `0 0 0 1000px ${alpha(colors.black, 0.4)} inset !important`,
        WebkitTextFillColor: `${colors.white} !important`,
        backgroundColor: 'transparent !important',
      },
      '&:-webkit-autofill:focus': {
        WebkitBoxShadow: `0 0 0 1000px ${alpha(colors.black, 0.4)} inset !important`,
        WebkitTextFillColor: `${colors.white} !important`,
        backgroundColor: 'transparent !important',
      },
      '&:-webkit-autofill:active': {
        WebkitBoxShadow: `0 0 0 1000px ${alpha(colors.black, 0.4)} inset !important`,
        WebkitTextFillColor: `${colors.white} !important`,
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
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
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

export default function LoginAdmin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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

      // Login with credentials using the api instance
      // Note: API_BASE_URL already includes '/admin', so we use '/login' not '/admin/login'
      const response = await api.post('/login', {
        email: values.email,
        password: values.password,
      });
      
      console.log('Login response:', response);

      // Handle different response formats
      const token = response.data?.token || 
                   response.data?.data?.token || 
                   response.data?.access_token;

      if (!token) {
        console.error('No token in response:', response.data);
        setError("Login failed: No token received from server.");
        return;
      }

      // Store token
      setToken(token);

      console.log("Login success:", response.data);
      navigate("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      
      // Better error handling
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401 || err.response.status === 422) {
          errorMessage = err.response.data?.message || 
                        err.response.data?.error || 
                        "Invalid email or password. Please try again.";
        } else if (err.response.status === 404) {
          errorMessage = "Login endpoint not found. Please check API configuration.";
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
            <AdminPanelSettingsIcon sx={{ fontSize: 40, color: colors.black }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" fontFamily="Arial, sans-serif" sx={{ color: colors.white }}>
            Admin Dashboard
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
                      '&:active': {
                        backgroundColor: alpha(colors.gold, 0.25),
                      },
                      transition: 'all 0.2s ease',
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
