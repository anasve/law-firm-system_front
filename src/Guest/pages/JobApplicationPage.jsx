import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../AdminManagement/constants';
import { StyledTextField, StyledButton } from '../../AdminManagement/components/StyledComponents';
import { guestService } from '../services/guestService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: colors.lightBlack,
  padding: theme.spacing(4),
  borderRadius: '12px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
}));

const steps = ['Application Type', 'Personal Information', 'Additional Information', 'Review & Submit'];

export default function JobApplicationPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [applicationType, setApplicationType] = useState(''); // 'employee' or 'lawyer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    address: '',
  });

  // Lawyer specific fields
  const [lawyerData, setLawyerData] = useState({
    specialization_id: '',
    experience_years: '',
    bio: '',
    certificate: null,
    image: null,
  });

  // Employee specific fields
  const [employeeData, setEmployeeData] = useState({
    experience_years: '',
    bio: '',
    image: null,
  });

  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    if (applicationType === 'lawyer') {
      fetchSpecializations();
    }
  }, [applicationType]);

  const fetchSpecializations = async () => {
    try {
      console.log('Fetching specializations...');
      const response = await guestService.getSpecializations();
      console.log('Specializations API response:', response);
      console.log('Response data:', response.data);
      
      let specsData = [];
      
      // Handle direct array (most common case)
      if (Array.isArray(response.data)) {
        specsData = response.data;
        console.log('Found direct array, count:', specsData.length);
      } 
      // Handle paginated response with data array
      else if (response.data?.data && Array.isArray(response.data.data)) {
        specsData = response.data.data;
        console.log('Found paginated data array, count:', specsData.length);
      } 
      // Handle nested specializations
      else if (response.data?.specializations && Array.isArray(response.data.specializations)) {
        specsData = response.data.specializations;
        console.log('Found nested specializations, count:', specsData.length);
      }
      
      console.log('Final specializations data:', specsData);
      console.log('Specializations count:', specsData.length);
      
      if (specsData.length === 0) {
        console.warn('No specializations found in response!');
      }
      
      setSpecializations(specsData);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      setSpecializations([]);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !applicationType) {
      setError('Please select an application type');
      return;
    }
    if (activeStep === 1) {
      // Validate personal information
      if (!formData.name || !formData.age) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLawyerInputChange = (e) => {
    const { name, value } = e.target;
    setLawyerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      if (type === 'lawyer') {
        setLawyerData((prev) => ({ ...prev, [field]: file }));
      } else {
        setEmployeeData((prev) => ({ ...prev, [field]: file }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate required fields before submission
      if (!formData.name || !formData.age) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (applicationType === 'lawyer') {
        if (!lawyerData.specialization_id) {
          setError('Please select a specialization');
          setLoading(false);
          return;
        }
        if (!lawyerData.certificate) {
          setError('Certificate is required for lawyer applications');
          setLoading(false);
          return;
        }
      }

      const formDataToSend = new FormData();
      
      // Common fields
      formDataToSend.append('name', formData.name?.trim() || '');
      formDataToSend.append('phone', formData.phone?.trim() || '');
      formDataToSend.append('age', formData.age || '');
      formDataToSend.append('address', formData.address?.trim() || '');
      formDataToSend.append('type', applicationType);
      
      console.log('Submitting application with type:', applicationType);
      console.log('Form data entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      if (applicationType === 'lawyer') {
        formDataToSend.append('specialization_id', lawyerData.specialization_id || '');
        if (lawyerData.experience_years) {
          formDataToSend.append('experience_years', lawyerData.experience_years.toString());
        }
        if (lawyerData.bio) {
          formDataToSend.append('bio', lawyerData.bio.trim());
        }
        formDataToSend.append('certificate', lawyerData.certificate);
        if (lawyerData.image) {
          formDataToSend.append('photo', lawyerData.image);
        }
      } else if (applicationType === 'employee') {
        if (employeeData.experience_years) {
          formDataToSend.append('experience_years', employeeData.experience_years.toString());
        }
        if (employeeData.bio) {
          formDataToSend.append('bio', employeeData.bio.trim());
        }
        if (employeeData.image) {
          formDataToSend.append('photo', employeeData.image);
        }
      }

      await guestService.submitJobApplication(formDataToSend);
      
      setSuccess('Your job application has been submitted successfully! We will review it and contact you soon.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Application submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 422) {
          // Validation errors
          const errors = error.response.data?.errors;
          if (errors) {
            const errorMessages = Object.entries(errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            errorMessage = errorMessages;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred. Please check that all required fields are filled correctly and try again.';
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
          if (error.response.data?.error) {
            errorMessage += '\nError: ' + error.response.data.error;
          }
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error: Could not connect to server. Please check your internet connection and try again.';
        console.error('No response received:', error.request);
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: colors.white, mb: 3, textAlign: 'center' }}>
              Select Application Type
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  onClick={() => setApplicationType('lawyer')}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: `2px solid ${applicationType === 'lawyer' ? colors.gold : alpha(colors.gold, 0.1)}`,
                    backgroundColor: applicationType === 'lawyer' ? alpha(colors.gold, 0.1) : colors.black,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: colors.gold,
                      backgroundColor: alpha(colors.gold, 0.1),
                    },
                  }}
                >
                  <Typography variant="h5" sx={{ color: colors.gold, mb: 1, fontWeight: 'bold' }}>
                    Lawyer Application
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Apply to become a lawyer on our platform. Share your legal expertise and help clients with their legal needs.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  onClick={() => setApplicationType('employee')}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: `2px solid ${applicationType === 'employee' ? colors.gold : alpha(colors.gold, 0.1)}`,
                    backgroundColor: applicationType === 'employee' ? alpha(colors.gold, 0.1) : colors.black,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: colors.gold,
                      backgroundColor: alpha(colors.gold, 0.1),
                    },
                  }}
                >
                  <Typography variant="h5" sx={{ color: colors.gold, mb: 1, fontWeight: 'bold' }}>
                    Employee Application
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Apply to join our team as an employee. Help manage the platform and support our users.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: colors.white, mb: 3 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Age *"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  inputProps={{ min: 18, max: 100 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: colors.white, mb: 3 }}>
              {applicationType === 'lawyer' ? 'Lawyer Information' : 'Employee Information'}
            </Typography>
            {applicationType === 'lawyer' ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: colors.textSecondary }}>Specialization *</InputLabel>
                    <Select
                      value={lawyerData.specialization_id || ''}
                      onChange={(e) => {
                        console.log('Selected specialization:', e.target.value);
                        setLawyerData((prev) => ({ ...prev, specialization_id: e.target.value }));
                      }}
                      sx={{
                        color: colors.white,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(colors.gold, 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(colors.gold, 0.5),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.gold,
                        },
                      }}
                      required
                    >
                      <MenuItem value="">
                        <em>Select Specialization</em>
                      </MenuItem>
                      {specializations && specializations.length > 0 ? (
                        specializations.map((spec) => (
                          <MenuItem key={spec.id} value={spec.id}>
                            {spec.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No specializations available</MenuItem>
                      )}
                    </Select>
                    {specializations.length === 0 && (
                      <Typography variant="caption" sx={{ color: colors.gold, mt: 1, display: 'block' }}>
                        Loading specializations...
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Years of Experience"
                    name="experience_years"
                    type="number"
                    value={lawyerData.experience_years}
                    onChange={handleLawyerInputChange}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={lawyerData.bio}
                    onChange={handleLawyerInputChange}
                    multiline
                    rows={4}
                    placeholder="Tell us about your legal background and expertise..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      color: colors.gold,
                      borderColor: colors.gold,
                      '&:hover': {
                        borderColor: colors.gold,
                        backgroundColor: alpha(colors.gold, 0.1),
                      },
                    }}
                  >
                    Upload Certificate *
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'certificate', 'lawyer')}
                    />
                  </Button>
                  {lawyerData.certificate && (
                    <Typography variant="caption" sx={{ color: colors.gold, mt: 1, display: 'block' }}>
                      {lawyerData.certificate.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      color: colors.gold,
                      borderColor: colors.gold,
                      '&:hover': {
                        borderColor: colors.gold,
                        backgroundColor: alpha(colors.gold, 0.1),
                      },
                    }}
                  >
                    Upload Your Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image', 'lawyer')}
                    />
                  </Button>
                  {lawyerData.image && (
                    <Typography variant="caption" sx={{ color: colors.gold, mt: 1, display: 'block' }}>
                      {lawyerData.image.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Years of Experience"
                    name="experience_years"
                    type="number"
                    value={employeeData.experience_years}
                    onChange={handleEmployeeInputChange}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={employeeData.bio}
                    onChange={handleEmployeeInputChange}
                    multiline
                    rows={4}
                    placeholder="Tell us about your background and why you want to join our team..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      color: colors.gold,
                      borderColor: colors.gold,
                      '&:hover': {
                        borderColor: colors.gold,
                        backgroundColor: alpha(colors.gold, 0.1),
                      },
                    }}
                  >
                    Upload Your Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image', 'employee')}
                    />
                  </Button>
                  {employeeData.image && (
                    <Typography variant="caption" sx={{ color: colors.gold, mt: 1, display: 'block' }}>
                      {employeeData.image.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: colors.white, mb: 3 }}>
              Review Your Application
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: colors.gold, mb: 1 }}>
                Application Type
              </Typography>
              <Typography variant="body1" sx={{ color: colors.white }}>
                {applicationType === 'lawyer' ? 'Lawyer Application' : 'Employee Application'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: colors.gold, mb: 1 }}>
                Personal Information
              </Typography>
              <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                Name: {formData.name}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                Phone: {formData.phone || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                Age: {formData.age}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.white }}>
                Address: {formData.address || 'N/A'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2, borderColor: alpha(colors.gold, 0.2) }} />
            {applicationType === 'lawyer' ? (
              <Box>
                <Typography variant="subtitle1" sx={{ color: colors.gold, mb: 1 }}>
                  Lawyer Information
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                  Specialization ID: {lawyerData.specialization_id || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                  Experience: {lawyerData.experience_years || 'N/A'} years
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                  Bio: {lawyerData.bio || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                  Certificate: {lawyerData.certificate ? lawyerData.certificate.name : 'Not uploaded'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white }}>
                  Image: {lawyerData.image ? lawyerData.image.name : 'Not uploaded'}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" sx={{ color: colors.gold, mb: 1 }}>
                  Employee Information
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                  Experience: {employeeData.experience_years || 'N/A'} years
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white, mb: 0.5 }}>
                  Bio: {employeeData.bio || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white }}>
                  Image: {employeeData.image ? employeeData.image.name : 'Not uploaded'}
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ backgroundColor: colors.black, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            color: colors.white,
            textAlign: 'center',
            mb: 4,
            fontWeight: 'bold',
          }}
        >
          Job Application
        </Typography>

        <StyledPaper>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { color: colors.white } }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 4, minHeight: '300px' }}>
            {renderStepContent()}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ color: colors.textSecondary }}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <StyledButton onClick={handleSubmit} disabled={loading}>
                {loading ? <CircularProgress size={24} sx={{ color: colors.black }} /> : 'Submit Application'}
              </StyledButton>
            ) : (
              <StyledButton onClick={handleNext}>
                Next
              </StyledButton>
            )}
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
}


