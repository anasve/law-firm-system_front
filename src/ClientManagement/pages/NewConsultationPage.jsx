import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  PriorityHigh as PriorityHighIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner, StyledButton, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { consultationsService, lawyersService } from '../services';
import { guestService } from '../../Guest/services';

const LawyerCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})(({ selected }) => ({
  backgroundColor: selected ? alpha(colors.gold, 0.15) : colors.lightBlack,
  border: selected ? `2px solid ${colors.gold}` : `1px solid ${alpha(colors.gold, 0.2)}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  color: colors.white,
  borderRadius: '12px',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: selected ? alpha(colors.gold, 0.2) : alpha(colors.gold, 0.1),
    borderColor: colors.gold,
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(colors.gold, 0.2)}`,
  },
  '&::before': selected ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    backgroundColor: colors.gold,
  } : {},
}));

const steps = ['Consultation Details', 'Additional Information', 'Review & Submit'];

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

const typeLabels = {
  online: 'Online',
  in_office: 'In Office',
  phone: 'Phone',
};

export default function NewConsultationPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lawyers, setLawyers] = useState([]);
  const [allLawyers, setAllLawyers] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectionMode, setSelectionMode] = useState('lawyer'); // 'lawyer' or 'specialization'
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    lawyer_id: '',
    specialization_id: '',
    subject: '',
    description: '',
    priority: 'normal',
    preferred_channel: 'chat',
    appointment_type: 'online',
    appointment_meeting_link: '',
    appointment_notes: '',
  });
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      const [lawyersRes, specializationsRes] = await Promise.all([
        lawyersService.getLawyers(),
        guestService.getSpecializations(),
      ]);
      
      let lawyersData = [];
      if (Array.isArray(lawyersRes.data)) {
        lawyersData = lawyersRes.data;
      } else if (lawyersRes.data?.data && Array.isArray(lawyersRes.data.data)) {
        lawyersData = lawyersRes.data.data;
      } else if (lawyersRes.data?.lawyers && Array.isArray(lawyersRes.data.lawyers)) {
        lawyersData = lawyersRes.data.lawyers;
      }
      
      console.log('Fetched lawyers:', lawyersData);
      if (lawyersData.length > 0) {
        console.log('Sample lawyer:', lawyersData[0]);
        console.log('Sample lawyer specializations:', lawyersData[0].specializations);
        console.log('Sample lawyer specialization:', lawyersData[0].specialization);
      }
      
      setAllLawyers(lawyersData);
      setLawyers(lawyersData);
      
      const specializationsData = Array.isArray(specializationsRes.data) 
        ? specializationsRes.data 
        : specializationsRes.data?.data || [];
      console.log('Fetched specializations:', specializationsData);
      setSpecializations(specializationsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    filterLawyers();
  }, [formData.specialization_id, searchQuery, allLawyers]);

  const filterLawyers = () => {
    let filtered = [...allLawyers];

    // Filter by specialization if selected
    if (formData.specialization_id) {
      filtered = filtered.filter(lawyer => {
        if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
          return lawyer.specializations.some(spec => 
            spec.id === parseInt(formData.specialization_id) || 
            spec.id === formData.specialization_id
          );
        }
        if (lawyer.specialization) {
          const specId = lawyer.specialization.id || lawyer.specialization;
          return specId === parseInt(formData.specialization_id) || specId === formData.specialization_id;
        }
        return false;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lawyer => {
        const nameMatch = lawyer.name?.toLowerCase().includes(query);
        const emailMatch = lawyer.email?.toLowerCase().includes(query);
        
        let specMatch = false;
        if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
          specMatch = lawyer.specializations.some(spec => 
            spec.name?.toLowerCase().includes(query)
          );
        } else if (lawyer.specialization) {
          const specName = lawyer.specialization.name || lawyer.specialization;
          specMatch = specName?.toLowerCase().includes(query);
        }
        
        return nameMatch || emailMatch || specMatch;
      });
    }

    setLawyers(filtered);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.subject || !formData.description) {
        setError('Please fill all required fields');
        return;
      }
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.subject || !formData.subject.trim()) {
      setError('Subject is required');
      setLoading(false);
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }

    try {
      // Prepare data - only include valid fields
      const data = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority || 'normal',
        preferred_channel: formData.preferred_channel || 'chat',
      };

      // Only add lawyer_id if it's a valid number
      if (formData.lawyer_id) {
        const lawyerId = typeof formData.lawyer_id === 'string' 
          ? parseInt(formData.lawyer_id) 
          : Number(formData.lawyer_id);
        if (!isNaN(lawyerId) && lawyerId > 0) {
          data.lawyer_id = lawyerId;
        }
      }

      // Only add specialization_id if it's a valid number
      if (formData.specialization_id) {
        const specId = typeof formData.specialization_id === 'string' 
          ? parseInt(formData.specialization_id) 
          : Number(formData.specialization_id);
        if (!isNaN(specId) && specId > 0) {
          data.specialization_id = specId;
        }
      }

      // Only add appointment fields if preferred_channel is 'appointment'
      if (formData.preferred_channel === 'appointment') {
        if (formData.appointment_type) {
          data.appointment_type = formData.appointment_type;
        }
        if (formData.appointment_meeting_link && formData.appointment_meeting_link.trim()) {
          data.appointment_meeting_link = formData.appointment_meeting_link.trim();
        }
        if (formData.appointment_notes && formData.appointment_notes.trim()) {
          data.appointment_notes = formData.appointment_notes.trim();
        }
      }

      // Add attachments if there are any
      if (attachments && attachments.length > 0) {
        data.attachments = attachments.filter(file => file instanceof File);
      }

      console.log('Submitting consultation data:', data);
      console.log('Attachments count:', data.attachments?.length || 0);

      await consultationsService.createConsultation(data);
      setSuccess('Consultation created successfully');
      setTimeout(() => {
        navigate('/client/consultations');
      }, 2000);
    } catch (err) {
      console.error('Consultation creation error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Handle validation errors (422)
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors;
        const errorData = err.response.data;
        
        console.log('422 Validation errors:', errors);
        console.log('Full error data:', errorData);
        
        if (errors && typeof errors === 'object') {
          // Format validation errors
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => {
              const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const messageText = Array.isArray(messages) ? messages.join(', ') : String(messages);
              return `${fieldName}: ${messageText}`;
            })
            .join('\n');
          setError(errorMessages || 'Validation failed. Please check your input.');
        } else if (errorData?.message) {
          setError(errorData.message);
        } else {
          setError('Validation failed. Please check all required fields are filled correctly.');
        }
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('Access forbidden. Please check your account status.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        const errorMessage = err.response?.data?.message || 
                            err.message ||
                            'Failed to create consultation. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/client/consultations')}
            sx={{ 
              color: colors.gold,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(colors.gold, 0.1),
              },
            }}
          >
            BACK
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              New Consultation
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              Create a new legal consultation request
            </Typography>
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

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.lightBlack, borderRadius: '12px' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: colors.textSecondary,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    '&.Mui-active': { 
                      color: colors.gold,
                      fontWeight: 600,
                    },
                    '&.Mui-completed': { 
                      color: colors.gold,
                      fontWeight: 500,
                    },
                  },
                  '& .MuiStepIcon-root': {
                    color: colors.textSecondary,
                    '&.Mui-active': {
                      color: colors.gold,
                    },
                    '&.Mui-completed': {
                      color: colors.gold,
                    },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ 
        p: 4, 
        backgroundColor: colors.lightBlack, 
        color: colors.white,
        borderRadius: '16px',
        border: `1px solid ${alpha(colors.gold, 0.1)}`,
      }}>
        {/* Step 1: Consultation Details */}
        {activeStep === 0 && (
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                color: colors.gold, 
                fontWeight: 'bold',
                textShadow: `0 2px 4px ${alpha(colors.gold, 0.3)}`,
              }}
            >
              Consultation Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  required
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Legal consultation about employment contract"
                  helperText="Brief summary of your legal question"
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  required
                  multiline
                  rows={6}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your legal issue..."
                  helperText="The more details you provide, the better we can assist you"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      color: alpha(colors.white, 0.9),
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: colors.gold,
                      },
                    }}
                  >
                    Priority
                  </InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    sx={{
                      color: colors.white,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.gold, 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.gold, 0.7),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.gold,
                      },
                      '& .MuiSvgIcon-root': {
                        color: colors.white,
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: colors.lightBlack,
                          color: colors.white,
                          border: `1px solid ${alpha(colors.gold, 0.3)}`,
                          '& .MuiMenuItem-root': {
                            color: colors.white,
                            '&:hover': {
                              backgroundColor: alpha(colors.gold, 0.2),
                            },
                            '&.Mui-selected': {
                              backgroundColor: alpha(colors.gold, 0.3),
                              '&:hover': {
                                backgroundColor: alpha(colors.gold, 0.4),
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="normal">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.white }}>
                        Normal
                      </Box>
                    </MenuItem>
                    <MenuItem value="urgent">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.white }}>
                        <PriorityHighIcon sx={{ fontSize: 18, color: colors.error }} />
                        Urgent
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      color: alpha(colors.white, 0.9),
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: colors.gold,
                      },
                    }}
                  >
                    Preferred Channel
                  </InputLabel>
                  <Select
                    value={formData.preferred_channel}
                    onChange={(e) => setFormData({ ...formData, preferred_channel: e.target.value })}
                    sx={{
                      color: colors.white,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.gold, 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.gold, 0.7),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.gold,
                      },
                      '& .MuiSvgIcon-root': {
                        color: colors.white,
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: colors.lightBlack,
                          color: colors.white,
                          border: `1px solid ${alpha(colors.gold, 0.3)}`,
                          '& .MuiMenuItem-root': {
                            color: colors.white,
                            '&:hover': {
                              backgroundColor: alpha(colors.gold, 0.2),
                            },
                            '&.Mui-selected': {
                              backgroundColor: alpha(colors.gold, 0.3),
                              '&:hover': {
                                backgroundColor: alpha(colors.gold, 0.4),
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="chat">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.white }}>
                        <ChatIcon sx={{ fontSize: 18, color: colors.gold }} />
                        Chat
                      </Box>
                    </MenuItem>
                    <MenuItem value="in_office">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.white }}>
                        <BusinessIcon sx={{ fontSize: 18, color: colors.gold }} />
                        In Office
                      </Box>
                    </MenuItem>
                    <MenuItem value="call">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.white }}>
                        <PhoneIcon sx={{ fontSize: 18, color: colors.gold }} />
                        Call
                      </Box>
                    </MenuItem>
                    <MenuItem value="appointment">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.white }}>
                        <EventIcon sx={{ fontSize: 18, color: colors.gold }} />
                        Appointment
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 2: Additional Information */}
        {activeStep === 1 && (
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                color: colors.gold, 
                fontWeight: 'bold',
                textShadow: `0 2px 4px ${alpha(colors.gold, 0.3)}`,
              }}
            >
              Additional Information
            </Typography>

            <Grid container spacing={3}>
              {/* Selection Mode Toggle */}
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 3, 
                    backgroundColor: colors.black,
                    border: `1px solid ${alpha(colors.gold, 0.2)}`,
                    borderRadius: '12px',
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 2, 
                      color: colors.textSecondary,
                      fontWeight: 600,
                    }}
                  >
                    Choose Selection Method
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant={selectionMode === 'specialization' ? 'contained' : 'outlined'}
                      onClick={() => {
                        setSelectionMode('specialization');
                        setFormData({ ...formData, lawyer_id: '' });
                        setSelectedLawyer(null);
                      }}
                      sx={{
                        flex: 1,
                        backgroundColor: selectionMode === 'specialization' 
                          ? colors.gold 
                          : 'transparent',
                        color: selectionMode === 'specialization' 
                          ? colors.black 
                          : colors.gold,
                        borderColor: colors.gold,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: selectionMode === 'specialization' 
                            ? alpha(colors.gold, 0.9) 
                            : alpha(colors.gold, 0.1),
                        },
                      }}
                    >
                      Select by Specialization First
                    </Button>
                    <Button
                      variant={selectionMode === 'lawyer' ? 'contained' : 'outlined'}
                      onClick={() => {
                        setSelectionMode('lawyer');
                        setFormData({ ...formData, specialization_id: '' });
                      }}
                      sx={{
                        flex: 1,
                        backgroundColor: selectionMode === 'lawyer' 
                          ? colors.gold 
                          : 'transparent',
                        color: selectionMode === 'lawyer' 
                          ? colors.black 
                          : colors.gold,
                        borderColor: colors.gold,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: selectionMode === 'lawyer' 
                            ? alpha(colors.gold, 0.9) 
                            : alpha(colors.gold, 0.1),
                        },
                      }}
                    >
                      Select Lawyer Directly
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Specialization Selection (if mode is specialization) */}
              {selectionMode === 'specialization' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        color: alpha(colors.white, 0.9),
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: colors.gold,
                        },
                      }}
                    >
                      Select Specialization
                    </InputLabel>
                    <Select
                      value={formData.specialization_id}
                      onChange={(e) => {
                        setFormData({ ...formData, specialization_id: e.target.value, lawyer_id: '' });
                        setSelectedLawyer(null);
                      }}
                      sx={{
                        color: colors.white,
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(colors.gold, 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(colors.gold, 0.7),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.gold,
                        },
                        '& .MuiSvgIcon-root': {
                          color: colors.white,
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: colors.lightBlack,
                            color: colors.white,
                            border: `1px solid ${alpha(colors.gold, 0.3)}`,
                            '& .MuiMenuItem-root': {
                              color: colors.white,
                              '&:hover': {
                                backgroundColor: alpha(colors.gold, 0.2),
                              },
                              '&.Mui-selected': {
                                backgroundColor: alpha(colors.gold, 0.3),
                                '&:hover': {
                                  backgroundColor: alpha(colors.gold, 0.4),
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <Box sx={{ color: alpha(colors.white, 0.7) }}>Select Specialization</Box>
                      </MenuItem>
                      {Array.isArray(specializations) && specializations.map((spec) => (
                        <MenuItem key={spec.id} value={spec.id}>
                          <Box sx={{ color: colors.white }}>{spec.name}</Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Search */}
              <Grid item xs={12} md={selectionMode === 'specialization' ? 6 : 12}>
                <StyledTextField
                  fullWidth
                  label="Search Lawyers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or specialization..."
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: colors.gold }}>
                        <PersonIcon />
                      </Box>
                    ),
                  }}
                />
              </Grid>

              {/* Clear Filters */}
              {(formData.specialization_id || searchQuery) && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Showing {lawyers.length} lawyer{lawyers.length !== 1 ? 's' : ''}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setFormData({ ...formData, specialization_id: '' });
                        setSearchQuery('');
                      }}
                      sx={{ color: colors.gold, textTransform: 'none' }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Grid>
              )}

              {/* Lawyers List */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    color: colors.white,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {selectionMode === 'specialization' && formData.specialization_id
                    ? 'Select Lawyer from Specialization'
                    : 'Select Lawyer (Optional)'}
                </Typography>
                {fetchingData ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: colors.gold }} />
                  </Box>
                ) : Array.isArray(lawyers) && lawyers.length > 0 ? (
                  <Box>
                    <Grid container spacing={2}>
                      {lawyers.slice(0, 6).map((lawyer) => {
                        // Get specializations - handle multiple formats
                        let lawyerSpecs = [];
                        if (lawyer.specializations) {
                          if (Array.isArray(lawyer.specializations)) {
                            lawyerSpecs = lawyer.specializations;
                          } else if (typeof lawyer.specializations === 'object') {
                            lawyerSpecs = [lawyer.specializations];
                          }
                        } else if (lawyer.specialization) {
                          if (Array.isArray(lawyer.specialization)) {
                            lawyerSpecs = lawyer.specialization;
                          } else if (typeof lawyer.specialization === 'object') {
                            lawyerSpecs = [lawyer.specialization];
                          } else {
                            lawyerSpecs = [{ name: lawyer.specialization }];
                          }
                        }
                        
                        // Debug log
                        if (lawyerSpecs.length === 0) {
                          console.log('Lawyer without specializations:', lawyer.name, lawyer);
                        }

                        return (
                        <Grid item xs={12} sm={6} md={4} key={lawyer.id}>
                        <LawyerCard
                          selected={formData.lawyer_id === lawyer.id.toString() || formData.lawyer_id === lawyer.id}
                          onClick={() => {
                            // Toggle selection - if already selected, deselect
                            const isSelected = formData.lawyer_id === lawyer.id || formData.lawyer_id === lawyer.id.toString();
                            const newLawyerId = isSelected ? '' : lawyer.id;
                            setFormData({ ...formData, lawyer_id: newLawyerId });
                            setSelectedLawyer(newLawyerId ? lawyer : null);
                          }}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: formData.lawyer_id === lawyer.id.toString() || formData.lawyer_id === lawyer.id
                                      ? colors.gold 
                                      : alpha(colors.gold, 0.2),
                                    width: 64, 
                                    height: 64,
                                    border: `2px solid ${formData.lawyer_id === lawyer.id.toString() || formData.lawyer_id === lawyer.id ? colors.gold : alpha(colors.gold, 0.3)}`,
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  <GavelIcon 
                                    sx={{ 
                                      color: formData.lawyer_id === lawyer.id.toString() || formData.lawyer_id === lawyer.id
                                        ? colors.black 
                                        : colors.gold,
                                      fontSize: 32,
                                    }} 
                                  />
                                </Avatar>
                                <Box sx={{ width: '100%' }}>
                                  <Typography 
                                    variant="h6" 
                                    fontWeight="bold" 
                                    sx={{ 
                                      color: formData.lawyer_id === lawyer.id.toString() || formData.lawyer_id === lawyer.id
                                        ? colors.gold 
                                        : colors.white,
                                      mb: 0.5,
                                      transition: 'color 0.3s ease',
                                    }}
                                  >
                                    {lawyer.name}
                                  </Typography>
                                  {lawyerSpecs.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, justifyContent: 'center' }}>
                                      {lawyerSpecs.map((spec, idx) => {
                                        const specName = spec?.name || spec?.title || (typeof spec === 'string' ? spec : 'Specialization');
                                        return (
                                          <Chip
                                            key={idx}
                                            label={specName}
                                            size="small"
                                            sx={{
                                              backgroundColor: formData.lawyer_id === lawyer.id.toString() || formData.lawyer_id === lawyer.id
                                                ? alpha(colors.gold, 0.3)
                                                : alpha(colors.gold, 0.2),
                                              color: colors.gold,
                                              fontSize: '0.7rem',
                                              height: '20px',
                                              fontWeight: 500,
                                              border: `1px solid ${alpha(colors.gold, 0.3)}`,
                                            }}
                                          />
                                        );
                                      })}
                                    </Box>
                                  ) : (
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 0.5, fontStyle: 'italic' }}>
                                      No specializations listed
                                    </Typography>
                                  )}
                                </Box>
                                {formData.lawyer_id === lawyer.id.toString() || formData.lawyer_id === lawyer.id ? (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    color: colors.gold,
                                    mt: 0.5,
                                  }}>
                                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      Selected
                                    </Typography>
                                  </Box>
                                ) : null}
                              </Box>
                            </CardContent>
                          </LawyerCard>
                        </Grid>
                        );
                      })}
                    </Grid>
                    {lawyers.length > 6 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Showing first 6 lawyers. {lawyers.length - 6} more available.
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ backgroundColor: alpha(colors.gold, 0.1), color: colors.gold }}>
                    {formData.specialization_id || searchQuery
                      ? 'No lawyers found matching your filters. Try adjusting your search criteria.'
                      : 'No lawyers available at the moment. You can still submit your consultation and we\'ll assign a lawyer.'}
                  </Alert>
                )}
              </Grid>

              {formData.preferred_channel === 'appointment' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />
                    <Typography variant="h6" sx={{ mb: 2, color: colors.gold }}>
                      Appointment Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel 
                        sx={{ 
                          color: alpha(colors.white, 0.9),
                          fontWeight: 500,
                          '&.Mui-focused': {
                            color: colors.gold,
                          },
                        }}
                      >
                        Appointment Type
                      </InputLabel>
                      <Select
                        value={formData.appointment_type}
                        onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                        sx={{
                          color: colors.white,
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(colors.gold, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(colors.gold, 0.7),
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.gold,
                          },
                          '& .MuiSvgIcon-root': {
                            color: colors.white,
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: colors.lightBlack,
                              color: colors.white,
                              border: `1px solid ${alpha(colors.gold, 0.3)}`,
                              '& .MuiMenuItem-root': {
                                color: colors.white,
                                '&:hover': {
                                  backgroundColor: alpha(colors.gold, 0.2),
                                },
                                '&.Mui-selected': {
                                  backgroundColor: alpha(colors.gold, 0.3),
                                  '&:hover': {
                                    backgroundColor: alpha(colors.gold, 0.4),
                                  },
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="online">
                          <Box sx={{ color: colors.white }}>Online</Box>
                        </MenuItem>
                        <MenuItem value="in_office">
                          <Box sx={{ color: colors.white }}>In Office</Box>
                        </MenuItem>
                        <MenuItem value="phone">
                          <Box sx={{ color: colors.white }}>Phone</Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {formData.appointment_type === 'online' && (
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        label="Meeting Link"
                        value={formData.appointment_meeting_link}
                        onChange={(e) => setFormData({ ...formData, appointment_meeting_link: e.target.value })}
                        placeholder="https://meet.google.com/xxx"
                        helperText="Link for online meeting"
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Appointment Notes (Optional)"
                      value={formData.appointment_notes}
                      onChange={(e) => setFormData({ ...formData, appointment_notes: e.target.value })}
                      placeholder="Any additional notes for the appointment..."
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    color: colors.white,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  Attachments (Optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{
                    color: colors.gold,
                    borderColor: alpha(colors.gold, 0.5),
                    borderWidth: '2px',
                    borderRadius: '8px',
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      borderColor: colors.gold, 
                      backgroundColor: alpha(colors.gold, 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(colors.gold, 0.2)}`,
                    },
                  }}
                >
                  Attach Files
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </Button>
                {attachments.length > 0 && (
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                      {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
                    </Typography>
                    {attachments.map((file, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          backgroundColor: colors.black,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: `1px solid ${alpha(colors.gold, 0.3)}`,
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: colors.gold,
                            backgroundColor: alpha(colors.gold, 0.05),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: '8px',
                              backgroundColor: alpha(colors.gold, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AttachFileIcon sx={{ color: colors.gold, fontSize: 24 }} />
                          </Box>
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
                              {file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeAttachment(index)}
                          sx={{ 
                            color: colors.error,
                            '&:hover': {
                              backgroundColor: alpha(colors.error, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 3: Review & Submit */}
        {activeStep === 2 && (
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                color: colors.gold, 
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: `0 2px 4px ${alpha(colors.gold, 0.3)}`,
              }}
            >
              Review & Submit
            </Typography>

            <Paper
              sx={{
                p: 4,
                backgroundColor: colors.black,
                border: `2px solid ${colors.gold}`,
                borderRadius: '16px',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Subject
                  </Typography>
                  <Typography variant="h6" sx={{ color: colors.white, fontWeight: 'bold' }}>
                    {formData.subject}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />

                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white }}>
                    {formData.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Priority
                    </Typography>
                    <Chip
                      label={priorityLabels[formData.priority]}
                      icon={formData.priority === 'urgent' ? <PriorityHighIcon /> : null}
                      sx={{
                        backgroundColor:
                          formData.priority === 'urgent'
                            ? alpha(colors.error, 0.2)
                            : alpha(colors.gold, 0.2),
                        color: formData.priority === 'urgent' ? colors.error : colors.gold,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      Preferred Channel
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {channelIcons[formData.preferred_channel]}
                      <Typography variant="body1" sx={{ color: colors.white }}>
                        {channelLabels[formData.preferred_channel]}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {selectedLawyer && (
                  <>
                    <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                        Selected Lawyer
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: colors.gold, width: 48, height: 48 }}>
                          <GavelIcon sx={{ color: colors.black, fontSize: 24 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ color: colors.white, fontWeight: 'bold' }}>
                            {selectedLawyer.name}
                          </Typography>
                          {(() => {
                            const specs = selectedLawyer.specializations && Array.isArray(selectedLawyer.specializations)
                              ? selectedLawyer.specializations
                              : selectedLawyer.specialization
                              ? [selectedLawyer.specialization]
                              : [];
                            return specs.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {specs.map((spec, idx) => (
                                  <Chip
                                    key={idx}
                                    label={spec.name || spec}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(colors.gold, 0.2),
                                      color: colors.gold,
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                    }}
                                  />
                                ))}
                              </Box>
                            );
                          })()}
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}

                {formData.specialization_id && (
                  <>
                    <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                        Specialization
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.white }}>
                        {specializations.find((s) => s.id === parseInt(formData.specialization_id))?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </>
                )}

                {formData.preferred_channel === 'appointment' && (
                  <>
                    <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                        Appointment Type
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.white }}>
                        {typeLabels[formData.appointment_type]}
                      </Typography>
                      {formData.appointment_meeting_link && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                            Meeting Link
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.gold,
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            }}
                            onClick={() => window.open(formData.appointment_meeting_link, '_blank')}
                          >
                            {formData.appointment_meeting_link}
                          </Typography>
                        </Box>
                      )}
                      {formData.appointment_notes && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                            Appointment Notes
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.white }}>
                            {formData.appointment_notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {attachments.length > 0 && (
                  <>
                    <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                        Attachments ({attachments.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {attachments.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1,
                              backgroundColor: alpha(colors.gold, 0.1),
                              borderRadius: '8px',
                            }}
                          >
                            <AttachFileIcon sx={{ color: colors.gold, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: colors.white, flex: 1 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  Your consultation will be reviewed by our team. You will receive a notification once it's been accepted.
                </Alert>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ 
              color: activeStep === 0 ? colors.textSecondary : colors.white,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: activeStep === 0 ? 'transparent' : alpha(colors.gold, 0.1),
              },
              '&.Mui-disabled': {
                color: colors.textSecondary,
              },
            }}
          >
            Previous
          </Button>
          {activeStep < steps.length - 1 ? (
            <StyledButton 
              onClick={handleNext}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '8px',
              }}
            >
              Next
            </StyledButton>
          ) : (
            <StyledButton 
              onClick={handleSubmit} 
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '8px',
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: colors.black }} />
              ) : (
                'Submit Consultation'
              )}
            </StyledButton>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
