import React, { useEffect } from 'react';
import { Box, Typography, Paper, Chip, Tooltip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  AccessTime as TimeIcon,
  CheckCircle as AvailableIcon,
  Cancel as BookedIcon,
  Lock as LockedIcon,
} from '@mui/icons-material';
import { colors } from '../../AdminManagement/constants';

const TimeSlotContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '12px',
  padding: '16px',
});

const TimeSlotCard = styled(Paper)(({ available, booked, selected, disabled }) => ({
  padding: '16px',
  textAlign: 'center',
  cursor: disabled ? 'not-allowed' : available && !booked ? 'pointer' : 'default',
                backgroundColor: disabled
    ? alpha(colors.textSecondary, 0.1)
    : booked
    ? alpha('#f44336', 0.2)
    : selected
    ? alpha(colors.gold, 0.3)
    : available
    ? alpha('#4caf50', 0.2)
    : alpha(colors.gold, 0.05), // Show unmarked slots with slight gold tint
                border: disabled
    ? `1px solid ${alpha(colors.textSecondary, 0.3)}`
    : booked
    ? `2px solid #f44336`
    : selected
    ? `2px solid ${colors.gold}`
    : available
    ? `2px solid #4caf50`
    : `1px solid ${alpha(colors.gold, 0.3)}`, // Make unmarked slots more visible
  transition: 'all 0.3s ease',
  opacity: disabled ? 0.5 : 1,
  position: 'relative',
  '&:hover': {
    transform: disabled ? 'none' : available && !booked ? 'translateY(-4px) scale(1.02)' : 'none',
    boxShadow: disabled
      ? 'none'
      : available && !booked
      ? `0 4px 12px ${alpha(colors.gold, 0.3)}`
      : 'none',
    borderColor: disabled
      ? alpha(colors.textSecondary, 0.3)
      : booked
      ? '#f44336'
      : selected
      ? colors.gold
      : available
      ? '#4caf50'
      : alpha(colors.gold, 0.2),
  },
}));

const StatusBadge = styled(Chip)(({ status }) => ({
  position: 'absolute',
  top: '4px',
  right: '4px',
  height: '20px',
  fontSize: '0.65rem',
  fontWeight: 'bold',
}));

