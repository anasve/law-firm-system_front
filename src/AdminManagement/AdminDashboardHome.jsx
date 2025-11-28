import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import AddIcon from '@mui/icons-material/Add';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const colors = {
  gold: '#D4AF37',
  black: '#1A1A1A',
  white: '#FFFFFF',
  lightBlack: '#232323',
};

const inputFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(0,0,0,0.15)',
    color: '#E0C181',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#C4A484',
      borderRadius: '8px',
    },
    '&:hover fieldset': {
      borderColor: '#E0C181',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#E0C181',
    },
    '& input, & textarea': {
      color: '#E0C181',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#C4A484',
    left: '1.5rem',
    right: 'auto',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#E0C181',
  },
  '& .MuiSelect-select': {
    color: '#E0C181',
  },
  '& .MuiSvgIcon-root': {
    color: '#C4A484',
  },
};

const WelcomeBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  marginBottom: theme.spacing(4),
  borderRadius: '16px',
  background: `linear-gradient(145deg, #232323 30%, #1A1A1A 100%)`,
  borderRight: `5px solid #D4AF37`,
  color: '#FFFFFF',
  position: 'relative',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '12px',
  backgroundColor: colors.lightBlack,
  color: colors.white,
  height: '100%',
}));

const ActionButton = styled(Button)({
  backgroundColor: colors.gold,
  color: colors.black,
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#B4943C',
  }
});

