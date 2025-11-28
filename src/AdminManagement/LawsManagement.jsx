import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";

// Color scheme
const colors = {
  gold: "#D4AF37",
  black: "#141414",
  lightBlack: "#232323",
  white: "#FFFFFF",
  textDark: "#000000",
  textLight: alpha("#FFFFFF", 0.8),
  error: "#d32f2f",
  success: "#66bb6a",
  info: "#29b6f6",
  grey: "#888",
};

// Create axios instance with base config
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/admin",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Initial state for new law
const newLawInitialState = {
  title: "",
  category: "",
  summary: "",
  fullContent: "",
};

// Styled components
const SearchTextField = styled(TextField)({
  "& .MuiInput-underline:before": {
    borderBottomColor: alpha(colors.white, 0.4),
  },
  "&:hover .MuiInput-underline:before": { borderBottomColor: colors.gold },
  "& .MuiInput-underline:after": { borderBottomColor: colors.gold },
  "& .MuiInputBase-input": {
    color: colors.white,
    fontFamily: "Arial, sans-serif",
  },
});

const StyledAccordion = styled(Accordion)({
  backgroundColor: colors.white,
  color: colors.textDark,
  borderRadius: "8px !important",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  marginBottom: "12px",
  "&:before": { display: "none" },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  minHeight: "64px",
  "& .MuiAccordionSummary-expandIconWrapper": { color: colors.textDark },
});

const StyledTabs = styled(Tabs)({
  minHeight: "48px",
  "& .MuiTabs-indicator": {
    backgroundColor: colors.gold,
    height: "3px",
    borderRadius: "2px",
  },
});

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: "48px",
  color: alpha(colors.white, 0.7),
  fontWeight: "bold",
  fontFamily: "Arial, sans-serif",
  "&.Mui-selected": { color: colors.gold },
  textTransform: "none",
  fontSize: "0.8rem",
  gap: theme.spacing(0.75),
}));

