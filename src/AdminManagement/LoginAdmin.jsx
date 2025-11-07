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

// --- Color theme ---
const colors = {
  gold: '#D4AF37',
  darkGold: '#b48f34',
  black: '#121212',
  lightBlack: '#1E1E1E',
  white: '#FFFFFF',
  textSecondary: '#A9A9A9',
};

// --- Styled components ---
const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    color: colors.white,
    borderRadius: '8px',
    backgroundColor: alpha(colors.black, 0.3),
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: alpha(colors.gold, 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha(colors.gold, 0.7),
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.gold,
      borderWidth: '2px',
    },
  },
  '& label': {
    color: colors.textSecondary,
  },
  '& label.Mui-focused': {
    color: colors.gold,
  },
});

const StyledButton = styled(Button)({
  backgroundColor: colors.gold,
  color: colors.black,
  fontFamily: 'Cairo, sans-serif',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
  '&:hover': {
    backgroundColor: colors.darkGold,
    transform: 'scale(1.02)',
  },
});

// --- Main component ---
export default function LoginAdminProMax() {
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
      // Step 1: Fetch CSRF cookie from Laravel Sanctum
      await axios.get("http://127.0.0.1:8000/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Step 2: Login with credentials; CSRF token sent automatically by Axios
      const response = await axios.post(
        "http://127.0.0.1:8000/api/admin/login",
        {
          email: values.email,
          password: values.password,
        },
        {
          withCredentials: true,
        }
      );

      // تخزين التوكن في localStorage
      localStorage.setItem('adminToken', response.data.token);

      console.log("Login success:", response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "فشل تسجيل الدخول. تحقق من البيانات.");
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
        background: `linear-gradient(135deg, ${colors.black} 0%, ${alpha(colors.lightBlack, 0.8)} 100%)`,
      }}
    >
      <Box
        sx={{
          width: { xs: '90%', sm: 450 },
          p: { xs: 3, sm: 5 },
          background: colors.lightBlack,
          borderRadius: '16px',
          border: `1px solid ${alpha(colors.gold, 0.2)}`,
          boxShadow: `0px 10px 40px ${alpha(colors.black, 0.5)}`,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: colors.gold, width: 70, height: 70, mx: 'auto', mb: 2 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 40, color: colors.black }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" fontFamily="Cairo, sans-serif" sx={{ color: colors.white }}>
            بوابة المدير
          </Typography>
          <Typography variant="body1" sx={{ color: colors.gold }}>
            منصة المحامي برو
          </Typography>
        </Box>

        {error && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            margin="normal"
            required
            id="email"
            label="البريد الإلكتروني"
            name="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
          <StyledTextField
            fullWidth
            margin="normal"
            required
            id="password"
            name="password"
            label="كلمة المرور"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: colors.textSecondary }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <StyledButton type="submit" fullWidth disabled={loading} sx={{ mt: 3, mb: 2 }}>
            {loading ? <CircularProgress size={26} sx={{ color: colors.black }} /> : "تسجيل الدخول"}
          </StyledButton>
        </Box>

        <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />

        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', display: 'block' }}>
          &copy; {new Date().getFullYear()} المحامي برو. جميع الحقوق محفوظة.
        </Typography>
      </Box>
    </Box>
  );
}
