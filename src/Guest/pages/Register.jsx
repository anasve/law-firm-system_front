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
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { colors } from '../../AdminManagement/constants';

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
  const [values, setValues] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    password_confirmation: "" 
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.get("/sanctum/csrf-cookie", {
        withCredentials: true,
        headers: {
          "Accept": "application/json",
        },
      });

      const response = await axios.post(
        "/api/guest/register",
        values,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      setSuccess(response.data.message || "Registered successfully. Please check your email for verification.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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

