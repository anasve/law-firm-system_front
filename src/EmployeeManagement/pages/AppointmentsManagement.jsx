import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { CalendarMonth } from '../components';
import { useNavigate } from 'react-router-dom';

// Constants
const STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'info',
  done: 'success',
  cancelled: 'error',
  rejected: 'error',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  done: 'Done',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const TYPE_LABELS = {
  online: 'Online',
  in_office: 'In Office',
  phone: 'Phone',
};

const REFRESH_INTERVAL = 30000; // 30 seconds
// Styled Components
const FilterCard = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

export default function AppointmentsManagement() {
  const navigate = useNavigate();
  
  // Main state
  const [appointments, setAppointments] = useState([]);
  const [customTimeRequests, setCustomTimeRequests] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    lawyer_id: '',
    client_id: '',
    search: '',
  });

  // Fetch functions
  const fetchAppointments = useCallback(async () => {
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
      
      // Auto-update expired appointments to 'done'
      const updatedData = data.map((apt) => {
        if (apt.status === 'confirmed' || apt.status === 'pending') {
          let appointmentDateTime = null;
          
          if (apt.datetime) {
            // Handle both "YYYY-MM-DD HH:mm:ss" and "YYYY-MM-DDTHH:mm:ss" formats
            appointmentDateTime = apt.datetime.replace(' ', 'T');
            console.log(`[Fetch] Appointment ${apt.id}: datetime=${apt.datetime}, normalized=${appointmentDateTime}`);
          } else if (apt.preferred_date && apt.preferred_time) {
            // Format preferred_time to ensure it has seconds if needed
            let timeStr = apt.preferred_time.trim();
            if (timeStr && !timeStr.includes(':')) {
              // Invalid time format, skip
              return apt;
            }
            // If time doesn't have seconds, add :00
            if (timeStr.split(':').length === 2) {
              timeStr = `${timeStr}:00`;
            }
            appointmentDateTime = `${apt.preferred_date}T${timeStr}`;
          }
          
          if (appointmentDateTime) {
            try {
              // Normalize datetime format for Date parsing
              let normalizedDateTime = appointmentDateTime;
              // Replace space with T if present
              if (normalizedDateTime.includes(' ') && !normalizedDateTime.includes('T')) {
                normalizedDateTime = normalizedDateTime.replace(' ', 'T');
              }
              // No need to add timezone, Date constructor handles local time by default
              
              const aptDate = new Date(normalizedDateTime);
              const now = new Date();
              
              // Check if date is valid
              if (!isNaN(aptDate.getTime())) {
                // If appointment time has passed, mark as done
                if (aptDate < now) {
                  console.log(`Marking appointment ${apt.id} as done. Time: ${aptDate.toISOString()}, Now: ${now.toISOString()}`);
                  return { ...apt, status: 'done' };
                }
              } else {
                console.warn('Invalid date parsed:', normalizedDateTime, 'for appointment:', apt.id);
              }
            } catch (e) {
              // Invalid date format, skip
              console.warn('Invalid appointment date format:', appointmentDateTime, 'Error:', e);
            }
          }
        }
        return apt;
      });
      
      // Log updated appointments
      const doneAppointments = updatedData.filter(apt => apt.status === 'done');
      if (doneAppointments.length > 0) {
        console.log('[Fetch] Marked', doneAppointments.length, 'appointments as done:', doneAppointments.map(apt => ({ id: apt.id, datetime: apt.datetime, status: apt.status })));
      }
      
      setAppointments(updatedData);
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
  }, [filters.status, filters.date, filters.lawyer_id, filters.client_id, navigate]);

  const fetchCustomTimeRequests = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await appointmentsService.getCustomTimeRequests();
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data?.custom_time_requests && Array.isArray(response.data.custom_time_requests)) {
        data = response.data.custom_time_requests;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
      }
      
      setCustomTimeRequests(data);
    } catch (error) {
      console.error('Failed to fetch custom time requests:', error);
      setCustomTimeRequests([]);
    }
  }, []);

  const fetchLawyers = useCallback(async () => {
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
  }, []);

  const fetchClients = useCallback(async () => {
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
  }, []);

  // Apply filters with memoization
  const applyFilters = useCallback(() => {
    // Custom time requests tab
    if (selectedTab === 5) {
      let filtered = [...customTimeRequests];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (apt) =>
            apt.client?.name?.toLowerCase().includes(searchLower) ||
            apt.lawyer?.name?.toLowerCase().includes(searchLower) ||
            apt.notes?.toLowerCase().includes(searchLower) ||
            apt.subject?.toLowerCase().includes(searchLower)
        );
      }
      
      filtered.sort((a, b) => {
        const dateA = new Date(a.datetime || a.preferred_date || 0);
        const dateB = new Date(b.datetime || b.preferred_date || 0);
        return dateB - dateA;
      });
      
      setFilteredAppointments(filtered);
      return;
    }

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
          apt.notes?.toLowerCase().includes(searchLower) ||
          apt.subject?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by datetime (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.datetime || a.preferred_date || 0);
      const dateB = new Date(b.datetime || b.preferred_date || 0);
      return dateA - dateB;
    });

    setFilteredAppointments(filtered);
  }, [appointments, customTimeRequests, filters, selectedTab]);

  // Handlers
  const handleViewDetails = useCallback(async (id) => {
    try {
      const response = await appointmentsService.getAppointment(id);
      setSelectedAppointment(response.data?.data || response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
      setError('Failed to load appointment details');
    }
  }, []);

  const handleAccept = useCallback(async (appointmentId) => {
    if (!appointmentId) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const response = await appointmentsService.acceptAppointment(appointmentId);
      const successMessage = response.data?.message || 'Appointment accepted successfully';
      setSuccess(successMessage);
      await Promise.all([fetchAppointments(), fetchCustomTimeRequests()]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to accept appointment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors ? 
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to accept appointment';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, [fetchAppointments, fetchCustomTimeRequests]);

  const handleReject = useCallback(async () => {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const response = await appointmentsService.rejectAppointment(selectedAppointment.id);
      const successMessage = response.data?.message || 'Appointment rejected successfully';
      setSuccess(successMessage);
      setRejectDialogOpen(false);
      setDetailsDialogOpen(false);
      await Promise.all([fetchAppointments(), fetchCustomTimeRequests()]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to reject appointment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors ? 
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to reject appointment';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, [selectedAppointment, fetchAppointments, fetchCustomTimeRequests]);

  const handleDateSelect = useCallback((dateStr) => {
    // When clicking on calendar date, just filter by that date
    setFilters({ ...filters, date: dateStr });
  }, [filters]);

  // Auto-update expired appointments to 'done'
  const checkAndUpdateExpiredAppointments = useCallback(() => {
    setAppointments((prevAppointments) => {
      const now = new Date();
      let hasUpdates = false;
      
      const updatedAppointments = prevAppointments.map((apt) => {
        // Only update confirmed or pending appointments
        if (apt.status === 'confirmed' || apt.status === 'pending') {
          let appointmentDateTime = null;
          
          if (apt.datetime) {
            // Handle both "YYYY-MM-DD HH:mm:ss" and "YYYY-MM-DDTHH:mm:ss" formats
            appointmentDateTime = apt.datetime.replace(' ', 'T');
            console.log(`[Auto-update] Appointment ${apt.id}: datetime=${apt.datetime}, normalized=${appointmentDateTime}`);
          } else if (apt.preferred_date && apt.preferred_time) {
            // Format preferred_time to ensure it has seconds if needed
            let timeStr = apt.preferred_time.trim();
            if (timeStr && !timeStr.includes(':')) {
              // Invalid time format, skip
              return apt;
            }
            // If time doesn't have seconds, add :00
            if (timeStr.split(':').length === 2) {
              timeStr = `${timeStr}:00`;
            }
            appointmentDateTime = `${apt.preferred_date}T${timeStr}`;
            console.log(`[Auto-update] Appointment ${apt.id}: preferred_date=${apt.preferred_date}, preferred_time=${apt.preferred_time}, normalized=${appointmentDateTime}`);
          }
          
          if (appointmentDateTime) {
            try {
              // Normalize datetime format for Date parsing
              let normalizedDateTime = appointmentDateTime;
              // Replace space with T if present (handles "YYYY-MM-DD HH:mm:ss" format)
              if (normalizedDateTime.includes(' ') && !normalizedDateTime.includes('T')) {
                normalizedDateTime = normalizedDateTime.replace(' ', 'T');
              }
              // No need to add timezone, Date constructor handles local time by default
              
              const aptDate = new Date(normalizedDateTime);
              console.log(`[Auto-update] Appointment ${apt.id}: parsed date=${aptDate.toISOString()}, now=${now.toISOString()}, isPast=${aptDate < now}`);
              
              // Check if date is valid
              if (!isNaN(aptDate.getTime())) {
                // If appointment time has passed, mark as done
                if (aptDate < now) {
                  console.log(`[Auto-update] Marking appointment ${apt.id} as done. Time: ${aptDate.toISOString()}, Now: ${now.toISOString()}`);
                  hasUpdates = true;
                  return { ...apt, status: 'done' };
                }
              } else {
                console.warn('[Auto-update] Invalid date parsed:', normalizedDateTime, 'for appointment:', apt.id);
              }
            } catch (e) {
              // Invalid date format, skip
              console.warn('[Auto-update] Invalid appointment date format:', appointmentDateTime, 'Error:', e);
            }
          }
        }
        return apt;
      });
      
      if (hasUpdates) {
        const doneCount = updatedAppointments.filter(apt => apt.status === 'done').length;
        console.log('[Auto-update] Updated', doneCount, 'appointments to done');
        console.log('[Auto-update] Done appointments:', updatedAppointments.filter(apt => apt.status === 'done').map(apt => ({ id: apt.id, datetime: apt.datetime, status: apt.status })));
      }
      
      return hasUpdates ? updatedAppointments : prevAppointments;
    });
  }, []);

  // Statistics (memoized)
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      { label: 'Total Appointments', value: appointments.length },
      { 
        label: 'Upcoming', 
        value: appointments.filter((apt) => {
          const aptDate = new Date(apt.datetime || apt.preferred_date || 0);
          return aptDate > now && apt.status !== 'cancelled' && apt.status !== 'done' && apt.status !== 'rejected';
        }).length 
      },
      { 
        label: 'Today', 
        value: appointments.filter((apt) => {
          const aptDate = new Date(apt.datetime || apt.preferred_date || 0);
          return aptDate >= today && aptDate < tomorrow && apt.status !== 'cancelled';
        }).length 
      },
      { label: 'Pending', value: appointments.filter((apt) => apt.status === 'pending').length },
    ];
  }, [appointments]);

  // Effects
  useEffect(() => {
    fetchAppointments();
    fetchCustomTimeRequests();
    fetchLawyers();
    fetchClients();
    
    const interval = setInterval(() => {
      fetchAppointments();
      fetchCustomTimeRequests();
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchAppointments, fetchCustomTimeRequests, fetchLawyers, fetchClients]);

  // Check for expired appointments every minute
  useEffect(() => {
    // Check immediately
    checkAndUpdateExpiredAppointments();
    
    // Then check every minute
    const expiredCheckInterval = setInterval(() => {
      checkAndUpdateExpiredAppointments();
    }, 60000); // 1 minute
    
    return () => clearInterval(expiredCheckInterval);
  }, [checkAndUpdateExpiredAppointments]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Render appointment card
  const renderAppointmentCard = useCallback((appointment) => {
    const appointmentDateTime = appointment.datetime || 
      (appointment.preferred_date && appointment.preferred_time 
        ? `${appointment.preferred_date}T${appointment.preferred_time}:00` 
        : null);
    const appointmentDate = appointmentDateTime ? new Date(appointmentDateTime) : new Date();
    const isPast = appointmentDate < new Date();
    const isToday = appointmentDate.toDateString() === new Date().toDateString();
    const isCustomTimeRequest = !appointment.datetime && (appointment.preferred_date || appointment.preferred_time);

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
                    {appointmentDateTime
                      ? appointmentDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : appointment.preferred_date
                      ? new Date(appointment.preferred_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Date TBD'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <TimeIcon sx={{ fontSize: 18, color: colors.gold }} />
                  <Typography variant="body1">
                    {appointmentDateTime 
                      ? appointmentDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : appointment.preferred_time || 'Time TBD'}
                  </Typography>
                  {isCustomTimeRequest && (
                    <Chip
                      label="Requested"
                      size="small"
                      sx={{
                        backgroundColor: alpha('#ff9800', 0.2),
                        color: '#ff9800',
                        fontSize: '0.65rem',
                        height: '18px',
                      }}
                    />
                  )}
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
              <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
                {isCustomTimeRequest && (
                  <Chip
                    label="Custom Time"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#ff9800', 0.3),
                      color: '#ff9800',
                      border: `1px solid #ff9800`,
                      fontSize: '0.7rem',
                      height: '20px',
                      mb: 0.5,
                    }}
                  />
                )}
                <Chip
                  label={STATUS_LABELS[appointment.status] || appointment.status}
                  color={STATUS_COLORS[appointment.status] || 'default'}
                  size="small"
                />
              </Box>
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

            {appointment.subject && (
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                <strong>Subject:</strong> {appointment.subject}
              </Typography>
            )}

            {appointment.type && (
              <Chip
                label={TYPE_LABELS[appointment.type] || appointment.type}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.gold, 0.2),
                  color: colors.gold,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between', p: 2, flexWrap: 'wrap', gap: 1 }}>
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewDetails(appointment.id)}
              sx={{ color: colors.gold }}
            >
              View Details
            </Button>
            {(() => {
              const status = appointment.status?.toLowerCase() || '';
              return status === 'pending';
            })() && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Tooltip title="Accept Appointment">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAccept(appointment.id)}
                    disabled={actionLoading}
                    sx={{
                      backgroundColor: colors.success,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: alpha(colors.success, 0.8),
                      },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Accept'}
                  </Button>
                </Tooltip>
                <Tooltip title="Reject Appointment">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setRejectDialogOpen(true);
                    }}
                    disabled={actionLoading}
                    sx={{
                      color: colors.error,
                      borderColor: colors.error,
                      '&:hover': {
                        borderColor: colors.error,
                        backgroundColor: alpha(colors.error, 0.1),
                      },
                    }}
                  >
                    Reject
                  </Button>
                </Tooltip>
              </Box>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  }, [handleViewDetails, handleAccept, actionLoading]);

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
          <Grid item xs={12} sm={6} md={2}>
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
          <Grid item xs={12} sm={6} md={1}>
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
          <Tab label="Custom Time Requests" />
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
        <Box>
          <CalendarMonth
            lawyerId={filters.lawyer_id || null}
            selectedDate={filters.date || ''}
            onDateSelect={handleDateSelect}
            appointments={filteredAppointments}
          />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(filteredAppointments) && filteredAppointments.length > 0 ? (
            filteredAppointments.map(renderAppointmentCard)
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
                  <Box sx={{ mb: 2 }}>
                    {selectedAppointment.datetime ? (
                      <Typography variant="body1" sx={{ color: colors.white }}>
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
                    ) : selectedAppointment.preferred_date || selectedAppointment.preferred_time ? (
                      <Box>
                        <Typography variant="body1" sx={{ color: colors.white, mb: 0.5 }}>
                          {selectedAppointment.preferred_date 
                            ? new Date(selectedAppointment.preferred_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Date: TBD'}
                        </Typography>
                        {selectedAppointment.preferred_time && (
                          <Typography variant="body2" sx={{ color: colors.gold }}>
                            Preferred Time: {selectedAppointment.preferred_time}
                          </Typography>
                        )}
                        <Chip
                          label="Custom Time Request"
                          size="small"
                          sx={{
                            backgroundColor: alpha('#ff9800', 0.3),
                            color: '#ff9800',
                            border: `1px solid #ff9800`,
                            mt: 1,
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                        Date & Time: TBD
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[selectedAppointment.status] || selectedAppointment.status}
                    color={STATUS_COLORS[selectedAppointment.status] || 'default'}
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
                {selectedAppointment.subject && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Subject
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedAppointment.subject}
                    </Typography>
                  </Grid>
                )}
                {selectedAppointment.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedAppointment.description}
                    </Typography>
                  </Grid>
                )}
                {selectedAppointment.type && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Type
                    </Typography>
                    <Chip
                      label={TYPE_LABELS[selectedAppointment.type] || selectedAppointment.type}
                      sx={{
                        backgroundColor: alpha(colors.gold, 0.2),
                        color: colors.gold,
                        mb: 2,
                      }}
                    />
                  </Grid>
                )}
                {selectedAppointment.meeting_link && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Meeting Link
                    </Typography>
                    <Typography 
                      variant="body1" 
                      component="a"
                      href={selectedAppointment.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        color: colors.gold, 
                        mb: 2,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
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
        <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(() => {
              const status = selectedAppointment?.status?.toLowerCase() || '';
              return status === 'pending';
            })() && (
              <>
                <StyledButton
                  onClick={() => {
                    handleAccept(selectedAppointment.id);
                    setDetailsDialogOpen(false);
                  }}
                  disabled={actionLoading}
                  sx={{
                    backgroundColor: colors.success,
                    '&:hover': { backgroundColor: alpha(colors.success, 0.8) },
                  }}
                >
                  {actionLoading ? (
                    <CircularProgress size={24} sx={{ color: colors.white }} />
                  ) : (
                    <>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Accept Appointment
                    </>
                  )}
                </StyledButton>
                <Button
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    setRejectDialogOpen(true);
                  }}
                  variant="outlined"
                  sx={{
                    color: colors.error,
                    borderColor: colors.error,
                    '&:hover': {
                      borderColor: colors.error,
                      backgroundColor: alpha(colors.error, 0.1),
                    },
                  }}
                >
                  <CancelIcon sx={{ mr: 1, fontSize: 20 }} />
                  Reject Appointment
                </Button>
              </>
            )}
          </Box>
          <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.textSecondary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <ConfirmationDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="Reject Appointment"
        message="Are you sure you want to reject this appointment? This action cannot be undone."
        loading={actionLoading}
      />

    </Box>
  );
}
