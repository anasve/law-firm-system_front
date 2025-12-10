import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Avatar } from '@mui/material';
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import EventIcon from "@mui/icons-material/Event";
import { WelcomeBanner, StatCard } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { consultationsService, appointmentsService } from '../services';

export default function LawyerDashboardHome() {
  const [stats, setStats] = useState({
    consultations: null,
    appointments: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultationsRes, appointmentsRes] = await Promise.all([
          consultationsService.getConsultations(),
          appointmentsService.getAppointments(),
        ]);

        setStats({
          consultations: consultationsRes.data?.length || 0,
          appointments: appointmentsRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    fetchData();
  }, []);

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
          Manage your consultations and appointments.
        </Typography>
      </WelcomeBanner>

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
    </Box>
  );
}

