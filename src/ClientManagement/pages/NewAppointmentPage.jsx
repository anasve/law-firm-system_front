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
import CalendarMonth from '../components/CalendarMonth';

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
    subject: '',
    description: '',
    type: 'in_office',
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
      // Expected format: { slots: { available: [], booked: [], unavailable: [], past: [] }, is_holiday: boolean }
      let slotsData = [];
      let bookedSlotsData = [];
      
      // Check if it's a holiday (Friday)
      if (response.data?.is_holiday) {
        setError(response.data?.holiday_reason || 'This day is a holiday (Friday). Please select another date.');
        setAvailableSlots([]);
        setBookedAppointments([]);
        return;
      }
      
      // Try new format first (from API documentation)
      if (response.data?.slots) {
        // Check for available slots
        if (response.data.slots.available && Array.isArray(response.data.slots.available)) {
          slotsData = response.data.slots.available.filter(slot => {
            // Only include slots with valid start_time
            // For automatic system, we accept slots with start_time even if id is temp
            return slot.start_time && (slot.id || slot.start_time);
          });
        }
        
        // Check for booked slots
        if (response.data.slots.booked && Array.isArray(response.data.slots.booked)) {
          bookedSlotsData = response.data.slots.booked;
          
          // Convert booked slots to appointments format
          const bookedAppts = bookedSlotsData.map(slot => ({
            id: slot.appointment_id || slot.id,
            datetime: `${formattedDate} ${slot.start_time || slot.time || '00:00'}:00`,
            status: 'confirmed',
            client: { name: 'Booked' },
            subject: 'Booked',
          }));
          setBookedAppointments(bookedAppts);
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
      
      // If no slots from API, generate them automatically (8 AM to 2 PM, hourly)
      if (slotsData.length === 0) {
        console.log('⚠️ No slots from API, generating automatically (8 AM - 2 PM)');
        
        // Check if it's Friday (holiday)
        const dateObj = new Date(formattedDate + 'T00:00:00');
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 5) {
          // Friday - no slots
          setError('Friday is a holiday. Please select another date.');
          setAvailableSlots([]);
          setBookedAppointments([]);
          return;
        }
        
        // Generate slots from 8 AM to 2 PM (hourly)
        const generatedSlots = [];
        for (let hour = 8; hour < 14; hour++) {
          const startTime = `${String(hour).padStart(2, '0')}:00`;
          const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
          
          // Check if this slot is booked
          const isBooked = bookedSlotsData.some(booked => {
            const bookedTime = booked.start_time || booked.time || '';
            return bookedTime.startsWith(startTime);
          });
          
          if (!isBooked) {
            generatedSlots.push({
              id: `temp-${hour}`,
              start_time: startTime,
              end_time: endTime,
              duration: 60,
              status: 'available',
              is_temp: true,
            });
          }
        }
        
        slotsData = generatedSlots;
        console.log('✓ Generated', slotsData.length, 'automatic slots');
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
        setError('No available time slots for this date. Please try another date.');
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
      
      // Check if it's Friday (holiday)
      const dateObj = new Date(formattedDate + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 5) {
        setError('Friday is a holiday. Please select another date.');
        setAvailableSlots([]);
        setBookedAppointments([]);
        return;
      }
      
      // If API fails, generate slots automatically (8 AM to 2 PM, hourly)
      console.log('⚠️ API error, generating slots automatically (8 AM - 2 PM)');
      const generatedSlots = [];
      for (let hour = 8; hour < 14; hour++) {
        const startTime = `${String(hour).padStart(2, '0')}:00`;
        const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
        
        generatedSlots.push({
          id: `temp-${hour}`,
          start_time: startTime,
          end_time: endTime,
          duration: 60,
          status: 'available',
          is_temp: true,
        });
      }
      
      setAvailableSlots(generatedSlots);
      setError(''); // Clear error since we generated slots automatically
      console.log('✓ Generated', generatedSlots.length, 'automatic slots as fallback');
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
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
    } else {
      navigate('/client/appointments');
    }
  };

  const handleSlotSelect = (slot) => {
    if (!slot) {
      console.warn('Invalid slot selected: slot is null or undefined');
      setError('Please select a valid time slot');
      return;
    }
    
    // For automatic slot system, we just need start_time
    if (!slot.start_time) {
      console.error('Invalid slot: missing start_time', slot);
      setError('Selected time slot is invalid. Please select another time slot.');
      return;
    }
    
    // Ensure slot has required fields for booking
    const slotToSelect = {
      ...slot,
      start_time: slot.start_time,
      end_time: slot.end_time || (() => {
        // Calculate end_time if not provided (add 1 hour)
        const [hours, minutes] = slot.start_time.split(':').map(Number);
        const endHours = hours + 1;
        return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      })(),
    };
    
    console.log('Slot selected:', slotToSelect);
    setSelectedSlot(slotToSelect);
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

      if (!selectedSlot || !selectedSlot.start_time) {
        setError('Please select a time slot');
        setLoading(false);
        return;
      }

      if (!selectedDate) {
        setError('Please select a date.');
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

      // Construct datetime from selectedDate and selectedSlot.start_time
      // Format: YYYY-MM-DDTHH:MM:SS
      const datetime = `${selectedDate}T${selectedSlot.start_time}:00`;

      // Extract preferred_time and preferred_date from datetime
      const preferredTime = selectedSlot.start_time; // HH:MM format
      const preferredDate = selectedDate; // YYYY-MM-DD format

      // Prepare data according to API documentation
      // Use datetime instead of availability_id for automatic slot system
      // When sending datetime, also include preferred_time and preferred_date
      const data = {
        lawyer_id: parseInt(selectedLawyer.id, 10),
        datetime: datetime,
        preferred_time: preferredTime,
        preferred_date: preferredDate,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        type: formData.type || 'in_office',
      };

      // Validate numeric fields
      if (isNaN(data.lawyer_id) || data.lawyer_id <= 0) {
        setError('Invalid lawyer selected. Please select a valid lawyer.');
        setLoading(false);
        return;
      }

      // Validate datetime format
      if (!data.datetime || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(data.datetime)) {
        setError('Invalid date and time format. Please select a valid time slot.');
        setLoading(false);
        return;
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
        datetime: typeof data.datetime,
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
              {/* Calendar Month View */}
              <Grid size={{ xs: 12, md: 8 }}>
                <CalendarMonth
                  lawyerId={selectedLawyer?.id}
                  selectedDate={selectedDate}
                  onDateSelect={(dateStr) => {
                    setSelectedDate(dateStr);
                    setSelectedSlot(null);
                    setError('');
                  }}
                />
              </Grid>

              {/* Selected Date Info and Time Slots */}
              <Grid size={{ xs: 12, md: 4 }}>
                {selectedDate ? (
                  <Box>
                    <Paper
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: colors.black,
                        border: `1px solid ${alpha(colors.gold, 0.3)}`,
                        borderRadius: '8px',
                      }}
                    >
                      <Typography variant="h6" sx={{ color: colors.gold, mb: 1, fontWeight: 'bold' }}>
                        Selected Date
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.white }}>
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Paper>

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
                        {Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {availableSlots.map((slot, index) => {
                              const isBooked = bookedAppointments.some(
                                (apt) =>
                                  apt.datetime &&
                                  apt.datetime.startsWith(selectedDate) &&
                                  apt.datetime.includes(slot.start_time)
                              );
                              const isSelected = selectedSlot?.id === slot.id;
                              const isPast = slot.status === 'past' || slot.status === 'unavailable';

                              return (
                                <Button
                                  key={slot.id || index}
                                  variant={isSelected ? 'contained' : 'outlined'}
                                  disabled={isBooked || isPast}
                                  onClick={() => handleSlotSelect(slot)}
                                  sx={{
                                    width: '100%',
                                    py: 1.5,
                                    backgroundColor: isSelected
                                      ? colors.gold
                                      : isBooked
                                      ? alpha('#f44336', 0.2)
                                      : alpha(colors.gold, 0.1),
                                    color: isSelected
                                      ? colors.black
                                      : isBooked
                                      ? '#f44336'
                                      : colors.gold,
                                    borderColor: isSelected
                                      ? colors.gold
                                      : isBooked
                                      ? '#f44336'
                                      : colors.gold,
                                    '&:hover': {
                                      backgroundColor: isSelected
                                        ? alpha(colors.gold, 0.9)
                                        : isBooked
                                        ? undefined
                                        : alpha(colors.gold, 0.2),
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: alpha('#f44336', 0.1),
                                      color: alpha('#f44336', 0.5),
                                      borderColor: alpha('#f44336', 0.3),
                                    },
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    <TimeIcon sx={{ fontSize: 20 }} />
                                    <Typography variant="body1" fontWeight="bold">
                                      {slot.start_time} - {slot.end_time || slot.start_time}
                                    </Typography>
                                    {isBooked && (
                                      <Chip
                                        label="Booked"
                                        size="small"
                                        sx={{
                                          ml: 'auto',
                                          backgroundColor: '#f44336',
                                          color: 'white',
                                          fontSize: '0.7rem',
                                          height: '20px',
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Button>
                              );
                            })}
                          </Box>
                        ) : (
                          <Alert severity="info" sx={{ backgroundColor: colors.lightBlack, color: colors.white }}>
                            {(() => {
                              const date = new Date(selectedDate);
                              const dayOfWeek = date.getDay();
                              if (dayOfWeek === 5) {
                                return 'Friday is a holiday. Please select another day.';
                              }
                              return 'No available time slots for this date. Please try another date.';
                            })()}
                          </Alert>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Paper
                    sx={{
                      p: 3,
                      backgroundColor: colors.black,
                      border: `1px solid ${alpha(colors.gold, 0.2)}`,
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 48, color: colors.textSecondary, mb: 2 }} />
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                      Select a date from the calendar to view available time slots
                    </Typography>
                  </Paper>
                )}
              </Grid>
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
                    <Typography variant="body1" sx={{ color: alpha(colors.white, 0.9) }}>
                      <Box component="span" sx={{ color: alpha(colors.white, 0.7), fontWeight: 600 }}>Lawyer: </Box>
                      <Box component="span" sx={{ color: colors.gold, fontWeight: 600 }}>{selectedLawyer.name}</Box>
                    </Typography>
                  </Box>
                )}
                {selectedDate && selectedSlot && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ color: colors.gold, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ color: alpha(colors.white, 0.9) }}>
                        <Box component="span" sx={{ color: alpha(colors.white, 0.7), fontWeight: 600 }}>Date: </Box>
                        <Box component="span" sx={{ color: colors.gold, fontWeight: 600 }}>
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Box>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon sx={{ color: colors.gold, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ color: alpha(colors.white, 0.9) }}>
                        <Box component="span" sx={{ color: alpha(colors.white, 0.7), fontWeight: 600 }}>Time: </Box>
                        <Box component="span" sx={{ color: colors.gold, fontWeight: 600 }}>
                          {selectedSlot.start_time} - {selectedSlot.end_time}
                        </Box>
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
          <StyledButton 
            variant="outlined"
            onClick={handleBack}
            sx={{
              color: alpha(colors.white, 0.9),
              borderColor: alpha(colors.gold, 0.5),
              '&:hover': {
                color: colors.gold,
                borderColor: colors.gold,
                backgroundColor: alpha(colors.gold, 0.1),
              },
            }}
          >
            Previous
          </StyledButton>
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
