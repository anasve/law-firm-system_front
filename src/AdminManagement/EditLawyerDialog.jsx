import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Avatar, InputAdornment, IconButton, Grid } from "@mui/material";
import { styled, alpha } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// --- نظام الألوان الموحد ---
const colors = {
  gold: '#D4AF37',
  darkGold: '#B4943C',
  black: '#1A1A1A',
  white: '#FFFFFF',
  lightBlack: '#232323',
};

// --- المكونات المصممة ---
const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: colors.lightBlack,
    color: colors.white,
    borderRadius: '16px',
    border: `1px solid ${alpha(colors.gold, 0.3)}`,
    width: '100%',
    maxWidth: '500px',
  },
});

const StyledDialogTitle = styled(DialogTitle)({
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 0,
});

const StyledTextField = styled(TextField)({
    margin: '12px 0',
    '& label': { color: alpha(colors.white, 0.7), fontFamily: 'Cairo, sans-serif' },
    '& label.Mui-focused': { color: colors.gold },
    '& .MuiInputBase-input': { color: colors.white, fontFamily: 'Cairo, sans-serif' },
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '& fieldset': { borderColor: alpha(colors.white, 0.3) },
        '&:hover fieldset': { borderColor: alpha(colors.gold, 0.7) },
        '&.Mui-focused fieldset': { borderColor: colors.gold },
    },
});

const ActionButton = styled(Button)({
    backgroundColor: colors.gold,
    color: colors.black,
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 'bold',
    borderRadius: '8px',
    padding: '10px 20px',
    '&:hover': { backgroundColor: colors.darkGold }
});

const CancelButton = styled(Button)({
    color: alpha(colors.white, 0.7),
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 'bold',
    borderRadius: '8px',
    padding: '10px 20px',
    '&:hover': { backgroundColor: alpha(colors.white, 0.1) }
});

export default function EditLawyerDialog({ open, onClose, lawyer, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", age: "", password: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [certificateImage, setCertificateImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (lawyer) {
      setForm({
        name: lawyer.name || "",
        email: lawyer.email || "",
        age: lawyer.age || "",
        password: "" // كلمة المرور تترك فارغة للأمان
      });
      setProfileImage(lawyer.profileImageUrl || null);
    }
  }, [lawyer]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = (e, setImage) => setImage(URL.createObjectURL(e.target.files[0]));
  const handleSubmit = () => onSave({ ...form, profileImageUrl: profileImage, certificateImageUrl: certificateImage });

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>تعديل بيانات المحامي</StyledDialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, mb: 2 }}>
            <Avatar src={profileImage} sx={{ width: 100, height: 100, mb: 1, border: `3px solid ${colors.gold}` }} />
            <Button component="label" startIcon={<PhotoCamera />} sx={{ color: colors.gold, fontFamily: 'Cairo, sans-serif' }}>
                تغيير الصورة
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e, setProfileImage)} />
            </Button>
        </Box>
        <Box component="form">
          <StyledTextField fullWidth label="الاسم" name="name" value={form.name} onChange={handleChange} />
          <StyledTextField fullWidth label="البريد الإلكتروني" name="email" value={form.email} onChange={handleChange} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <StyledTextField fullWidth label="العمر" name="age" type="number" value={form.age} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
                 <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{
                        height: '56px',
                        mt: '12px',
                        color: alpha(colors.white, 0.8),
                        borderColor: alpha(colors.white, 0.3),
                        borderRadius: '8px',
                        fontFamily: 'Cairo, sans-serif',
                        '&:hover': { borderColor: colors.gold, backgroundColor: alpha(colors.gold, 0.1), color: colors.gold }
                    }}
                >
                    تحميل الشهادة
                    <input type="file" hidden accept="image/*, .pdf" onChange={(e) => handleImageChange(e, setCertificateImage)} />
                </Button>
            </Grid>
          </Grid>

          <StyledTextField
            fullWidth
            label="كلمة المرور (اتركها فارغة لعدم التغيير)"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{color: alpha(colors.white, 0.7)}}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 20px' }}>
        <CancelButton onClick={onClose}>إلغاء</CancelButton>
        <ActionButton onClick={handleSubmit} autoFocus>حفظ التعديلات</ActionButton>
      </DialogActions>
    </StyledDialog>
  );
}