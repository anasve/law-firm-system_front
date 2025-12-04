import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import { colors } from '../../constants';

const defaultMessages = {
  0: "No items match your search",
  1: "No published items currently",
  2: "No unpublished items currently",
  3: "Archive is currently empty",
};

export default function EmptyState({ message, tab, messages = defaultMessages }) {
  return (
    <Box sx={{ textAlign: "center", p: 8, color: colors.textLight }}>
      <FindInPageOutlinedIcon
        sx={{ fontSize: 80, mb: 2, color: alpha(colors.white, 0.3) }}
      />
      <Typography variant="h6" fontWeight="bold">
        {messages[tab] || defaultMessages[tab]}
      </Typography>
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}

