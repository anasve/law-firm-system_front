// import React, { useState, useEffect } from 'react';
// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Avatar, InputAdornment, IconButton } from "@mui/material";
// import { styled, alpha } from '@mui/material/styles';
// import PhotoCamera from '@mui/icons-material/PhotoCamera';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';

// // --- نظام الألوان الموحد ---
// const colors = {
//   gold: '#D4AF37',
//   darkGold: '#B4943C',
//   black: '#1A1A1A',
//   white: '#FFFFFF',
//   lightBlack: '#232323',
// };

// // --- المكونات المصممة (نفس تصميم النموذج السابق) ---
// const StyledDialog = styled(Dialog)({
//   '& .MuiDialog-paper': {
//     backgroundColor: colors.lightBlack,
//     color: colors.white,
//     borderRadius: '16px',
//     border: `1px solid ${alpha(colors.gold, 0.3)}`,
//     width: '100%',
//     maxWidth: '500px',
//   },
// });

// const StyledDialogTitle = styled(DialogTitle)({
//     fontFamily: 'Cairo, sans-serif',
//     fontWeight: 'bold',
//     textAlign: 'center',
//     paddingBottom: 0,
// });

// const StyledTextField = styled(TextField)({
//     margin: '12px 0',
//     '& label': { color: alpha(colors.white, 0.7), fontFamily: 'Cairo, sans-serif' },
//     '& label.Mui-focused': { color: colors.gold },
//     '& .MuiInputBase-input': { color: colors.white, fontFamily: 'Cairo, sans-serif' },
//     '& .MuiOutlinedInput-root': {
//         borderRadius: '8px',
//         '& fieldset': { borderColor: alpha(colors.white, 0.3) },
//         '&:hover fieldset': { borderColor: alpha(colors.gold, 0.7) },
//         '&.Mui-focused fieldset': { borderColor: colors.gold },
//     },
// });

// const ActionButton = styled(Button)({
//     backgroundColor: colors.gold,
//     color: colors.black,
//     fontFamily: 'Cairo, sans-serif',
//     fontWeight: 'bold',
//     borderRadius: '8px',
//     padding: '10px 20px',
//     '&:hover': { backgroundColor: colors.darkGold }
// });

// const CancelButton = styled(Button)({
//     color: alpha(colors.white, 0.7),
//     fontFamily: 'Cairo, sans-serif',
//     fontWeight: 'bold',
//     borderRadius: '8px',
//     padding: '10px 20px',
//     '&:hover': { backgroundColor: alpha(colors.white, 0.1) }
// });

// export default function EditEmployeeDialog({ open, onClose, employee, onSave }) {
//   const [form, setForm] = useState({ name: "", email: "", age: "", password: "" });
//   const [profileImage, setProfileImage] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     if (employee) {
//       setForm({
//         name: employee.name || "",
//         email: employee.email || "",
//         age: employee.age || "",
//         password: "" // كلمة المرور تترك فارغة للأمان
//       });
//       setProfileImage(employee.profileImageUrl || null);
//     }
//   }, [employee]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
//   const handleImageChange = (e) => setProfileImage(URL.createObjectURL(e.target.files[0]));
//   const handleSubmit = () => onSave({ ...form, profileImageUrl: profileImage });

//   return (
//     <StyledDialog open={open} onClose={onClose}>
//       <StyledDialogTitle>تعديل بيانات الموظف</StyledDialogTitle>
//       <DialogContent>
//         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, mb: 2 }}>
//             <Avatar src={profileImage} sx={{ width: 100, height: 100, mb: 1, border: `3px solid ${colors.gold}` }} />
//             <Button component="label" startIcon={<PhotoCamera />} sx={{ color: colors.gold, fontFamily: 'Cairo, sans-serif' }}>
//                 تغيير الصورة
//                 <input type="file" hidden accept="image/*" onChange={handleImageChange} />
//             </Button>
//         </Box>
//         <Box component="form">
//           <StyledTextField fullWidth label="الاسم" name="name" value={form.name} onChange={handleChange} />
//           <StyledTextField fullWidth label="البريد الإلكتروني" name="email" value={form.email} onChange={handleChange} />
//           <StyledTextField fullWidth label="العمر" name="age" type="number" value={form.age} onChange={handleChange} />
//           <StyledTextField
//             fullWidth
//             label="كلمة المرور (اتركها فارغة لعدم التغيير)"
//             name="password"
//             type={showPassword ? 'text' : 'password'}
//             value={form.password}
//             onChange={handleChange}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{color: alpha(colors.white, 0.7)}}>
//                     {showPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Box>
//       </DialogContent>
//       <DialogActions sx={{ p: '0 24px 20px' }}>
//         <CancelButton onClick={onClose}>إلغاء</CancelButton>
//         <ActionButton onClick={handleSubmit} autoFocus>حفظ التعديلات</ActionButton>
//       </DialogActions>
//     </StyledDialog>
//   );
// }