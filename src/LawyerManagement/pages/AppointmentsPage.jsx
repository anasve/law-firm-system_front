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
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  VideoCall as VideoCallIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { WelcomeBanner, StyledButton, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { appointmentsService, getToken } from '../services';

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
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    search: '',
  });

  useEffect(() => {
    fetchAppointments();
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
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await appointmentsService.getAppointments();
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.appointments || []);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to load appointments. Please try again.';
        setError(errorMessage);
      }
      setAppointments([]);
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
          apt.client?.name?.toLowerCase().includes(searchLower) ||
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
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAppointments} sx={{ color: colors.gold }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
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
              placeholder="Search by client or subject..."
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

                      {appointment.client && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: colors.gold }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Client: <span style={{ color: colors.gold }}>{appointment.client.name}</span>
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
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(appointment.id)}
                        sx={{ color: colors.gold }}
                      >
                        View Details
                      </Button>
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
                    : 'No appointments scheduled yet'}
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
                {selectedAppointment.client && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Client
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedAppointment.client.name}
                      {selectedAppointment.client.email && (
                        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                          {selectedAppointment.client.email}
                        </Typography>
                      )}
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
                {selectedAppointment.cancellation_reason && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Cancellation Reason
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.error, mb: 2 }}>
                      {selectedAppointment.cancellation_reason}
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
    </Box>
  );
}