export default function TimeSlotGrid({
  slots = [],
  bookedAppointments = [],
  selectedSlot = null,
  onSlotSelect = () => {},
  startHour = 8,
  endHour = 18,
  slotDuration = 60, // in minutes
}) {
  // Generate all time slots for the day
  const generateAllSlots = () => {
    const allSlots = [];
    const totalMinutes = (endHour - startHour) * 60;
    const numSlots = Math.floor(totalMinutes / slotDuration);

    for (let i = 0; i < numSlots; i++) {
      const startMinutes = startHour * 60 + i * slotDuration;
      const endMinutes = startMinutes + slotDuration;
      
      const startHourValue = Math.floor(startMinutes / 60);
      const startMinuteValue = startMinutes % 60;
      const endHourValue = Math.floor(endMinutes / 60);
      const endMinuteValue = endMinutes % 60;

      const startTime = `${String(startHourValue).padStart(2, '0')}:${String(startMinuteValue).padStart(2, '0')}`;
      const endTime = `${String(endHourValue).padStart(2, '0')}:${String(endMinuteValue).padStart(2, '0')}`;

      // Check if this slot is available
      // According to API documentation, slots have status field
      // Try multiple ways to match the time
      const availableSlot = slots.find((slot) => {
        const slotStartTime = slot.start_time || slot.time || slot.start || '';
        if (!slotStartTime) return false;
        
        // Normalize time format (remove seconds if present, handle different formats)
        const normalizedSlotTime = slotStartTime.split(':').slice(0, 2).join(':');
        const normalizedStartTime = startTime.split(':').slice(0, 2).join(':');
        
        // Exact match
        if (normalizedSlotTime === normalizedStartTime) {
          // If status exists, check it's "available", otherwise assume it's available
          if (slot.status) {
            return slot.status === 'available';
          }
          return true; // No status field means it's available
        }
        
        // Try matching with different formats (e.g., "9:00" vs "09:00")
        const slotTimeParts = normalizedSlotTime.split(':');
        const startTimeParts = normalizedStartTime.split(':');
        if (slotTimeParts.length === 2 && startTimeParts.length === 2) {
          const slotHour = parseInt(slotTimeParts[0], 10);
          const slotMin = parseInt(slotTimeParts[1], 10);
          const startHour = parseInt(startTimeParts[0], 10);
          const startMin = parseInt(startTimeParts[1], 10);
          
          if (slotHour === startHour && slotMin === startMin) {
            // If status exists, check it's "available", otherwise assume it's available
            if (slot.status) {
              return slot.status === 'available';
            }
            return true; // No status field means it's available
          }
        }
        
        return false;
      });

      // Check if this slot is booked
      const bookedSlot = bookedAppointments.find((apt) => {
        if (!apt.datetime) return false;
        const aptDate = new Date(apt.datetime);
        if (isNaN(aptDate.getTime())) return false;
        const aptTime = `${String(aptDate.getHours()).padStart(2, '0')}:${String(aptDate.getMinutes()).padStart(2, '0')}`;
        return aptTime === startTime;
      });

      // Check if this slot is in the past (disabled)
      // Only check if we have a selected date context
      const isPast = false; // We'll pass this as a prop if needed, for now allow all slots

      // If we found a slot from API, use it (even if status is not "available")
      // This allows displaying all slots from API
      const foundSlot = slots.find((slot) => {
        const slotStartTime = slot.start_time || slot.time || slot.start || '';
        if (!slotStartTime) return false;
        
        const normalizedSlotTime = slotStartTime.split(':').slice(0, 2).join(':');
        const normalizedStartTime = startTime.split(':').slice(0, 2).join(':');
        
        if (normalizedSlotTime === normalizedStartTime) return true;
        
        const slotTimeParts = normalizedSlotTime.split(':');
        const startTimeParts = normalizedStartTime.split(':');
        if (slotTimeParts.length === 2 && startTimeParts.length === 2) {
          const slotHour = parseInt(slotTimeParts[0], 10);
          const slotMin = parseInt(slotTimeParts[1], 10);
          const startHour = parseInt(startTimeParts[0], 10);
          const startMin = parseInt(startTimeParts[1], 10);
          return slotHour === startHour && slotMin === startMin;
        }
        return false;
      });
      
      // Determine if slot is available (must be from availableSlot and status is "available" or no status)
      const isAvailable = !!availableSlot && (!availableSlot.status || availableSlot.status === 'available');
      
      allSlots.push({
        id: foundSlot?.id || availableSlot?.id || `slot-${i}`,
        start_time: startTime,
        end_time: endTime,
        available: isAvailable,
        booked: !!bookedSlot,
        disabled: isPast || (foundSlot && foundSlot.status === 'past'),
        appointment: bookedSlot,
        slotData: availableSlot || foundSlot || {
          id: `slot-${i}`,
          start_time: startTime,
          end_time: endTime,
          duration: slotDuration,
          status: 'available', // Default to available if not found in API
        },
      });
    }

    return allSlots;
  };

  const allSlots = generateAllSlots();

  // Debug logging
  useEffect(() => {
    console.log('=== TimeSlotGrid Debug ===');
    console.log('Slots received from API:', slots);
    console.log('Slots count:', slots.length);
    console.log('Booked appointments:', bookedAppointments);
    console.log('Booked appointments count:', bookedAppointments.length);
    console.log('Generated all slots count:', allSlots.length);
    console.log('Available slots count:', allSlots.filter(s => s.available).length);
    console.log('Booked slots count:', allSlots.filter(s => s.booked).length);
    console.log('Slots with slotData:', allSlots.filter(s => s.slotData).length);
    if (slots.length > 0) {
      console.log('First slot from API:', slots[0]);
    }
    if (allSlots.length > 0) {
      console.log('First generated slot:', allSlots[0]);
      console.log('Sample available slots:', allSlots.filter(s => s.available).slice(0, 3));
    }
  }, [slots, bookedAppointments]);

  const handleSlotClick = (slot) => {
    console.log('Slot clicked:', slot);
    console.log('Slot details:', {
      id: slot.id,
      available: slot.available,
      booked: slot.booked,
      disabled: slot.disabled,
      slotData: slot.slotData,
    });
    
    if (slot.disabled || slot.booked) {
      console.log('Slot is disabled or booked, cannot select');
      return;
    }
    
    // Check if slot has a valid ID from API (not a generated one like "slot-0")
    const slotDataId = slot.slotData?.id;
    const hasValidId = slotDataId && 
                       (typeof slotDataId === 'number' || 
                        (typeof slotDataId === 'string' && !slotDataId.startsWith('slot-')));
    
    // Only allow selection if slot is available AND has valid ID from API
    if (!slot.available || !slot.slotData || !hasValidId) {
      console.warn('Slot is not available or does not have a valid ID from API');
      console.warn('Slot ID:', slot.id, 'SlotData ID:', slotDataId, 'Available:', slot.available);
      // Don't allow selection - show error or do nothing
      return;
    }
    
    const slotToSelect = slot.slotData;
    
    console.log('Selecting slot:', slotToSelect);
    onSlotSelect(slotToSelect);
  };

  return (
    <Box>
      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              backgroundColor: alpha('#4caf50', 0.2),
              border: `2px solid #4caf50`,
            }}
          />
          <Typography variant="body2" sx={{ color: colors.white }}>
            Available
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              backgroundColor: alpha('#f44336', 0.2),
              border: `2px solid #f44336`,
            }}
          />
          <Typography variant="body2" sx={{ color: colors.white }}>
            Booked
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              backgroundColor: alpha(colors.gold, 0.3),
              border: `2px solid ${colors.gold}`,
            }}
          />
          <Typography variant="body2" sx={{ color: colors.white }}>
            Selected
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              backgroundColor: alpha(colors.textSecondary, 0.1),
              border: `1px solid ${alpha(colors.textSecondary, 0.3)}`,
              opacity: 0.5,
            }}
          />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Unavailable / Past
          </Typography>
        </Box>
      </Box>

      {/* Time Slots Grid */}
      <TimeSlotContainer>
        {allSlots.map((slot, index) => {
          const isSelected = selectedSlot?.id === slot.id;
          
          return (
            <Tooltip
              key={slot.id || index}
              title={
                slot.disabled
                  ? 'This time slot is in the past'
                  : slot.booked
                  ? `Booked: ${slot.appointment?.client?.name || slot.appointment?.subject || 'Appointment'}`
                  : slot.available
                  ? 'Click to select this time slot'
                  : 'This time slot is not available'
              }
              arrow
            >
              <TimeSlotCard
                available={slot.available}
                booked={slot.booked}
                selected={isSelected}
                disabled={slot.disabled || slot.booked || !slot.available || !slot.slotData}
                onClick={() => handleSlotClick(slot)}
              >
                {slot.booked && (
                  <StatusBadge
                    label="Booked"
                    status="error"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#f44336', 0.3),
                      color: '#fff',
                      border: `1px solid #f44336`,
                    }}
                  />
                )}
                {isSelected && !slot.booked && (
                  <StatusBadge
                    label="Selected"
                    status="success"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.gold, 0.3),
                      color: colors.gold,
                      border: `1px solid ${colors.gold}`,
                    }}
                  />
                )}
                {slot.available && !slot.booked && !isSelected && (
                  <StatusBadge
                    label="Available"
                    status="success"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#4caf50', 0.3),
                      color: '#4caf50',
                      border: `1px solid #4caf50`,
                    }}
                  />
                )}
                {!slot.available && !slot.booked && !isSelected && (
                  <StatusBadge
                    label="Not Available"
                    status="default"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.textSecondary, 0.2),
                      color: colors.textSecondary,
                      border: `1px solid ${alpha(colors.textSecondary, 0.3)}`,
                    }}
                  />
                )}

                <TimeIcon
                  sx={{
                    fontSize: 28,
                    color: slot.disabled
                      ? colors.textSecondary
                      : slot.booked
                      ? '#f44336'
                      : isSelected
                      ? colors.gold
                      : slot.available
                      ? '#4caf50'
                      : colors.textSecondary,
                    mb: 1,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: slot.disabled
                      ? colors.textSecondary
                      : slot.booked
                      ? '#f44336'
                      : isSelected
                      ? colors.gold
                      : slot.available
                      ? '#4caf50'
                      : colors.white,
                    fontWeight: 'bold',
                    mb: 0.5,
                  }}
                >
                  {slot.start_time}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: slot.disabled
                      ? colors.textSecondary
                      : alpha(colors.white, 0.7),
                    display: 'block',
                  }}
                >
                  - {slot.end_time}
                </Typography>
                {slot.booked && slot.appointment && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#f44336',
                      display: 'block',
                      mt: 0.5,
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {slot.appointment.client?.name || slot.appointment.subject || 'Booked'}
                  </Typography>
                )}
              </TimeSlotCard>
            </Tooltip>
          );
        })}
      </TimeSlotContainer>
    </Box>
  );
}

