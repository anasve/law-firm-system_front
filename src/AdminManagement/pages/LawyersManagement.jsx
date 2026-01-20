import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Grid, InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { colors } from '../constants';
import { usersService } from '../services/usersService';
import { getToken, removeToken } from '../services/api';
import { ManagementHeader, StyledTabs, StyledTab, SearchTextField, StyledToggleButtonGroup, StyledToggleButton } from '../components/users/UserManagementStyles';
import UserCard from '../components/users/UserCard';
import EditLawyerDialog from '../components/users/EditLawyerDialog';
import UserDetailsDialog from '../components/users/UserDetailsDialog';
import ConfirmationDialog from '../components/feedback/ConfirmationDialog';

export default function LawyersManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lawyers, setLawyers] = useState([]);
  const [archivedLawyers, setArchivedLawyers] = useState([]);
  const [editLawyerOpen, setEditLawyerOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [viewUserOpen, setViewUserOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/'); return; }
    fetchLawyers();
    fetchArchivedLawyers();
  }, [navigate]);

  const fetchLawyers = async () => {
    try {
      const response = await usersService.getLawyers();
      setLawyers(response.data);
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
      if (error.response?.status === 401) {
        removeToken();
        navigate('/');
      }
    }
  };

  const fetchArchivedLawyers = async () => {
    try {
      const response = await usersService.getArchivedLawyers();
      setArchivedLawyers(response.data);
    } catch (error) {
      console.error('Failed to fetch archived lawyers:', error);
    }
  };

  const filteredLawyers = filterStatus === 'archived'
    ? archivedLawyers.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : lawyers.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleFilterChange = (_, newFilter) => { if (newFilter !== null) setFilterStatus(newFilter); };
  const handleViewUser = (user, type) => { setSelectedUserForView({ ...user, type }); setViewUserOpen(true); };
  const handleCloseViewDialog = () => { setViewUserOpen(false); setSelectedUserForView(null); };
  const handleEditLawyer = (lawyer) => { setSelectedLawyer(lawyer); setEditLawyerOpen(true); };

  const handleSaveEditLawyer = async (editedLawyer) => {
    const token = getToken();
    if (!token) { navigate('/'); return; }

    if (!editedLawyer || !editedLawyer.id) {
      alert('Error: Lawyer ID is missing');
      return;
    }

    if (editedLawyer.password && editedLawyer.password !== editedLawyer.password_confirmation) {
      alert('Passwords do not match!');
      return;
    }

    const apiData = new FormData();
    apiData.append('name', editedLawyer.name || '');
    apiData.append('age', editedLawyer.age || '');
    if (editedLawyer.email) {
      apiData.append('email', editedLawyer.email);
    }
    if (editedLawyer.phone) {
      apiData.append('phone', editedLawyer.phone);
    }
    if (editedLawyer.address) {
      apiData.append('address', editedLawyer.address);
    }
    if (editedLawyer.password) {
      apiData.append('password', editedLawyer.password);
      apiData.append('password_confirmation', editedLawyer.password_confirmation);
    }
    if (Array.isArray(editedLawyer.specialization_ids)) {
      const validIds = editedLawyer.specialization_ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
      validIds.forEach(id => {
        apiData.append('specialization_ids[]', id);
      });
    }
    if (editedLawyer.photo && editedLawyer.photo instanceof File) {
      apiData.append('photo', editedLawyer.photo);
    }
    if (editedLawyer.certificate && editedLawyer.certificate instanceof File) {
      apiData.append('certificate', editedLawyer.certificate);
    }
    apiData.append('_method', 'PUT');

    try {
      await usersService.updateLawyer(editedLawyer.id, apiData);
      await fetchLawyers();
      setEditLawyerOpen(false);
      alert('Lawyer information updated successfully');
    } catch (error) {
      console.error('Failed to update lawyer:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating lawyer information.';
      alert(errorMessage);
    }
  };

  const handleArchiveLawyer = async (lawyer) => {
    const token = getToken();
    if (!token) { navigate("/"); return; }

    try {
      await usersService.archiveLawyer(lawyer.id);
      await Promise.all([fetchLawyers(), fetchArchivedLawyers()]);
      alert('Lawyer archived successfully');
    } catch (error) {
      console.error("Failed to archive lawyer:", error);
      alert(error?.response?.data?.message || "An error occurred while archiving the lawyer.");
    }
  };

  const handleUnarchiveLawyer = async (lawyer) => {
    const token = getToken();
    if (!token) { navigate("/"); return; }

    try {
      await usersService.restoreLawyer(lawyer.id);
      await Promise.all([fetchLawyers(), fetchArchivedLawyers()]);
      alert('Lawyer unarchived successfully');
    } catch (error) {
      console.error("Failed to unarchive lawyer:", error);
      alert(error?.response?.data?.message || "An error occurred while unarchiving the lawyer.");
    }
  };

  const handleDeleteUser = (user, type) => {
    setUserToDelete({ ...user, type });
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const token = getToken();
    if (!token) {
      navigate('/');
      return;
    }

    try {
      await usersService.deleteLawyer(userToDelete.id);
      await fetchArchivedLawyers();
      alert('Lawyer deleted permanently successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error?.response?.data?.message || 'An error occurred while deleting.');
    } finally {
      setConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#121212', minHeight: '100vh', color: colors.white }}>
      <ManagementHeader>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: colors.gold, color: colors.black, width: 56, height: 56, mr: 2 }}>
            <GavelOutlinedIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" fontFamily="Arial, sans-serif">
              Lawyers Management
            </Typography>
            <Typography fontFamily="Arial, sans-serif" color={colors.textSecondary}>
              Manage lawyers in the system
            </Typography>
          </Box>
        </Box>
      </ManagementHeader>

      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <SearchTextField
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

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={1.5}>
          {filteredLawyers.length === 0 ? (
            <Typography sx={{ mt: 2, color: colors.textSecondary, width: '100%', textAlign: 'center' }}>
              No lawyers to display
            </Typography>
          ) : filteredLawyers.map(lawyer => (
            <Grid key={lawyer.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <UserCard
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
      </Box>

      <EditLawyerDialog
        open={editLawyerOpen}
        onClose={() => setEditLawyerOpen(false)}
        lawyer={selectedLawyer}
        onSave={handleSaveEditLawyer}
      />

      <UserDetailsDialog
        open={viewUserOpen}
        onClose={handleCloseViewDialog}
        user={selectedUserForView}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Lawyer Deletion"
        message="Are you sure you want to permanently delete this lawyer? This action cannot be undone."
      />
    </Box>
  );
}

