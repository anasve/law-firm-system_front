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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Gavel as GavelIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  PriorityHigh as PriorityHighIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner, StyledButton, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { consultationsService, getToken } from '../services';
import ConfirmationDialog from '../../AdminManagement/components/feedback/ConfirmationDialog';

const statusColors = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  completed: 'success',
  cancelled: 'default',
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const priorityLabels = {
  normal: 'Normal',
  urgent: 'Urgent',
};

const priorityIcons = {
  normal: null,
  urgent: <PriorityHighIcon sx={{ fontSize: 16, color: colors.error }} />,
};

const channelLabels = {
  chat: 'Chat',
  in_office: 'In Office',
  call: 'Call',
  appointment: 'Appointment',
};

const channelIcons = {
  chat: <ChatIcon sx={{ fontSize: 18 }} />,
  in_office: <BusinessIcon sx={{ fontSize: 18 }} />,
  call: <PhoneIcon sx={{ fontSize: 18 }} />,
  appointment: <EventIcon sx={{ fontSize: 18 }} />,
};

const FilterCard = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

const ConsultationCard = styled(Card)({
  backgroundColor: colors.lightBlack,
  color: colors.white,
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 16px ${alpha(colors.black, 0.3)}`,
    borderColor: colors.gold,
  },
});

export default function ConsultationsPage() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageAttachment, setMessageAttachment] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  });

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [consultations, filters, selectedTab]);

  useEffect(() => {
    if (detailsDialogOpen && selectedConsultation) {
      fetchMessages(selectedConsultation.id);
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConsultation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [detailsDialogOpen, selectedConsultation]);

  const fetchConsultations = async () => {
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
      const response = await consultationsService.getConsultations();
      const data = Array.isArray(response.data) ? response.data : [];
      setConsultations(data);
      setFilteredConsultations(data);
    } catch (error) {
      // Handle different error statuses
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        // Endpoint not implemented in backend - handle gracefully
        setConsultations([]);
        setFilteredConsultations([]);
        setError('Consultations feature is not available yet. Please contact support.');
      } else {
        // Only log non-404 errors
        console.error('Failed to fetch consultations:', error);
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to load consultations. Please try again.';
        setError(errorMessage);
      }
      setConsultations([]);
      setFilteredConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...consultations];

    // Tab filter
    const tabFilters = {
      0: () => true, // All
      1: (cons) => cons.status === 'pending',
      2: (cons) => cons.status === 'accepted',
      3: (cons) => cons.status === 'completed',
      4: (cons) => cons.status === 'rejected',
      5: (cons) => cons.status === 'cancelled',
    };
    filtered = filtered.filter(tabFilters[selectedTab] || (() => true));

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((cons) => cons.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter((cons) => cons.priority === filters.priority);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (cons) =>
          cons.subject?.toLowerCase().includes(searchLower) ||
          cons.description?.toLowerCase().includes(searchLower) ||
          cons.lawyer?.name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredConsultations(filtered);
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await consultationsService.getConsultation(id);
      setSelectedConsultation(response.data);
      setDetailsDialogOpen(true);
      await fetchMessages(id);
    } catch (error) {
      // Handle errors gracefully
      if (error.response?.status === 404) {
        setError('Consultation not found or feature not available yet.');
      } else {
        console.error('Failed to fetch consultation details:', error);
        setError('Failed to load consultation details');
      }
    }
  };

  const fetchMessages = async (consultationId) => {
    try {
      const response = await consultationsService.getMessages(consultationId);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Handle 404 silently - messaging feature may not be implemented yet
      if (error.response?.status !== 404) {
        console.error('Failed to fetch messages:', error);
      }
      // Set empty messages array on error
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !messageAttachment) {
      setError('Please enter a message or attach a file');
      return;
    }

    if (!selectedConsultation) return;

    try {
      setSendingMessage(true);
      setError('');
      const formData = {
        message: newMessage.trim(),
      };
      if (messageAttachment) {
        formData.attachment = messageAttachment;
      }

      await consultationsService.sendMessage(selectedConsultation.id, formData);
      setNewMessage('');
      setMessageAttachment(null);
      await fetchMessages(selectedConsultation.id);
      // Refresh consultation to get updated messages
      const response = await consultationsService.getConsultation(selectedConsultation.id);
      setSelectedConsultation(response.data);
      setSuccess('Message sent successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // Handle errors gracefully
      if (error.response?.status === 404) {
        setError('Messaging feature is not available yet. Please contact support.');
      } else {
        console.error('Failed to send message:', error);
        setError(error.response?.data?.message || 'Failed to send message');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedConsultation) return;
    try {
      setActionLoading(true);
      setError('');
      await consultationsService.cancelConsultation(selectedConsultation.id);
      setSuccess('Consultation cancelled successfully');
      setCancelDialogOpen(false);
      await fetchConsultations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStats = () => {
    return {
      total: consultations.length,
      pending: consultations.filter((c) => c.status === 'pending').length,
      accepted: consultations.filter((c) => c.status === 'accepted').length,
      completed: consultations.filter((c) => c.status === 'completed').length,
      urgent: consultations.filter((c) => c.priority === 'urgent').length,
    };
  };

  const stats = getStats();

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              My Consultations
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              View and manage your legal consultations
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchConsultations} sx={{ color: colors.gold }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <StyledButton startIcon={<AddIcon />} onClick={() => navigate('/client/consultations/new')}>
              New Consultation
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
        <Grid item xs={6} sm={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: colors.gold, fontWeight: 'bold' }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Total
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              {stats.pending}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Pending
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: '#29b6f6', fontWeight: 'bold' }}>
              {stats.accepted}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Accepted
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: '#66bb6a', fontWeight: 'bold' }}>
              {stats.completed}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: colors.error, fontWeight: 'bold' }}>
              {stats.urgent}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Urgent
            </Typography>
          </Paper>
        </Grid>
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
              placeholder="Search by subject, description, or lawyer..."
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
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                sx={{
                  color: colors.white,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.gold, 0.3),
                  },
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
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
          <Tab label="Accepted" />
          <Tab label="Completed" />
          <Tab label="Rejected" />
          <Tab label="Cancelled" />
        </Tabs>
      </Box>

      {/* Consultations List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(filteredConsultations) && filteredConsultations.length > 0 ? (
            filteredConsultations.map((consultation) => (
              <Grid item xs={12} md={6} key={consultation.id}>
                <ConsultationCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <QuestionAnswerIcon sx={{ color: colors.gold, fontSize: 20 }} />
                          <Typography variant="h6" fontWeight="bold" sx={{ color: colors.white }}>
                            {consultation.subject}
                          </Typography>
                          {consultation.priority === 'urgent' && (
                            <Tooltip title="Urgent">
                              <PriorityHighIcon sx={{ color: colors.error, fontSize: 20 }} />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {consultation.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={statusLabels[consultation.status] || consultation.status}
                        color={statusColors[consultation.status] || 'default'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {consultation.lawyer && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GavelIcon sx={{ fontSize: 18, color: colors.gold }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Lawyer: <span style={{ color: colors.gold }}>{consultation.lawyer.name}</span>
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {channelIcons[consultation.preferred_channel]}
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Channel: {channelLabels[consultation.preferred_channel] || consultation.preferred_channel}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {new Date(consultation.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(consultation.id)}
                      sx={{ color: colors.gold }}
                    >
                      View Details
                    </Button>
                    {consultation.status !== 'cancelled' && consultation.status !== 'completed' && (
                      <Tooltip title="Cancel Consultation">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setCancelDialogOpen(true);
                          }}
                          sx={{ color: colors.error }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </ConsultationCard>
              </Grid>
            ))
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
                <Typography variant="h6">No Consultations</Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                  {filters.status !== 'all' || filters.priority !== 'all' || filters.search
                    ? 'No consultations match the specified criteria'
                    : 'Create your first consultation to get started'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setMessages([]);
          setNewMessage('');
          setMessageAttachment(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: colors.white, fontWeight: 'bold' }}>
            Consultation Details
          </Typography>
          <IconButton onClick={() => {
            setDetailsDialogOpen(false);
            setMessages([]);
            setNewMessage('');
            setMessageAttachment(null);
          }} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {selectedConsultation && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ color: colors.gold, fontWeight: 'bold' }}>
                      {selectedConsultation.subject}
                    </Typography>
                    {selectedConsultation.priority === 'urgent' && (
                      <Chip
                        icon={<PriorityHighIcon />}
                        label="Urgent"
                        size="small"
                        sx={{ backgroundColor: alpha(colors.error, 0.2), color: colors.error }}
                      />
                    )}
                    <Chip
                      label={statusLabels[selectedConsultation.status] || selectedConsultation.status}
                      color={statusColors[selectedConsultation.status] || 'default'}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedConsultation.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={statusLabels[selectedConsultation.status] || selectedConsultation.status}
                    color={statusColors[selectedConsultation.status] || 'default'}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Priority
                  </Typography>
                  <Chip
                    label={priorityLabels[selectedConsultation.priority] || selectedConsultation.priority}
                    sx={{
                      mb: 2,
                      backgroundColor:
                        selectedConsultation.priority === 'urgent'
                          ? alpha(colors.error, 0.2)
                          : alpha(colors.gold, 0.2),
                      color: selectedConsultation.priority === 'urgent' ? colors.error : colors.gold,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Preferred Channel
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {channelIcons[selectedConsultation.preferred_channel]}
                    <Typography variant="body1" sx={{ color: colors.white }}>
                      {channelLabels[selectedConsultation.preferred_channel] || selectedConsultation.preferred_channel}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Created At
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {new Date(selectedConsultation.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Typography>
                </Grid>

                {selectedConsultation.lawyer && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Assigned Lawyer
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: colors.gold, width: 40, height: 40 }}>
                        <GavelIcon sx={{ color: colors.black, fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ color: colors.white, fontWeight: 'bold' }}>
                          {selectedConsultation.lawyer.name}
                        </Typography>
                        {selectedConsultation.lawyer.email && (
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {selectedConsultation.lawyer.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                )}

                {selectedConsultation.attachments && selectedConsultation.attachments.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1, fontWeight: 600 }}>
                      Consultation Attachments ({selectedConsultation.attachments.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedConsultation.attachments.map((attachment, index) => {
                        const fileUrl = attachment.path || attachment.url || attachment.file_path;
                        const fileName = attachment.name || attachment.file_name || `Attachment ${index + 1}`;
                        const fileSize = attachment.size ? `(${(attachment.size / 1024).toFixed(2)} KB)` : '';
                        return (
                          <Paper
                            key={index}
                            onClick={() => {
                              if (fileUrl) {
                                window.open(fileUrl, '_blank');
                              }
                            }}
                            sx={{
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              backgroundColor: colors.black,
                              border: `1px solid ${alpha(colors.gold, 0.3)}`,
                              borderRadius: '8px',
                              cursor: fileUrl ? 'pointer' : 'default',
                              transition: 'all 0.3s ease',
                              '&:hover': fileUrl ? {
                                backgroundColor: alpha(colors.gold, 0.1),
                                borderColor: colors.gold,
                                transform: 'translateY(-2px)',
                              } : {},
                            }}
                          >
                            <AttachFileIcon sx={{ color: colors.gold, fontSize: 20 }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: colors.white,
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {fileName}
                              </Typography>
                              {fileSize && (
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  {fileSize}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Grid>
                )}

                {/* Messages Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />
                  <Typography variant="h6" sx={{ color: colors.gold, mb: 2 }}>
                    Messages ({messages.length})
                  </Typography>

                  {/* Messages List */}
                  <Box
                    sx={{
                      maxHeight: '400px',
                      overflow: 'auto',
                      mb: 2,
                      p: 2,
                      backgroundColor: colors.black,
                      borderRadius: '12px',
                      border: `1px solid ${alpha(colors.gold, 0.1)}`,
                    }}
                  >
                    {Array.isArray(messages) && messages.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {messages.map((message, index) => {
                          const isClient = message.sender_type === 'client';
                          const hasAttachment = message.attachment || message.attachment_path || message.attachment_url;
                          return (
                            <Box
                              key={message.id || index}
                              sx={{
                                display: 'flex',
                                flexDirection: isClient ? 'row' : 'row-reverse',
                                gap: 1.5,
                                alignItems: 'flex-start',
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: isClient ? colors.gold : colors.info,
                                  width: 40,
                                  height: 40,
                                  border: `2px solid ${alpha(isClient ? colors.gold : colors.info, 0.3)}`,
                                }}
                              >
                                {isClient ? (
                                  <PersonIcon sx={{ fontSize: 20, color: colors.black }} />
                                ) : (
                                  <GavelIcon sx={{ fontSize: 20, color: colors.white }} />
                                )}
                              </Avatar>
                              <Box
                                sx={{
                                  flex: 1,
                                  maxWidth: '70%',
                                  backgroundColor: isClient
                                    ? alpha(colors.gold, 0.15)
                                    : alpha(colors.info, 0.15),
                                  borderRadius: '12px',
                                  p: 1.5,
                                  border: `1px solid ${alpha(isClient ? colors.gold : colors.info, 0.3)}`,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: colors.white,
                                    mb: hasAttachment ? 1 : 0,
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {message.message}
                                </Typography>
                                {hasAttachment && (
                                  <Paper
                                    onClick={() => {
                                      const attachmentUrl = message.attachment_path || message.attachment_url || message.attachment;
                                      if (attachmentUrl) {
                                        window.open(attachmentUrl, '_blank');
                                      }
                                    }}
                                    sx={{
                                      p: 1,
                                      mt: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      backgroundColor: colors.black,
                                      border: `1px solid ${alpha(colors.gold, 0.3)}`,
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        backgroundColor: alpha(colors.gold, 0.1),
                                        borderColor: colors.gold,
                                      },
                                    }}
                                  >
                                    <AttachFileIcon sx={{ color: colors.gold, fontSize: 18 }} />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: colors.gold,
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                      }}
                                    >
                                      {message.attachment_name || 'Attachment'}
                                    </Typography>
                                  </Paper>
                                )}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: colors.textSecondary,
                                    display: 'block',
                                    mt: 0.5,
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  {new Date(message.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <ChatIcon sx={{ fontSize: 48, color: colors.textSecondary, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Send Message Section */}
                  {selectedConsultation.status === 'accepted' && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        backgroundColor: colors.black,
                        borderRadius: '12px',
                        border: `1px solid ${alpha(colors.gold, 0.2)}`,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1.5, fontWeight: 600 }}>
                        Send a Message
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <StyledTextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Type your message here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && (newMessage.trim() || messageAttachment)) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: colors.lightBlack,
                            },
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <input
                            type="file"
                            id="message-attachment"
                            style={{ display: 'none' }}
                            onChange={(e) => setMessageAttachment(e.target.files[0])}
                          />
                          <label htmlFor="message-attachment">
                            <IconButton
                              component="span"
                              sx={{
                                color: colors.gold,
                                border: `1px solid ${alpha(colors.gold, 0.3)}`,
                                '&:hover': {
                                  backgroundColor: alpha(colors.gold, 0.1),
                                  borderColor: colors.gold,
                                },
                              }}
                            >
                              <AttachFileIcon />
                            </IconButton>
                          </label>
                          <IconButton
                            onClick={handleSendMessage}
                            disabled={sendingMessage || (!newMessage.trim() && !messageAttachment)}
                            sx={{
                              color: colors.white,
                              backgroundColor: colors.gold,
                              '&:hover': {
                                backgroundColor: alpha(colors.gold, 0.9),
                              },
                              '&:disabled': {
                                backgroundColor: alpha(colors.gold, 0.3),
                                color: alpha(colors.white, 0.5),
                              },
                            }}
                          >
                            {sendingMessage ? <CircularProgress size={20} sx={{ color: colors.black }} /> : <SendIcon />}
                          </IconButton>
                        </Box>
                      </Box>
                      {messageAttachment && (
                        <Paper
                          sx={{
                            p: 1.5,
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            backgroundColor: alpha(colors.gold, 0.1),
                            border: `1px solid ${alpha(colors.gold, 0.3)}`,
                            borderRadius: '8px',
                          }}
                        >
                          <AttachFileIcon sx={{ fontSize: 20, color: colors.gold }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.gold,
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {messageAttachment.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {(messageAttachment.size / 1024).toFixed(2)} KB
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => setMessageAttachment(null)}
                            sx={{
                              color: colors.error,
                              '&:hover': {
                                backgroundColor: alpha(colors.error, 0.1),
                              },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.textSecondary }}>
            Close
          </Button>
          {selectedConsultation?.status !== 'cancelled' && selectedConsultation?.status !== 'completed' && (
            <StyledButton onClick={() => setCancelDialogOpen(true)}>
              Cancel Consultation
            </StyledButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Consultation"
        message="Are you sure you want to cancel this consultation? This action cannot be undone."
        loading={actionLoading}
      />
    </Box>
  );
}
