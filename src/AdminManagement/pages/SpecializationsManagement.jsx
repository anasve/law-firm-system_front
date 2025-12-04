import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Snackbar, Alert, Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../constants';
import { usersService } from '../services/usersService';
import { getToken, removeToken } from '../services/api';
import { StyledTabs, StyledTab } from '../components/specializations/SpecializationsManagementStyles';
import SearchBar from '../components/ui/SearchBar';
import SpecializationItem from '../components/SpecializationItem';
import SpecializationFormDialog from '../components/forms/SpecializationFormDialog';
import ConfirmationDialog from '../components/feedback/ConfirmationDialog';
import DescriptionDialog from '../components/DescriptionDialog';
import EmptyState from '../components/feedback/EmptyState';

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
    try {
      const response = await usersService.getSpecializations();
      setSpecializations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
      setSpecializations([]);
      if (error.response?.status === 401) {
        removeToken();
        navigate('/');
      } else {
        showSnackbar('Failed to load specializations', 'error');
      }
    }
  };

  const fetchArchivedSpecializations = async () => {
    try {
      const response = await usersService.getArchivedSpecializations();
      
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data?.specializations && Array.isArray(response.data.specializations)) {
        data = response.data.specializations;
      }
      
      setArchivedSpecializations(data);
    } catch (error) {
      console.error('Failed to fetch archived specializations:', error);
      setArchivedSpecializations([]);
      if (error.response?.status === 401) {
        removeToken();
        navigate('/');
      }
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/');
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
    if (currentTab === 1) {
      fetchArchivedSpecializations();
    }
  }, [currentTab]);

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const handleTabChange = (_, newVal) => setCurrentTab(newVal);

  const handleArchive = async (id) => {
    try {
      await usersService.archiveSpecialization(id);
      await Promise.all([
        fetchSpecializations(),
        fetchArchivedSpecializations()
      ]);
      showSnackbar('Specialization archived successfully', 'success');
    } catch (error) {
      console.error('Archive failed:', error);
      showSnackbar(error?.response?.data?.message || 'Failed to archive specialization', 'error');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await usersService.restoreSpecialization(id);
      await Promise.all([
        fetchSpecializations(),
        fetchArchivedSpecializations()
      ]);
      showSnackbar('Specialization restored successfully', 'success');
    } catch (err) {
      console.error('Restore failed:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to restore specialization', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await usersService.deleteSpecialization(itemToDelete);
      await fetchArchivedSpecializations();
      showSnackbar('Specialization deleted permanently successfully', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to delete specialization', 'error');
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
      await usersService.updateSpecialization(currentSpecialization.id, {
        name: currentSpecialization.name,
        description: currentSpecialization.description
      });
      await Promise.all([
        fetchSpecializations(),
        fetchArchivedSpecializations()
      ]);
      handleDialogClose(setIsEditDialogOpen)();
      showSnackbar('Changes saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save changes:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save changes';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleAddNew = async () => {
    try {
      await usersService.createSpecialization(currentSpecialization);
      await fetchSpecializations();
      handleDialogClose(setIsAddDialogOpen)();
      showSnackbar('Specialization added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add specialization:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add specialization';
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
      </Box>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={currentTab === 0 ? handleAddClick : null}
        addButtonText="Add Specialization"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <StyledTabs value={currentTab} onChange={handleTabChange}>
          <StyledTab 
            label="Active Specializations" 
            icon={
              <Chip 
                label={Array.isArray(specializations) ? specializations.length : 0} 
                size="small" 
                sx={{ bgcolor: colors.success, color: colors.white, height: '18px', fontSize: '0.7rem' }} 
              />
            } 
          />
          <StyledTab 
            label="Archive" 
            icon={
              <Chip 
                label={Array.isArray(archivedSpecializations) ? archivedSpecializations.length : 0} 
                size="small" 
                sx={{ height: '18px', fontSize: '0.7rem' }} 
              />
            } 
          />
        </StyledTabs>
      </Box>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={70} sx={{ borderRadius: '8px', mb: 1.5, bgcolor: colors.lightBlack }} />
        ))
      ) : filteredSpecializations.length ? (
        filteredSpecializations.map(spec => (
          <SpecializationItem
            key={spec.id}
            specialization={spec}
            currentTab={currentTab}
            onEdit={handleEditClick}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onDelete={handleDeleteClick}
            onViewDescription={handleViewDescription}
          />
        ))
      ) : (
        <EmptyState 
          message={searchQuery ? "No results found." : ""} 
          tab={currentTab}
          messages={{
            0: "No specializations match your search",
            1: "Archive is currently empty"
          }}
        />
      )}

      <SpecializationFormDialog
        open={isAddDialogOpen}
        onClose={handleDialogClose(setIsAddDialogOpen)}
        onSubmit={handleAddNew}
        specialization={currentSpecialization}
        onChange={handleFormChange}
      />

      <SpecializationFormDialog
        open={isEditDialogOpen}
        onClose={handleDialogClose(setIsEditDialogOpen)}
        onSubmit={handleSaveChanges}
        specialization={currentSpecialization}
        onChange={handleFormChange}
      />

      <DescriptionDialog 
        open={isDescriptionOpen} 
        onClose={handleDialogClose(setIsDescriptionOpen)} 
        specialization={currentSpecialization} 
      />

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
        <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

