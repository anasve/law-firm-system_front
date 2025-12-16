import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Paper, CircularProgress, Alert, Chip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
} from '@mui/icons-material';
import { colors } from '../../AdminManagement/constants';
import { appointmentsService } from '../services';

const CalendarContainer = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${alpha(colors.gold, 0.2)}`,
});

const CalendarHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  paddingBottom: '15px',
  borderBottom: `1px solid ${alpha(colors.gold, 0.2)}`,
});

const WeekDaysContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '8px',
  marginBottom: '10px',
});

const WeekDay = styled(Box)({
  textAlign: 'center',
  padding: '10px',
  fontWeight: 'bold',
  color: colors.gold,
  fontSize: '0.9rem',
});

const DaysContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '8px',
});

const DayCell = styled(Paper, {
  shouldForwardProp: (prop) => !['isToday', 'isSelected', 'isHoliday', 'isPast', 'hasSlots', 'isOtherMonth'].includes(prop),
})(({ isToday, isSelected, isHoliday, isPast, hasSlots, isOtherMonth }) => ({
  minHeight: '80px',
  padding: '8px',
  cursor: isHoliday || isPast || isOtherMonth ? 'not-allowed' : 'pointer',
  backgroundColor: isSelected
    ? alpha(colors.gold, 0.3)
    : isHoliday
    ? alpha(colors.black, 0.5)
    : isPast
    ? alpha(colors.black, 0.3)
    : isOtherMonth
    ? alpha(colors.black, 0.2)
    : colors.lightBlack,
  border: isSelected
    ? `2px solid ${colors.gold}`
    : isToday
    ? `2px solid ${alpha(colors.gold, 0.5)}`
    : `1px solid ${alpha(colors.gold, 0.1)}`,
  transition: 'all 0.2s ease',
  opacity: isOtherMonth ? 0.4 : 1,
  '&:hover': {
    backgroundColor:
      isHoliday || isPast || isOtherMonth
        ? undefined
        : alpha(colors.gold, 0.2),
    transform: isHoliday || isPast || isOtherMonth ? undefined : 'scale(1.05)',
  },
}));

const AppointmentBadge = styled(Chip)(({ status }) => ({
  fontSize: '0.65rem',
  height: '18px',
  fontWeight: 'bold',
  '& .MuiChip-label': {
    padding: '0 6px',
  },
  backgroundColor:
    status === 'available'
      ? alpha('#4caf50', 0.3)
      : status === 'booked'
      ? alpha('#f44336', 0.3)
      : status === 'holiday'
      ? alpha('#ff9800', 0.3)
      : status === 'past'
      ? alpha('#757575', 0.3)
      : alpha('#2196f3', 0.3),
  color: colors.white,
  border: `1px solid ${
    status === 'available'
      ? '#4caf50'
      : status === 'booked'
      ? '#f44336'
      : status === 'holiday'
      ? '#ff9800'
      : status === 'past'
      ? '#757575'
      : '#2196f3'
  }`,
}));

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarMonth({ lawyerId = null, selectedDate, onDateSelect, appointments = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Month is 0-indexed

  useEffect(() => {
    fetchCalendarMonth();
  }, [lawyerId, year, month]);

  const fetchCalendarMonth = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentsService.getCalendarMonth(year, month, lawyerId);
      setCalendarData(response.data);
    } catch (err) {
      console.error('Failed to fetch calendar month:', err);
      // Don't show error, just use empty data
      setCalendarData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleDateClick = (dateStr) => {
    if (!dateStr) return;

    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow selecting past dates
    if (date < today) return;

    // Check if it's a holiday (Friday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5) return; // Friday

    // Allow selecting any future date that is not a holiday
    onDateSelect(dateStr);
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = calendarData?.calendar?.[dateStr];
      const isHoliday = dayData?.is_holiday || date.getDay() === 5; // Friday
      const isPast = date < today;
      const isToday = dateStr === today.toISOString().split('T')[0];
      const isSelected = selectedDate === dateStr;
      // For automatic system, future dates (not past, not Friday) are considered to have slots
      const hasSlots = !isPast && !isHoliday;
      const availableCount = dayData?.summary?.available_count || (hasSlots ? 6 : 0); // 6 slots from 8 AM to 2 PM
      const bookedCount = dayData?.summary?.booked_count || 0;

      // Count appointments for this date
      const dateAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.datetime).toISOString().split('T')[0];
        return aptDate === dateStr;
      });

      days.push({
        day,
        dateStr,
        isHoliday,
        isPast,
        isToday,
        isSelected,
        hasSlots,
        availableCount,
        bookedCount,
        appointments: dateAppointments,
        dayData,
      });
    }

    return days;
  };

  const days = getDaysInMonth();

  return (
    <CalendarContainer>
      <CalendarHeader>
        <IconButton
          onClick={handlePreviousMonth}
          sx={{ color: colors.gold, '&:hover': { backgroundColor: alpha(colors.gold, 0.1) } }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ color: colors.white }}>
          {monthNames[month - 1]} {year}
        </Typography>
        <IconButton
          onClick={handleNextMonth}
          sx={{ color: colors.gold, '&:hover': { backgroundColor: alpha(colors.gold, 0.1) } }}
        >
          <ChevronRightIcon />
        </IconButton>
      </CalendarHeader>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ backgroundColor: colors.lightBlack, color: colors.white }}>
          {error}
        </Alert>
      ) : (
        <>
          <WeekDaysContainer>
            {weekDays.map((day) => (
              <WeekDay key={day}>{day}</WeekDay>
            ))}
          </WeekDaysContainer>

          <DaysContainer>
            {days.map((dayInfo, index) => {
              if (!dayInfo) {
                return <DayCell key={`empty-${index}`} isOtherMonth />;
              }

              const { day, dateStr, isHoliday, isPast, isToday, isSelected, hasSlots, availableCount, bookedCount, appointments: dateAppointments } =
                dayInfo;

              return (
                <DayCell
                  key={dateStr}
                  isToday={isToday}
                  isSelected={isSelected}
                  isHoliday={isHoliday}
                  isPast={isPast}
                  hasSlots={hasSlots}
                  onClick={() => handleDateClick(dateStr)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography
                      variant="body2"
                      fontWeight={isToday ? 'bold' : 'normal'}
                      sx={{
                        color: isHoliday ? colors.textSecondary : isSelected ? colors.gold : colors.white,
                        mb: 0.5,
                      }}
                    >
                      {day}
                    </Typography>
                    {isHoliday ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                        <AppointmentBadge label="Holiday" status="holiday" size="small" />
                      </Box>
                    ) : isPast ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                        <AppointmentBadge label="Past" status="past" size="small" />
                      </Box>
                    ) : hasSlots ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                        {availableCount > 0 && (
                          <AppointmentBadge
                            label={`${availableCount} Available`}
                            status="available"
                            size="small"
                            icon={<EventAvailableIcon sx={{ fontSize: '12px !important' }} />}
                          />
                        )}
                        {bookedCount > 0 && (
                          <AppointmentBadge
                            label={`${bookedCount} Booked`}
                            status="booked"
                            size="small"
                            icon={<EventBusyIcon sx={{ fontSize: '12px !important' }} />}
                          />
                        )}
                        {dateAppointments.length > 0 && (
                          <AppointmentBadge
                            label={`${dateAppointments.length} Appt`}
                            status="booked"
                            size="small"
                          />
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                        <AppointmentBadge label="No slots" status="unavailable" size="small" />
                      </Box>
                    )}
                  </Box>
                </DayCell>
              );
            })}
          </DaysContainer>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AppointmentBadge label="Available" status="available" />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Available slots
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AppointmentBadge label="Booked" status="booked" />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Booked slots
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AppointmentBadge label="Holiday" status="holiday" />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Holiday (Friday)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AppointmentBadge label="Past" status="past" />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Past date
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </CalendarContainer>
  );
}


