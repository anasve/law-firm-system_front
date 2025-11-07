import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Avatar, IconButton, Grid, Button, Paper,
  InputAdornment, Tooltip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import axios from 'axios';

// --- الألوان ---
const colors = {
  gold: '#D4AF37',
  black: '#141414',
  lightBlack: '#232323',
  white: '#FFFFFF',
  textSecondary: alpha('#FFFFFF', 0.7),
};

// --- العناصر المصممة ---
const SectionCard = styled(Paper)(({ theme }) => ({
  backgroundColor: colors.lightBlack,
  padding: theme.spacing(4),
  borderRadius: '16px',
  border: `1px solid ${alpha(colors.white, 0.1)}`,
  color: colors.white,
  marginBottom: theme.spacing(4),
}));

const StyledTextField = styled(TextField)({
  '& label.Mui-focused': { color: colors.gold },
  '& .MuiOutlinedInput-root': {
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.2)',
    fontFamily: 'Cairo, sans-serif',
    '& fieldset': { borderColor: alpha(colors.white, 0.2) },
    '&:hover fieldset': { borderColor: alpha(colors.gold, 0.7) },
    '&.Mui-focused fieldset': { borderColor: colors.gold },
    '& .MuiSvgIcon-root': { color: colors.textSecondary }
  },
  '& .MuiInputLabel-root': {
    color: colors.textSecondary,
    fontFamily: 'Cairo, sans-serif',
  }
});

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  fontFamily: 'Cairo, sans-serif',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 24px',
  backgroundColor: variant === 'contained' ? colors.gold : 'transparent',
  color: variant === 'contained' ? colors.black : colors.textSecondary,
  border: variant === 'outlined' ? `1px solid ${colors.textSecondary}` : 'none',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#B4943C' : alpha(colors.white, 0.1),
  },
  '& .MuiButton-startIcon': {
    marginRight: -4,
    marginLeft: 8
  }
}));

export default function ProfileEdit() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // --- جلب بيانات الملف الشخصي ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return navigate('/login');

      try {
        const { data } = await axios.get('http://127.0.0.1:8000/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile({
          fullName: data.name ?? '',
          email: data.email ?? ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
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
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/login');

    try {
      await axios.put(
        'http://127.0.0.1:8000/api/admin/profile',
        {
          name: profile.fullName,
          email: profile.email,
          current_password: passwords.current,
          new_password: passwords.new,
          confirm_password: passwords.confirm,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("تم حفظ التغييرات!");
      setPasswords({ current: "", new: "", confirm: "" });

    } catch (error) {
      console.error("خطأ أثناء حفظ التغييرات:", error);
      alert("فشل في حفظ التغييرات، تحقق من صحة البيانات.");
    }
  };

  const handleCancel = () => setPasswords({ current: "", new: "", confirm: "" });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, fontFamily: 'Cairo, sans-serif' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: colors.white, mb: 4, textAlign: 'center' }}>
        تعديل الملف الشخصي
      </Typography>

      <form onSubmit={handleSave}>
        <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* صورة المستخدم */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box position="relative" display="inline-block" mb={2}>
              <Avatar sx={{ width: 120, height: 120, bgcolor: colors.gold, fontSize: 48, color: colors.black }}>
                {profile.fullName.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </Avatar>
              <IconButton component="label" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: alpha(colors.black, 0.7), '&:hover': { bgcolor: colors.black } }}>
                <PhotoCameraIcon sx={{ color: colors.gold }} />
                <input type="file" hidden />
              </IconButton>
            </Box>
            <Typography fontWeight="bold" variant="h6" sx={{ color: colors.white }}>{profile.fullName}</Typography>
          </Box>

          {/* البيانات الشخصية */}
          <SectionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.gold, mb: 3 }}>المعلومات الشخصية</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StyledTextField fullWidth label="الاسم الكامل" name="fullName" value={profile.fullName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField fullWidth label="البريد الإلكتروني" name="email" value={profile.email} onChange={handleChange} />
              </Grid>
            </Grid>
          </SectionCard>

          {/* تغيير كلمة المرور */}
          <SectionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.gold, mb: 3 }}>تغيير كلمة المرور</Typography>
            <Grid container spacing={3}>
              {['current', 'new', 'confirm'].map((field, index) => (
                <Grid item xs={12} md={4} key={field}>
                  <StyledTextField
                    fullWidth
                    label={field === 'current' ? 'كلمة المرور الحالية' : field === 'new' ? 'كلمة المرور الجديدة' : 'تأكيد كلمة المرور'}
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
            <Tooltip title="كلمة المرور يجب أن تحتوي على الأقل 8 أحرف، وتتضمن حرف كبير ورقم ورمز خاص.">
              <Box display="flex" alignItems="center" justifyContent="flex-end" mt={2} sx={{ color: colors.textSecondary, cursor: 'pointer' }}>
                <Typography variant="caption" sx={{ mr: 1 }}>إرشادات كلمة المرور</Typography>
                <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
              </Box>
            </Tooltip>
          </SectionCard>

          {/* أزرار */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
            <ActionButton type="submit" startIcon={<SaveIcon />}>حفظ التغييرات</ActionButton>
            <ActionButton variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}>إلغاء</ActionButton>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