export default function AdminDashboardHome() {
  const [totalLawyers, setTotalLawyers] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [specializations, setSpecializations] = useState([]);

  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openLawyerDialog, setOpenLawyerDialog] = useState(false);

  const [employeeForm, setEmployeeForm] = useState({
    name: '', email: '', age: '', password: '', password_confirmation: '', photo: null, certificate: null
  });
  const [employeeImagePreview, setEmployeeImagePreview] = useState(null);

  const [lawyerForm, setLawyerForm] = useState({
    name: '', email: '', age: '', password: '', password_confirmation: '', specialization_ids: [], photo: null,
  });
  const [lawyerImagePreview, setLawyerImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [lawyersRes, employeesRes, specsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/admin/lawyers/total', config),
          axios.get('http://127.0.0.1:8000/api/admin/employees/total', config),
          axios.get('http://127.0.0.1:8000/api/admin/specializations', config),
        ]);

        setTotalLawyers(lawyersRes.data.total_lawyers);
        setTotalEmployees(employeesRes.data.total_employees);
        setSpecializations(specsRes.data);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    fetchData();
  }, []);

  // Employee data input
  const handleEmployeeInput = (e) => {
    const { name, value } = e.target;
    setEmployeeForm({ ...employeeForm, [name]: value });
  };
  const handleEmployeeFile = (e) => {
    const file = e.target.files[0];
    setEmployeeForm({ ...employeeForm, photo: file });
    setEmployeeImagePreview(file ? URL.createObjectURL(file) : null);
  };
  const handleSubmitEmployee = async () => {

    if (employeeForm.password !== employeeForm.password_confirmation) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      Object.entries(employeeForm).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });



      await axios.post('http://127.0.0.1:8000/api/admin/employees', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Employee added successfully');
      setOpenEmployeeDialog(false);
      setEmployeeForm({ name: '', email: '', age: '', password: '', password_confirmation: '', photo: null });
      setEmployeeImagePreview(null);
    } catch (err) {
      console.error(err);
      alert('Failed to add employee');
    }
  };

  // Lawyer data input
  const handleLawyerInput = (e) => {
    const { name, value } = e.target;
    if (Array.isArray(value)) {
      setLawyerForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setLawyerForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleLawyerFile = (e) => {
    const file = e.target.files[0];
    setLawyerForm({ ...lawyerForm, photo: file });
    setLawyerImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleLawyerCertificate = (e) => {
    const file = e.target.files[0];
    setLawyerForm({ ...lawyerForm, certificate: file });
  };
  const handleSubmitLawyer = async () => {


    if (lawyerForm.password !== lawyerForm.password_confirmation) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      Object.entries(lawyerForm).forEach(([key, val]) => {
        if (val) {
          if (key === 'specialization_ids') {
            val.forEach(id => formData.append('specialization_ids[]', id));
          } else {
            formData.append(key, val);
          }
        }
      });

      await axios.post('http://127.0.0.1:8000/api/admin/lawyers', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Lawyer added successfully');
      setOpenLawyerDialog(false);
      setLawyerForm({ name: '', email: '', age: '', password: '', password_confirmation: '', specializations: [], photo: null });
      setLawyerImagePreview(null);
    } catch (err) {
      console.error(err);
      alert('Failed to add lawyer');
    }
  };

  const stats = [
    { title: 'Total Lawyers', value: totalLawyers ?? '...', icon: <PeopleAltOutlinedIcon sx={{ color: colors.black }} />, color: colors.gold },
    { title: 'Total Employees', value: totalEmployees ?? '...', icon: <Groups2OutlinedIcon sx={{ color: colors.black }} />, color: colors.gold },
  ];

  // Dialog PaperProps لتوحيد الخلفية والزوايا
  const dialogPaperProps = {
    sx: {
      background: '#141414',
      borderRadius: 4,
      boxShadow: 24,
    }
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Typography variant="h4" fontWeight="bold">
          Welcome back, System Administrator
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          We wish you a productive day. Here's a quick overview of your dashboard.
        </Typography>
      </WelcomeBanner>

      <Grid container spacing={4}>
        {stats.map((stat, index) => (
          <Grid key={index} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <StatCard elevation={3}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                <Typography sx={{ color: '#bbb' }}>{stat.title}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                {stat.icon}
              </Avatar>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 5, p: 3, borderRadius: '12px', backgroundColor: colors.lightBlack }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: colors.white, mb: 2 }}>Quick Actions</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <ActionButton startIcon={<AddIcon />} onClick={() => setOpenLawyerDialog(true)}>Add Lawyer</ActionButton>
          <ActionButton startIcon={<AddIcon />} onClick={() => setOpenEmployeeDialog(true)}>Add Employee</ActionButton>
        </Box>
      </Paper>

      {/* Dialog: Add Employee */}
      <Dialog open={openEmployeeDialog} onClose={() => setOpenEmployeeDialog(false)} PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ background: '#141414', color: '#E0C181', fontWeight: 'bold', borderRadius: 0 }}>Add Employee</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex', flexDirection: 'column', gap: 2, background: '#141414', color: '#E0C181', p: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: '2px dashed #C4A484',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backgroundImage: employeeImagePreview ? `url(${employeeImagePreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!employeeImagePreview && (
                <Typography sx={{ color: '#C4A484', fontSize: 13 }}>Profile Picture</Typography>
              )}
              <label htmlFor="employee-photo-upload" style={{
                position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', padding: 4, cursor: 'pointer'
              }}>
                <input
                  id="employee-photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleEmployeeFile}
                />
                <PhotoCamera sx={{ color: '#E0C181' }} />
              </label>
            </Box>
          </Box>
          <TextField
            name="name"
            label="Name"
            onChange={handleEmployeeInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="email"
            label="Email"
            onChange={handleEmployeeInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="age"
            label="Age"
            type="number"
            onChange={handleEmployeeInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            onChange={handleEmployeeInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            onChange={handleEmployeeInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />

        </DialogContent>
        <DialogActions sx={{ background: '#141414', m: 0, p: 2 }}>
          <Button onClick={() => setOpenEmployeeDialog(false)} sx={{ color: '#C4A484' }}>Cancel</Button>
          <Button onClick={handleSubmitEmployee} sx={{
            backgroundColor: '#E0C181',
            color: '#141414',
            fontWeight: 'bold',
            borderRadius: '8px',
            px: 4,
            '&:hover': { backgroundColor: '#C4A484' }
          }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Add Lawyer */}
      <Dialog open={openLawyerDialog} onClose={() => setOpenLawyerDialog(false)} PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ background: '#141414', color: '#E0C181', fontWeight: 'bold', borderRadius: 0 }}>Add Lawyer</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex', flexDirection: 'column', gap: 2, background: '#141414', color: '#E0C181', p: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: '2px dashed #C4A484',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backgroundImage: lawyerImagePreview ? `url(${lawyerImagePreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!lawyerImagePreview && (
                <Typography sx={{ color: '#C4A484', fontSize: 13 }}>Profile Picture</Typography>
              )}
              <label htmlFor="lawyer-photo-upload" style={{
                position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', padding: 4, cursor: 'pointer'
              }}>
                <input
                  id="lawyer-photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLawyerFile}
                />
                <PhotoCamera sx={{ color: '#E0C181' }} />
              </label>
            </Box>
          </Box>
          
          <TextField
            name="name"
            label="Name"
            onChange={handleLawyerInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="email"
            label="Email"
            onChange={handleLawyerInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="age"
            label="Age"
            type="number"
            onChange={handleLawyerInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            onChange={handleLawyerInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />
          <TextField
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            onChange={handleLawyerInput}
            autoComplete="off"
            sx={inputFieldStyles}
            InputLabelProps={{ sx: { color: '#C4A484', left: '1.5rem', right: 'auto' } }}
          />

          <TextField
            select
            SelectProps={{ multiple: true }}
            name="specialization_ids"
            label="Specializations"
            value={lawyerForm.specialization_ids || []}
            onChange={handleLawyerInput}
            sx={inputFieldStyles}
          >
            {specializations.map((spec) => (
              <MenuItem key={spec.id} value={spec.id}>
                {spec.name}
              </MenuItem>
            ))}
          </TextField>
<Box sx={{ mt: 2 }}>
            <Typography sx={{ color: '#C4A484', mb: 1 }}>Lawyer Certificate</Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{
                color: '#E0C181',
                borderColor: '#C4A484',
                '&:hover': { borderColor: '#E0C181', backgroundColor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Upload Certificate
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleLawyerCertificate}
              />
            </Button>
            {lawyerForm.certificate && (
              <Typography sx={{ color: '#E0C181', mt: 1, fontSize: 14 }}>
                Selected file: {lawyerForm.certificate.name}
              </Typography>
            )}
          </Box>

        </DialogContent>
        <DialogActions sx={{ background: '#141414', m: 0, p: 2 }}>
          <Button onClick={() => setOpenLawyerDialog(false)} sx={{ color: '#C4A484' }}>Cancel</Button>
          <Button onClick={handleSubmitLawyer} sx={{
            backgroundColor: '#E0C181',
            color: '#141414',
            fontWeight: 'bold',
            borderRadius: '8px',
            px: 4,
            '&:hover': { backgroundColor: '#C4A484' }
          }}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}