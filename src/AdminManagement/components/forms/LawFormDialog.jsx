import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { colors } from '../../constants';

const dialogPaperProps = {
  sx: {
    backgroundColor: colors.lightBlack,
    color: colors.white,
    borderRadius: "16px",
  },
};

export default function LawFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  law, 
  formData, 
  onChange 
}) {
  const isEdit = !!law;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={dialogPaperProps}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {isEdit ? "Edit Law" : "Add New Law"}
      </DialogTitle>
      <DialogContent sx={{ pt: "20px !important", mt: 1 }}>
        <TextField
          autoFocus
          name="title"
          label="Law Title"
          fullWidth
          variant="filled"
          value={formData.title || ""}
          onChange={onChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white } }}
        />
        <TextField
          name="category"
          label="Category"
          fullWidth
          variant="filled"
          value={formData.category || ""}
          onChange={onChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white } }}
        />
        <TextField
          name="summary"
          label="Law Summary"
          fullWidth
          multiline
          rows={3}
          variant="filled"
          value={formData.summary || ""}
          onChange={onChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white } }}
        />
        <TextField
          name="full_content"
          label="Full Description"
          fullWidth
          multiline
          rows={6}
          variant="filled"
          value={formData.full_content || formData.fullContent || ""}
          onChange={onChange}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ color: colors.white, borderColor: colors.white }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          sx={{
            backgroundColor: colors.gold,
            color: colors.black,
            "&:hover": { backgroundColor: colors.darkGold },
          }}
        >
          {isEdit ? "Save Changes" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
