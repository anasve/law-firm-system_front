import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Skeleton,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { colors } from '../constants';
import { lawsService } from '../services/lawsService';
import { getToken, removeToken } from '../services/api';
import { StyledTabs, StyledTab, newLawInitialState } from '../components/laws/LawsManagementStyles';
import LawCard from '../components/LawCard';
import LawFormDialog from '../components/forms/LawFormDialog';
import EmptyState from '../components/feedback/EmptyState';
import SearchBar from '../components/ui/SearchBar';

export default function LawsManagement() {
  const navigate = useNavigate();
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

  const fetchLaws = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }

      let response;
      const params = searchQuery.trim() ? { search: searchQuery.trim() } : {};

      switch (currentTab) {
        case 1:
          response = await lawsService.getPublished(params);
          break;
        case 2:
          response = await lawsService.getDraft(params);
          break;
        case 3:
          response = await lawsService.getArchived(params);
          break;
        default:
          response = await lawsService.getAll(params);
      }

      const lawsData = response.data.data || response.data || [];
      setLaws(lawsData);
    } catch (error) {
      console.error("Error fetching laws:", error);
      showSnackbar("An error occurred while fetching laws", "error");
      setLaws([]);

      if (error.response?.status === 401) {
        removeToken();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaws();
  }, [currentTab, searchQuery]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
    setExpanded(false);
  };

  const handleExpand = (lawId) => {
    // If clicking the same law that's already expanded, close it
    // Otherwise, expand the clicked law
    setExpanded(expanded === lawId ? false : lawId);
  };

  const updateLawStatus = async (id, action) => {
    try {
      let response;
      const messages = {
        publish: "Law published successfully",
        unpublish: "Law unpublished successfully",
        archive: "Law moved to archive",
        restore: "Law restored (unpublished)",
        delete: "Law deleted permanently",
      };

      switch (action) {
        case "publish":
          response = await lawsService.toggleStatus(id, "published");
          break;
        case "unpublish":
          response = await lawsService.toggleStatus(id, "draft");
          break;
        case "archive":
          response = await lawsService.archive(id);
          break;
        case "restore":
          response = await lawsService.restore(id);
          break;
        case "delete":
          response = await lawsService.forceDelete(id);
          break;
        default:
          throw new Error("Invalid action");
      }

      showSnackbar(
        messages[action],
        action === "publish" || action === "restore" ? "success" : "info"
      );

      fetchLaws();
    } catch (error) {
      console.error(`Error ${action} law:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${action} law`;
      showSnackbar(errorMessage, "error");
    }
  };

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
      const lawDataToUpdate = {
        ...currentLaw,
        full_content: currentLaw.full_content || currentLaw.fullContent || '',
      };
      delete lawDataToUpdate.fullContent;

      await lawsService.update(currentLaw.id, lawDataToUpdate);
      showSnackbar("Changes saved successfully", "success");
      fetchLaws();
      handleEditDialogClose();
    } catch (error) {
      console.error("Error updating law:", error);
      const errorMessage = error.response?.data?.message || "Failed to save changes";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleAddClick = () => setIsAddDialogOpen(true);

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setNewLawData(newLawInitialState);
  };

  const handleAddNewLaw = async () => {
    try {
      await lawsService.create(newLawData);
      showSnackbar("New law added successfully", "success");
      fetchLaws();
      handleAddDialogClose();
    } catch (error) {
      console.error("Error adding law:", error);
      const errorMessage = error.response?.data?.message || "Failed to add law";
      showSnackbar(errorMessage, "error");
    }
  };

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

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAddClick}
        addButtonText="Add Law"
      />

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
          <LawCard
            key={law.id}
            law={law}
            expanded={expanded}
            onExpand={handleExpand}
            onEdit={handleEditClick}
            onStatusChange={updateLawStatus}
            currentTab={currentTab}
          />
        ))
      ) : (
        <EmptyState
          message={searchQuery ? "No results found for your search." : ""}
          tab={currentTab}
        />
      )}

      <LawFormDialog
        open={isAddDialogOpen}
        onClose={handleAddDialogClose}
        onSubmit={handleAddNewLaw}
        formData={newLawData}
        onChange={(e) => handleFormChange(e, "add")}
      />

      <LawFormDialog
        open={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSubmit={handleSaveChanges}
        law={currentLaw}
        formData={currentLaw || {}}
        onChange={(e) => handleFormChange(e, "edit")}
      />

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

