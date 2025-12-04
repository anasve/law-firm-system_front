import React from 'react';
import { Box, Typography, IconButton, Button, Divider, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import { colors } from '../constants';
import { alpha } from '@mui/material/styles';

const StyledItem = styled(Box)(({ theme }) => ({
  backgroundColor: colors.white,
  color: colors.textDark,
  borderRadius: '8px',
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
  }
}));

export default function SpecializationItem({ 
  specialization, 
  currentTab, 
  onEdit, 
  onArchive, 
  onUnarchive, 
  onDelete, 
  onViewDescription 
}) {
  return (
    <StyledItem>
      <Typography variant="h6" fontWeight="bold">{specialization.name}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Button
          variant="outlined"
          endIcon={<SearchIcon />}
          onClick={() => onViewDescription(specialization)}
          sx={{ 
            color: colors.gold, 
            borderColor: alpha(colors.gold, 0.5), 
            '&:hover': { borderColor: colors.gold, bgcolor: alpha(colors.gold, 0.1) } 
          }}
        >
          View Description
        </Button>
        <Divider orientation="vertical" flexItem sx={{ mx: 1.5, borderColor: alpha(colors.grey, 0.2) }} />
        {currentTab === 0 ? (
          <>
            <Tooltip title="Edit">
              <IconButton onClick={() => onEdit(specialization)}>
                <EditIcon sx={{ color: colors.info }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive">
              <IconButton onClick={() => onArchive(specialization.id)}>
                <ArchiveIcon sx={{ color: colors.grey }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Restore">
              <IconButton onClick={() => onUnarchive(specialization.id)}>
                <UnarchiveIcon sx={{ color: colors.success }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Permanently">
              <IconButton onClick={() => onDelete(specialization.id)}>
                <DeleteForeverIcon sx={{ color: colors.error }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </StyledItem>
  );
}

