import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar } from '@mui/material';
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner, StatCard, StyledButton } from '../components/StyledComponents';
import { colors } from '../constants';
import { usersService } from '../services/usersService';
import AddEmployeeDialog from '../components/forms/AddEmployeeDialog';
import AddLawyerDialog from '../components/forms/AddLawyerDialog';

export default function AdminDashboardHome() {
  const navigate = useNavigate();
  const [totalLawyers, setTotalLawyers] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openLawyerDialog, setOpenLawyerDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lawyersRes, employeesRes] = await Promise.all([
          usersService.getLawyersTotal(),
          usersService.getEmployeesTotal(),
        ]);

        setTotalLawyers(lawyersRes.data.total_lawyers);
        setTotalEmployees(employeesRes.data.total_employees);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    const fetchData = async () => {
      try {
        const [lawyersRes, employeesRes] = await Promise.all([
          usersService.getLawyersTotal(),
          usersService.getEmployeesTotal(),
        ]);

        setTotalLawyers(lawyersRes.data.total_lawyers);
        setTotalEmployees(employeesRes.data.total_employees);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };
    fetchData();
  };

  const stats = [
    { 
      title: 'Total Lawyers', 
      value: totalLawyers ?? '...', 
      icon: <PeopleAltOutlinedIcon sx={{ color: colors.black }} />, 
      color: colors.gold 
    },
    { 
      title: 'Total Employees', 
      value: totalEmployees ?? '...', 
      icon: <Groups2OutlinedIcon sx={{ color: colors.black }} />, 
      color: colors.gold 
    },
  ];

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

      <Paper sx={{ mt: 5, p: 3, borderRadius: '12px', backgroundColor: colors.lightBlack }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: colors.white, mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <StyledButton 
            startIcon={<AddIcon />} 
            onClick={() => setOpenLawyerDialog(true)}
          >
            Add Lawyer
          </StyledButton>
          <StyledButton 
            startIcon={<AddIcon />} 
            onClick={() => setOpenEmployeeDialog(true)}
          >
            Add Employee
          </StyledButton>
        </Box>
      </Paper>

      <AddLawyerDialog 
        open={openLawyerDialog} 
        onClose={() => setOpenLawyerDialog(false)}
        onSuccess={handleRefresh}
      />
      <AddEmployeeDialog 
        open={openEmployeeDialog} 
        onClose={() => setOpenEmployeeDialog(false)}
        onSuccess={handleRefresh}
      />
    </Box>
  );
}

