import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Alert, CircularProgress } from '@mui/material';
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import EventIcon from "@mui/icons-material/Event";
import { WelcomeBanner, StatCard } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { consultationsService, appointmentsService, getToken } from '../services';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    consultations: null,
    appointments: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated
      const token = getToken();
      if (!token) {
        setError('Please login first');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [consultationsRes, appointmentsRes] = await Promise.all([
          consultationsService.getConsultations().catch((err) => {
            // If 401, let interceptor handle it - don't catch here
            if (err.response?.status === 401) {
              // Return empty data but let the error propagate so interceptor can handle it
              throw err;
            }
            // For other errors, return empty data
            console.error('Failed to fetch consultations:', err);
            return { data: [] };
          }),
          appointmentsService.getAppointments().catch((err) => {
            // If 401, let interceptor handle it - don't catch here
            if (err.response?.status === 401) {
              // Return empty data but let the error propagate so interceptor can handle it
              throw err;
            }
            // For other errors, return empty data
            console.error('Failed to fetch appointments:', err);
            return { data: [] };
          }),
        ]);

        setStats({
          consultations: Array.isArray(consultationsRes.data) ? consultationsRes.data.length : 0,
          appointments: Array.isArray(appointmentsRes.data) ? appointmentsRes.data.length : 0,
        });
      } catch (error) {
        console.error('Fetch failed:', error);
        // Don't set error for 401 - let interceptor handle it
        if (error.response?.status !== 401) {
          setError('Failed to load dashboard data. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const statCards = [
    { 
      title: 'My Consultations', 
      value: stats.consultations ?? '...', 
      icon: <QuestionAnswerIcon sx={{ color: colors.black }} />, 
      color: colors.gold 
    },
    { 
      title: 'My Appointments', 
      value: stats.appointments ?? '...', 
      icon: <EventIcon sx={{ color: colors.black }} />, 
      color: colors.gold 
    },
  ];

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Typography variant="h4" fontWeight="bold">
          Welcome to Your Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          Manage your consultations and appointments with ease.
        </Typography>
      </WelcomeBanner>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {statCards.map((stat, index) => (
            <Grid key={index} item xs={12} sm={6}>
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
      )}
    </Box>
  );
}

