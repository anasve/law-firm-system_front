import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { WelcomeBanner } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { appointmentsService } from '../services';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  done: 'success',
  cancelled: 'error',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsService.getAppointments();
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Typography variant="h4" fontWeight="bold">
          My Appointments
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          View your scheduled appointments
        </Typography>
      </WelcomeBanner>

      <Grid container spacing={3}>
        {Array.isArray(appointments) && appointments.map((appointment) => (
          <Grid item xs={12} md={6} key={appointment.id}>
            <Card sx={{ backgroundColor: colors.lightBlack, color: colors.white }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {new Date(appointment.datetime).toLocaleString()}
                  </Typography>
                  <Chip 
                    label={appointment.status} 
                    color={statusColors[appointment.status] || 'default'}
                    size="small"
                  />
                </Box>
                {appointment.client && (
                  <Typography variant="body2" sx={{ color: colors.gold, mb: 1 }}>
                    Client: {appointment.client.name}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Type: {appointment.type}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => navigate(`/lawyer/appointments/${appointment.id}`)}
                  sx={{ color: colors.gold }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {appointments.length === 0 && !loading && (
        <Box sx={{ p: 4, textAlign: 'center', backgroundColor: colors.lightBlack, color: colors.white, borderRadius: '12px' }}>
          <Typography variant="h6">No appointments yet</Typography>
        </Box>
      )}
    </Box>
  );
}

