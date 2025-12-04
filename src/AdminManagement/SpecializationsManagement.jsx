import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, IconButton, Button, TextField, InputAdornment, Divider, Chip,
  Tabs, Tab, Snackbar, Alert, Tooltip, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

const colors = {
  gold: '#D4AF37',
  black: '#141414',
  lightBlack: '#232323',
  white: '#FFFFFF',
  textDark: '#000000',
  textLight: alpha('#FFFFFF', 0.8),
  error: '#d32f2f',
  success: '#66bb6a',
  info: '#29b6f6',
  grey: '#888'
};

const SearchTextField = styled(TextField)({
  '& .MuiInput-underline:before': { borderBottomColor: alpha(colors.white, 0.4) },
  '&:hover .MuiInput-underline:before': { borderBottomColor: colors.gold },
  '& .MuiInput-underline:after': { borderBottomColor: colors.gold },
  '& .MuiInputBase-input': { color: colors.white, fontFamily: 'Arial, sans-serif' }
});

const SpecializationItem = styled(Box)(({ theme }) => ({
  backgroundColor: colors.white,
  color: colors.textDark,
  borderRadius: '8px',
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
  }
}));

const StyledTabs = styled(Tabs)({
  minHeight: '48px',
  '& .MuiTabs-indicator': { backgroundColor: colors.gold, height: '3px', borderRadius: '2px' }
});

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: '48px',
  color: alpha(colors.white, 0.7),
  fontWeight: 'bold',
  fontFamily: 'Arial, sans-serif',
  '&.Mui-selected': { color: colors.gold },
  textTransform: 'none',
  fontSize: '0.8rem',
  gap: theme.spacing(0.75)
}));

const EmptyState = ({ message, tab }) => (
  <Box sx={{ textAlign: 'center', p: 8, color: colors.textLight }}>
    <FindInPageOutlinedIcon sx={{ fontSize: 80, mb: 2, color: alpha(colors.white, 0.3) }} />
    <Typography variant="h6" fontWeight="bold">
      {tab === 0 ? "No specializations match your search" : "Archive is currently empty"}
    </Typography>
    <Typography variant="body1">{message}</Typography>
  </Box>
);

function ConfirmationDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '12px', border: `1px solid ${alpha(colors.gold, 0.2)}` } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent><Typography>{message}</Typography></DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: colors.textLight }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Confirm Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

