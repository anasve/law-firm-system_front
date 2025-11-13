import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Card, Avatar, Grid, CardContent,
  CardActions, Divider, IconButton, Tooltip, Chip, TextField, InputAdornment,
  ToggleButtonGroup, ToggleButton, Dialog, DialogContent, DialogActions, DialogTitle,
  MenuItem, Select, FormControl, InputLabel, OutlinedInput
} from "@mui/material";
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

// --- Color Scheme & Styled Components ---
const colors = { gold: '#D4AF37', darkGold: '#B4943C', black: '#1A1A1A', white: '#FFFFFF', lightBlack: '#232323', textSecondary: alpha('#FFFFFF', 0.7) };
const ManagementHeader = styled(Card)(({ theme }) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing(4), padding: theme.spacing(3), borderRadius: '16px', background: `linear-gradient(135deg, ${colors.lightBlack} 0%, ${colors.black} 100%)`, border: `1px solid ${alpha(colors.gold, 0.2)}`, color: colors.white }));
const StyledTabs = styled(Tabs)({ '& .MuiTabs-indicator': { backgroundColor: colors.gold, height: '3px' } });
const StyledTab = styled(Tab)(({ theme }) => ({ color: colors.textSecondary, fontFamily: 'Cairo, sans-serif', fontWeight: 'bold', '&.Mui-selected': { color: colors.gold } }));
const UserCardStyled = styled(Card)({ background: colors.lightBlack, color: colors.white, borderRadius: '16px', border: `1px solid ${alpha(colors.gold, 0.1)}`, display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 10px 20px ${alpha(colors.black, 0.5)}` } });
const SearchBar = styled(TextField)({ '& .MuiInputBase-root': { color: colors.white, borderRadius: '8px', backgroundColor: colors.lightBlack }, '& .MuiOutlinedInput-root fieldset': { borderColor: alpha(colors.gold, 0.3) } });
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({ backgroundColor: colors.lightBlack, border: `1px solid ${alpha(colors.gold, 0.2)}`, borderRadius: '8px', }));
const StyledToggleButton = styled(ToggleButton)({ color: colors.textSecondary, fontFamily: 'Cairo, sans-serif', fontWeight: 'bold', border: 'none', padding: '8px 16px', '&.Mui-selected, &.Mui-selected:hover': { color: colors.black, backgroundColor: colors.gold, }, '&:hover': { backgroundColor: alpha(colors.gold, 0.1), } });

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: colors.lightBlack,
    color: colors.white,
    borderRadius: '16px',
    border: `1px solid ${alpha(colors.gold, 0.2)}`,
    fontFamily: 'Cairo, sans-serif'
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputLabel-root': { // More specific selector for the label
    color: colors.textSecondary,
    fontFamily: 'Cairo, sans-serif'
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.gold,
  },
  '& .MuiOutlinedInput-root': {
    color: colors.white,
    fontFamily: 'Cairo, sans-serif',
    '& fieldset': {
      borderColor: alpha(colors.gold, 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha(colors.gold, 0.7),
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.gold,
    },
  },
  '& .MuiInputBase-input': {
    color: colors.white,
  }
});

const specializationsList = [
  'القانون الجنائي', 'القانون المدني', 'القانون التجاري', 'قانون الشركات',
  'قانون العمل', 'الأحوال الشخصية', 'القانون الإداري', 'الملكية الفكرية', 'العقارات'
];

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
    right: '1.5rem',
    left: 'auto',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#E0C181',
  },
  '& .MuiSelect-select': {
    color: '#E0C181',
  },
  '& .MuiSvgIcon-root': {
    color: '#C4A484',
  },
};


// --- Dialogs ---
const EditLawyerDialog = ({ open, onClose, lawyer, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', age: '', email: '', password: '', password_confirmation: '', specializations: [], image: null, certifications: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (lawyer) {
      let currentSpecs = [];
      if (Array.isArray(lawyer.specializations)) {
        currentSpecs = lawyer.specializations;
      } else if (typeof lawyer.specialty === 'string') {
        currentSpecs = lawyer.specialty.split(',').map(s => s.trim()).filter(Boolean);
      }
      setFormData({
        name: lawyer.name || '',
        age: lawyer.age || '',
        email: lawyer.email || '',
        password: '',
        password_confirmation: '',
        specializations: currentSpecs,
        image: null,
        certifications: null, // Reset file input on new selection
      });
      setImagePreview(lawyer.image_url || null); // Assuming image_url exists
    }
  }, [lawyer]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecializationChange = (event) => {
    const { target: { value } } = event;
    setFormData(prev => ({ ...prev, specializations: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCertificationsChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, certifications: e.target.files[0] }));
    }
  };

  const handleSave = () => {
    // In a real app, you might use FormData to handle file uploads
    onSave({ ...lawyer, ...formData });
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: `1px solid ${alpha(colors.gold, 0.2)}` }}>تعديل بيانات المحامي</DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 4 }, mt: 2 }}>
        <Grid container spacing={4}>
          {/* --- Left Panel: Avatar --- */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, borderRight: { md: `1px solid ${alpha(colors.gold, 0.2)}` }, pr: { md: 4 } }}>
            <Avatar src={imagePreview} sx={{ width: 120, height: 120, mb: 2, bgcolor: colors.gold, color: colors.black, fontSize: 48 }}>
              {formData.name.charAt(0)}
            </Avatar>
            <Button variant="outlined" component="label" sx={{ color: colors.gold, borderColor: colors.gold, '&:hover': { borderColor: colors.darkGold, bgcolor: alpha(colors.gold, 0.1) } }}>
              تغيير الصورة
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
          </Grid>

          {/* --- Right Panel: Fields --- */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="الاسم الكامل" name="name" value={formData.name} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="العمر" name="age" type="number" value={formData.age} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12}><StyledTextField fullWidth label="البريد الإلكتروني" name="email" type="email" value={formData.email} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="كلمة المرور الجديدة" name="password" type="password" value={formData.password} onChange={handleChange} InputLabelProps={{ shrink: true }} placeholder="اتركه فارغًا" /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="تأكيد كلمة المرور" name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="specializations-label" shrink sx={{ color: colors.textSecondary, fontFamily: 'Cairo, sans-serif' }}>التخصصات</InputLabel>
                  <Select
                    labelId="specializations-label"
                    multiple
                    value={formData.specializations}
                    onChange={handleSpecializationChange}
                    input={<OutlinedInput label="التخصصات" sx={{ color: colors.white, '.MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.gold, 0.3) }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.gold, 0.7) }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.gold }, '.MuiSvgIcon-root': { color: colors.white } }} />}
                    renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => (<Chip key={value} label={value} sx={{ bgcolor: colors.gold, color: colors.black, fontWeight: 'bold' }} />))}</Box>)}
                  >
                    {specializationsList.map((name) => (<MenuItem key={name} value={name} sx={{ fontFamily: 'Cairo, sans-serif' }}>{name}</MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, color: colors.textSecondary, fontFamily: 'Cairo, sans-serif' }}>
                  الشهادات (ملف PDF أو صورة)
                </Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ color: colors.gold, borderColor: colors.gold, '&:hover': { borderColor: colors.darkGold, bgcolor: alpha(colors.gold, 0.1) }, justifyContent: 'flex-start', textTransform: 'none', fontFamily: 'Cairo, sans-serif', p: 1.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formData.certifications ? formData.certifications.name : 'اختيار ملف...'}
                  <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertificationsChange} />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(colors.gold, 0.2)}` }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary, fontFamily: 'Cairo, sans-serif' }}>إلغاء</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: colors.gold, color: colors.black, '&:hover': { bgcolor: colors.darkGold }, fontFamily: 'Cairo, sans-serif', fontWeight: 'bold' }}>حفظ التغييرات</Button>
      </DialogActions>
    </StyledDialog>
  );
};

