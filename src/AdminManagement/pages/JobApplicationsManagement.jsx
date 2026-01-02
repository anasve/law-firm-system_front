import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import GavelIcon from '@mui/icons-material/Gavel';
import { WelcomeBanner, StyledButton, StyledTextField } from '../components/StyledComponents';
import { colors } from '../constants';
import { jobApplicationsService } from '../services/jobApplicationsService';
import { getToken, removeToken } from '../services/api';
import ConfirmationDialog from '../components/feedback/ConfirmationDialog';

const ApplicationCard = styled(Card)(({ theme }) => ({
  backgroundColor: colors.lightBlack,
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 16px ${alpha(colors.black, 0.3)}`,
    borderColor: colors.gold,
  },
}));

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function JobApplicationsManagement() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: All, 1: Lawyer, 2: Employee
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchApplications();
  }, [tab, navigate]);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      switch (tab) {
        case 1:
          response = await jobApplicationsService.getLawyerApplications();
          break;
        case 2:
          response = await jobApplicationsService.getEmployeeApplications();
          break;
        default:
          response = await jobApplicationsService.getAll();
      }

      console.log('Applications response:', response);
      
      let appsData = [];
      if (Array.isArray(response.data)) {
        appsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        appsData = response.data.data;
      } else if (response.data?.applications && Array.isArray(response.data.applications)) {
        appsData = response.data.applications;
      }
      
      console.log('Applications data:', appsData);
      console.log('First application:', appsData[0]);
      
      setApplications(appsData);
      setFilteredApplications(appsData);
    } catch (error) {
      if (error.response?.status === 401) {
        removeToken();
        navigate('/admin/login');
      } else if (error.response?.status === 404) {
        // Endpoint not implemented - handle gracefully without showing error
        setError('Job applications feature is not available yet.');
        setApplications([]);
        setFilteredApplications([]);
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        // Network error - show warning but keep existing data if available
        setError('Cannot connect to server. Please check your connection.');
        if (applications.length === 0) {
          setApplications([]);
          setFilteredApplications([]);
        }
      } else {
        // Only log non-404, non-network errors
        console.error('Failed to fetch applications:', error);
        setError('Failed to load job applications');
        // Keep existing applications if available
        if (applications.length === 0) {
          setApplications([]);
          setFilteredApplications([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (searchTerm.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter((app) =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await jobApplicationsService.getById(id);
      console.log('Application details response:', response);
      
      // Handle different response structures
      let applicationData = response.data;
      if (response.data?.data) {
        applicationData = response.data.data;
      } else if (response.data?.application) {
        applicationData = response.data.application;
      }
      
      console.log('Application data to display:', applicationData);
      setSelectedApplication(applicationData);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch application details:', error);
      setError('Failed to load application details');
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    try {
      setActionLoading(true);
      setError('');
      await jobApplicationsService.approve(selectedApplication.id);
      setSuccess('Application approved successfully');
      setApproveDialogOpen(false);
      await fetchApplications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    try {
      setActionLoading(true);
      setError('');
      await jobApplicationsService.reject(selectedApplication.id, rejectReason);
      setSuccess('Application rejected successfully');
      setRejectDialogOpen(false);
      setRejectReason('');
      await fetchApplications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    try {
      setActionLoading(true);
      setError('');
      await jobApplicationsService.delete(selectedApplication.id);
      setSuccess('Application deleted successfully');
      setDeleteDialogOpen(false);
      await fetchApplications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete application');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Typography variant="h4" fontWeight="bold">
          Job Applications Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          Review and manage job applications from lawyers and employees.
        </Typography>
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

      {/* Search and Filters */}
      <Paper
        sx={{
          backgroundColor: colors.lightBlack,
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: `1px solid ${alpha(colors.gold, 0.1)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              placeholder="Search by name, email, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.gold }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            color: colors.textSecondary,
            '&.Mui-selected': { color: colors.gold },
          },
          '& .MuiTabs-indicator': { backgroundColor: colors.gold },
        }}
      >
        <Tab label="All Applications" />
        <Tab label="Lawyer Applications" />
        <Tab label="Employee Applications" />
      </Tabs>

      {/* Applications List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <Grid item xs={12} md={6} key={application.id}>
                <ApplicationCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: (application.type === 'lawyer' || application.type === 'Lawyer') ? colors.gold : colors.white,
                          width: 56,
                          height: 56,
                          mr: 2,
                        }}
                      >
                        {(application.type === 'lawyer' || application.type === 'Lawyer') ? (
                          <GavelIcon sx={{ color: colors.black, fontSize: 32 }} />
                        ) : (
                          <PersonIcon sx={{ color: colors.black, fontSize: 32 }} />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: colors.white, fontWeight: 'bold', mb: 0.5 }}>
                          {application.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                          {application.email || 'N/A'}
                        </Typography>
                        <Chip
                          label={
                            (application.type === 'lawyer' || application.type === 'Lawyer') 
                              ? 'Lawyer' 
                              : (application.type === 'employee' || application.type === 'Employee')
                              ? 'Employee'
                              : application.type || 'Unknown'
                          }
                          size="small"
                          sx={{
                            backgroundColor: alpha(colors.gold, 0.1),
                            color: colors.gold,
                            fontWeight: 'bold',
                            mr: 1,
                          }}
                        />
                        <Chip
                          label={statusLabels[application.status] || application.status}
                          color={statusColors[application.status] || 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    {application.created_at && (
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                  <Box sx={{ display: 'flex', gap: 1, p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(application.id)}
                      sx={{ color: colors.gold }}
                    >
                      View Details
                    </Button>
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            setSelectedApplication(application);
                            setApproveDialogOpen(true);
                          }}
                          sx={{ color: colors.success }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setSelectedApplication(application);
                            setRejectDialogOpen(true);
                          }}
                          sx={{ color: colors.error }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setSelectedApplication(application);
                        setDeleteDialogOpen(true);
                      }}
                      sx={{ color: colors.error, ml: 'auto' }}
                    >
                      Delete
                    </Button>
                  </Box>
                </ApplicationCard>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.lightBlack }}>
                <Typography variant="h6" sx={{ color: colors.white }}>
                  No applications found
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
            Application Details
          </Typography>
          <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedApplication.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedApplication.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedApplication.phone || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Age
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedApplication.age || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedApplication.address || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Type
                  </Typography>
                  <Chip
                    label={
                      selectedApplication.type === 'lawyer' || selectedApplication.type === 'Lawyer' 
                        ? 'Lawyer' 
                        : selectedApplication.type === 'employee' || selectedApplication.type === 'Employee'
                        ? 'Employee'
                        : selectedApplication.type || 'N/A'
                    }
                    sx={{
                      backgroundColor: alpha(colors.gold, 0.1),
                      color: colors.gold,
                      fontWeight: 'bold',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={statusLabels[selectedApplication.status] || selectedApplication.status}
                    color={statusColors[selectedApplication.status] || 'default'}
                  />
                </Grid>
                {(selectedApplication.type === 'lawyer' || selectedApplication.type === 'Lawyer') && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                        Specialization ID
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                        {selectedApplication.specialization_id || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                        Experience Years
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                        {selectedApplication.experience_years || 'N/A'}
                      </Typography>
                    </Grid>
                  </>
                )}
                {(selectedApplication.type === 'employee' || selectedApplication.type === 'Employee') && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                        Experience Years
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                        {selectedApplication.experience_years || 'N/A'}
                      </Typography>
                    </Grid>
                  </>
                )}
                {selectedApplication.bio && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Bio
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2, whiteSpace: 'pre-line' }}>
                      {selectedApplication.bio}
                    </Typography>
                  </Grid>
                )}
                {selectedApplication.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Applied Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {new Date(selectedApplication.created_at).toLocaleString()}
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
          {selectedApplication?.status === 'pending' && (
            <>
              <StyledButton
                onClick={() => {
                  setDetailsDialogOpen(false);
                  setApproveDialogOpen(true);
                }}
                sx={{ mr: 1 }}
              >
                Approve
              </StyledButton>
              <Button
                onClick={() => {
                  setDetailsDialogOpen(false);
                  setRejectDialogOpen(true);
                }}
                sx={{
                  color: colors.error,
                  borderColor: colors.error,
                  '&:hover': { borderColor: colors.error, backgroundColor: alpha(colors.error, 0.1) },
                }}
                variant="outlined"
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation */}
      <ConfirmationDialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleApprove}
        title="Approve Application"
        message={`Are you sure you want to approve ${selectedApplication?.name}'s application?`}
        loading={actionLoading}
      />

      {/* Reject Confirmation */}
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: colors.white, fontWeight: 'bold' }}>
            Reject Application
          </Typography>
          <IconButton onClick={() => {
            setRejectDialogOpen(false);
            setRejectReason('');
          }} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
            Are you sure you want to reject {selectedApplication?.name}'s application?
          </Typography>
          <StyledTextField
            fullWidth
            label="Rejection Reason (Optional)"
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
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
              borderColor: colors.error,
              '&:hover': { borderColor: colors.error, backgroundColor: alpha(colors.error, 0.1) },
            }}
            variant="outlined"
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Are you sure you want to delete ${selectedApplication?.name}'s application? This action cannot be undone.`}
        loading={actionLoading}
      />
    </Box>
  );
}

