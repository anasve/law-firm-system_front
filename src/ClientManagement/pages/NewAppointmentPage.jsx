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
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Gavel as GavelIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner, StyledButton, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { appointmentsService, lawyersService } from '../services';

const SlotCard = styled(Card)(({ selected }) => ({
  backgroundColor: selected ? alpha(colors.gold, 0.2) : colors.black,
  border: selected ? `2px solid ${colors.gold}` : `1px solid ${alpha(colors.gold, 0.2)}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(colors.gold, 0.1),
    borderColor: colors.gold,
    transform: 'translateY(-2px)',
  },
}));

const LawyerInfoCard = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '20px',
  borderRadius: '12px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

const steps = ['Select Lawyer', 'Select Date & Time', 'Appointment Details', 'Confirm Booking'];

const typeIcons = {
  online: <VideoCallIcon />,
  in_office: <BusinessIcon />,
  phone: <PhoneIcon />,
};

const typeLabels = {
  online: 'Online',
  in_office: 'In Office',
  phone: 'Phone',
};

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lawyers, setLawyers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    lawyer_id: '',
    availability_id: '',
    subject: '',
    description: '',
    type: 'online',
    meeting_link: '',
    notes: '',
  });

  useEffect(() => {
    fetchLawyers();
  }, []);

  useEffect(() => {
    if (selectedLawyer && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedLawyer, selectedDate]);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await lawyersService.getLawyers();
      
      // Handle different response structures
      let lawyersData = [];
      if (Array.isArray(response.data)) {
        lawyersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        lawyersData = response.data.data;
      } else if (response.data?.lawyers && Array.isArray(response.data.lawyers)) {
        lawyersData = response.data.lawyers;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        lawyersData = response.data.results;
      }
      
      setLawyers(lawyersData);
      
      if (lawyersData.length === 0) {
        setError('No lawyers available at the moment. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to load lawyers list. Please check your internet connection and try again.';
      setError(errorMessage);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedLawyer || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    
    // Ensure date is in YYYY-MM-DD format
    let formattedDate = selectedDate;
    
    // If date includes time, extract date part only
    if (formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      console.error('Invalid date format:', formattedDate);
      setError('Invalid date format. Please select a valid date.');
      setAvailableSlots([]);
      return;
    }
    
    // Validate date is not in the past
    const dateObj = new Date(formattedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      setError('Please select a future date');
      setAvailableSlots([]);
      return;
    }
    
    try {
      setSlotsLoading(true);
      setError('');
      const response = await appointmentsService.getAvailableSlots(selectedLawyer.id, formattedDate);
      setAvailableSlots(response.data?.available_slots || []);
      if (!response.data?.available_slots || response.data.available_slots.length === 0) {
        setError('No available time slots for this date');
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setAvailableSlots([]);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors?.date ? error.response.data.errors.date[0] : '') ||
                          'Failed to load available time slots. Please try another date.';
      setError(errorMessage);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedLawyer) {
      setError('Please select a lawyer');
      return;
    }
    if (activeStep === 1 && (!selectedDate || !selectedSlot)) {
      setError('Please select date and time');
      return;
    }
    if (activeStep === 2 && (!formData.subject || !formData.description)) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setFormData({ ...formData, availability_id: slot.id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        lawyer_id: selectedLawyer.id,
      };

      // Remove empty fields
      Object.keys(data).forEach((key) => {
        if (data[key] === '' || data[key] === null) {
          delete data[key];
        }
      });

      const response = await appointmentsService.bookDirectAppointment(data);
      setSuccess(response.data?.message || 'Appointment booked successfully');
      setTimeout(() => {
        navigate('/client/appointments');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      }
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDateTime = () => {
    if (!selectedDate || !selectedSlot) return null;
    return `${selectedDate} ${selectedSlot.start_time}`;
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/client/appointments')}
            sx={{ color: colors.gold }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Book New Appointment
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              Book your appointment with the best lawyers
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
      <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.lightBlack }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: colors.textSecondary,
                    '&.Mui-active': { color: colors.gold },
                    '&.Mui-completed': { color: colors.gold },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 4, backgroundColor: colors.lightBlack, color: colors.white }}>
        {/* Step 1: Select Lawyer */}
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
              Select Lawyer
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: colors.gold }} />
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button
                  variant="outlined"
                  onClick={fetchLawyers}
                  sx={{
                    color: colors.gold,
                    borderColor: colors.gold,
                    '&:hover': {
                      borderColor: colors.gold,
                      backgroundColor: alpha(colors.gold, 0.1),
                    },
                  }}
                >
                  Retry
                </Button>
              </Box>
            ) : Array.isArray(lawyers) && lawyers.length > 0 ? (
              <Grid container spacing={3}>
                {lawyers.map((lawyer) => (
                  <Grid item xs={12} sm={6} md={4} key={lawyer.id}>
                    <Card
                      sx={{
                        backgroundColor: selectedLawyer?.id === lawyer.id 
                          ? alpha(colors.gold, 0.15) 
                          : colors.lightBlack,
                        border: selectedLawyer?.id === lawyer.id 
                          ? `2px solid ${colors.gold}` 
                          : `1px solid ${alpha(colors.gold, 0.3)}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        color: colors.white,
                        '&:hover': {
                          backgroundColor: selectedLawyer?.id === lawyer.id 
                            ? alpha(colors.gold, 0.2) 
                            : alpha(colors.gold, 0.1),
                          borderColor: colors.gold,
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 16px ${alpha(colors.black, 0.4)}`,
                        },
                      }}
                      onClick={() => {
                        setSelectedLawyer(lawyer);
                        setFormData({ ...formData, lawyer_id: lawyer.id });
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: colors.gold, 
                              width: 56, 
                              height: 56,
                              border: `2px solid ${alpha(colors.gold, 0.5)}`,
                            }}
                          >
                            <GavelIcon sx={{ color: colors.black, fontSize: 28 }} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              sx={{ 
                                color: selectedLawyer?.id === lawyer.id 
                                  ? colors.gold 
                                  : colors.white,
                                mb: 0.5,
                              }}
                            >
                              {lawyer.name}
                            </Typography>
                            {lawyer.specialization && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: selectedLawyer?.id === lawyer.id 
                                    ? alpha(colors.gold, 0.9) 
                                    : alpha(colors.gold, 0.8),
                                  fontWeight: 500,
                                }}
                              >
                                {lawyer.specialization.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {lawyer.email && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: selectedLawyer?.id === lawyer.id 
                                ? alpha(colors.white, 0.8) 
                                : alpha(colors.white, 0.7),
                              fontSize: '0.85rem',
                            }}
                          >
                            {lawyer.email}
                          </Typography>
                        )}
                        {selectedLawyer?.id === lawyer.id && (
                          <Box 
                            sx={{ 
                              mt: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              p: 1,
                              borderRadius: '8px',
                              backgroundColor: alpha(colors.gold, 0.2),
                            }}
                          >
                            <CheckCircleIcon sx={{ color: colors.gold, fontSize: 20 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: colors.gold,
                                fontWeight: 'bold',
                              }}
                            >
                              Selected
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">No lawyers available at the moment</Alert>
            )}
          </Box>
        )}

        {/* Step 2: Select Date and Time */}
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
              Select Date & Time
            </Typography>

            {selectedLawyer && (
              <LawyerInfoCard 
                sx={{ 
                  mb: 3,
                  backgroundColor: alpha(colors.gold, 0.1),
                  border: `1px solid ${alpha(colors.gold, 0.4)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: colors.gold, 
                      width: 48, 
                      height: 48,
                      border: `2px solid ${alpha(colors.gold, 0.5)}`,
                    }}
                  >
                    <GavelIcon sx={{ color: colors.black, fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{ color: colors.white }}
                    >
                      {selectedLawyer.name}
                    </Typography>
                    {selectedLawyer.specialization && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: colors.gold,
                          fontWeight: 500,
                        }}
                      >
                        {selectedLawyer.specialization.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </LawyerInfoCard>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  required
                  type="date"
                  label="Date"
                  value={selectedDate}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      // Validate date format (YYYY-MM-DD)
                      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                        setSelectedDate(dateValue);
                        setError('');
                      } else {
                        setError('Please select a valid date');
                      }
                    } else {
                      setSelectedDate('');
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0],
                  }}
                />
              </Grid>

              {selectedDate && (
                <Grid item xs={12}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      color: colors.white,
                      fontWeight: 'bold',
                    }}
                  >
                    Available Time Slots
                  </Typography>
                  {slotsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress sx={{ color: colors.gold }} />
                    </Box>
                  ) : Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    <Grid container spacing={2}>
                      {availableSlots.map((slot) => (
                        <Grid item xs={6} sm={4} md={3} key={slot.id}>
                          <SlotCard
                            selected={selectedSlot?.id === slot.id}
                            onClick={() => handleSlotSelect(slot)}
                          >
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <TimeIcon 
                                sx={{ 
                                  color: selectedSlot?.id === slot.id 
                                    ? colors.gold 
                                    : alpha(colors.gold, 0.7), 
                                  mb: 1,
                                  fontSize: 24,
                                }} 
                              />
                              <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                sx={{ 
                                  color: selectedSlot?.id === slot.id 
                                    ? colors.gold 
                                    : colors.white,
                                }}
                              >
                                {slot.start_time}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: selectedSlot?.id === slot.id 
                                    ? alpha(colors.gold, 0.9) 
                                    : alpha(colors.white, 0.7),
                                  display: 'block',
                                }}
                              >
                                - {slot.end_time}
                              </Typography>
                              {slot.duration && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block', 
                                    color: selectedSlot?.id === slot.id 
                                      ? alpha(colors.gold, 0.8) 
                                      : alpha(colors.white, 0.6), 
                                    mt: 0.5,
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  ({slot.duration} min)
                                </Typography>
                              )}
                            </CardContent>
                          </SlotCard>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">No available time slots for this date</Alert>
                  )}
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Step 3: Appointment Details */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, color: colors.gold, fontWeight: 'bold' }}>
              Appointment Details
            </Typography>

            {/* Summary Card */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: colors.black,
                border: `1px solid ${alpha(colors.gold, 0.2)}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: colors.gold }}>
                Booking Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedLawyer && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: colors.gold, fontSize: 20 }} />
                    <Typography variant="body1">
                      <strong>Lawyer:</strong> {selectedLawyer.name}
                    </Typography>
                  </Box>
                )}
                {selectedDate && selectedSlot && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ color: colors.gold, fontSize: 20 }} />
                      <Typography variant="body1">
                        <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon sx={{ color: colors.gold, fontSize: 20 }} />
                      <Typography variant="body1">
                        <strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  required
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Legal consultation about employment contract"
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the legal issue..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: colors.textSecondary }}>Appointment Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    sx={{
                      color: colors.white,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.gold, 0.3),
                      },
                    }}
                  >
                    <MenuItem value="online">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideoCallIcon sx={{ fontSize: 20 }} />
                        Online
                      </Box>
                    </MenuItem>
                    <MenuItem value="in_office">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 20 }} />
                        In Office
                      </Box>
                    </MenuItem>
                    <MenuItem value="phone">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 20 }} />
                        Phone
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.type === 'online' && (
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Meeting Link"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/xxx"
                    helperText="This link will be used for the online meeting"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes (Optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes you want to add..."
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 4: Confirmation */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, color: colors.gold, fontWeight: 'bold', textAlign: 'center' }}>
              Confirm Booking
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: colors.gold, width: 64, height: 64 }}>
                    <GavelIcon sx={{ fontSize: 32, color: colors.black }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedLawyer?.name}
                    </Typography>
                    {selectedLawyer?.specialization && (
                      <Chip
                        label={selectedLawyer.specialization.name}
                        sx={{
                          backgroundColor: colors.gold,
                          color: colors.black,
                          mt: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarIcon sx={{ color: colors.gold, fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TimeIcon sx={{ color: colors.gold, fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Time
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedSlot?.start_time} - {selectedSlot?.end_time}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {typeIcons[formData.type]}
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Appointment Type
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {typeLabels[formData.type]}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: alpha(colors.gold, 0.2) }} />

                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                    Subject
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formData.subject}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {formData.description}
                  </Typography>
                </Box>

                {formData.meeting_link && (
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                      Meeting Link
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: colors.gold,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(formData.meeting_link, '_blank')}
                    >
                      {formData.meeting_link}
                    </Typography>
                  </Box>
                )}

                {formData.notes && (
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {formData.notes}
                    </Typography>
                  </Box>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  The appointment will be confirmed by an employee shortly. You will receive a notification upon confirmation.
                </Alert>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ color: colors.textSecondary }}
          >
            Previous
          </Button>
          {activeStep < steps.length - 1 ? (
            <StyledButton onClick={handleNext}>
              Next
            </StyledButton>
          ) : (
            <StyledButton onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <CircularProgress size={24} sx={{ color: colors.black }} />
              ) : (
                'Confirm Booking'
              )}
            </StyledButton>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
