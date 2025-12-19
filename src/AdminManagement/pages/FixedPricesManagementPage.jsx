import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { WelcomeBanner, StyledButton, StyledTextField } from '../components/StyledComponents';
import { colors } from '../constants';
import { fixedPricesService } from '../services';
import { getToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/feedback/ConfirmationDialog';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(colors.gold, 0.2)}`,
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    color: colors.textSecondary,
    fontWeight: 500,
    textTransform: 'none',
    fontSize: '1rem',
    '&.Mui-selected': {
      color: colors.gold,
      fontWeight: 600,
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: colors.gold,
  },
}));

const StyledTab = styled(Tab)({
  minWidth: 120,
});

const itemTypes = [
  { value: 'fee', label: 'Legal Fee' },
  { value: 'court_fee', label: 'Court Fee' },
  { value: 'stamp', label: 'Stamp' },
  { value: 'translation', label: 'Translation' },
  { value: 'copy', label: 'Copy/Document' },
  { value: 'document', label: 'Document' },
  { value: 'other', label: 'Other' },
];

const units = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'page', label: 'Page' },
  { value: 'stamp', label: 'Stamp' },
  { value: 'item', label: 'Item' },
  { value: 'unit', label: 'Unit' },
];

export default function FixedPricesManagementPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fixedPrices, setFixedPrices] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    type: 'fee',
    price: '',
    unit: 'hour',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchFixedPrices();
  }, [navigate, currentTab]);

  const fetchFixedPrices = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      
      switch (currentTab) {
        case 1:
          response = await fixedPricesService.getArchived();
          break;
        default:
          response = await fixedPricesService.getActive();
      }
      
      let pricesData = [];
      if (Array.isArray(response.data)) {
        pricesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        pricesData = response.data.data;
      }
      setFixedPrices(pricesData);
    } catch (error) {
      console.error('Failed to fetch fixed prices:', error);
      if (error.response?.status !== 401) {
        setError('Failed to load fixed prices. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      name_ar: '',
      type: 'fee',
      price: '',
      unit: 'hour',
      description: '',
      is_active: true,
    });
    setIsEditMode(false);
    setSelectedPrice(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = (price) => {
    setFormData({
      name: price.name || '',
      name_ar: price.name_ar || '',
      type: price.type || 'fee',
      price: price.price || '',
      unit: price.unit || 'hour',
      description: price.description || '',
      is_active: price.is_active !== undefined ? price.is_active : true,
    });
    setSelectedPrice(price);
    setIsEditMode(true);
    setEditDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.name_ar || !formData.price || !formData.type) {
      setError('Please fill in all required fields (Name, Name Arabic, Price, and Type)');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (isEditMode && selectedPrice) {
        await fixedPricesService.update(selectedPrice.id, payload);
        setSuccess('Fixed price updated successfully');
        setEditDialogOpen(false);
      } else {
        await fixedPricesService.create(payload);
        setSuccess('Fixed price created successfully');
        setCreateDialogOpen(false);
      }

      await fetchFixedPrices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save fixed price:', error);
      setError(error.response?.data?.message || 'Failed to save fixed price');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPrice) return;
    try {
      setActionLoading(true);
      setError('');
      await fixedPricesService.delete(selectedPrice.id);
      setSuccess('Fixed price archived successfully');
      setDeleteDialogOpen(false);
      await fetchFixedPrices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to archive fixed price:', error);
      setError(error.response?.data?.message || 'Failed to archive fixed price');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedPrice) return;
    try {
      setActionLoading(true);
      setError('');
      await fixedPricesService.restore(selectedPrice.id);
      setSuccess('Fixed price restored successfully');
      setRestoreDialogOpen(false);
      await fetchFixedPrices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to restore fixed price:', error);
      setError(error.response?.data?.message || 'Failed to restore fixed price');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceDelete = async () => {
    if (!selectedPrice) return;
    try {
      setActionLoading(true);
      setError('');
      await fixedPricesService.forceDelete(selectedPrice.id);
      setSuccess('Fixed price permanently deleted');
      setForceDeleteDialogOpen(false);
      await fetchFixedPrices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete fixed price:', error);
      setError(error.response?.data?.message || 'Failed to delete fixed price');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Fixed Prices Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              Manage fixed prices for invoices (Legal fees, stamps, translation, etc.)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={fetchFixedPrices} sx={{ color: colors.gold }}>
              <RefreshIcon />
            </IconButton>
            {currentTab === 0 && (
              <StyledButton startIcon={<AddIcon />} onClick={handleAdd}>
                Add Fixed Price
              </StyledButton>
            )}
          </Box>
        </Box>
      </WelcomeBanner>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <StyledTabs value={currentTab} onChange={handleTabChange}>
        <StyledTab label="Active" />
        <StyledTab label="Archived" />
      </StyledTabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : fixedPrices.length > 0 ? (
        <TableContainer component={Paper} sx={{ backgroundColor: colors.lightBlack }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Name (AR)</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }} align="right">Price</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Unit</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fixedPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell sx={{ color: colors.white }}>{price.name || 'N/A'}</TableCell>
                  <TableCell sx={{ color: colors.white }}>{price.name_ar || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={itemTypes.find((t) => t.value === price.type)?.label || price.type}
                      size="small"
                      sx={{
                        backgroundColor: alpha(colors.gold, 0.1),
                        color: colors.gold,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: colors.white, fontWeight: 'bold' }} align="right">
                    {formatCurrency(price.price)}
                  </TableCell>
                  <TableCell sx={{ color: colors.white }}>{price.unit || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={price.is_active ? 'Active' : 'Archived'}
                      color={price.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {currentTab === 0 ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(price)}
                          sx={{ color: colors.gold, mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPrice(price);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ color: colors.error }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPrice(price);
                            setRestoreDialogOpen(true);
                          }}
                          sx={{ color: colors.success, mr: 1 }}
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPrice(price);
                            setForceDeleteDialogOpen(true);
                          }}
                          sx={{ color: colors.error }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.lightBlack }}>
          <Typography variant="h6" sx={{ color: colors.white }}>
            No fixed prices found
          </Typography>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: colors.white, fontWeight: 'bold' }}>
            {isEditMode ? 'Edit Fixed Price' : 'Add Fixed Price'}
          </Typography>
          <IconButton
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}
            sx={{ color: colors.white }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Name (English) *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Name (Arabic)"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.textSecondary }}>Type *</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type *"
                  sx={{
                    color: colors.white,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(colors.gold, 0.3),
                    },
                  }}
                >
                  {itemTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.textSecondary }}>Unit *</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  label="Unit *"
                  sx={{
                    color: colors.white,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(colors.gold, 0.3),
                    },
                  }}
                >
                  {units.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Price *"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: colors.gold,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: colors.gold,
                      },
                    }}
                  />
                }
                label="Active"
                sx={{ color: colors.white }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <StyledButton
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleSubmit}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isEditMode ? 'Update' : 'Create'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Archive Fixed Price"
        message="Are you sure you want to archive this fixed price? It will be moved to the archived section."
        loading={actionLoading}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        onConfirm={handleRestore}
        title="Restore Fixed Price"
        message="Are you sure you want to restore this fixed price? It will be moved back to active prices."
        loading={actionLoading}
      />

      {/* Force Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={forceDeleteDialogOpen}
        onClose={() => setForceDeleteDialogOpen(false)}
        onConfirm={handleForceDelete}
        title="Permanently Delete Fixed Price"
        message="Are you sure you want to permanently delete this fixed price? This action cannot be undone."
        loading={actionLoading}
      />
    </Box>
  );
}

