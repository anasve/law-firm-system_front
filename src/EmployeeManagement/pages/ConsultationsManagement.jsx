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
  Menu,
  MenuItem,
  Paper,
  Divider,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  PriorityHigh as PriorityHighIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
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
  chat: <ChatIcon />,
  in_office: <BusinessIcon />,
  call: <PhoneIcon />,
  appointment: <EventIcon />,
};

const FilterCard = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

export default function ConsultationsManagement() {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    unassigned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuConsultationId, setMenuConsultationId] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState('');

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected'];

  useEffect(() => {
    fetchConsultations();
    fetchStatistics();
    
    // Refresh every 30 seconds to get new consultations
    const interval = setInterval(() => {
      fetchConsultations();
      fetchStatistics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [consultations, searchTerm, selectedTab]);

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
      
      console.log('Consultations response:', response);
      console.log('Response data:', response.data);
      
      // Handle different response formats
      let consultationsData = [];
      if (Array.isArray(response.data)) {
        consultationsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        consultationsData = response.data.data;
      } else if (response.data?.consultations && Array.isArray(response.data.consultations)) {
        consultationsData = response.data.consultations;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        consultationsData = response.data.items;
      }
      
      console.log('Extracted consultations:', consultationsData);
      setConsultations(consultationsData);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to load consultations. Please try again.');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await consultationsService.getStatistics();
      console.log('Statistics response:', response);
      
      const statsData = response.data?.data || response.data || {};
      if (statsData) {
        setStatistics({
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          accepted: statsData.accepted || 0,
          completed: statsData.completed || 0,
          rejected: statsData.rejected || 0,
          unassigned: statsData.unassigned || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      // Don't show error for statistics, just use defaults
    }
  };

  const applyFilters = () => {
    let filtered = [...consultations];

    // Filter by tab (status)
    if (selectedTab > 0) {
      const statusMap = {
        1: 'pending',
        2: 'accepted',
        3: 'completed',
        4: 'rejected',
      };
      filtered = filtered.filter((c) => c.status === statusMap[selectedTab]);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.subject?.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search) ||
          c.client?.name?.toLowerCase().includes(search) ||
          c.lawyer?.name?.toLowerCase().includes(search)
      );
    }

    setFilteredConsultations(filtered);
  };

  const handleViewDetails = async (consultation) => {
    try {
      const response = await consultationsService.getConsultation(consultation.id);
      setSelectedConsultation(response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch consultation details:', error);
      setError('Failed to load consultation details.');
    }
  };

  const handleAssign = async (consultationId, lawyerId) => {
    try {
      setActionLoading(true);
      setError('');
      await consultationsService.assignConsultation(consultationId, lawyerId);
      setSuccess('Consultation assigned successfully');
      setAssignDialogOpen(false);
      setSelectedLawyerId('');
      fetchConsultations();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to assign consultation:', error);
      setError(error.response?.data?.message || 'Failed to assign consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoAssign = async (consultationId) => {
    try {
      setActionLoading(true);
      setError('');
      await consultationsService.autoAssignConsultation(consultationId);
      setSuccess('Consultation assigned automatically');
      fetchConsultations();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to auto-assign consultation:', error);
      setError(error.response?.data?.message || 'Failed to auto-assign consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuOpen = (event, consultationId) => {
    setAnchorEl(event.currentTarget);
    setMenuConsultationId(consultationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuConsultationId(null);
  };

  const statCards = [
    { title: 'Total', value: statistics.total, color: colors.gold },
    { title: 'Pending', value: statistics.pending, color: '#FF9800' },
    { title: 'Accepted', value: statistics.accepted, color: '#2196F3' },
    { title: 'Completed', value: statistics.completed, color: '#4CAF50' },
    { title: 'Rejected', value: statistics.rejected, color: '#F44336' },
  ];

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Consultations Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              Manage all consultations
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
        {statCards.map((stat, index) => (
          <Grid item xs={6} sm={2.4} key={index}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: colors.lightBlack,
                border: `1px solid ${alpha(stat.color, 0.3)}`,
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <FilterCard>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <StyledTextField
            placeholder="Search consultations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: '250px' }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: colors.gold, mr: 1 }} />,
            }}
          />
        </Box>
      </FilterCard>

      {/* Tabs */}
      <Paper sx={{ mb: 3, backgroundColor: colors.lightBlack }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: colors.gold,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.gold,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      </Paper>

      {/* Consultations List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : Array.isArray(filteredConsultations) && filteredConsultations.length > 0 ? (
        <Grid container spacing={3}>
          {filteredConsultations.map((consultation) => (
            <Grid item xs={12} md={6} key={consultation.id}>
              <Card
                sx={{
                  backgroundColor: colors.lightBlack,
                  color: colors.white,
                  border: `1px solid ${alpha(colors.gold, 0.2)}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.gold,
                    boxShadow: `0 4px 12px ${alpha(colors.gold, 0.2)}`,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: colors.white }}>
                        {consultation.subject}
                      </Typography>
                      <Chip
                        label={statusLabels[consultation.status] || consultation.status}
                        color={statusColors[consultation.status] || 'default'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {consultation.priority === 'urgent' && (
                        <Chip
                          icon={<PriorityHighIcon />}
                          label="Urgent"
                          size="small"
                          sx={{
                            ml: 1,
                            backgroundColor: alpha(colors.error, 0.2),
                            color: colors.error,
                          }}
                        />
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, consultation.id)}
                      sx={{ color: colors.textSecondary }}
                    >
                      <MoreVertIcon />
                    </IconButton>
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

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {consultation.client && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: colors.gold }} />
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Client: <span style={{ color: colors.gold }}>{consultation.client.name}</span>
                        </Typography>
                      </Box>
                    )}
                    {consultation.lawyer ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GavelIcon sx={{ fontSize: 16, color: colors.gold }} />
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Lawyer: <span style={{ color: colors.gold }}>{consultation.lawyer.name}</span>
                        </Typography>
                      </Box>
                    ) : (
                      <Chip
                        label="Unassigned"
                        size="small"
                        sx={{
                          backgroundColor: alpha(colors.error, 0.2),
                          color: colors.error,
                          width: 'fit-content',
                        }}
                      />
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
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Created: {new Date(consultation.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(consultation)}
                    sx={{ color: colors.gold }}
                  >
                    View Details
                  </Button>
                  {!consultation.lawyer && (
                    <Button
                      size="small"
                      startIcon={<AutoAwesomeIcon />}
                      onClick={() => handleAutoAssign(consultation.id)}
                      disabled={actionLoading}
                      sx={{ color: colors.gold, ml: 1 }}
                    >
                      Auto Assign
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
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
            No consultations found
          </Typography>
          {searchTerm && (
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
              Try adjusting your search or filters
            </Typography>
          )}
        </Paper>
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
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Consultation Details
            </Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.textSecondary }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedConsultation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  Subject
                </Typography>
                <Typography variant="h6" sx={{ color: colors.white }}>
                  {selectedConsultation.subject}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />

              <Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ color: colors.white }}>
                  {selectedConsultation.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={statusLabels[selectedConsultation.status] || selectedConsultation.status}
                    color={statusColors[selectedConsultation.status] || 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Priority
                  </Typography>
                  <Chip
                    label={priorityLabels[selectedConsultation.priority] || selectedConsultation.priority}
                    size="small"
                    icon={selectedConsultation.priority === 'urgent' ? <PriorityHighIcon /> : null}
                    sx={{
                      backgroundColor:
                        selectedConsultation.priority === 'urgent'
                          ? alpha(colors.error, 0.2)
                          : alpha(colors.gold, 0.2),
                      color: selectedConsultation.priority === 'urgent' ? colors.error : colors.gold,
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Channel
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {channelIcons[selectedConsultation.preferred_channel]}
                    <Typography variant="body2" sx={{ color: colors.white }}>
                      {channelLabels[selectedConsultation.preferred_channel] || selectedConsultation.preferred_channel}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {selectedConsultation.client && (
                <>
                  <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Client
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: colors.gold }} />
                      <Typography variant="body1" sx={{ color: colors.white }}>
                        {selectedConsultation.client.name}
                      </Typography>
                      {selectedConsultation.client.email && (
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          ({selectedConsultation.client.email})
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {selectedConsultation.lawyer ? (
                <>
                  <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Assigned Lawyer
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GavelIcon sx={{ color: colors.gold }} />
                      <Typography variant="body1" sx={{ color: colors.white }}>
                        {selectedConsultation.lawyer.name}
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                      No lawyer assigned
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => {
                          handleAutoAssign(selectedConsultation.id);
                          setDetailsDialogOpen(false);
                        }}
                        disabled={actionLoading}
                        sx={{
                          color: colors.gold,
                          borderColor: colors.gold,
                          '&:hover': {
                            borderColor: colors.gold,
                            backgroundColor: alpha(colors.gold, 0.1),
                          },
                        }}
                      >
                        Auto Assign
                      </Button>
                    </Box>
                  </Box>
                </>
              )}

              {selectedConsultation.created_at && (
                <>
                  <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Created At
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.white }}>
                      {new Date(selectedConsultation.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.textSecondary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const consultation = consultations.find((c) => c.id === menuConsultationId);
            if (consultation) {
              handleViewDetails(consultation);
            }
            handleMenuClose();
          }}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem>
        {consultations.find((c) => c.id === menuConsultationId)?.lawyer === null && (
          <MenuItem
            onClick={() => {
              handleAutoAssign(menuConsultationId);
              handleMenuClose();
            }}
          >
            <AutoAwesomeIcon sx={{ mr: 1, fontSize: 20 }} />
            Auto Assign
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
