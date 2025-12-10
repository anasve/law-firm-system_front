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
  Tabs,
  Tab,
  TextField,
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
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  PriorityHigh as PriorityHighIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Gavel as GavelIcon,
  Schedule as ScheduleIcon,
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
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageAttachment, setMessageAttachment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [completeSummary, setCompleteSummary] = useState('');
  const [acceptNotes, setAcceptNotes] = useState('');

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected'];

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [consultations, selectedTab]);

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
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await consultationsService.getConsultations();
      
      // Handle different response formats
      let consultationsData = [];
      if (Array.isArray(response.data)) {
        consultationsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        consultationsData = response.data.data;
      } else if (response.data?.consultations && Array.isArray(response.data.consultations)) {
        consultationsData = response.data.consultations;
      }
      
      setConsultations(consultationsData);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(error.response?.data?.message || 'Failed to load consultations. Please try again.');
      }
      setConsultations([]);
    } finally {
      setLoading(false);
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

  const applyFilters = () => {
    let filtered = [...consultations];

    const tabFilters = {
      0: () => true, // All
      1: (cons) => cons.status === 'pending',
      2: (cons) => cons.status === 'accepted',
      3: (cons) => cons.status === 'completed',
      4: (cons) => cons.status === 'rejected',
    };
    filtered = filtered.filter(tabFilters[selectedTab] || (() => true));

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
      setSuccess('Message sent successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedConsultation) return;
    try {
      setActionLoading(true);
      setError('');
      await consultationsService.acceptConsultation(selectedConsultation.id, {
        notes: acceptNotes || undefined,
      });
      setSuccess('Consultation accepted successfully');
      setAcceptDialogOpen(false);
      setAcceptNotes('');
      await fetchConsultations();
      if (detailsDialogOpen) {
        const response = await consultationsService.getConsultation(selectedConsultation.id);
        setSelectedConsultation(response.data);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to accept consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedConsultation) return;
    try {
      setActionLoading(true);
      setError('');
      await consultationsService.rejectConsultation(selectedConsultation.id, {
        rejection_reason: rejectReason || undefined,
      });
      setSuccess('Consultation rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      await fetchConsultations();
      if (detailsDialogOpen) {
        const response = await consultationsService.getConsultation(selectedConsultation.id);
        setSelectedConsultation(response.data);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedConsultation) return;
    if (!completeSummary.trim()) {
      setError('Please provide a legal summary');
      return;
    }
    try {
      setActionLoading(true);
      setError('');
      await consultationsService.completeConsultation(selectedConsultation.id, {
        legal_summary: completeSummary,
      });
      setSuccess('Consultation completed successfully');
      setCompleteDialogOpen(false);
      setCompleteSummary('');
      await fetchConsultations();
      if (detailsDialogOpen) {
        const response = await consultationsService.getConsultation(selectedConsultation.id);
        setSelectedConsultation(response.data);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to complete consultation');
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
              View and manage consultations assigned to you
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchConsultations} sx={{ color: colors.gold }}>
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
        <Grid item xs={6} sm={3}>
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
        <Grid item xs={6} sm={3}>
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
        <Grid item xs={6} sm={3}>
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
        <Grid item xs={6} sm={3}>
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
      </Grid>

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
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
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
                      {consultation.client && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: colors.gold }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Client: <span style={{ color: colors.gold }}>{consultation.client.name}</span>
                          </Typography>
                        </Box>
                      )}

                      {consultation.preferred_channel && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {channelIcons[consultation.preferred_channel]}
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {channelLabels[consultation.preferred_channel] || consultation.preferred_channel}
                          </Typography>
                        </Box>
                      )}

                      {consultation.created_at && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {new Date(consultation.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      )}
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
                    {consultation.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Accept">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setAcceptDialogOpen(true);
                            }}
                            sx={{ color: colors.success }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setRejectDialogOpen(true);
                            }}
                            sx={{ color: colors.error }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    {consultation.status === 'accepted' && (
                      <Tooltip title="Complete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setCompleteDialogOpen(true);
                          }}
                          sx={{ color: colors.success }}
                        >
                          <DoneIcon />
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
                <QuestionAnswerIcon sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
                <Typography variant="h6" sx={{ color: colors.textSecondary }}>
                  No Consultations
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                  {selectedTab === 1
                    ? 'No pending consultations at the moment'
                    : 'No consultations match the selected filter'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Details Dialog with Messages */}
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
              <Grid container spacing={2} sx={{ mb: 3 }}>
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
                  <Typography variant="body1" sx={{ color: colors.white }}>
                    {selectedConsultation.description}
                  </Typography>
                </Grid>

                {selectedConsultation.client && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Client
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: colors.gold, width: 40, height: 40 }}>
                        <PersonIcon sx={{ color: colors.black, fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ color: colors.white, fontWeight: 'bold' }}>
                          {selectedConsultation.client.name}
                        </Typography>
                        {selectedConsultation.client.email && (
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {selectedConsultation.client.email}
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
              </Grid>

              <Divider sx={{ my: 3, borderColor: alpha(colors.gold, 0.2) }} />

              {/* Messages Section */}
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
                          backgroundColor: message.sender_type === 'lawyer' ? alpha(colors.gold, 0.1) : colors.black,
                          borderRadius: '8px',
                          mb: 1,
                          flexDirection: message.sender_type === 'lawyer' ? 'row-reverse' : 'row',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: message.sender_type === 'lawyer' ? colors.gold : colors.info,
                              width: 32,
                              height: 32,
                            }}
                          >
                            {message.sender_type === 'lawyer' ? (
                              <GavelIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <PersonIcon sx={{ fontSize: 18 }} />
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
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setDetailsDialogOpen(false);
            setMessages([]);
            setNewMessage('');
            setMessageAttachment(null);
          }} sx={{ color: colors.textSecondary }}>
            Close
          </Button>
          {selectedConsultation?.status === 'pending' && (
            <>
              <Button
                onClick={() => setAcceptDialogOpen(true)}
                sx={{
                  color: colors.success,
                  '&:hover': { backgroundColor: alpha(colors.success, 0.1) },
                }}
                startIcon={<CheckCircleIcon />}
              >
                Accept
              </Button>
              <Button
                onClick={() => setRejectDialogOpen(true)}
                sx={{
                  color: colors.error,
                  '&:hover': { backgroundColor: alpha(colors.error, 0.1) },
                }}
                startIcon={<CancelIcon />}
              >
                Reject
              </Button>
            </>
          )}
          {selectedConsultation?.status === 'accepted' && (
            <Button
              onClick={() => setCompleteDialogOpen(true)}
              sx={{
                color: colors.success,
                '&:hover': { backgroundColor: alpha(colors.success, 0.1) },
              }}
              startIcon={<DoneIcon />}
            >
              Complete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Accept Dialog */}
      <Dialog
        open={acceptDialogOpen}
        onClose={() => {
          setAcceptDialogOpen(false);
          setAcceptNotes('');
        }}
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
          },
        }}
      >
        <DialogTitle>Accept Consultation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            Are you sure you want to accept this consultation?
          </Typography>
          <StyledTextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            placeholder="Add any notes about accepting this consultation..."
            value={acceptNotes}
            onChange={(e) => setAcceptNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAcceptDialogOpen(false);
              setAcceptNotes('');
            }}
            sx={{ color: colors.textSecondary }}
          >
            Cancel
          </Button>
          <StyledButton onClick={handleAccept} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} sx={{ color: colors.black }} /> : 'Accept'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectReason('');
        }}
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
          },
        }}
      >
        <DialogTitle>Reject Consultation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            Are you sure you want to reject this consultation?
          </Typography>
          <StyledTextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason (Optional)"
            placeholder="Provide a reason for rejecting this consultation..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason('');
            }}
            sx={{ color: colors.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={actionLoading}
            sx={{
              color: colors.error,
              '&:hover': { backgroundColor: alpha(colors.error, 0.1) },
            }}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => {
          setCompleteDialogOpen(false);
          setCompleteSummary('');
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
        <DialogTitle>Complete Consultation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            Please provide a legal summary of what was discussed and agreed upon.
          </Typography>
          <StyledTextField
            fullWidth
            multiline
            rows={6}
            required
            label="Legal Summary"
            placeholder="Provide a summary of the legal consultation, what was discussed, and any agreements made..."
            value={completeSummary}
            onChange={(e) => setCompleteSummary(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCompleteDialogOpen(false);
              setCompleteSummary('');
            }}
            sx={{ color: colors.textSecondary }}
          >
            Cancel
          </Button>
          <StyledButton onClick={handleComplete} disabled={actionLoading || !completeSummary.trim()}>
            {actionLoading ? <CircularProgress size={24} sx={{ color: colors.black }} /> : 'Complete'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