function DescriptionDialog({ open, onClose, specialization }) {
  if (!specialization) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '12px' } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Description: {specialization.name || 'Specialization'}</DialogTitle>
      <DialogContent>
        <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: colors.textLight, pt: 1 }}>
          {specialization.description || 'No description available.'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: colors.textLight }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SpecializationsManagement() {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);
  const [archivedSpecializations, setArchivedSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [currentSpecialization, setCurrentSpecialization] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchSpecializations = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/specializations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecializations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
      // Always set to empty array on error to prevent filter errors
      setSpecializations([]);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      } else {
        showSnackbar('Failed to load specializations', 'error');
      }
    }
  };

  const fetchArchivedSpecializations = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/specializations-archived/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Try different possible data structures
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && Array.isArray(response.data.specializations)) {
        data = response.data.specializations;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, try to extract array from it
        const keys = Object.keys(response.data);
        if (keys.length > 0 && Array.isArray(response.data[keys[0]])) {
          data = response.data[keys[0]];
        }
      }
      
      setArchivedSpecializations(data);
    } catch (error) {
      console.error('Failed to fetch archived specializations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      // Always set to empty array on error to prevent filter errors
      setArchivedSpecializations([]);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSpecializations(),
        fetchArchivedSpecializations()
      ]);
      setLoading(false);
    };
    loadData();
  }, [navigate]);

  useEffect(() => {
    // Always fetch when tab changes, regardless of loading state
    if (currentTab === 1) {
      console.log('Switching to Archive tab, fetching archived specializations...');
      fetchArchivedSpecializations();
    }
    // Don't refetch active list when switching to active tab, it's already loaded
  }, [currentTab]);

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const handleTabChange = (_, newVal) => setCurrentTab(newVal);

  const handleArchive = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`http://127.0.0.1:8000/api/admin/specializations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch both lists to ensure UI consistency
      await Promise.all([
        fetchSpecializations(),
        fetchArchivedSpecializations()
      ]);
      alert('Specialization archived successfully');
    } catch (error) {
      console.error('Archive failed:', error);
      alert(error?.response?.data?.message || 'Failed to archive specialization');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.put(`http://127.0.0.1:8000/api/admin/specializations/${id}/restore`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch both lists to ensure UI consistency
      await Promise.all([
        fetchSpecializations(),
        fetchArchivedSpecializations()
      ]);
      alert('Specialization restored successfully');
    } catch (err) {
      console.error('Restore failed:', err);
      alert(err?.response?.data?.message || 'Failed to restore specialization');
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`http://127.0.0.1:8000/api/admin/specializations/${itemToDelete}/force`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch archived list after deletion
      await fetchArchivedSpecializations();
      alert('Specialization deleted permanently successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err?.response?.data?.message || 'Failed to delete specialization');
    } finally {
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEditClick = (spec) => {
    setCurrentSpecialization({ ...spec });
    setIsEditDialogOpen(true);
  };

  const handleAddClick = () => {
    setCurrentSpecialization({ name: '', description: '' });
    setIsAddDialogOpen(true);
  };

  const handleViewDescription = (spec) => {
    setCurrentSpecialization(spec);
    setIsDescriptionOpen(true);
  };

  const handleDialogClose = (setter) => () => {
    setter(false);
    setTimeout(() => setCurrentSpecialization(null), 300);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.put(
        `http://127.0.0.1:8000/api/admin/specializations/${currentSpecialization.id}`,
        {
          name: currentSpecialization.name,
          description: currentSpecialization.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch lists to ensure UI consistency
      await Promise.all([
        fetchSpecializations(),
        fetchArchivedSpecializations()
      ]);
      handleDialogClose(setIsEditDialogOpen)();
      showSnackbar('Changes saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save changes:', error);
      let errorMessage = 'Failed to save changes';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errorMessages = [];
        Object.keys(error.response.data.errors).forEach(key => {
          if (Array.isArray(error.response.data.errors[key])) {
            errorMessages.push(...error.response.data.errors[key]);
          } else {
            errorMessages.push(error.response.data.errors[key]);
          }
        });
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n');
        }
      }
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleAddNew = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.post('http://127.0.0.1:8000/api/admin/specializations', currentSpecialization, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch lists to ensure UI consistency
      await fetchSpecializations();
      handleDialogClose(setIsAddDialogOpen)();
      showSnackbar('Specialization added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add specialization:', error);
      let errorMessage = 'Failed to add specialization';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errorMessages = [];
        Object.keys(error.response.data.errors).forEach(key => {
          if (Array.isArray(error.response.data.errors[key])) {
            errorMessages.push(...error.response.data.errors[key]);
          } else {
            errorMessages.push(error.response.data.errors[key]);
          }
        });
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n');
        }
      }
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleFormChange = (e) => setCurrentSpecialization(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const searchFilter = (s) => {
    const q = searchQuery.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  };

  const filteredSpecializations = currentTab === 0
    ? (Array.isArray(specializations) ? specializations : []).filter(searchFilter)
    : (Array.isArray(archivedSpecializations) ? archivedSpecializations : []).filter(searchFilter);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, fontFamily: 'Arial, sans-serif', color: colors.white, bgcolor: colors.black, minHeight: '100vh', direction: 'ltr' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">Specializations Management</Typography>
        {currentTab === 1 && (
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              color: colors.gold,
              borderColor: colors.gold,
              '&:hover': { borderColor: colors.gold, backgroundColor: alpha(colors.gold, 0.1) }
            }}
          >
            Return to Home
          </Button>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
        <SearchTextField
          variant="standard"
          placeholder="Search for specialization..."
          fullWidth
          sx={{ flexGrow: 1 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: alpha(colors.white, 0.6) }} /></InputAdornment>)
          }}
        />
        {currentTab === 0 && (
          <Button
            onClick={handleAddClick}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ backgroundColor: colors.gold, color: colors.black, fontWeight: 'bold', padding: '10px 24px', borderRadius: '12px', '&:hover': { backgroundColor: '#B4943C' } }}
          >
            Add Specialization
          </Button>
        )}
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <StyledTabs value={currentTab} onChange={handleTabChange}>
          <StyledTab label="Active Specializations" icon={<Chip label={Array.isArray(specializations) ? specializations.length : 0} size="small" sx={{ bgcolor: colors.success, color: colors.white, height: '18px', fontSize: '0.7rem' }} />} />
          <StyledTab label="Archive" icon={<Chip label={Array.isArray(archivedSpecializations) ? archivedSpecializations.length : 0} size="small" sx={{ height: '18px', fontSize: '0.7rem' }} />} />
        </StyledTabs>
      </Box>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={70} sx={{ borderRadius: '8px', mb: 1.5, bgcolor: colors.lightBlack }} />
        ))
      ) : filteredSpecializations.length ? (
        filteredSpecializations.map(spec => (
          <SpecializationItem key={spec.id}>
            <Typography variant="h6" fontWeight="bold">{spec.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Button
                variant="outlined"
                endIcon={<SearchIcon />}
                onClick={() => handleViewDescription(spec)}
                sx={{ color: colors.gold, borderColor: alpha(colors.gold, 0.5), '&:hover': { borderColor: colors.gold, bgcolor: alpha(colors.gold, 0.1) } }}
              >
                View Description
              </Button>
              <Divider orientation="vertical" flexItem sx={{ mx: 1.5, borderColor: alpha(colors.grey, 0.2) }} />
              {currentTab === 0 ? (
                <>
                  <Tooltip title="Edit"><IconButton onClick={() => handleEditClick(spec)}><EditIcon sx={{ color: colors.info }} /></IconButton></Tooltip>
                  <Tooltip title="Archive"><IconButton onClick={() => handleArchive(spec.id)}><ArchiveIcon sx={{ color: colors.grey }} /></IconButton></Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Restore"><IconButton onClick={() => handleUnarchive(spec.id)}><UnarchiveIcon sx={{ color: colors.success }} /></IconButton></Tooltip>
                  <Tooltip title="Delete Permanently"><IconButton onClick={() => handleDeleteClick(spec.id)}><DeleteForeverIcon sx={{ color: colors.error }} /></IconButton></Tooltip>
                </>
              )}
            </Box>
          </SpecializationItem>
        ))
      ) : (
        <EmptyState message={searchQuery ? "No results found." : ""} tab={currentTab} />
      )}

      {/* Dialogs */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onClose={handleDialogClose(isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen)}
        fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>{isAddDialogOpen ? 'Add New Specialization' : 'Edit Specialization'}</DialogTitle>
        <DialogContent sx={{ pt: '20px!important', mt: 1 }}>
          <TextField
            autoFocus
            name="name"
            label="Specialization Type"
            fullWidth
            variant="filled"
            value={currentSpecialization?.name || ''}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: colors.textLight } }}
            InputProps={{ sx: { color: colors.white, backgroundColor: colors.black, borderRadius: '4px' } }}
          />
          <TextField
            name="description"
            label="Specialization Description"
            fullWidth multiline rows={4}
            variant="filled"
            value={currentSpecialization?.description || ''}
            onChange={handleFormChange}
            InputLabelProps={{ sx: { color: colors.textLight } }}
            InputProps={{ sx: { color: colors.white, backgroundColor: colors.black, borderRadius: '4px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleDialogClose(isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen)} sx={{ color: colors.textLight }}>Cancel</Button>
          <Button
            onClick={isAddDialogOpen ? handleAddNew : handleSaveChanges}
            variant="contained"
            sx={{ backgroundColor: colors.gold, color: colors.black, '&:hover': { backgroundColor: '#B4943C' } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <DescriptionDialog open={isDescriptionOpen} onClose={handleDialogClose(setIsDescriptionOpen)} specialization={currentSpecialization} />
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to permanently delete this specialization? This action cannot be undone."
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
