import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { colors } from '../../constants';

const dialogPaperProps = {
  sx: {
    bgcolor: colors.lightBlack,
    color: colors.white,
    borderRadius: '16px'
  }
};

export default function SpecializationFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  specialization, 
  onChange 
}) {
  const isEdit = !!specialization?.id;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={dialogPaperProps}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {isEdit ? 'Edit Specialization' : 'Add New Specialization'}
      </DialogTitle>
      <DialogContent sx={{ pt: '20px!important', mt: 1 }}>
        <TextField
          autoFocus
          name="name"
          label="Specialization Type"
          fullWidth
          variant="filled"
          value={specialization?.name || ''}
          onChange={onChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white, backgroundColor: colors.black, borderRadius: '4px' } }}
        />
        <TextField
          name="description"
          label="Specialization Description"
          fullWidth
          multiline
          rows={4}
          variant="filled"
          value={specialization?.description || ''}
          onChange={onChange}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white, backgroundColor: colors.black, borderRadius: '4px' } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: colors.textLight }}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          sx={{ 
            backgroundColor: colors.gold, 
            color: colors.black, 
            '&:hover': { backgroundColor: colors.darkGold } 
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

