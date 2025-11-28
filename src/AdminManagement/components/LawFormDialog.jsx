import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { colors } from "../utils/constants";

export default function LawFormDialog({
  open,
  onClose,
  onSubmit,
  law,
  title,
}) {
  const [formData, setFormData] = React.useState({
    title: law?.title || "",
    category: law?.category || "",
    summary: law?.summary || "",
    fullContent: law?.fullContent || "",
  });

  React.useEffect(() => {
    if (law) {
      setFormData({
        title: law.title || "",
        category: law.category || "",
        summary: law.summary || "",
        fullContent: law.fullContent || "",
      });
    } else {
      setFormData({
        title: "",
        category: "",
        summary: "",
        fullContent: "",
      });
    }
  }, [law, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: colors.lightBlack,
          color: colors.white,
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: "20px !important", mt: 1 }}>
        <TextField
          autoFocus
          name="title"
          label="Law Title"
          fullWidth
          variant="filled"
          value={formData.title}
          onChange={handleChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white } }}
        />
        <TextField
          name="category"
          label="Category"
          fullWidth
          variant="filled"
          value={formData.category}
          onChange={handleChange}
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
          value={formData.summary}
          onChange={handleChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: colors.textLight } }}
          InputProps={{ sx: { color: colors.white } }}
        />
        <TextField
          name="fullContent"
          label="Full Description"
          fullWidth
          multiline
          rows={6}
          variant="filled"
          value={formData.fullContent}
          onChange={handleChange}
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
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: colors.gold,
            color: colors.black,
            "&:hover": { backgroundColor: "#B4943C" },
          }}
        >
          {law ? "Save Changes" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