const EditEmployeeDialog = ({ open, onClose, employee, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', age: '', email: '', position: '', password: '', password_confirmation: '', image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        age: employee.age || '',
        email: employee.email || '',
        position: employee.position || '',
        password: '',
        password_confirmation: '',
        image: null,
      });
      setImagePreview(employee.image_url || null);
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
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: `1px solid ${alpha(colors.gold, 0.2)}` }}>تعديل بيانات الموظف</DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 4 }, mt: 2 }}>
        <Grid container spacing={4}>
          {/* --- Left Panel: Avatar --- */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, borderRight: { md: `1px solid ${alpha(colors.gold, 0.2)}` }, pr: { md: 4 } }}>
            <Avatar src={imagePreview} sx={{ width: 120, height: 120, mb: 2, bgcolor: colors.gold, color: colors.black, fontSize: 48 }}>
              {formData.name.charAt(0)}
            </Avatar>
            <Button variant="outlined" component="label" sx={{ color: colors.gold, borderColor: colors.gold, '&:hover': { borderColor: colors.darkGold, bgcolor: alpha(colors.gold, 0.1) } }}>
              تغيير الصورة
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
          </Grid>
          {/* --- Right Panel: Fields --- */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="الاسم الكامل" name="name" value={formData.name} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="العمر" name="age" type="number" value={formData.age} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="البريد الإلكتروني" name="email" type="email" value={formData.email} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="المنصب" name="position" value={formData.position} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="كلمة المرور الجديدة" name="password" type="password" value={formData.password} onChange={handleChange} InputLabelProps={{ shrink: true }} placeholder="اتركه فارغًا" /></Grid>
              <Grid item xs={12} sm={6}><StyledTextField fullWidth label="تأكيد كلمة المرور" name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(colors.gold, 0.2)}` }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary, fontFamily: 'Cairo, sans-serif' }}>إلغاء</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: colors.gold, color: colors.black, '&:hover': { bgcolor: colors.darkGold }, fontFamily: 'Cairo, sans-serif', fontWeight: 'bold' }}>حفظ التغييرات</Button>
      </DialogActions>
    </StyledDialog>
  );
};

// --- Confirmation Dialog Component ---
function ConfirmationDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '12px', border: `1px solid ${alpha(colors.gold, 0.2)}`, fontFamily: 'Cairo, sans-serif' } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary, fontFamily: 'Cairo, sans-serif' }}>إلغاء</Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ fontFamily: 'Cairo, sans-serif', bgcolor: '#D32F2F', '&:hover': { bgcolor: '#B71C1C' } }}>تأكيد الحذف</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- UserCard Component ---
function UserCard({ user, type, onEdit, onArchive, onUnarchive, onView, onDelete }) {
  const isLawyer = type === 'lawyer';
  return (
    <UserCardStyled>
      <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
        <Avatar src={user.image_url} sx={{ width: 80, height: 80, margin: '0 auto 16px', bgcolor: colors.gold, color: colors.black, fontSize: 32 }}>{user.name.charAt(0)}</Avatar>
        <Typography variant="h6" fontWeight="bold" noWrap>{user.name}</Typography>
        <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 0.5 }}>
          العمر: {user.age || 'غير محدد'}
        </Typography>
        {isLawyer ? (
          <Typography variant="body2" color={colors.gold} sx={{ mb: 1, minHeight: '20px' }} noWrap>
            {user.specialty || ''}
          </Typography>
        ) : (
          <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 1 }}>
            {user.position || ''}
          </Typography>
        )}
        <Chip label={user.status === 'active' ? 'نشط' : 'مؤرشف'} size="small" sx={{ bgcolor: user.status === 'active' ? alpha(colors.gold, 0.3) : '#555', color: colors.white }} />
      </CardContent>
      <Divider sx={{ borderColor: alpha(colors.gold, 0.1) }} />
      <CardActions sx={{ justifyContent: 'center', background: alpha(colors.black, 0.3), py: 1 }}>
        <Tooltip title="عرض التفاصيل">
          <IconButton onClick={() => onView(user, type)} size="small" sx={{ color: colors.textSecondary }}>
            <VisibilityOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="تعديل البيانات">
          <IconButton onClick={() => onEdit(user, type)} size="small" sx={{ color: colors.textSecondary }}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        {user.isArchived ? (
          <Tooltip title="إلغاء الأرشفة">
            <IconButton onClick={() => onUnarchive(user)} size="small" sx={{ color: colors.textSecondary }}>
              <UnarchiveOutlinedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="أرشفة">
            <IconButton onClick={() => onArchive(user)} size="small" sx={{ color: colors.textSecondary }}>
              <ArchiveOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}

      </CardActions>

    </UserCardStyled>
  );
}

// --- UserDetailsDialog Component ---
function UserDetailsDialog({ open, onClose, user }) {
  if (!user) return null;
  const isLawyer = user.type === 'lawyer';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '16px', border: `1px solid ${alpha(colors.gold, 0.2)}` } }}>
      <DialogContent sx={{ p: 4, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, left: 8, color: colors.textSecondary }}><CloseIcon /></IconButton>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar src={user.image_url} sx={{ width: 120, height: 120, bgcolor: colors.gold, fontSize: 48, color: colors.black, mb: 2 }}>{user.name.charAt(0)}</Avatar>
          <Typography variant="h4" fontWeight="bold">{user.name}</Typography>
          <Typography color={colors.gold} variant="h6">{isLawyer ? user.specialty : user.position}</Typography>
          <Chip label={user.status === 'active' ? 'نشط' : 'مؤرشف'} size="small" sx={{ bgcolor: user.status === 'active' ? alpha(colors.gold, 0.3) : '#555', color: colors.white, mt: 1 }} />
        </Box>
        <Divider sx={{ my: 2, borderColor: alpha(colors.white, 0.1) }} />
        <Grid container spacing={2} sx={{ textAlign: 'right', fontFamily: 'Cairo, sans-serif' }}>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><EmailOutlinedIcon sx={{ color: colors.gold }} /><Box><Typography color={colors.textSecondary}>البريد الإلكتروني</Typography><Typography>{user.email}</Typography></Box></Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><PhoneOutlinedIcon sx={{ color: colors.gold }} /><Box><Typography color={colors.textSecondary}>رقم الهاتف</Typography><Typography>{user.phone}</Typography></Box></Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default function ManagementPage() {
  const [mainTab, setMainTab] = useState(0);
  const navigate = useNavigate();

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lawyers, setLawyers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editLawyerOpen, setEditLawyerOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewUserOpen, setViewUserOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLawyers(token);
    fetchEmployees(token);
  }, [navigate]);

  const fetchLawyers = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/lawyers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLawyers(response.data);
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
      if (error.response && error.response.status === 401) {
        // التوكن غير صالح أو منتهي الصلاحية
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    }
  };

  const fetchEmployees = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    }
  };

  // --- Filtering Logic ---
  const filteredLawyers = lawyers.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) && (filterStatus === 'all' || l.status === filterStatus));
  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) && (filterStatus === 'all' || e.status === filterStatus));

  // --- Event Handlers ---
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleFilterChange = (_, newFilter) => { if (newFilter !== null) setFilterStatus(newFilter); };
  const handleMainTabChange = (_, newValue) => { setMainTab(newValue); setSearchTerm(''); setFilterStatus('all'); };

  const handleViewUser = (user, type) => { setSelectedUserForView({ ...user, type }); setViewUserOpen(true); };
  const handleCloseViewDialog = () => { setViewUserOpen(false); setSelectedUserForView(null); };

  // --- Handlers ---
  const handleEditLawyer = (lawyer) => { setSelectedLawyer(lawyer); setEditLawyerOpen(true); };
  const handleSaveEditLawyer = async (editedLawyer) => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/login'); return; }

    const apiData = new FormData();
    apiData.append('name', editedLawyer.name);
    apiData.append('age', editedLawyer.age);
    apiData.append('email', editedLawyer.email);

    if (editedLawyer.password) {
      apiData.append('password', editedLawyer.password);
      apiData.append('password_confirmation', editedLawyer.password_confirmation);
    }

    if (Array.isArray(editedLawyer.specializations)) {
      apiData.append('specialty', editedLawyer.specializations.join(', '));
    }

    if (editedLawyer.image) {
      apiData.append('image', editedLawyer.image);
    }

    if (editedLawyer.certifications) {
      apiData.append('certifications', editedLawyer.certifications);
    }

    apiData.append('_method', 'PUT');

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/admin/lawyers/${editedLawyer.id}`, apiData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLawyers(lawyers.map(l => (l.id === response.data.id ? response.data : l)));
      setEditLawyerOpen(false);
    } catch (error) {
      console.error('Failed to update lawyer:', error.response ? error.response.data : error);
      alert('حدث خطأ أثناء تحديث بيانات المحامي.');
    }
  };

  // Archive lawyer
  const handleArchiveLawyer = async (lawyer) => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/lawyers/${lawyer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // update local state by refetching
      fetchLawyers(token);
    } catch (error) {
      console.error("Failed to archive lawyer:", error?.response?.data || error);
      alert(error?.response?.data?.message || "حدث خطأ أثناء أرشفة المحامي.");
    }
  };

  // Restore (unarchive) lawyer
  const handleUnarchiveLawyer = async (lawyer) => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/lawyers/${lawyer.id}/restore`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLawyers(token);
    } catch (error) {
      console.error("Failed to unarchive lawyer:", error?.response?.data || error);
      alert(error?.response?.data?.message || "حدث خطأ أثناء إلغاء أرشفة المحامي.");
    }
  };

  const handleEditEmployee = (employee) => { setSelectedEmployee(employee); setEditEmployeeOpen(true); };
  const handleSaveEditEmployee = async (editedEmployee) => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/login'); return; }

    const apiData = new FormData();
    apiData.append('name', editedEmployee.name);
    apiData.append('age', editedEmployee.age);
    apiData.append('email', editedEmployee.email);
    apiData.append('position', editedEmployee.position);

    if (editedEmployee.password) {
      apiData.append('password', editedEmployee.password);
      apiData.append('password_confirmation', editedEmployee.password_confirmation);
    }
    if (editedEmployee.image) {
      apiData.append('image', editedEmployee.image);
    }

    apiData.append('_method', 'PUT');

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/admin/employees/${editedEmployee.id}`, apiData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.map(e => (e.id === response.data.id ? response.data : e)));
      setEditEmployeeOpen(false);
    } catch (error) {
      console.error('Failed to update employee:', error.response ? error.response.data : error);
      alert('حدث خطأ أثناء تحديث بيانات الموظف.');
    }
  };

  // Archive / Unarchive (Restore) logic
  const handleArchiveEmployee = async (employee) => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/employees/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // remove locally or refetch
      setEmployees(prev => prev.filter(e => e.id !== employee.id));
    } catch (error) {
      console.error("Failed to archive employee:", error?.response?.data || error);
      alert(error?.response?.data?.message || "حدث خطأ أثناء أرشفة الموظف.");
    }
  };

  // Restore (unarchive) for employee
  const handleUnarchiveEmployee = async (employee) => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.post(`http://127.0.0.1:8000/api/admin/employees/${employee.id}/restore`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // refetch list to include restored employee
      fetchEmployees(token);
    } catch (error) {
      console.error("Failed to unarchive employee:", error?.response?.data || error);
      alert(error?.response?.data?.message || "حدث خطأ أثناء إلغاء أرشفة الموظف.");
    }
  };

  // --- Delete Flow Handlers ---
  const handleDeleteUser = (user, type) => {
    setUserToDelete({ ...user, type });
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (userToDelete.type === 'lawyer') {
        await axios.delete(`http://127.0.0.1:8000/api/admin/lawyers/${userToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyers(prev => prev.filter(l => l.id !== userToDelete.id));
      } else {
        await axios.delete(`http://127.0.0.1:8000/api/admin/employees/${userToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(prev => prev.filter(e => e.id !== userToDelete.id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('حدث خطأ أثناء الحذف.');
    } finally {
      setConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const renderControls = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={3} flexWrap="wrap">
      <SearchBar
        variant="outlined"
        placeholder="ابحث بالاسم..."
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: colors.gold }} /></InputAdornment>),
        }}
        sx={{ flexGrow: 1, minWidth: '250px' }}
      />
      <StyledToggleButtonGroup value={filterStatus} exclusive onChange={handleFilterChange}>
        <StyledToggleButton value="all">الكل</StyledToggleButton>
        <StyledToggleButton value="archived">المؤرشفين</StyledToggleButton>
      </StyledToggleButtonGroup>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#121212', minHeight: '100vh', color: colors.white }}>
      <ManagementHeader>
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              bgcolor: colors.gold,
              color: colors.black,
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            <PeopleAltOutlinedIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              fontFamily="Cairo, sans-serif"
            >
              إدارة المستخدمين
            </Typography>
            <Typography
              fontFamily="Cairo, sans-serif"
              color={colors.textSecondary}
            >
              إدارة المحامين والموظفين في النظام
            </Typography>
          </Box>
        </Box>
      </ManagementHeader>

      <StyledTabs value={mainTab} onChange={handleMainTabChange} aria-label="إدارة المحامين والموظفين">
        <StyledTab label="المحامين" icon={<GavelOutlinedIcon />} iconPosition="start" />
        <StyledTab label="الموظفين" icon={<BusinessCenterOutlinedIcon />} iconPosition="start" />
      </StyledTabs>

      {renderControls()}

      <Box sx={{ mt: 3 }}>
        {mainTab === 0 && (
          <Grid container spacing={3}>
            {filteredLawyers.length === 0 ? (
              <Typography sx={{ mt: 2, color: colors.textSecondary, width: '100%', textAlign: 'center' }}>لا يوجد محامين للعرض</Typography>
            ) : filteredLawyers.map(lawyer => (
              <Grid key={lawyer.id} item xs={12} sm={6} md={4}>
                <UserCard
                  key={lawyer.id}
                  user={lawyer}
                  type="lawyer"
                  onEdit={handleEditLawyer}
                  onArchive={handleArchiveLawyer}       // <-- This
                  onUnarchive={handleUnarchiveLawyer}   // <-- And this
                  onView={handleViewUser}
                  onDelete={handleDeleteUser}
                />

              </Grid>
            ))}
          </Grid>
        )}
        {mainTab === 1 && (
          <Grid container spacing={3}>
            {filteredEmployees.length === 0 ? (
              <Typography sx={{ mt: 2, color: colors.textSecondary, width: '100%', textAlign: 'center' }}>لا يوجد موظفين للعرض</Typography>
            ) : filteredEmployees.map(employee => (
              <Grid key={employee.id} item xs={12} sm={6} md={4}>
                <UserCard
                  key={employee.id}
                  user={employee}
                  type="employee"
                  onEdit={handleEditEmployee}
                  onArchive={handleArchiveEmployee}     // <-- This
                  onUnarchive={handleUnarchiveEmployee} // <-- And this
                  onView={handleViewUser}
                  onDelete={handleDeleteUser}
                />

              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Edit Dialogs */}
      <EditLawyerDialog
        open={editLawyerOpen}
        onClose={() => setEditLawyerOpen(false)}
        lawyer={selectedLawyer}
        onSave={handleSaveEditLawyer}
      />
      <EditEmployeeDialog
        open={editEmployeeOpen}
        onClose={() => setEditEmployeeOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveEditEmployee}
      />

      {/* View Details Dialog */}
      <UserDetailsDialog
        open={viewUserOpen}
        onClose={handleCloseViewDialog}
        user={selectedUserForView}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف المستخدم"
        message="هل أنت متأكد من حذف هذا المستخدم نهائيًا؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </Box>
  );
}
