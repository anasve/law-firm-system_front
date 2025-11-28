import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Card, Avatar, Grid, CardContent,
  CardActions, Divider, IconButton, Tooltip, Chip, TextField, InputAdornment,
  ToggleButtonGroup, ToggleButton, Dialog, DialogContent, DialogActions, DialogTitle,
  MenuItem, Select, FormControl, InputLabel, OutlinedInput, CircularProgress
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
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// --- Color Scheme & Styled Components ---
const colors = { gold: '#D4AF37', darkGold: '#B4943C', black: '#1A1A1A', white: '#FFFFFF', lightBlack: '#232323', textSecondary: alpha('#FFFFFF', 0.7) };
const ManagementHeader = styled(Card)(({ theme }) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing(4), padding: theme.spacing(3), borderRadius: '16px', background: `linear-gradient(135deg, ${colors.lightBlack} 0%, ${colors.black} 100%)`, border: `1px solid ${alpha(colors.gold, 0.2)}`, color: colors.white }));
const StyledTabs = styled(Tabs)({ '& .MuiTabs-indicator': { backgroundColor: colors.gold, height: '3px' } });
const StyledTab = styled(Tab)(({ theme }) => ({ color: colors.textSecondary, fontFamily: 'Arial, sans-serif', fontWeight: 'bold', '&.Mui-selected': { color: colors.gold } }));
const UserCardStyled = styled(Card)({ 
  background: colors.lightBlack, 
  color: colors.white, 
  borderRadius: '16px', 
  border: `1px solid ${alpha(colors.gold, 0.1)}`, 
  display: 'flex', 
  flexDirection: 'column', 
  height: '100%', 
  width: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease', 
  '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 10px 20px ${alpha(colors.black, 0.5)}` } 
});
const SearchBar = styled(TextField)({ '& .MuiInputBase-root': { color: colors.white, borderRadius: '8px', backgroundColor: colors.lightBlack }, '& .MuiOutlinedInput-root fieldset': { borderColor: alpha(colors.gold, 0.3) } });
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({ backgroundColor: colors.lightBlack, border: `1px solid ${alpha(colors.gold, 0.2)}`, borderRadius: '8px', }));
const StyledToggleButton = styled(ToggleButton)({ color: colors.textSecondary, fontFamily: 'Arial, sans-serif', fontWeight: 'bold', border: 'none', padding: '8px 16px', '&.Mui-selected, &.Mui-selected:hover': { color: colors.black, backgroundColor: colors.gold, }, '&:hover': { backgroundColor: alpha(colors.gold, 0.1), } });

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: colors.lightBlack,
    color: colors.white,
    borderRadius: '16px',
    border: `1px solid ${alpha(colors.gold, 0.2)}`,
    fontFamily: 'Arial, sans-serif'
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputLabel-root': { // More specific selector for the label
    color: colors.textSecondary,
    fontFamily: 'Arial, sans-serif'
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.gold,
  },
  '& .MuiOutlinedInput-root': {
    color: colors.white,
    fontFamily: 'Arial, sans-serif',
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
    name: '', age: '', email: '', password: '', password_confirmation: '', specialization_ids: [], image: null, certificate: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [fullLawyerData, setFullLawyerData] = useState(null);
  const [loading, setLoading] = useState(false);

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
      left: '1.5rem',
      right: 'auto',
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

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // Fetch specializations
        axios.get('http://127.0.0.1:8000/api/admin/specializations', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => setSpecializations(res.data || []))
          .catch(err => console.error('Failed to fetch specializations:', err));

        // Fetch full lawyer data if lawyer and id exist
        if (lawyer && lawyer.id) {
          setLoading(true);
          axios.get(`http://127.0.0.1:8000/api/admin/lawyers/${lawyer.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => {
            setFullLawyerData(res.data);
            const lawyerData = res.data;
            
            // Get specialization IDs from lawyer data
            let currentSpecIds = [];
            if (lawyerData.specialization_ids && Array.isArray(lawyerData.specialization_ids)) {
              currentSpecIds = lawyerData.specialization_ids;
            } else if (lawyerData.specializations && Array.isArray(lawyerData.specializations)) {
              currentSpecIds = lawyerData.specializations.map(s => s.id || s);
            }
            
            setFormData({
              name: lawyerData.name || '',
              age: lawyerData.age || '',
              email: lawyerData.email || '',
              password: '',
              password_confirmation: '',
              specialization_ids: currentSpecIds,
              image: null,
              certificate: null,
            });
            
            // Get image URL and make it full URL if needed
            let imageUrl = lawyerData.image_url || lawyerData.photo || lawyerData.image || null;
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
              if (imageUrl.startsWith('/')) {
                imageUrl = `http://127.0.0.1:8000${imageUrl}`;
              } else {
                imageUrl = `http://127.0.0.1:8000/${imageUrl}`;
              }
            }
            setImagePreview(imageUrl);
          }).catch(err => {
            console.error('Failed to fetch lawyer data:', err);
            // Fallback to passed lawyer data
            if (lawyer) {
              let currentSpecIds = [];
              if (lawyer.specialization_ids && Array.isArray(lawyer.specialization_ids)) {
                currentSpecIds = lawyer.specialization_ids;
              } else if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
                currentSpecIds = lawyer.specializations.map(s => s.id || s);
              }
              
              setFormData({
                name: lawyer.name || '',
                age: lawyer.age || '',
                email: lawyer.email || '',
                password: '',
                password_confirmation: '',
                specialization_ids: currentSpecIds,
                image: null,
                certificate: null,
              });
              
              let imageUrl = lawyer.image_url || lawyer.photo || lawyer.image || null;
              if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                if (imageUrl.startsWith('/')) {
                  imageUrl = `http://127.0.0.1:8000${imageUrl}`;
                } else {
                  imageUrl = `http://127.0.0.1:8000/${imageUrl}`;
                }
              }
              setImagePreview(imageUrl);
            }
          }).finally(() => {
            setLoading(false);
          });
        }
      }
    } else if (!open) {
      setFullLawyerData(null);
      setFormData({
        name: '', age: '', email: '', password: '', password_confirmation: '', specialization_ids: [], image: null, certificate: null,
      });
      setImagePreview(null);
    }
  }, [open, lawyer]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert specialization_ids to numbers if it's an array
    if (name === 'specialization_ids' && Array.isArray(value)) {
      setFormData(prev => ({ ...prev, [name]: value.map(id => Number(id)) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCertificateChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, certificate: e.target.files[0] }));
    }
  };

  const handleSave = () => {
    // Use fullLawyerData if available, otherwise fallback to lawyer
    const lawyerToSave = fullLawyerData || lawyer;
    if (!lawyerToSave || !lawyerToSave.id) {
      alert('Error: Lawyer ID is missing');
      return;
    }
    onSave({ ...lawyerToSave, ...formData });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { background: '#141414', borderRadius: 4 } }}>
      <DialogTitle sx={{ background: '#141414', color: '#E0C181', fontWeight: 'bold', borderRadius: 0 }}>Edit Lawyer Information</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex', flexDirection: 'column', gap: 2, background: '#141414', color: '#E0C181', p: 3
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: '#E0C181' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '2px dashed #C4A484',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!imagePreview && (
                  <Typography sx={{ color: '#C4A484', fontSize: 13 }}>Profile Picture</Typography>
                )}
                <label htmlFor="lawyer-photo-upload-edit" style={{
                  position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', padding: 4, cursor: 'pointer'
                }}>
                  <input
                    id="lawyer-photo-upload-edit"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <PhotoCamera sx={{ color: '#E0C181' }} />
                </label>
              </Box>
            </Box>
            
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />
            <TextField
              name="age"
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
              placeholder="Leave empty if you don't want to change it"
            />
            <TextField
              name="password_confirmation"
              label="Confirm Password"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              autoComplete="off"
              sx={inputFieldStyles}
              InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
            />

            <TextField
              select
              SelectProps={{ multiple: true }}
              name="specialization_ids"
              label="Specializations"
              value={formData.specialization_ids || []}
              onChange={handleChange}
              sx={inputFieldStyles}
            >
              {specializations.map((spec) => (
                <MenuItem key={spec.id} value={spec.id}>
                  {spec.name}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: '#C4A484', mb: 1 }}>Lawyer Certificate</Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  color: '#E0C181',
                  borderColor: '#C4A484',
                  '&:hover': { borderColor: '#E0C181', backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                Upload Certificate
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleCertificateChange}
                />
              </Button>
              {formData.certificate && (
                <Typography sx={{ color: '#E0C181', mt: 1, fontSize: 14 }}>
                  Selected file: {formData.certificate.name}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ background: '#141414', m: 0, p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#C4A484' }} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading} sx={{
          backgroundColor: '#E0C181',
          color: '#141414',
          fontWeight: 'bold',
          borderRadius: '8px',
          px: 4,
          '&:hover': { backgroundColor: '#C4A484' },
          '&:disabled': { backgroundColor: '#555', color: '#999' }
        }}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditEmployeeDialog = ({ open, onClose, employee, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', age: '', email: '', password: '', password_confirmation: '', image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

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
      left: '1.5rem',
      right: 'auto',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#E0C181',
    },
    '& .MuiSvgIcon-root': {
      color: '#C4A484',
    },
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        age: employee.age || '',
        email: employee.email || '',
        password: '',
        password_confirmation: '',
        image: null,
      });
      // Get image URL and make it full URL if needed
      let imageUrl = employee.image_url || employee.photo || employee.image || null;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        if (imageUrl.startsWith('/')) {
          imageUrl = `http://127.0.0.1:8000${imageUrl}`;
        } else {
          imageUrl = `http://127.0.0.1:8000/${imageUrl}`;
        }
      }
      setImagePreview(imageUrl);
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
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { background: '#141414', borderRadius: 4 } }}>
      <DialogTitle sx={{ background: '#141414', color: '#E0C181', fontWeight: 'bold', borderRadius: 0 }}>Edit Employee Information</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex', flexDirection: 'column', gap: 2, background: '#141414', color: '#E0C181', p: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '2px dashed #C4A484',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!imagePreview && (
              <Typography sx={{ color: '#C4A484', fontSize: 13 }}>Profile Picture</Typography>
            )}
            <label htmlFor="employee-photo-upload-edit" style={{
              position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', padding: 4, cursor: 'pointer'
            }}>
              <input
                id="employee-photo-upload-edit"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <PhotoCamera sx={{ color: '#E0C181' }} />
            </label>
          </Box>
        </Box>
        
        <TextField
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="off"
          sx={inputFieldStyles}
          InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
        />
        <TextField
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="off"
          sx={inputFieldStyles}
          InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
        />
        <TextField
          name="age"
          label="Age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          autoComplete="off"
          sx={inputFieldStyles}
          InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="off"
          sx={inputFieldStyles}
          InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          placeholder="Leave empty if you don't want to change it"
        />
        <TextField
          name="password_confirmation"
          label="Confirm Password"
          type="password"
          value={formData.password_confirmation}
          onChange={handleChange}
          autoComplete="off"
          sx={inputFieldStyles}
          InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
        />

      </DialogContent>
      <DialogActions sx={{ background: '#141414', m: 0, p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#C4A484' }}>Cancel</Button>
        <Button onClick={handleSave} sx={{
          backgroundColor: '#E0C181',
          color: '#141414',
          fontWeight: 'bold',
          borderRadius: '8px',
          px: 4,
          '&:hover': { backgroundColor: '#C4A484' }
        }}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

// --- Confirmation Dialog Component ---
function ConfirmationDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '12px', border: `1px solid ${alpha(colors.gold, 0.2)}`, fontFamily: 'Arial, sans-serif' } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary, fontFamily: 'Arial, sans-serif' }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ fontFamily: 'Arial, sans-serif', bgcolor: '#D32F2F', '&:hover': { bgcolor: '#B71C1C' } }}>Confirm Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- UserCard Component ---
function UserCard({ user, type, onEdit, onArchive, onUnarchive, onView, onDelete, isArchivedView = false }) {
  const isLawyer = type === 'lawyer';
  // Determine if user is archived - prioritize isArchivedView (which list we're viewing)
  // If we're in archived view, show unarchive button. Otherwise, show archive button.
  const isArchived = isArchivedView;
  
  // Process image URL
  let userImageUrl = user.image_url || user.photo || user.image || null;
  if (userImageUrl && !userImageUrl.startsWith('http') && !userImageUrl.startsWith('data:')) {
    if (userImageUrl.startsWith('/')) {
      userImageUrl = `http://127.0.0.1:8000${userImageUrl}`;
    } else {
      userImageUrl = `http://127.0.0.1:8000/${userImageUrl}`;
    }
  }

  return (
    <UserCardStyled>
      <CardContent sx={{ flexGrow: 1, p: 1.5, textAlign: 'center' }}>
        <Avatar src={userImageUrl} sx={{ width: 64, height: 64, margin: '0 auto 8px', bgcolor: colors.gold, color: colors.black, fontSize: 24 }}>{user.name?.charAt(0) || ''}</Avatar>
        <Typography variant="h6" fontWeight="bold" noWrap sx={{ fontSize: '1rem', mb: 0.5 }}>{user.name}</Typography>
        <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 0, fontSize: '0.85rem' }}>
          Age: {user.age || 'Not specified'}
        </Typography>
        {isLawyer ? (
          <Typography variant="body2" color={colors.gold} sx={{ mb: 0.5, fontSize: '0.85rem' }} noWrap>
            {user.specialty || ''}
          </Typography>
        ) : (
          <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            {user.position || ''}
          </Typography>
        )}
      </CardContent>
      <Divider sx={{ borderColor: alpha(colors.gold, 0.1) }} />
      <CardActions sx={{ justifyContent: 'center', background: alpha(colors.black, 0.3), py: 1 }}>
        <Tooltip title="View Details">
          <IconButton onClick={() => onView(user, type)} size="small" sx={{ color: colors.textSecondary }}>
            <VisibilityOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit">
          <IconButton onClick={() => onEdit(user, type)} size="small" sx={{ color: colors.textSecondary }}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        {isArchived ? (
          <Tooltip title="Unarchive">
            <IconButton onClick={() => onUnarchive(user)} size="small" sx={{ color: '#66bb6a' }}>
              <UnarchiveOutlinedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Archive">
            <IconButton onClick={() => onArchive(user)} size="small" sx={{ color: colors.textSecondary }}>
              <ArchiveOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}

        {isArchivedView && (
          <Tooltip title="Delete Permanently">
            <IconButton onClick={() => onDelete(user, type)} size="small" sx={{ color: '#d32f2f' }}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        )}

      </CardActions>

    </UserCardStyled>
  );
}

