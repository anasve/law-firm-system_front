import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { colors } from '../constants';

const dialogPaperProps = {
  sx: {
    bgcolor: colors.lightBlack,
    color: colors.white,
    borderRadius: '12px'
  }
};

export default function DescriptionDialog({ open, onClose, specialization }) {
  if (!specialization) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm" 
      PaperProps={dialogPaperProps}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Description: {specialization.name || 'Specialization'}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: colors.textLight, pt: 1 }}>
          {specialization.description || 'No description available.'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: colors.textLight }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