const EmptyState = ({ message, tab }) => {
  const messages = {
    0: "No laws match your search",
    1: "No published laws currently",
    2: "No unpublished laws currently",
    3: "Archive is currently empty",
  };
  return (
    <Box sx={{ textAlign: "center", p: 8, color: colors.textLight }}>
      <FindInPageOutlinedIcon
        sx={{ fontSize: 80, mb: 2, color: alpha(colors.white, 0.3) }}
      />
      <Typography variant="h6" fontWeight="bold">
        {messages[tab]}
      </Typography>
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
};

export default function LawsManagement() {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentLaw, setCurrentLaw] = useState(null);
  const [newLawData, setNewLawData] = useState(newLawInitialState);

  // Handle authentication
  const handleAuth = async () => {
    try {
      // First check if we already have a token
      const token = localStorage.getItem("adminToken");
      if (token) return true;

      // If no token, redirect to login (don't auto-login with hardcoded credentials)
      showSnackbar("Please log in first", "error");
      return false;
    } catch (error) {
      console.error("Authentication failed:", error);
      showSnackbar("Authentication failed. Please log in.", "error");
      return false;
    }
  };

  // Fetch laws from API
  const fetchLaws = async () => {
    setLoading(true);
    try {
      // Ensure we're authenticated first
      const isAuthenticated = await handleAuth();
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      let endpoint = "/laws";
      if (currentTab === 1) endpoint = "/laws/published";
      else if (currentTab === 2) endpoint = "/laws/draft";
      else if (currentTab === 3) endpoint = "/laws/archived";

      const params = searchQuery.trim() ? { search: searchQuery.trim() } : {};
      const response = await api.get(endpoint, { params });
      
      // Handle different response structures
      const lawsData = response.data.data || response.data || [];
      setLaws(lawsData);
    } catch (error) {
      console.error("Error fetching laws:", error);
      showSnackbar("An error occurred while fetching laws", "error");
      setLaws([]);
      
      // If unauthorized, clear token and try to re-authenticate
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        await handleAuth();
        fetchLaws(); // Retry
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaws();
  }, [currentTab, searchQuery]);

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Tab change handler
  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
    setExpanded(false);
  };

  // Accordion expand/collapse handler
  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Update law status (publish/unpublish/archive/restore/delete)
  const updateLawStatus = async (id, action) => {
    try {
      let endpoint = `/laws/${id}/toggle-status`;
      let method = "post";
      let payload = {};

      switch (action) {
        case "publish":
          payload.status = "published";
          break;
        case "unpublish":
          payload.status = "draft";
          break;
        case "archive":
          payload.status = "archived";
          break;
        case "restore":
          method = "put";
          endpoint = `/laws/${id}/restore`;
          payload = null;
          break;
        case "delete":
          method = "delete";
          endpoint = `/laws/${id}/force`;
          payload = null;
          break;
        default:
          throw new Error("Invalid action");
      }

      await api[method](endpoint, payload);

      const messages = {
        publish: "Law published successfully",
        unpublish: "Law unpublished successfully",
        archive: "Law moved to archive",
        restore: "Law restored (unpublished)",
        delete: "Law deleted permanently",
      };

      showSnackbar(
        messages[action],
        action === "publish" || action === "restore" ? "success" : "info"
      );

      fetchLaws(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action} law:`, error);
      showSnackbar(`Failed to ${action} law`, "error");
    }
  };

  // Edit law handlers
  const handleEditClick = (law) => {
    setCurrentLaw({ ...law });
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setCurrentLaw(null);
  };

  const handleSaveChanges = async () => {
    try {
      await api.put(`/laws/${currentLaw.id}`, currentLaw);
      showSnackbar("Changes saved successfully", "success");
      fetchLaws();
      handleEditDialogClose();
    } catch (error) {
      console.error("Error updating law:", error);
      showSnackbar("Failed to save changes", "error");
    }
  };

  // Add law handlers
  const handleAddClick = () => setIsAddDialogOpen(true);

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setNewLawData(newLawInitialState);
  };

  const handleAddNewLaw = async () => {
    try {
      await api.post("/laws", newLawData);
      showSnackbar("New law added successfully", "success");
      fetchLaws();
      handleAddDialogClose();
    } catch (error) {
      console.error("Error adding law:", error);
      showSnackbar("Failed to add law", "error");
    }
  };

  // Form change handler
  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === "edit") {
      setCurrentLaw({ ...currentLaw, [name]: value });
    } else {
      setNewLawData({ ...newLawData, [name]: value });
    }
  };

  // Count laws by status for tabs
  const publishedLawsCount = laws.filter((l) => l.status === "published").length;
  const unpublishedLawsCount = laws.filter((l) => l.status === "draft").length;
  const archivedLawsCount = laws.filter((l) => l.status === "archived").length;
  const allActiveLawsCount = publishedLawsCount + unpublishedLawsCount;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        fontFamily: "Arial, sans-serif",
        color: colors.white,
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
        Laws and Legislation Management
      </Typography>

      {/* Search and add */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 3 }}>
        <SearchTextField
          variant="standard"
          placeholder="Search in title, category, content..."
          sx={{ flexGrow: 1 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: alpha(colors.white, 0.6) }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          onClick={handleAddClick}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: colors.gold,
            color: colors.black,
            fontWeight: "bold",
            padding: "10px 24px",
            borderRadius: "12px",
            "&:hover": { backgroundColor: "#B4943C" },
          }}
        >
          Add Law
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <StyledTabs value={currentTab} onChange={handleTabChange}>
          <StyledTab
            label="All"
            icon={
              <Chip
                label={allActiveLawsCount}
                size="small"
                sx={{
                  bgcolor: colors.info,
                  color: colors.white,
                  height: "18px",
                  fontSize: "0.7rem",
                }}
              />
            }
          />
          <StyledTab
            label="Published"
            icon={
              <Chip
                label={publishedLawsCount}
                size="small"
                sx={{
                  bgcolor: colors.success,
                  color: colors.white,
                  height: "18px",
                  fontSize: "0.7rem",
                }}
              />
            }
          />
          <StyledTab
            label="Unpublished"
            icon={
              <Chip
                label={unpublishedLawsCount}
                size="small"
                sx={{
                  bgcolor: colors.grey,
                  color: colors.white,
                  height: "18px",
                  fontSize: "0.7rem",
                }}
              />
            }
          />
          <StyledTab
            label="Archive"
            icon={
              <Chip
                label={archivedLawsCount}
                size="small"
                sx={{ height: "18px", fontSize: "0.7rem" }}
              />
            }
          />
        </StyledTabs>
      </Box>

      {/* Content */}
      {loading ? (
        Array.from(new Array(3)).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={64}
            sx={{ borderRadius: "8px", mb: 1.5, bgcolor: colors.lightBlack }}
          />
        ))
      ) : laws.length > 0 ? (
        laws.map((law) => (
          <StyledAccordion
            key={law.id}
            expanded={expanded === law.id}
            onChange={handleAccordionChange(law.id)}
          >
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">
                {law.title}
              </Typography>
            </StyledAccordionSummary>
            <AccordionDetails>
              <Chip
                label={law.category}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.gold, 0.1),
                  color: colors.gold,
                  fontWeight: "bold",
                }}
              />
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ color: colors.textDark }}
              >
                Law Summary
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: alpha(colors.textDark, 0.8),
                  lineHeight: 1.8,
                  mb: 3,
                  whiteSpace: "pre-line",
                }}
              >
                {law.summary}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ color: colors.textDark }}
              >
                Full Law Description
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: alpha(colors.textDark, 0.8),
                  lineHeight: 1.8,
                  mb: 3,
                  whiteSpace: "pre-line",
                }}
              >
                {law.fullContent}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  borderTop: `1px solid ${alpha(colors.grey, 0.2)}`,
                  pt: 1.5,
                }}
              >
                {law.status === "published" && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClick(law)}>
                        <EditIcon sx={{ color: colors.gold }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Unpublish">
                      <IconButton
                        onClick={() => updateLawStatus(law.id, "unpublish")}
                      >
                        <CloudOffOutlinedIcon sx={{ color: colors.info }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive">
                      <IconButton
                        onClick={() => updateLawStatus(law.id, "archive")}
                      >
                        <ArchiveIcon sx={{ color: colors.grey }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {law.status === "draft" && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClick(law)}>
                        <EditIcon sx={{ color: colors.gold }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Publish">
                      <IconButton
                        onClick={() => updateLawStatus(law.id, "publish")}
                      >
                        <CloudUploadOutlinedIcon
                          sx={{ color: colors.success }}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive">
                      <IconButton
                        onClick={() => updateLawStatus(law.id, "archive")}
                      >
                        <ArchiveIcon sx={{ color: colors.grey }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {law.status === "archived" && (
                  <>
                    <Tooltip title="Restore">
                      <IconButton
                        onClick={() => updateLawStatus(law.id, "restore")}
                      >
                        <UnarchiveIcon sx={{ color: colors.success }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Permanently">
                      <IconButton
                        onClick={() => updateLawStatus(law.id, "delete")}
                      >
                        <DeleteForeverIcon sx={{ color: colors.error }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </AccordionDetails>
          </StyledAccordion>
        ))
      ) : (
        <EmptyState
          message={searchQuery ? "No results found for your search." : ""}
          tab={currentTab}
        />
      )}

      {/* Add Law Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={handleAddDialogClose}
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
        <DialogTitle sx={{ fontWeight: "bold" }}>Add New Law</DialogTitle>
        <DialogContent sx={{ pt: "20px !important", mt: 1 }}>
          <TextField
            autoFocus
            name="title"
            label="Law Title"
            fullWidth
            variant="filled"
            value={newLawData.title}
            onChange={(e) => handleFormChange(e, "add")}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: colors.textLight } }}
            InputProps={{ sx: { color: colors.white } }}
          />
          <TextField
            name="category"
            label="Category"
            fullWidth
            variant="filled"
            value={newLawData.category}
            onChange={(e) => handleFormChange(e, "add")}
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
            value={newLawData.summary}
            onChange={(e) => handleFormChange(e, "add")}
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
            value={newLawData.fullContent}
            onChange={(e) => handleFormChange(e, "add")}
            InputLabelProps={{ sx: { color: colors.textLight } }}
            InputProps={{ sx: { color: colors.white } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleAddDialogClose}
            variant="outlined"
            sx={{ color: colors.white, borderColor: colors.white }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNewLaw}
            variant="contained"
            sx={{
              backgroundColor: colors.gold,
              color: colors.black,
              "&:hover": { backgroundColor: "#B4943C" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Law Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleEditDialogClose}
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
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Law</DialogTitle>
        <DialogContent sx={{ pt: "20px !important", mt: 1 }}>
          <TextField
            autoFocus
            name="title"
            label="Law Title"
            fullWidth
            variant="filled"
            value={currentLaw?.title || ""}
            onChange={(e) => handleFormChange(e, "edit")}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: colors.textLight } }}
            InputProps={{ sx: { color: colors.white } }}
          />
          <TextField
            name="category"
            label="Category"
            fullWidth
            variant="filled"
            value={currentLaw?.category || ""}
            onChange={(e) => handleFormChange(e, "edit")}
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
            value={currentLaw?.summary || ""}
            onChange={(e) => handleFormChange(e, "edit")}
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
            value={currentLaw?.fullContent || ""}
            onChange={(e) => handleFormChange(e, "edit")}
            InputLabelProps={{ sx: { color: colors.textLight } }}
            InputProps={{ sx: { color: colors.white } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleEditDialogClose}
            variant="outlined"
            sx={{ color: colors.white, borderColor: colors.white }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="contained"
            sx={{
              backgroundColor: colors.gold,
              color: colors.black,
              "&:hover": { backgroundColor: "#B4943C" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ fontFamily: "Arial, sans-serif" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}