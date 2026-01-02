import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../constants';

export default function ConfirmationDialog({ open, onClose, onConfirm, title, message, loading = false }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ 
        sx: { 
          bgcolor: colors.lightBlack, 
          color: colors.white, 
          borderRadius: '12px', 
          border: `1px solid ${alpha(colors.gold, 0.2)}` 
        } 
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: colors.textLight }}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          disabled={loading}
          sx={{ 
            bgcolor: colors.error, 
            '&:hover': { bgcolor: '#B71C1C' } 
          }}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

