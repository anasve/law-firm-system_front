import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Close as CloseIcon,
  ViewModule as ViewModuleIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { WelcomeBanner, StyledButton, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { appointmentsService, clientsService, lawyersService, getToken } from '../services';
import ConfirmationDialog from '../../AdminManagement/components/feedback/ConfirmationDialog';
import AppointmentCalendar from '../components/AppointmentCalendar';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  done: 'success',
  cancelled: 'error',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  done: 'Done',
  cancelled: 'Cancelled',
};

const typeLabels = {
  online: 'Online',
  in_office: 'In Office',
  phone: 'Phone',
};

const FilterCard = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

export default function AppointmentsManagement() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [editFormData, setEditFormData] = useState({
    datetime: '',
    type: 'online',
    meeting_link: '',
    notes: '',
    status: 'pending',
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    lawyer_id: '',
    client_id: '',
    search: '',
  });

  useEffect(() => {
    fetchAppointments();
    fetchLawyers();
    fetchClients();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters, selectedTab]);

  const fetchAppointments = async () => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      navigate('/employee/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.date) params.date = filters.date;
      if (filters.lawyer_id) params.lawyer_id = filters.lawyer_id;
      if (filters.client_id) params.client_id = filters.client_id;

      const response = await appointmentsService.getAppointments(params);
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
        data = response.data.appointments;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
      }
      
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      let errorMessage = 'Failed to load appointments. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        navigate('/employee/login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      const response = await lawyersService.getLawyers();
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.lawyers || []);
      setLawyers(data);
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
      setLawyers([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientsService.getClients({ limit: 100 });
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.clients || []);
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Tab filter
    if (selectedTab === 1) {
      filtered = filtered.filter((apt) => apt.status === 'pending');
    } else if (selectedTab === 2) {
      filtered = filtered.filter((apt) => apt.status === 'confirmed');
    } else if (selectedTab === 3) {
      filtered = filtered.filter((apt) => apt.status === 'done');
    } else if (selectedTab === 4) {
      filtered = filtered.filter((apt) => apt.status === 'cancelled');
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.client?.name?.toLowerCase().includes(searchLower) ||
          apt.lawyer?.name?.toLowerCase().includes(searchLower) ||
          apt.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by datetime (upcoming first)
    filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    setFilteredAppointments(filtered);
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await appointmentsService.getAppointment(id);
      setSelectedAppointment(response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
      setError('Failed to load appointment details');
    }
  };

  const handleConfirm = async () => {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const response = await appointmentsService.confirmAppointment(selectedAppointment.id);
      const successMessage = response.data?.message || 'Appointment confirmed successfully';
      setSuccess(successMessage);
      setConfirmDialogOpen(false);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors ? 
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to confirm appointment';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      await appointmentsService.cancelAppointment(selectedAppointment.id, reason);
      setSuccess('Appointment cancelled successfully');
      setCancelDialogOpen(false);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors ? 
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to cancel appointment';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      setError('');
      await appointmentsService.deleteAppointment(selectedAppointment.id);
      setSuccess('Appointment deleted successfully');
      setDeleteDialogOpen(false);
      setDetailsDialogOpen(false);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // Prepare data according to API documentation
      const data = {
        datetime: editFormData.datetime,
        type: editFormData.type,
        status: editFormData.status,
      };
      
      // Add meeting_link only if type is online
      if (editFormData.type === 'online' && editFormData.meeting_link) {
        data.meeting_link = editFormData.meeting_link.trim();
      } else {
        data.meeting_link = null;
      }
      
      // Add notes if provided
      if (editFormData.notes && editFormData.notes.trim()) {
        data.notes = editFormData.notes.trim();
      } else {
        data.notes = null;
      }
      
      console.log('Updating appointment with data:', data);
      
      const response = await appointmentsService.updateAppointment(selectedAppointment.id, data);
      const successMessage = response.data?.message || 'Appointment updated successfully';
      setSuccess(successMessage);
      setEditDialogOpen(false);
      setSelectedAppointment(null);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      let errorMessage = 'Failed to update appointment';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    const appointmentDate = new Date(appointment.datetime);
    setEditFormData({
      datetime: appointmentDate.toISOString().slice(0, 16), // Format for datetime-local input
      type: appointment.type || 'online',
      meeting_link: appointment.meeting_link || '',
      notes: appointment.notes || '',
      status: appointment.status || 'pending',
    });
    setEditDialogOpen(true);
  };

  const getUpcomingCount = () => {
    const now = new Date();
    return appointments.filter((apt) => new Date(apt.datetime) > now && apt.status !== 'cancelled' && apt.status !== 'done').length;
  };

  const getTodayCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.datetime);
      return aptDate >= today && aptDate < tomorrow && apt.status !== 'cancelled';
    }).length;
  };

  const stats = [
    { label: 'Total Appointments', value: appointments.length },
    { label: 'Upcoming', value: getUpcomingCount() },
    { label: 'Today', value: getTodayCount() },
    { label: 'Pending', value: appointments.filter((apt) => apt.status === 'pending').length },
  ];

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Appointments Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              Manage and organize all appointments
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchAppointments} sx={{ color: colors.gold }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </WelcomeBanner>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: colors.lightBlack,
                textAlign: 'center',
                border: `1px solid ${alpha(colors.gold, 0.1)}`,
              }}
            >
              <Typography variant="h5" sx={{ color: colors.gold, fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <FilterCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ color: colors.gold, mr: 1 }} />
          <Typography variant="h6" sx={{ color: colors.white }}>
            Filters & Search
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledTextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search for client or lawyer..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledTextField
              fullWidth
              type="date"
              label="Date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                sx={{
                  color: colors.white,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.gold, 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.gold, 0.6),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.gold,
                  },
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="done">Done</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Lawyer</InputLabel>
              <Select
                value={filters.lawyer_id}
                onChange={(e) => setFilters({ ...filters, lawyer_id: e.target.value })}
                sx={{
                  color: colors.white,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.gold, 0.3),
                  },
                }}
              >
                <MenuItem value="">All Lawyers</MenuItem>
                {lawyers.map((lawyer) => (
                  <MenuItem key={lawyer.id} value={lawyer.id}>
                    {lawyer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Client</InputLabel>
              <Select
                value={filters.client_id}
                onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
                sx={{
                  color: colors.white,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.gold, 0.3),
                  },
                }}
              >
                <MenuItem value="">All Clients</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({ status: 'all', date: '', lawyer_id: '', client_id: '', search: '' })}
              sx={{
                color: colors.gold,
                borderColor: colors.gold,
                '&:hover': { borderColor: colors.darkGold, backgroundColor: alpha(colors.gold, 0.1) },
                height: '56px',
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </FilterCard>

      {/* View Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, v) => setSelectedTab(v)}
          sx={{
            '& .MuiTab-root': {
              color: colors.textSecondary,
              '&.Mui-selected': { color: colors.gold },
            },
            '& .MuiTabs-indicator': { backgroundColor: colors.gold },
          }}
        >
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="Confirmed" />
          <Tab label="Done" />
          <Tab label="Cancelled" />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Calendar View">
            <IconButton
              onClick={() => setViewMode('calendar')}
              sx={{
                color: viewMode === 'calendar' ? colors.gold : colors.textSecondary,
                backgroundColor: viewMode === 'calendar' ? alpha(colors.gold, 0.1) : 'transparent',
              }}
            >
              <CalendarMonthIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton
              onClick={() => setViewMode('list')}
              sx={{
                color: viewMode === 'list' ? colors.gold : colors.textSecondary,
                backgroundColor: viewMode === 'list' ? alpha(colors.gold, 0.1) : 'transparent',
              }}
            >
              <ViewModuleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Appointments View */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : viewMode === 'calendar' ? (
        <AppointmentCalendar
          appointments={filteredAppointments}
          onDateClick={(date) => {
            setFilters({ ...filters, date: date.toISOString().split('T')[0] });
            setViewMode('list');
          }}
          onAppointmentClick={(appointment) => handleViewDetails(appointment.id)}
        />
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(filteredAppointments) && filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.datetime);
              const isPast = appointmentDate < new Date();
              const isToday =
                appointmentDate.toDateString() === new Date().toDateString();

              return (
                <Grid item xs={12} md={6} key={appointment.id}>
                  <Card
                    sx={{
                      backgroundColor: colors.lightBlack,
                      color: colors.white,
                      border: isToday ? `2px solid ${colors.gold}` : `1px solid ${alpha(colors.gold, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 16px ${alpha(colors.black, 0.3)}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CalendarIcon sx={{ fontSize: 18, color: colors.gold }} />
                            <Typography variant="h6" fontWeight="bold">
                              {appointmentDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 18, color: colors.gold }} />
                            <Typography variant="body1">
                              {appointmentDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </Typography>
                            {isToday && (
                              <Chip
                                label="Today"
                                size="small"
                                sx={{
                                  backgroundColor: colors.gold,
                                  color: colors.black,
                                  ml: 1,
                                  fontWeight: 'bold',
                                }}
                              />
                            )}
                            {isPast && appointment.status !== 'done' && appointment.status !== 'cancelled' && (
                              <Chip
                                label="Past"
                                size="small"
                                color="error"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </Box>
                        <Chip
                          label={statusLabels[appointment.status] || appointment.status}
                          color={statusColors[appointment.status] || 'default'}
                          size="small"
                        />
                      </Box>

                      {appointment.lawyer && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <GavelIcon sx={{ fontSize: 18, color: colors.gold }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Lawyer: <span style={{ color: colors.gold }}>{appointment.lawyer.name}</span>
                          </Typography>
                        </Box>
                      )}

                      {appointment.client && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: colors.gold }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Client: <span style={{ color: colors.gold }}>{appointment.client.name}</span>
                          </Typography>
                        </Box>
                      )}

                      {appointment.type && (
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                          Type: {typeLabels[appointment.type] || appointment.type}
                        </Typography>
                      )}

                      {appointment.meeting_link && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.gold,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            mb: 1,
                          }}
                          onClick={() => window.open(appointment.meeting_link, '_blank')}
                        >
                          Meeting Link
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(appointment.id)}
                        sx={{ color: colors.gold }}
                      >
                        View
                      </Button>
                      <Box>
                        {appointment.status === 'pending' && (
                          <Tooltip title="Confirm">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setConfirmDialogOpen(true);
                              }}
                              sx={{ color: colors.success, mr: 1 }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {appointment.status !== 'cancelled' && appointment.status !== 'done' && (
                          <>
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setCancelDialogOpen(true);
                                }}
                                sx={{ color: colors.error, mr: 1 }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(appointment)}
                                sx={{ color: colors.gold, mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: colors.error }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: colors.lightBlack,
                  color: colors.white,
                  borderRadius: '12px',
                }}
              >
                <Typography variant="h6">No Appointments</Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                  No appointments match the specified criteria
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: colors.white, fontWeight: 'bold' }}>
            Appointment Details
          </Typography>
          <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Date & Time
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {new Date(selectedAppointment.datetime).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={statusLabels[selectedAppointment.status] || selectedAppointment.status}
                    color={statusColors[selectedAppointment.status] || 'default'}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                {selectedAppointment.lawyer && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Lawyer
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedAppointment.lawyer.name}
                    </Typography>
                  </Grid>
                )}
                {selectedAppointment.client && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Client
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedAppointment.client.name}
                    </Typography>
                  </Grid>
                )}
                {selectedAppointment.type && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Type
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {typeLabels[selectedAppointment.type] || selectedAppointment.type}
                    </Typography>
                  </Grid>
                )}
                {selectedAppointment.meeting_link && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Meeting Link
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: colors.gold,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        mb: 2,
                      }}
                      onClick={() => window.open(selectedAppointment.meeting_link, '_blank')}
                    >
                      {selectedAppointment.meeting_link}
                    </Typography>
                  </Grid>
                )}
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedAppointment.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.textSecondary }}>
            Close
          </Button>
          {selectedAppointment?.status === 'pending' && (
            <StyledButton onClick={() => setConfirmDialogOpen(true)}>Confirm</StyledButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Appointment"
        message="Are you sure you want to confirm this appointment?"
        loading={actionLoading}
      />

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
          },
        }}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <StyledTextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason (Optional)"
            sx={{ mt: 2 }}
            onChange={(e) => setSelectedAppointment({ ...selectedAppointment, cancellation_reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} sx={{ color: colors.textSecondary }}>
            Cancel
          </Button>
          <StyledButton
            onClick={() => handleCancel(selectedAppointment?.cancellation_reason || '')}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} sx={{ color: colors.black }} /> : 'Confirm Cancellation'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        loading={actionLoading}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedAppointment(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: colors.white, fontWeight: 'bold' }}>
            Edit Appointment
          </Typography>
          <IconButton onClick={() => {
            setEditDialogOpen(false);
            setSelectedAppointment(null);
          }} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <StyledTextField
              fullWidth
              type="datetime-local"
              label="Date & Time"
              value={editFormData.datetime}
              onChange={(e) => setEditFormData({ ...editFormData, datetime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Type</InputLabel>
              <Select
                value={editFormData.type}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                sx={{
                  color: colors.white,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.gold, 0.3),
                  },
                }}
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="in_office">In Office</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
              </Select>
            </FormControl>
            {editFormData.type === 'online' && (
              <StyledTextField
                fullWidth
                label="Meeting Link"
                value={editFormData.meeting_link}
                onChange={(e) => setEditFormData({ ...editFormData, meeting_link: e.target.value })}
                placeholder="https://meet.google.com/xxx"
              />
            )}
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Status</InputLabel>
              <Select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                sx={{
                  color: colors.white,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.gold, 0.3),
                  },
                }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="done">Done</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <StyledTextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={editFormData.notes}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedAppointment(null);
            }}
            sx={{ color: colors.textSecondary }}
          >
            Cancel
          </Button>
          <StyledButton onClick={handleUpdate} disabled={actionLoading || !editFormData.datetime}>
            {actionLoading ? <CircularProgress size={24} sx={{ color: colors.black }} /> : 'Update Appointment'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
