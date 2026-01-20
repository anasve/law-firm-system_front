import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Grid, InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { colors } from '../constants';
import { usersService } from '../services/usersService';
import { getToken, removeToken } from '../services/api';
import { ManagementHeader, SearchTextField, StyledToggleButtonGroup, StyledToggleButton } from '../components/users/UserManagementStyles';
import UserCard from '../components/users/UserCard';
import EditEmployeeDialog from '../components/users/EditEmployeeDialog';
import UserDetailsDialog from '../components/users/UserDetailsDialog';
import ConfirmationDialog from '../components/feedback/ConfirmationDialog';

export default function EmployeesManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [archivedEmployees, setArchivedEmployees] = useState([]);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewUserOpen, setViewUserOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/'); return; }
    fetchEmployees();
    fetchArchivedEmployees();
  }, [navigate]);

  const fetchEmployees = async () => {
    try {
      const response = await usersService.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      if (error.response?.status === 401) {
        removeToken();
        navigate('/');
      }
    }
  };

  const fetchArchivedEmployees = async () => {
    try {
      const response = await usersService.getArchivedEmployees();
      setArchivedEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch archived employees:', error);
    }
  };

  const filteredEmployees = filterStatus === 'archived'
    ? archivedEmployees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleFilterChange = (_, newFilter) => { if (newFilter !== null) setFilterStatus(newFilter); };
  const handleViewUser = (user, type) => { setSelectedUserForView({ ...user, type }); setViewUserOpen(true); };
  const handleCloseViewDialog = () => { setViewUserOpen(false); setSelectedUserForView(null); };
  const handleEditEmployee = (employee) => { setSelectedEmployee(employee); setEditEmployeeOpen(true); };

  const handleSaveEditEmployee = async (editedEmployee) => {
    const token = getToken();
    if (!token) { navigate('/'); return; }

    if (editedEmployee.password && editedEmployee.password !== editedEmployee.password_confirmation) {
      alert('Passwords do not match!');
      return;
    }

    const apiData = new FormData();
    apiData.append('name', editedEmployee.name);
    apiData.append('age', editedEmployee.age);
    if (editedEmployee.email) {
      apiData.append('email', editedEmployee.email);
    }
    if (editedEmployee.phone) {
      apiData.append('phone', editedEmployee.phone);
    }
    if (editedEmployee.address) {
      apiData.append('address', editedEmployee.address);
    }
    if (editedEmployee.password) {
      apiData.append('password', editedEmployee.password);
      apiData.append('password_confirmation', editedEmployee.password_confirmation);
    }
    if (editedEmployee.photo && editedEmployee.photo instanceof File) {
      apiData.append('photo', editedEmployee.photo);
    }
    apiData.append('_method', 'PUT');

    try {
      await usersService.updateEmployee(editedEmployee.id, apiData);
      await fetchEmployees();
      setEditEmployeeOpen(false);
      alert('Employee information updated successfully');
    } catch (error) {
      console.error('Failed to update employee:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating employee information.';
      alert(errorMessage);
    }
  };

  const handleArchiveEmployee = async (employee) => {
    const token = getToken();
    if (!token) { navigate("/"); return; }

    try {
      await usersService.archiveEmployee(employee.id);
      await Promise.all([fetchEmployees(), fetchArchivedEmployees()]);
      alert('Employee archived successfully');
    } catch (error) {
      console.error("Failed to archive employee:", error);
      alert(error?.response?.data?.message || "An error occurred while archiving the employee.");
    }
  };

  const handleUnarchiveEmployee = async (employee) => {
    const token = getToken();
    if (!token) { navigate("/"); return; }

    try {
      await usersService.restoreEmployee(employee.id);
      await Promise.all([fetchEmployees(), fetchArchivedEmployees()]);
      alert('Employee unarchived successfully');
    } catch (error) {
      console.error("Failed to unarchive employee:", error);
      alert(error?.response?.data?.message || "An error occurred while unarchiving the employee.");
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
      await usersService.deleteEmployee(userToDelete.id);
      await fetchArchivedEmployees();
      alert('Employee deleted permanently successfully');
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
            <BusinessCenterOutlinedIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" fontFamily="Arial, sans-serif">
              Employees Management
            </Typography>
            <Typography fontFamily="Arial, sans-serif" color={colors.textSecondary}>
              Manage employees in the system
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
          {filteredEmployees.length === 0 ? (
            <Typography sx={{ mt: 2, color: colors.textSecondary, width: '100%', textAlign: 'center' }}>
              No employees to display
            </Typography>
          ) : filteredEmployees.map(employee => (
            <Grid key={employee.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <UserCard
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
      </Box>

      <EditEmployeeDialog
        open={editEmployeeOpen}
        onClose={() => setEditEmployeeOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveEditEmployee}
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
        title="Confirm Employee Deletion"
        message="Are you sure you want to permanently delete this employee? This action cannot be undone."
      />
    </Box>
  );
}