// --- UserDetailsDialog Component ---
function UserDetailsDialog({ open, onClose, user }) {
  const [fullUserData, setFullUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      const token = localStorage.getItem('adminToken');
      if (token) {
        setLoading(true);
        const endpoint = user.type === 'lawyer' 
          ? `http://127.0.0.1:8000/api/admin/lawyers/${user.id}`
          : `http://127.0.0.1:8000/api/admin/employees/${user.id}`;
        
        axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          setFullUserData(res.data);
        }).catch(err => {
          console.error('Failed to fetch user details:', err);
          setFullUserData(user); // Fallback to passed user data
        }).finally(() => {
          setLoading(false);
        });
      }
    } else if (!open) {
      setFullUserData(null);
    }
  }, [open, user]);

  if (!user) return null;
  const isLawyer = user.type === 'lawyer';
  const displayData = fullUserData || user;

  // Get specializations for lawyer
  let specializationsList = [];
  if (isLawyer && displayData.specializations) {
    if (Array.isArray(displayData.specializations)) {
      specializationsList = displayData.specializations.map(s => s.name || s);
    } else if (typeof displayData.specializations === 'string') {
      specializationsList = displayData.specializations.split(',').map(s => s.trim());
    }
  }

  // Get certificate URL
  const certificateUrl = displayData.certificate_url || displayData.certificate || null;
  let fullCertificateUrl = null;
  if (certificateUrl && !certificateUrl.startsWith('http') && !certificateUrl.startsWith('data:')) {
    if (certificateUrl.startsWith('/')) {
      fullCertificateUrl = `http://127.0.0.1:8000${certificateUrl}`;
    } else {
      fullCertificateUrl = `http://127.0.0.1:8000/${certificateUrl}`;
    }
  } else {
    fullCertificateUrl = certificateUrl;
  }

  // Get image URL
  let imageUrl = displayData.image_url || displayData.photo || displayData.image || null;
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    if (imageUrl.startsWith('/')) {
      imageUrl = `http://127.0.0.1:8000${imageUrl}`;
    } else {
      imageUrl = `http://127.0.0.1:8000/${imageUrl}`;
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '16px', border: `1px solid ${alpha(colors.gold, 0.2)}` } }}>
      <DialogContent sx={{ p: 4, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, left: 8, color: colors.textSecondary }}><CloseIcon /></IconButton>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: colors.gold }} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar src={imageUrl} sx={{ width: 120, height: 120, bgcolor: colors.gold, fontSize: 48, color: colors.black, mb: 2 }}>{displayData.name?.charAt(0) || ''}</Avatar>
              <Typography variant="h4" fontWeight="bold">{displayData.name}</Typography>
              <Typography color={colors.gold} variant="h6">{isLawyer ? (specializationsList.length > 0 ? specializationsList.join(', ') : displayData.specialty || '') : displayData.position}</Typography>
              <Chip label={displayData.status === 'active' ? 'Active' : 'Archived'} size="small" sx={{ bgcolor: displayData.status === 'active' ? alpha(colors.gold, 0.3) : '#555', color: colors.white, mt: 1 }} />
            </Box>
            <Divider sx={{ my: 2, borderColor: alpha(colors.white, 0.1) }} />
            <Grid container spacing={2} sx={{ textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <EmailOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                <Box>
                  <Typography color={colors.textSecondary} variant="body2">Email</Typography>
                  <Typography>{displayData.email || 'Not specified'}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <BadgeOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                <Box>
                  <Typography color={colors.textSecondary} variant="body2">Age</Typography>
                  <Typography>{displayData.age || 'Not specified'}</Typography>
                </Box>
              </Grid>
              {displayData.phone && (
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <PhoneOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                  <Box>
                    <Typography color={colors.textSecondary} variant="body2">Phone Number</Typography>
                    <Typography>{displayData.phone}</Typography>
                  </Box>
                </Grid>
              )}
              {isLawyer && specializationsList.length > 0 && (
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <GavelOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography color={colors.textSecondary} variant="body2" sx={{ mb: 1 }}>Specializations</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {specializationsList.map((spec, idx) => (
                        <Chip key={idx} label={spec} size="small" sx={{ bgcolor: alpha(colors.gold, 0.2), color: colors.gold, border: `1px solid ${alpha(colors.gold, 0.3)}` }} />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              )}
              {isLawyer && fullCertificateUrl && (
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <DescriptionOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography color={colors.textSecondary} variant="body2" sx={{ mb: 1 }}>Lawyer Certificate</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      href={fullCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: colors.gold,
                        borderColor: colors.gold,
                        '&:hover': { borderColor: colors.darkGold, bgcolor: alpha(colors.gold, 0.1) }
                      }}
                      startIcon={<AttachFileIcon />}
                    >
                      View Certificate
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}
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
  const [archivedLawyers, setArchivedLawyers] = useState([]);
  const [archivedEmployees, setArchivedEmployees] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/login'); return; }
    fetchLawyers(token);
    fetchArchivedLawyers(token);
  }, [navigate]);
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/login'); return; }

    fetchEmployees(token);             // main employees
    fetchArchivedEmployees(token);     // archived employees
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
        // Token is invalid or expired
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    }
  };

  const fetchArchivedLawyers = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/lawyers-archived/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArchivedLawyers(response.data);
    } catch (error) {
      console.error('Failed to fetch archived lawyers:', error);
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
  const fetchArchivedEmployees = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/employees-archived/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArchivedEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch archived employees:', error);
    }
  };


  // --- Filtering Logic ---
  const filteredLawyers = filterStatus === 'archived'
    ? archivedLawyers.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : lawyers.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredEmployees = filterStatus === 'archived'
    ? archivedEmployees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
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

    // Validate that ID exists
    if (!editedLawyer || !editedLawyer.id) {
      alert('Error: Lawyer ID is missing');
      console.error('Lawyer ID is missing:', editedLawyer);
      return;
    }

    // Validate password if provided
    if (editedLawyer.password && editedLawyer.password !== editedLawyer.password_confirmation) {
      alert('Passwords do not match!');
      return;
    }

    const apiData = new FormData();
    apiData.append('name', editedLawyer.name || '');
    apiData.append('age', editedLawyer.age || '');
    
    // Always send email - backend will handle duplicate check excluding current user
    if (editedLawyer.email) {
      apiData.append('email', editedLawyer.email);
    }

    if (editedLawyer.password) {
      apiData.append('password', editedLawyer.password);
      apiData.append('password_confirmation', editedLawyer.password_confirmation);
    }

    // Always send specialization_ids, even if empty array (to clear existing ones)
    if (Array.isArray(editedLawyer.specialization_ids)) {
      // Convert to numbers and filter out invalid values
      const validIds = editedLawyer.specialization_ids
        .map(id => Number(id))
        .filter(id => !isNaN(id) && id > 0);
      
      // Send valid IDs
      validIds.forEach(id => {
        apiData.append('specialization_ids[]', id);
      });
    }

    // Only send image if it's a new file (File object)
    if (editedLawyer.image && editedLawyer.image instanceof File) {
      apiData.append('image', editedLawyer.image);
    }

    // Only send certificate if it's a new file (File object)
    if (editedLawyer.certificate && editedLawyer.certificate instanceof File) {
      apiData.append('certificate', editedLawyer.certificate);
    }

    apiData.append('_method', 'PUT');

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/admin/lawyers/${editedLawyer.id}`, apiData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      // Refetch lawyers list to get updated data
      await fetchLawyers(token);
      setEditLawyerOpen(false);
      alert('Lawyer information updated successfully');
    } catch (error) {
      console.error('Failed to update lawyer:', error.response ? error.response.data : error);
      console.error('Lawyer ID:', editedLawyer.id);
      console.error('Full error:', error);
      
      // Extract all error messages
      let errorMessage = 'An error occurred while updating lawyer information.';
      
      if (error?.response) {
        if (error.response.status === 404) {
          errorMessage = 'Lawyer not found or has been deleted. Please refresh the page.';
        } else if (error.response.data) {
          const errorData = error.response.data;
          
          // If there's a message field
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          // If there are validation errors
          if (errorData.errors) {
            const errorMessages = [];
            Object.keys(errorData.errors).forEach(key => {
              if (Array.isArray(errorData.errors[key])) {
                errorMessages.push(...errorData.errors[key]);
              } else {
                errorMessages.push(errorData.errors[key]);
              }
            });
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('\n');
            }
          }
        }
      }
      
      alert(errorMessage);
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
      // update local state by refetching both lists
      await Promise.all([
        fetchLawyers(token),
        fetchArchivedLawyers(token)
      ]);
      alert('Lawyer archived successfully');
    } catch (error) {
      console.error("Failed to archive lawyer:", error?.response?.data || error);
      alert(error?.response?.data?.message || "An error occurred while archiving the lawyer.");
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
      // update local state by refetching both lists
      await Promise.all([
        fetchLawyers(token),
        fetchArchivedLawyers(token)
      ]);
      alert('Lawyer unarchived successfully');
    } catch (error) {
      console.error("Failed to unarchive lawyer:", error?.response?.data || error);
      alert(error?.response?.data?.message || "An error occurred while unarchiving the lawyer.");
    }
  };

  const handleEditEmployee = (employee) => { setSelectedEmployee(employee); setEditEmployeeOpen(true); };
  const handleSaveEditEmployee = async (editedEmployee) => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/login'); return; }

    // Validate password if provided
    if (editedEmployee.password && editedEmployee.password !== editedEmployee.password_confirmation) {
      alert('Passwords do not match!');
      return;
    }

    const apiData = new FormData();
    apiData.append('name', editedEmployee.name);
    apiData.append('age', editedEmployee.age);
    
    // Always send email - backend will handle duplicate check excluding current user
    if (editedEmployee.email) {
      apiData.append('email', editedEmployee.email);
    }

    if (editedEmployee.password) {
      apiData.append('password', editedEmployee.password);
      apiData.append('password_confirmation', editedEmployee.password_confirmation);
    }

    // Only send image if it's a new file (File object)
    if (editedEmployee.image && editedEmployee.image instanceof File) {
      apiData.append('image', editedEmployee.image);
    }

    apiData.append('_method', 'PUT');

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/admin/employees/${editedEmployee.id}`, apiData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      await fetchEmployees(token);
      setEditEmployeeOpen(false);
      alert('Employee information updated successfully');
    } catch (error) {
      console.error('Failed to update employee:', error.response ? error.response.data : error);
      
      // Extract all error messages
      let errorMessage = 'An error occurred while updating employee information.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // If there's a message field
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // If there are validation errors
        if (errorData.errors) {
          const errorMessages = [];
          Object.keys(errorData.errors).forEach(key => {
            if (Array.isArray(errorData.errors[key])) {
              errorMessages.push(...errorData.errors[key]);
            } else {
              errorMessages.push(errorData.errors[key]);
            }
          });
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
        }
      }
      
      alert(errorMessage);
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
      // update local state by refetching both lists
      await Promise.all([
        fetchEmployees(token),
        fetchArchivedEmployees(token)
      ]);
      alert('Employee archived successfully');
    } catch (error) {
      console.error("Failed to archive employee:", error?.response?.data || error);
      alert(error?.response?.data?.message || "An error occurred while archiving the employee.");
    }
  };

  // Restore (unarchive) for employee
  const handleUnarchiveEmployee = async (employee) => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/employees/${employee.id}/restore`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // update local state by refetching both lists
      await Promise.all([
        fetchEmployees(token),
        fetchArchivedEmployees(token)
      ]);
      alert('Employee unarchived successfully');
    } catch (error) {
      console.error("Failed to unarchive employee:", error?.response?.data || error);
      alert(error?.response?.data?.message || "An error occurred while unarchiving the employee.");
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
        await axios.delete(`http://127.0.0.1:8000/api/admin/lawyers/${userToDelete.id}/force`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refetch archived lawyers list after deletion
        await fetchArchivedLawyers(token);
        alert('Lawyer deleted permanently successfully');
      } else {
        await axios.delete(`http://127.0.0.1:8000/api/admin/employees/${userToDelete.id}/force`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refetch archived employees list after deletion
        await fetchArchivedEmployees(token);
        alert('Employee deleted permanently successfully');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error?.response?.data?.message || 'An error occurred while deleting.');
    } finally {
      setConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const renderControls = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={3} flexWrap="wrap">
      <SearchBar
        variant="outlined"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: colors.gold }} /></InputAdornment>),
        }}
        sx={{ flexGrow: 1, minWidth: '250px' }}
      />
      <StyledToggleButtonGroup value={filterStatus} exclusive onChange={handleFilterChange}>
        <StyledToggleButton value="all">All</StyledToggleButton>
        <StyledToggleButton value="archived">Archived</StyledToggleButton>
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
              fontFamily="Arial, sans-serif"
            >
              User Management
            </Typography> 
            <Typography
              fontFamily="Arial, sans-serif"
              color={colors.textSecondary}
            >
              Manage lawyers and employees in the system
            </Typography>
          </Box>
        </Box>
      </ManagementHeader>

      <StyledTabs value={mainTab} onChange={handleMainTabChange} aria-label="Manage lawyers and employees">
        <StyledTab label="Lawyers" icon={<GavelOutlinedIcon />} iconPosition="start" />
        <StyledTab label="Employees" icon={<BusinessCenterOutlinedIcon />} iconPosition="start" />
      </StyledTabs>

      {renderControls()}

      <Box sx={{ mt: 3 }}>
        {mainTab === 0 && (
          <Grid container spacing={1.5}>
            {filteredLawyers.length === 0 ? (
              <Typography sx={{ mt: 2, color: colors.textSecondary, width: '100%', textAlign: 'center' }}>No lawyers to display</Typography>
            ) : filteredLawyers.map(lawyer => (
              <Grid key={lawyer.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <UserCard
                  key={lawyer.id}
                  user={lawyer}
                  type="lawyer"
                  onEdit={handleEditLawyer}
                  onArchive={handleArchiveLawyer}
                  onUnarchive={handleUnarchiveLawyer}
                  onView={handleViewUser}
                  onDelete={handleDeleteUser}
                  isArchivedView={filterStatus === 'archived'}
                />
              </Grid>
            ))}
          </Grid>
        )}
        {mainTab === 1 && (
          <Grid container spacing={1.5}>
            {filteredEmployees.length === 0 ? (
              <Typography sx={{ mt: 2, color: colors.textSecondary, width: '100%', textAlign: 'center' }}>No employees to display</Typography>
            ) : filteredEmployees.map(employee => (
              <Grid key={employee.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <UserCard
                  key={employee.id}
                  user={employee}
                  type="employee"
                  onEdit={handleEditEmployee}
                  onArchive={handleArchiveEmployee}
                  onUnarchive={handleUnarchiveEmployee}
                  onView={handleViewUser}
                  onDelete={handleDeleteUser}
                  isArchivedView={filterStatus === 'archived'}
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
        title="Confirm User Deletion"
        message="Are you sure you want to permanently delete this user? This action cannot be undone."
      />
    </Box>
  );
}
