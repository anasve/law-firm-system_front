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
import { guestService } from '../../Guest/services';
import TimeSlotGrid from '../components/TimeSlotGrid';

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
  const [allLawyers, setAllLawyers] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
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
    fetchSpecializations();
  }, []);

  useEffect(() => {
    filterLawyers();
  }, [selectedSpecialization, searchQuery, allLawyers]);

  useEffect(() => {
    // Only fetch slots if both lawyer and date are selected
    if (selectedLawyer?.id && selectedDate) {
      console.log('useEffect triggered - Fetching slots for lawyer:', selectedLawyer.id, 'date:', selectedDate);
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        fetchAvailableSlots();
        fetchBookedAppointments();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Clear slots when lawyer or date is not selected
      setAvailableSlots([]);
      setBookedAppointments([]);
      setSelectedSlot(null);
    }
  }, [selectedLawyer?.id, selectedDate]);

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
      
      setAllLawyers(lawyersData);
      setLawyers(lawyersData);
      
      if (lawyersData.length === 0) {
        setError('No lawyers available at the moment. Please try again later.');
      }
    } catch (error) {
      // Handle errors gracefully
      if (error.response?.status === 404) {
        // Endpoint not implemented in backend
        setError('Lawyers feature is not available yet. Please contact support.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        // Only log non-404 errors
        console.error('Failed to fetch lawyers:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error ||
                            error.message || 
                            'Failed to load lawyers list. Please check your internet connection and try again.';
        setError(errorMessage);
      }
      setLawyers([]);
      setAllLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await guestService.getSpecializations();
      const specs = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      setSpecializations(specs);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
    }
  };

  const filterLawyers = () => {
    let filtered = [...allLawyers];

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter(lawyer => {
        // Check if lawyer has specializations array
        if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
          return lawyer.specializations.some(spec => 
            spec.id === parseInt(selectedSpecialization) || 
            spec.id === selectedSpecialization
          );
        }
        // Fallback: check single specialization
        if (lawyer.specialization) {
          const specId = lawyer.specialization.id || lawyer.specialization;
          return specId === parseInt(selectedSpecialization) || specId === selectedSpecialization;
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
        
        // Check specializations
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

  const fetchAvailableSlots = async () => {
    // Validate inputs
    if (!selectedLawyer?.id) {
      console.warn('Cannot fetch slots: No lawyer selected');
      setAvailableSlots([]);
      return;
    }
    
    if (!selectedDate) {
      console.warn('Cannot fetch slots: No date selected');
      setAvailableSlots([]);
      return;
    }
    
    // Ensure date is in YYYY-MM-DD format
    let formattedDate = selectedDate.trim();
    
    // If date includes time, extract date part only
    if (formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    
    // Remove any extra spaces
    formattedDate = formattedDate.replace(/\s/g, '');
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      console.error('Invalid date format:', formattedDate, 'Original:', selectedDate);
      setError('Invalid date format. Please select a valid date.');
      setAvailableSlots([]);
      return;
    }
    
    // Validate date is not in the past
    const dateObj = new Date(formattedDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', formattedDate);
      setError('Invalid date. Please select a valid date.');
      setAvailableSlots([]);
      return;
    }
    
    if (dateObj < today) {
      setError('Please select a future date');
      setAvailableSlots([]);
      return;
    }
    
    try {
      setSlotsLoading(true);
      setError('');
      console.log('=== Fetching Available Slots ===');
      console.log('Lawyer ID:', selectedLawyer.id);
      console.log('Formatted Date:', formattedDate);
      console.log('Date validation passed');
      
      const response = await appointmentsService.getAvailableSlots(selectedLawyer.id, formattedDate);
      console.log('=== API Response ===');
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Available slots response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is response.data an array?', Array.isArray(response.data));
      console.log('Response.data keys:', response.data ? Object.keys(response.data) : 'null');
      
      // Handle response format according to API documentation
      // Expected format: { slots: { available: [], booked: [], unavailable: [], past: [] } }
      let slotsData = [];
      let bookedSlotsData = [];
      
      console.log('=== Parsing Response Data ===');
      console.log('Response.data structure:', response.data);
      console.log('Response.data.slots:', response.data?.slots);
      console.log('Response.data.slots?.available:', response.data?.slots?.available);
      
      // Try new format first (from API documentation)
      if (response.data?.slots) {
        console.log('Found response.data.slots object');
        
        // Check for available slots
        if (response.data.slots.available && Array.isArray(response.data.slots.available)) {
          slotsData = response.data.slots.available;
          console.log('✓ Found available slots:', slotsData.length);
        }
        
        // Check for booked slots
        if (response.data.slots.booked && Array.isArray(response.data.slots.booked)) {
          bookedSlotsData = response.data.slots.booked;
          console.log('✓ Found booked slots:', bookedSlotsData.length);
          
          // Convert booked slots to appointments format for TimeSlotGrid
          const bookedAppts = bookedSlotsData.map(slot => ({
            id: slot.appointment_id || slot.id,
            datetime: `${formattedDate} ${slot.start_time || slot.time || '00:00'}:00`,
            status: 'confirmed',
            client: { name: 'Booked' },
            subject: 'Booked',
          }));
          setBookedAppointments(bookedAppts);
        }
        
        // If we found slots object but no available array, check if slots itself is an array
        if (slotsData.length === 0 && Array.isArray(response.data.slots)) {
          slotsData = response.data.slots;
          console.log('✓ Using response.data.slots as array:', slotsData.length);
        }
      }
      
      // Fallback to old formats if new format didn't work
      if (slotsData.length === 0) {
        console.log('Trying fallback formats...');
        
        if (Array.isArray(response.data)) {
          slotsData = response.data;
          console.log('✓ Using response.data as array (fallback):', slotsData.length);
        } else if (response.data?.available_slots && Array.isArray(response.data.available_slots)) {
          slotsData = response.data.available_slots;
          console.log('✓ Using response.data.available_slots (old format):', slotsData.length);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          slotsData = response.data.data;
          console.log('✓ Using response.data.data (fallback):', slotsData.length);
        } else {
          // Try to find any array in the response
          if (response.data && typeof response.data === 'object') {
            for (const key in response.data) {
              if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                // Prefer arrays that look like slots (have start_time or time property)
                const firstItem = response.data[key][0];
                if (firstItem && (firstItem.start_time || firstItem.time || firstItem.start)) {
                  slotsData = response.data[key];
                  console.log(`✓ Using response.data.${key} (found slots-like array):`, slotsData.length);
                  break;
                }
              }
            }
            
            // If still no slots, use any array found
            if (slotsData.length === 0) {
              for (const key in response.data) {
                if (Array.isArray(response.data[key])) {
                  slotsData = response.data[key];
                  console.log(`✓ Using response.data.${key} (any array):`, slotsData.length);
                  break;
                }
              }
            }
          }
        }
      }
      
      if (slotsData.length === 0) {
        console.warn('⚠️ Could not find any slots in response!');
        console.warn('Full response.data:', JSON.stringify(response.data, null, 2));
      }
      
      console.log('=== Extracted Slots ===');
      console.log('Slots data:', slotsData);
      console.log('Slots count:', slotsData.length);
      if (slotsData.length > 0) {
        console.log('First slot example:', slotsData[0]);
      }
      
      setAvailableSlots(slotsData);
      
      if (slotsData.length === 0) {
        console.warn('No available slots found for date:', formattedDate);
        // Don't set error as a blocking error, just show info message
        // The UI will show "No available time slots" message
        setError('');
      } else {
        console.log('Successfully loaded', slotsData.length, 'available slots');
        setError(''); // Clear error if slots are found
      }
    } catch (error) {
      console.error('=== Error Fetching Slots ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request params:', error.config?.params);
      
      setAvailableSlots([]);
      
      let errorMessage = 'Failed to load available time slots. Please try another date.';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 404) {
          errorMessage = 'Lawyer or endpoint not found. Please try again.';
        } else if (error.response.status === 422) {
          // Validation error
          if (error.response.data?.errors?.date) {
            errorMessage = `Date error: ${error.response.data.errors.date[0]}`;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else {
            errorMessage = 'Invalid date format. Please select a valid date.';
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSlotsLoading(false);
      console.log('=== Finished Fetching Slots ===');
    }
  };

  const fetchBookedAppointments = async () => {
    if (!selectedLawyer?.id || !selectedDate) {
      setBookedAppointments([]);
      return;
    }

    try {
      // Ensure date is in YYYY-MM-DD format
      let formattedDate = selectedDate.trim();
      if (formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }

      // Fetch appointments for the selected date
      const response = await appointmentsService.getAppointments({ 
        date: formattedDate,
        lawyer_id: selectedLawyer.id,
      });

      // Handle different response formats
      let appointmentsData = [];
      if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        appointmentsData = response.data.data;
      } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
        appointmentsData = response.data.appointments;
      }

      // Filter only confirmed and pending appointments (not cancelled or done)
      const activeAppointments = appointmentsData.filter(
        (apt) => apt.status === 'confirmed' || apt.status === 'pending'
      );

      console.log('Booked appointments for date:', formattedDate, activeAppointments);
      setBookedAppointments(activeAppointments);
    } catch (error) {
      console.error('Failed to fetch booked appointments:', error);
      // Don't show error to user, just set empty array
      setBookedAppointments([]);
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
    if (!slot) {
      console.warn('Invalid slot selected: slot is null or undefined');
      setError('Please select a valid time slot');
      return;
    }
    
    // Ensure slot has an id
    const slotId = slot.id;
    if (!slotId) {
      console.warn('Invalid slot selected: slot has no id', slot);
      setError('Selected time slot is invalid. Please select another time slot.');
      return;
    }
    
    console.log('Slot selected:', slot);
    console.log('Slot ID:', slotId, 'Type:', typeof slotId);
    
    // Check if slot ID is a generated one (like "slot-0") - these are invalid
    if (typeof slotId === 'string' && slotId.startsWith('slot-')) {
      console.error('Invalid slot ID: Generated slot ID detected:', slotId);
      setError('This time slot is not available. Please select an available time slot (marked in green).');
      return;
    }
    
    // Ensure availability_id is set correctly
    const availabilityId = typeof slotId === 'number' ? slotId : parseInt(slotId, 10);
    if (isNaN(availabilityId) || availabilityId <= 0) {
      console.error('Invalid slot ID:', slotId);
      setError('Selected time slot has an invalid ID. Please select another time slot.');
      return;
    }
    
    setSelectedSlot({ ...slot, id: availabilityId });
    setFormData({ ...formData, availability_id: availabilityId });
    setError(''); // Clear any errors when a slot is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!selectedLawyer || !selectedLawyer.id) {
        setError('Please select a lawyer');
        setLoading(false);
        return;
      }

      if (!selectedSlot || !selectedSlot.id) {
        setError('Please select a time slot');
        setLoading(false);
        return;
      }

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

      // Validate description length (minimum 10 characters according to API documentation)
      if (formData.description.trim().length < 10) {
        setError('Description must be at least 10 characters long');
        setLoading(false);
        return;
      }

      // Validate availability_id
      const availabilityId = selectedSlot.id;
      if (!availabilityId || (typeof availabilityId !== 'number' && isNaN(parseInt(availabilityId)))) {
        setError('Invalid time slot selected. Please select a valid time slot.');
        setLoading(false);
        return;
      }

      // Prepare data according to API documentation
      const data = {
        lawyer_id: parseInt(selectedLawyer.id, 10),
        availability_id: parseInt(availabilityId, 10),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        type: formData.type || 'online',
      };

      // Validate numeric fields
      if (isNaN(data.lawyer_id) || data.lawyer_id <= 0) {
        setError('Invalid lawyer selected. Please select a valid lawyer.');
        setLoading(false);
        return;
      }

      if (isNaN(data.availability_id) || data.availability_id <= 0) {
        setError('Invalid time slot selected. Please select a valid time slot.');
        setLoading(false);
        return;
      }

      // Add meeting_link only if type is online (required according to API documentation)
      if (formData.type === 'online') {
        if (!formData.meeting_link || !formData.meeting_link.trim()) {
          setError('Meeting link is required for online appointments');
          setLoading(false);
          return;
        }
        data.meeting_link = formData.meeting_link.trim();
      }

      // Add notes if provided
      if (formData.notes && formData.notes.trim()) {
        data.notes = formData.notes.trim();
      }

      console.log('=== Submitting Appointment ===');
      console.log('Selected Lawyer:', selectedLawyer);
      console.log('Selected Slot:', selectedSlot);
      console.log('Form Data:', formData);
      console.log('Prepared Data:', data);
      console.log('Data types:', {
        lawyer_id: typeof data.lawyer_id,
        availability_id: typeof data.availability_id,
        subject: typeof data.subject,
        description: typeof data.description,
        type: typeof data.type,
      });

      const response = await appointmentsService.bookDirectAppointment(data);
      
      const successMessage = response.data?.message || 'Appointment booked successfully. It will be confirmed by an employee shortly.';
      setSuccess(successMessage);
      
      // Reset form
      setFormData({
        lawyer_id: '',
        availability_id: '',
        subject: '',
        description: '',
        type: 'online',
        meeting_link: '',
        notes: '',
      });
      setSelectedLawyer(null);
      setSelectedDate('');
      setSelectedSlot(null);
      setAvailableSlots([]);
      
      setTimeout(() => {
        navigate('/client/appointments');
      }, 2000);
    } catch (err) {
      console.error('=== Appointment Booking Error ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to book appointment. Please try again.';
      
      if (err.response?.status === 422) {
        // Validation error - show detailed errors
        if (err.response.data?.errors) {
          const errorMessages = [];
          Object.keys(err.response.data.errors).forEach((field) => {
            const fieldErrors = err.response.data.errors[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((error) => {
                errorMessages.push(`${field}: ${error}`);
              });
            } else {
              errorMessages.push(`${field}: ${fieldErrors}`);
            }
          });
          errorMessage = errorMessages.length > 0 
            ? `Validation errors: ${errorMessages.join(', ')}`
            : 'Invalid data provided. Please check all fields.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = 'Invalid data provided. Please check all required fields.';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Final error message:', errorMessage);
      setError(errorMessage);
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

            {/* Filters */}
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3, 
                backgroundColor: colors.black,
                border: `1px solid ${alpha(colors.gold, 0.2)}`,
                borderRadius: '12px',
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: colors.textSecondary }}>Filter by Specialization</InputLabel>
                    <Select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      sx={{
                        color: colors.white,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(colors.gold, 0.3),
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>All Specializations</em>
                      </MenuItem>
                      {Array.isArray(specializations) && specializations.map((spec) => (
                        <MenuItem key={spec.id} value={spec.id}>
                          {spec.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {(selectedSpecialization || searchQuery) && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Showing {lawyers.length} lawyer{lawyers.length !== 1 ? 's' : ''}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedSpecialization('');
                      setSearchQuery('');
                    }}
                    sx={{ color: colors.gold, textTransform: 'none' }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              )}
            </Paper>

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
                  <Grid size={{ xs: 12, md: 4 }} key={lawyer.id}>
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
                            {(() => {
                              const specs = lawyer.specializations && Array.isArray(lawyer.specializations)
                                ? lawyer.specializations
                                : lawyer.specialization
                                ? [lawyer.specialization]
                                : [];
                              return specs.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                  {specs.map((spec, idx) => (
                                    <Chip
                                      key={idx}
                                      label={spec.name || spec}
                                      size="small"
                                      sx={{
                                        backgroundColor: selectedLawyer?.id === lawyer.id
                                          ? alpha(colors.gold, 0.3)
                                          : alpha(colors.gold, 0.2),
                                        color: colors.gold,
                                        fontSize: '0.7rem',
                                        height: '20px',
                                        fontWeight: 500,
                                      }}
                                    />
                                  ))}
                                </Box>
                              );
                            })()}
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
              <Alert severity="info">
                {selectedSpecialization || searchQuery 
                  ? 'No lawyers found matching your filters. Try adjusting your search criteria.'
                  : 'No lawyers available at the moment'}
              </Alert>
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
              </LawyerInfoCard>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  required
                  type="date"
                  label="Select Date"
                  value={selectedDate || ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    console.log('Date input changed:', dateValue);
                    
                    if (dateValue) {
                      // Ensure date is in YYYY-MM-DD format
                      const formattedDate = dateValue.split('T')[0];
                      
                      // Validate date format
                      if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
                        // Validate date is not in the past
                        const dateObj = new Date(formattedDate + 'T00:00:00');
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        if (dateObj < today) {
                          setError('Please select a future date');
                          setSelectedDate('');
                          setAvailableSlots([]);
                        } else {
                          console.log('Setting selected date:', formattedDate);
                          setSelectedDate(formattedDate);
                          setError('');
                          // Clear selected slot when date changes
                          setSelectedSlot(null);
                        }
                      } else {
                        setError('Please select a valid date');
                        setSelectedDate('');
                        setAvailableSlots([]);
                      }
                    } else {
                      setSelectedDate('');
                      setAvailableSlots([]);
                      setSelectedSlot(null);
                    }
                  }}
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: colors.textSecondary }
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0],
                  }}
                  helperText={selectedDate ? `Selected: ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : 'Please select a date to view available time slots'}
                  FormHelperTextProps={{
                    sx: { color: colors.textSecondary, mt: 1 }
                  }}
                />
              </Grid>

              {selectedDate && (
                <Grid size={{ xs: 12 }}>
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
                  ) : (
                    <Box>
                      <TimeSlotGrid
                        slots={availableSlots}
                        bookedAppointments={bookedAppointments}
                        selectedSlot={selectedSlot}
                        onSlotSelect={handleSlotSelect}
                        startHour={8}
                        endHour={18}
                        slotDuration={60}
                      />
                      {Array.isArray(availableSlots) && availableSlots.length === 0 && (
                        <Box sx={{ textAlign: 'center', p: 3, mt: 2 }}>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            No available time slots for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'this date'}. Please try another date.
                          </Alert>
                          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                            If you need to book an appointment urgently, please contact the lawyer directly or try selecting a different date.
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              const tomorrowStr = tomorrow.toISOString().split('T')[0];
                              setSelectedDate(tomorrowStr);
                            }}
                            sx={{
                              color: colors.gold,
                              borderColor: colors.gold,
                              '&:hover': {
                                borderColor: colors.gold,
                                backgroundColor: alpha(colors.gold, 0.1),
                              },
                            }}
                          >
                            Try Tomorrow
                          </Button>
                        </Box>
                      )}
                    </Box>
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
              <Grid size={{ xs: 12 }}>
                <StyledTextField
                  fullWidth
                  required
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Legal consultation about employment contract"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12 }}>
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
