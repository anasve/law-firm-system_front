import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
  Add as AddIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  VideoCall as VideoCallIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  EventRepeat as RescheduleIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner, StyledButton, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { appointmentsService, getToken } from '../services';
import ConfirmationDialog from '../../AdminManagement/components/feedback/ConfirmationDialog';

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

const typeIcons = {
  online: <VideoCallIcon sx={{ fontSize: 18 }} />,
  in_office: <BusinessIcon sx={{ fontSize: 18 }} />,
  phone: <PhoneIcon sx={{ fontSize: 18 }} />,
};

const FilterCard = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    search: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters, selectedTab]);

  const fetchAppointments = async () => {
    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      setError('Please login first');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await appointmentsService.getAppointments();
      const data = Array.isArray(response.data) ? response.data : [];
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      // Handle different error statuses
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        // Endpoint not implemented in backend - handle gracefully
        setAppointments([]);
        setFilteredAppointments([]);
        setError('Appointments feature is not available yet. Please contact support.');
      } else {
        // Only log non-404 errors
        console.error('Failed to fetch appointments:', error);
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to load appointments. Please try again.';
        setError(errorMessage);
      }
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Tab filter
    const tabFilters = {
      0: () => true, // All
      1: (apt) => apt.status === 'pending',
      2: (apt) => apt.status === 'confirmed',
      3: (apt) => apt.status === 'done',
      4: (apt) => apt.status === 'cancelled',
    };
    filtered = filtered.filter(tabFilters[selectedTab] || (() => true));

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    // Date filter
    if (filters.date) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.datetime).toISOString().split('T')[0];
        return aptDate === filters.date;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.lawyer?.name?.toLowerCase().includes(searchLower) ||
          apt.subject?.toLowerCase().includes(searchLower) ||
          apt.description?.toLowerCase().includes(searchLower)
      );
    }

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

  const handleCancel = async (reason) => {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      setError('');
      await appointmentsService.cancelAppointment(selectedAppointment.id, reason);
      setSuccess('Appointment cancelled successfully');
      setCancelDialogOpen(false);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !selectedSlot) {
      setError('Please select a new time slot');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await appointmentsService.rescheduleAppointment(selectedAppointment.id, selectedSlot.id);
      setSuccess('Appointment rescheduled successfully. It will be confirmed by an employee shortly.');
      setRescheduleDialogOpen(false);
      setSelectedSlot(null);
      setAvailableSlots([]);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAvailableSlotsForReschedule = async (lawyerId, date) => {
    if (!lawyerId || !date) return;
    
    try {
      setSlotsLoading(true);
      setError('');
      const formattedDate = date.split('T')[0];
      const response = await appointmentsService.getAvailableSlots(lawyerId, formattedDate);
      
      // Handle different response formats
      let slotsData = [];
      if (Array.isArray(response.data)) {
        slotsData = response.data;
      } else if (response.data?.available_slots && Array.isArray(response.data.available_slots)) {
        slotsData = response.data.available_slots;
      } else if (response.data?.slots && Array.isArray(response.data.slots)) {
        slotsData = response.data.slots;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        slotsData = response.data.data;
      }
      
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setAvailableSlots([]);
      setError('Failed to load available time slots. Please try another date.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleOpenReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    
    // Fetch available slots for the lawyer
    if (appointment.lawyer?.id) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await fetchAvailableSlotsForReschedule(appointment.lawyer.id, tomorrow.toISOString().split('T')[0]);
    }
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
              My Appointments
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              View and manage your appointments
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchAppointments} sx={{ color: colors.gold }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <StyledButton startIcon={<AddIcon />} onClick={() => navigate('/client/appointments/new')}>
              Book Appointment
            </StyledButton>
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <StyledTextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by lawyer or subject..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledTextField
              fullWidth
              type="date"
              label="Date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
        </Grid>
      </FilterCard>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
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
      </Box>

      {/* Appointments List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(filteredAppointments) && filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.datetime);
              const isPast = appointmentDate < new Date();
              const isToday = appointmentDate.toDateString() === new Date().toDateString();

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
                              <Chip label="Past" size="small" color="error" sx={{ ml: 1 }} />
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

                      {appointment.subject && (
                        <Typography variant="body2" sx={{ color: colors.white, mb: 1, fontWeight: 'bold' }}>
                          {appointment.subject}
                        </Typography>
                      )}

                      {appointment.type && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {typeIcons[appointment.type]}
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Type: {typeLabels[appointment.type] || appointment.type}
                          </Typography>
                        </Box>
                      )}

                      {appointment.meeting_link && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.gold,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            mt: 1,
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
                        View Details
                      </Button>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {appointment.status !== 'cancelled' && appointment.status !== 'done' && appointment.status === 'pending' && (
                          <Tooltip title="Reschedule Appointment">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenReschedule(appointment)}
                              sx={{ color: colors.gold }}
                            >
                              <RescheduleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {appointment.status !== 'cancelled' && appointment.status !== 'done' && (
                          <Tooltip title="Cancel Appointment">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setCancelDialogOpen(true);
                              }}
                              sx={{ color: colors.error }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
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
                  {filters.status !== 'all' || filters.date || filters.search
                    ? 'No appointments match the specified criteria'
                    : 'Book your first appointment to get started'}
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
                {selectedAppointment.subject && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Subject
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedAppointment.subject}
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
        </DialogActions>
      </Dialog>

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

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onClose={() => {
          setRescheduleDialogOpen(false);
          setSelectedSlot(null);
          setAvailableSlots([]);
        }}
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
            Reschedule Appointment
          </Typography>
          <IconButton onClick={() => {
            setRescheduleDialogOpen(false);
            setSelectedSlot(null);
            setAvailableSlots([]);
          }} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Select a new date and time slot for your appointment with {selectedAppointment.lawyer?.name || 'the lawyer'}.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                    Select Date
                  </Typography>
                  <StyledTextField
                    fullWidth
                    type="date"
                    value={selectedDate || ''}
                    onChange={async (e) => {
                      const date = e.target.value;
                      setSelectedDate(date);
                      if (selectedAppointment.lawyer?.id && date) {
                        await fetchAvailableSlotsForReschedule(selectedAppointment.lawyer.id, date);
                      }
                    }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                    Available Time Slots
                  </Typography>
                  {slotsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress sx={{ color: colors.gold }} />
                    </Box>
                  ) : Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    <Grid container spacing={2}>
                      {availableSlots.map((slot) => (
                        <Grid item xs={6} sm={4} md={3} key={slot.id}>
                          <Card
                            onClick={() => setSelectedSlot(slot)}
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: selectedSlot?.id === slot.id ? alpha(colors.gold, 0.2) : colors.black,
                              border: selectedSlot?.id === slot.id ? `2px solid ${colors.gold}` : `1px solid ${alpha(colors.gold, 0.2)}`,
                              '&:hover': {
                                backgroundColor: alpha(colors.gold, 0.1),
                                borderColor: colors.gold,
                              },
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <TimeIcon sx={{ color: selectedSlot?.id === slot.id ? colors.gold : alpha(colors.gold, 0.7), mb: 1 }} />
                              <Typography variant="body1" fontWeight="bold" sx={{ color: colors.white }}>
                                {slot.start_time || slot.time || slot.start || 'N/A'}
                              </Typography>
                              {slot.end_time && (
                                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                                  - {slot.end_time}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : selectedDate ? (
                    <Alert severity="warning">
                      No available time slots for this date. Please try another date.
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      Please select a date to view available time slots.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setRescheduleDialogOpen(false);
              setSelectedSlot(null);
              setAvailableSlots([]);
            }}
            sx={{ color: colors.textSecondary }}
          >
            Cancel
          </Button>
          <StyledButton
            onClick={handleReschedule}
            disabled={actionLoading || !selectedSlot}
          >
            {actionLoading ? <CircularProgress size={24} sx={{ color: colors.black }} /> : 'Reschedule Appointment'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
