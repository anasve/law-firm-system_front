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
      console.error('Failed to fetch consultations:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
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
      console.error('Failed to fetch consultation details:', error);
      setError('Failed to load consultation details');
    }
  };

  const fetchMessages = async (consultationId) => {
    try {
      const response = await consultationsService.getMessages(consultationId);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
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
      console.error('Failed to send message:', error);
      setError(error.response?.data?.message || 'Failed to send message');
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
          <Typography variant="h5" sx={{ color: colors.white, fontWeight: 'bold' }}>
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
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                      Attachments
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedConsultation.attachments.map((attachment, index) => (
                        <Chip
                          key={index}
                          icon={<AttachFileIcon />}
                          label={attachment.name || `Attachment ${index + 1}`}
                          onClick={() => window.open(attachment.path || attachment.url, '_blank')}
                          sx={{
                            backgroundColor: colors.black,
                            color: colors.gold,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: alpha(colors.gold, 0.2),
                            },
                          }}
                        />
                      ))}
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
                      maxHeight: '300px',
                      overflow: 'auto',
                      mb: 2,
                      p: 1,
                      backgroundColor: colors.black,
                      borderRadius: '8px',
                    }}
                  >
                    {Array.isArray(messages) && messages.length > 0 ? (
                      <List>
                        {messages.map((message, index) => (
                          <ListItem
                            key={message.id || index}
                            sx={{
                              backgroundColor: message.sender_type === 'client' ? alpha(colors.gold, 0.1) : colors.black,
                              borderRadius: '8px',
                              mb: 1,
                              flexDirection: message.sender_type === 'client' ? 'row' : 'row-reverse',
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: message.sender_type === 'client' ? colors.gold : colors.info,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {message.sender_type === 'client' ? (
                                  <PersonIcon sx={{ fontSize: 18 }} />
                                ) : (
                                  <GavelIcon sx={{ fontSize: 18 }} />
                                )}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ color: colors.white }}>
                                  {message.message}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  {new Date(message.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center', py: 2 }}>
                        No messages yet. Start the conversation!
                      </Typography>
                    )}
                  </Box>

                  {/* Send Message Section */}
                  {selectedConsultation.status === 'accepted' && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <StyledTextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <input
                          type="file"
                          id="message-attachment"
                          style={{ display: 'none' }}
                          onChange={(e) => setMessageAttachment(e.target.files[0])}
                        />
                        <label htmlFor="message-attachment">
                          <IconButton component="span" sx={{ color: colors.gold }}>
                            <AttachFileIcon />
                          </IconButton>
                        </label>
                        <IconButton
                          onClick={handleSendMessage}
                          disabled={sendingMessage || (!newMessage.trim() && !messageAttachment)}
                          sx={{ color: colors.gold }}
                        >
                          {sendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
                        </IconButton>
                      </Box>
                      {messageAttachment && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AttachFileIcon sx={{ fontSize: 16, color: colors.gold }} />
                          <Typography variant="caption" sx={{ color: colors.gold }}>
                            {messageAttachment.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setMessageAttachment(null)}
                            sx={{ color: colors.error, p: 0.5 }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
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
