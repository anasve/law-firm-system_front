import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../AdminManagement/constants';

const CalendarContainer = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

const CalendarHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: `1px solid ${alpha(colors.gold, 0.1)}`,
});

const WeekDaysContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '8px',
  marginBottom: '8px',
});

const WeekDay = styled(Box)({
  textAlign: 'center',
  padding: '12px',
  color: colors.gold,
  fontWeight: 'bold',
  fontSize: '0.9rem',
});

const DaysContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '8px',
});

const DayCell = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isToday' && prop !== 'isOtherMonth' && prop !== 'hasAppointments',
})(({ isToday, isOtherMonth, hasAppointments }) => ({
  minHeight: '100px',
  padding: '8px',
  backgroundColor: isToday ? alpha(colors.gold, 0.2) : colors.black,
  border: isToday ? `2px solid ${colors.gold}` : `1px solid ${alpha(colors.gold, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  opacity: isOtherMonth ? 0.4 : 1,
  position: 'relative',
  '&:hover': {
    backgroundColor: isToday ? alpha(colors.gold, 0.3) : alpha(colors.gold, 0.1),
    transform: 'scale(1.02)',
  },
  ...(hasAppointments && {
    borderColor: colors.gold,
    borderWidth: '2px',
  }),
}));

const DayNumber = styled(Typography)({
  color: colors.white,
  fontWeight: 'bold',
  marginBottom: '4px',
  fontSize: '0.9rem',
});

const AppointmentBadge = styled(Chip)(({ status }) => ({
  width: '100%',
  height: '20px',
  fontSize: '0.7rem',
  marginBottom: '4px',
  backgroundColor:
    status === 'pending'
      ? alpha('#ff9800', 0.3)
      : status === 'confirmed'
      ? alpha('#2196f3', 0.3)
      : status === 'done'
      ? alpha('#4caf50', 0.3)
      : alpha('#f44336', 0.3),
  color: colors.white,
  border: `1px solid ${
    status === 'pending'
      ? '#ff9800'
      : status === 'confirmed'
      ? '#2196f3'
      : status === 'done'
      ? '#4caf50'
      : '#f44336'
  }`,
}));

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  done: 'Done',
  cancelled: 'Cancelled',
};

export default function AppointmentCalendar({ appointments = [], onDateClick, onAppointmentClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isOtherMonth: true,
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isOtherMonth: false,
      });
    }

    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isOtherMonth: true,
      });
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!Array.isArray(appointments)) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.datetime).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (event, day, dayAppointments) => {
    if (dayAppointments.length > 0) {
      setSelectedDate(day);
      setSelectedDayAppointments(dayAppointments);
      setAnchorEl(event.currentTarget);
    } else if (onDateClick) {
      onDateClick(day);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedDate(null);
    setSelectedDayAppointments([]);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <CalendarContainer>
      <CalendarHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handlePreviousMonth} sx={{ color: colors.gold }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h5" sx={{ color: colors.white, fontWeight: 'bold', minWidth: '200px', textAlign: 'center' }}>
            {getMonthName(currentDate)}
          </Typography>
          <IconButton onClick={handleNextMonth} sx={{ color: colors.gold }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Button
          startIcon={<TodayIcon />}
          onClick={handleToday}
          sx={{
            color: colors.gold,
            borderColor: colors.gold,
            '&:hover': {
              borderColor: colors.darkGold,
              backgroundColor: alpha(colors.gold, 0.1),
            },
          }}
          variant="outlined"
        >
          Today
        </Button>
      </CalendarHeader>

      <WeekDaysContainer>
        {weekDays.map((day) => (
          <WeekDay key={day}>{day}</WeekDay>
        ))}
      </WeekDaysContainer>

      <DaysContainer>
        {days.map((dayObj, index) => {
          const dayAppointments = getAppointmentsForDate(dayObj.date);
          const dayIsToday = isToday(dayObj.date);

          return (
            <DayCell
              key={index}
              isToday={dayIsToday}
              isOtherMonth={dayObj.isOtherMonth}
              hasAppointments={dayAppointments.length > 0}
              onClick={(e) => handleDayClick(e, dayObj.date, dayAppointments)}
            >
              <DayNumber>{dayObj.date.getDate()}</DayNumber>
              {dayAppointments.slice(0, 3).map((apt, idx) => (
                <AppointmentBadge
                  key={idx}
                  label={`${new Date(apt.datetime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })} - ${apt.client?.name || apt.lawyer?.name || 'Appointment'}`}
                  status={apt.status}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAppointmentClick) onAppointmentClick(apt);
                  }}
                />
              ))}
              {dayAppointments.length > 3 && (
                <Typography
                  variant="caption"
                  sx={{ color: colors.gold, fontSize: '0.7rem', display: 'block', mt: 0.5 }}
                >
                  +{dayAppointments.length - 3} more
                </Typography>
              )}
            </DayCell>
          );
        })}
      </DaysContainer>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
            minWidth: '300px',
            maxWidth: '400px',
            maxHeight: '400px',
            overflow: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: colors.gold, mb: 2 }}>
            Appointments for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
          <Divider sx={{ mb: 2, borderColor: alpha(colors.gold, 0.2) }} />
          {selectedDayAppointments.length > 0 ? (
            <List>
              {selectedDayAppointments.map((apt, idx) => (
                <React.Fragment key={idx}>
                  <ListItem
                    button
                    onClick={() => {
                      if (onAppointmentClick) onAppointmentClick(apt);
                      handleClosePopover();
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(colors.gold, 0.1),
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" sx={{ color: colors.white, fontWeight: 'bold' }}>
                            {new Date(apt.datetime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </Typography>
                          <Chip
                            label={statusLabels[apt.status] || apt.status}
                            size="small"
                            sx={{
                              backgroundColor:
                                apt.status === 'pending'
                                  ? alpha('#ff9800', 0.3)
                                  : apt.status === 'confirmed'
                                  ? alpha('#2196f3', 0.3)
                                  : apt.status === 'done'
                                  ? alpha('#4caf50', 0.3)
                                  : alpha('#f44336', 0.3),
                              color: colors.white,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          {apt.client && (
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              Client: {apt.client.name}
                            </Typography>
                          )}
                          {apt.lawyer && (
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              Lawyer: {apt.lawyer.name}
                            </Typography>
                          )}
                          {apt.type && (
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              Type: {apt.type}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < selectedDayAppointments.length - 1 && (
                    <Divider sx={{ borderColor: alpha(colors.gold, 0.1) }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center', py: 2 }}>
              No appointments for this day
            </Typography>
          )}
        </Box>
      </Popover>
    </CalendarContainer>
  );
}
