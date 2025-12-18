import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Paper,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { WelcomeBanner, StyledButton, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { clientsService } from '../services';
import ConfirmationDialog from '../../AdminManagement/components/feedback/ConfirmationDialog';

const statusColors = {
  pending: 'warning',
  active: 'success',
  suspended: 'error',
  rejected: 'error',
};

const statusLabels = {
  pending: 'في الانتظار',
  active: 'نشط',
  suspended: 'معلق',
  rejected: 'مرفوض',
};

const FilterCard = styled(Paper)({
  backgroundColor: colors.lightBlack,
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
});

export default function ClientsManagement() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuClientId, setMenuClientId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    fetchClients();
  }, [tab]);

  useEffect(() => {
    console.log('[Filter] Applying filters, clients count:', clients.length, 'searchTerm:', searchTerm);
    applyFilters();
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      switch (tab) {
        case 0:
          response = await clientsService.getClients();
          break;
        case 1:
          response = await clientsService.getPendingClients();
          break;
        case 2:
          response = await clientsService.getApprovedClients();
          break;
        case 3:
          response = await clientsService.getSuspendedClients();
          break;
        case 4:
          response = await clientsService.getRejectedClients();
          break;
        case 5:
          response = await clientsService.getArchivedClients();
          break;
        default:
          response = await clientsService.getClients();
      }
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data?.clients && Array.isArray(response.data.clients)) {
        data = response.data.clients;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
      }
      
      console.log(`[Tab ${tab}] Full response:`, response);
      console.log(`[Tab ${tab}] Response data:`, response.data);
      console.log(`[Tab ${tab}] Fetched ${data.length} clients:`, data);
      
      // If no data found and it's pending tab, try alternative endpoint
      if (tab === 1 && data.length === 0) {
        console.log('[Tab 1] No data from pending-verified, trying with status filter...');
        try {
          const altResponse = await clientsService.getClients({ status: 'pending' });
          let altData = [];
          if (Array.isArray(altResponse.data)) {
            altData = altResponse.data;
          } else if (altResponse.data?.data && Array.isArray(altResponse.data.data)) {
            altData = altResponse.data.data;
          } else if (altResponse.data?.clients && Array.isArray(altResponse.data.clients)) {
            altData = altResponse.data.clients;
          }
          if (altData.length > 0) {
            console.log('[Tab 1] Found clients using status filter:', altData);
            data = altData;
          }
        } catch (altError) {
          console.warn('[Tab 1] Alternative fetch failed:', altError);
        }
      }
      
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'فشل تحميل العملاء. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];
    console.log('[Filter] Starting with', filtered.length, 'clients');

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower)
      );
      console.log('[Filter] After search filter:', filtered.length, 'clients');
    }

    console.log('[Filter] Final filtered clients:', filtered.length);
    setFilteredClients(filtered);
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await clientsService.getClient(id);
      setSelectedClient(response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch client details:', error);
      setError('فشل تحميل تفاصيل العميل');
    }
  };

  const handleActivate = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      setError('');
      await clientsService.activateClient(selectedClient.id);
      setSuccess('تم تفعيل العميل بنجاح');
      setActivateDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل تفعيل العميل');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      setError('');
      await clientsService.rejectClient(selectedClient.id);
      setSuccess('تم رفض العميل بنجاح');
      setRejectDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل رفض العميل');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      setError('');
      console.log('Suspending client:', selectedClient.id);
      const response = await clientsService.suspendClient(selectedClient.id);
      console.log('Suspend response:', response);
      setSuccess('تم تعليق العميل بنجاح');
      setSuspendDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Suspend error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'فشل تعليق العميل';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuOpen = (event, clientId) => {
    setAnchorEl(event.currentTarget);
    setMenuClientId(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuClientId(null);
  };

  const handleMenuAction = async (action, client) => {
    setSelectedClient(client);
    handleMenuClose();

    switch (action) {
      case 'view':
        await handleViewDetails(client.id);
        break;
      case 'activate':
        setActivateDialogOpen(true);
        break;
      case 'reject':
        setRejectDialogOpen(true);
        break;
      case 'suspend':
        setSuspendDialogOpen(true);
        break;
      case 'edit':
        setFormData({
          name: client.name || '',
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          password: '',
          password_confirmation: '',
        });
        setIsEditMode(true);
        setAddEditDialogOpen(true);
        break;
      case 'archive':
        setArchiveDialogOpen(true);
        break;
      case 'restore':
        setRestoreDialogOpen(true);
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
    }
  };

  const handleAddClient = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      password_confirmation: '',
    });
    setIsEditMode(false);
    setSelectedClient(null);
    setAddEditDialogOpen(true);
  };

  const handleSaveClient = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      // Validation
      if (!formData.name || !formData.email) {
        setError('الاسم والبريد الإلكتروني مطلوبان');
        setActionLoading(false);
        return;
      }

      if (!isEditMode && (!formData.password || formData.password.length < 6)) {
        setError('كلمة المرور مطلوبة ويجب أن تكون 6 أحرف على الأقل');
        setActionLoading(false);
        return;
      }

      if (formData.password && formData.password !== formData.password_confirmation) {
        setError('كلمات المرور غير متطابقة');
        setActionLoading(false);
        return;
      }

      const data = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
      };

      if (formData.password) {
        data.password = formData.password;
        data.password_confirmation = formData.password_confirmation;
      }

      if (isEditMode && selectedClient) {
        await clientsService.updateClient(selectedClient.id, data);
        setSuccess('تم تحديث العميل بنجاح');
      } else {
        await clientsService.createClient(data);
        setSuccess('تم إضافة العميل بنجاح');
      }

      setAddEditDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save client:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors ? 
                          Object.values(error.response.data.errors).flat().join(', ') :
                          (isEditMode ? 'فشل تحديث العميل' : 'فشل إضافة العميل');
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      setError('');
      await clientsService.forceDeleteClient(selectedClient.id);
      setSuccess('تم حذف العميل بنجاح');
      setDeleteDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.message || error.message || 'فشل حذف العميل');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      setError('');
      await clientsService.archiveClient(selectedClient.id);
      setSuccess('تم أرشفة العميل بنجاح');
      setArchiveDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل أرشفة العميل');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      setError('');
      await clientsService.restoreClient(selectedClient.id);
      setSuccess('تم إلغاء أرشفة العميل بنجاح');
      setRestoreDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل إلغاء أرشفة العميل');
    } finally {
      setActionLoading(false);
    }
  };

  const getStats = () => {
    return {
      total: clients.length,
      pending: clients.filter((c) => c.status === 'pending').length,
      active: clients.filter((c) => c.status === 'active').length,
      suspended: clients.filter((c) => c.status === 'suspended').length,
      rejected: clients.filter((c) => c.status === 'rejected').length,
    };
  };

  const stats = getStats();

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              إدارة العملاء
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              إدارة وتنظيم جميع العملاء
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="تحديث">
              <IconButton onClick={fetchClients} sx={{ color: colors.gold }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <StyledButton startIcon={<AddIcon />} onClick={handleAddClient}>
              إضافة عميل جديد
            </StyledButton>
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

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: colors.gold, fontWeight: 'bold' }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              إجمالي العملاء
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              {stats.pending}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              في الانتظار
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              {stats.active}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              نشط
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              {stats.suspended}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              معلق
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.lightBlack,
              textAlign: 'center',
              border: `1px solid ${alpha(colors.gold, 0.1)}`,
            }}
          >
            <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              {stats.rejected}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              مرفوض
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search */}
      <FilterCard>
        <StyledTextField
          fullWidth
          placeholder="ابحث عن عميل بالاسم أو البريد الإلكتروني..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: colors.gold, mr: 1 }} />,
          }}
        />
      </FilterCard>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            color: colors.textSecondary,
            '&.Mui-selected': { color: colors.gold },
          },
          '& .MuiTabs-indicator': { backgroundColor: colors.gold },
        }}
      >
        <Tab label="الكل" />
        <Tab label="في الانتظار" />
        <Tab label="معتمد" />
        <Tab label="معلق" />
        <Tab label="مرفوض" />
        <Tab label="أرشيف" />
      </Tabs>

      {/* Clients List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(filteredClients) && filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <Grid item xs={12} md={6} key={client.id}>
                <Card
                  sx={{
                    backgroundColor: colors.lightBlack,
                    color: colors.white,
                    border: `1px solid ${alpha(colors.gold, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 16px ${alpha(colors.black, 0.3)}`,
                      borderColor: colors.gold,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {client.image ? (
                          <Avatar 
                            src={client.image} 
                            alt={client.name}
                            sx={{ width: 56, height: 56, border: `2px solid ${colors.gold}` }}
                          />
                        ) : (
                          <Avatar sx={{ bgcolor: colors.gold, width: 56, height: 56 }}>
                            <PersonIcon sx={{ color: colors.black, fontSize: 32 }} />
                          </Avatar>
                        )}
                        <Box>
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            sx={{ 
                              color: alpha(colors.white, 0.95),
                              fontSize: '1.1rem',
                              mb: 0.5,
                            }}
                          >
                            {client.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: alpha(colors.white, 0.8),
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5, 
                              mt: 0.5,
                              fontSize: '0.875rem',
                            }}
                          >
                            <EmailIcon sx={{ fontSize: 14, color: colors.gold }} />
                            {client.email}
                          </Typography>
                          {client.phone && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: alpha(colors.white, 0.8),
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5, 
                                mt: 0.5,
                                fontSize: '0.875rem',
                              }}
                            >
                              <PhoneIcon sx={{ fontSize: 14, color: colors.gold }} />
                              {client.phone}
                            </Typography>
                          )}
                          {client.address && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: alpha(colors.white, 0.8),
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5, 
                                mt: 0.5,
                                fontSize: '0.875rem',
                              }}
                            >
                              <LocationIcon sx={{ fontSize: 14, color: colors.gold }} />
                              {client.address}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, client.id)}
                        sx={{ color: colors.textSecondary }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={statusLabels[client.status] || client.status}
                        color={statusColors[client.status] || 'default'}
                        size="small"
                      />
                      {client.created_at && (
                        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 12 }} />
                          {new Date(client.created_at).toLocaleDateString('ar-SA')}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(client.id)}
                      sx={{ color: colors.gold }}
                    >
                      عرض التفاصيل
                    </Button>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="تعديل">
                        <IconButton
                          size="small"
                          onClick={() => handleMenuAction('edit', client)}
                          sx={{ color: colors.gold }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {!client.deleted_at && (
                        <Tooltip title="أرشفة">
                          <IconButton
                            size="small"
                            onClick={() => handleMenuAction('archive', client)}
                            sx={{ color: '#ff9800' }}
                          >
                            <ArchiveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {client.deleted_at && (
                        <>
                          <Tooltip title="إلغاء أرشفة">
                            <IconButton
                              size="small"
                              onClick={() => handleMenuAction('restore', client)}
                              sx={{ color: colors.success }}
                            >
                              <UnarchiveIcon />
                            </IconButton>
                          </Tooltip>
                          {tab === 5 && (
                            <Tooltip title="حذف">
                              <IconButton
                                size="small"
                                onClick={() => handleMenuAction('delete', client)}
                                sx={{ color: colors.error }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                      {client.status === 'pending' && (
                        <>
                          <Tooltip title="تفعيل">
                            <IconButton
                              size="small"
                              onClick={() => handleMenuAction('activate', client)}
                              sx={{ color: colors.success }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="رفض">
                            <IconButton
                              size="small"
                              onClick={() => handleMenuAction('reject', client)}
                              sx={{ color: colors.error }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {client.status === 'active' && (
                        <Tooltip title="تعليق">
                          <IconButton
                            size="small"
                            onClick={() => handleMenuAction('suspend', client)}
                            sx={{ color: colors.error }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {client.status === 'suspended' && (
                        <Tooltip title="تفعيل">
                          <IconButton
                            size="small"
                            onClick={() => handleMenuAction('activate', client)}
                            sx={{ color: colors.success }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: colors.lightBlack,
                  color: colors.white,
                  borderRadius: '12px',
                }}
              >
                <Typography variant="h6">لا يوجد عملاء</Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                  {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد عملاء في هذه الفئة'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: colors.lightBlack,
            color: colors.white,
            minWidth: '180px',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const client = clients.find((c) => c.id === menuClientId);
            if (client) handleMenuAction('view', client);
          }}
          sx={{ color: colors.white, '&:hover': { backgroundColor: alpha(colors.gold, 0.1) } }}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          عرض التفاصيل
        </MenuItem>
        {clients.find((c) => c.id === menuClientId)?.status === 'pending' && (
          <>
            <MenuItem
              onClick={() => {
                const client = clients.find((c) => c.id === menuClientId);
                if (client) handleMenuAction('activate', client);
              }}
              sx={{ color: colors.success, '&:hover': { backgroundColor: alpha(colors.success, 0.1) } }}
            >
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
              تفعيل
            </MenuItem>
            <MenuItem
              onClick={() => {
                const client = clients.find((c) => c.id === menuClientId);
                if (client) handleMenuAction('reject', client);
              }}
              sx={{ color: colors.error, '&:hover': { backgroundColor: alpha(colors.error, 0.1) } }}
            >
              <CancelIcon sx={{ mr: 1, fontSize: 20 }} />
              رفض
            </MenuItem>
          </>
        )}
        {clients.find((c) => c.id === menuClientId)?.status === 'active' && (
          <MenuItem
            onClick={() => {
              const client = clients.find((c) => c.id === menuClientId);
              if (client) handleMenuAction('suspend', client);
            }}
            sx={{ color: colors.error, '&:hover': { backgroundColor: alpha(colors.error, 0.1) } }}
          >
            <BlockIcon sx={{ mr: 1, fontSize: 20 }} />
            تعليق
          </MenuItem>
        )}
        {clients.find((c) => c.id === menuClientId)?.status === 'suspended' && (
          <MenuItem
            onClick={() => {
              const client = clients.find((c) => c.id === menuClientId);
              if (client) handleMenuAction('activate', client);
            }}
            sx={{ color: colors.success, '&:hover': { backgroundColor: alpha(colors.success, 0.1) } }}
          >
            <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            تفعيل
          </MenuItem>
        )}
      </Menu>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
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
            تفاصيل العميل
          </Typography>
          <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Box>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                {selectedClient.image ? (
                  <Avatar 
                    src={selectedClient.image} 
                    alt={selectedClient.name}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: `3px solid ${colors.gold}` }}
                  />
                ) : (
                  <Avatar sx={{ bgcolor: colors.gold, width: 120, height: 120, mx: 'auto', mb: 2 }}>
                    <PersonIcon sx={{ color: colors.black, fontSize: 60 }} />
                  </Avatar>
                )}
                <Typography variant="h5" fontWeight="bold" sx={{ color: colors.white, mb: 0.5 }}>
                  {selectedClient.name}
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    الاسم
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedClient.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    البريد الإلكتروني
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                    {selectedClient.email}
                  </Typography>
                </Grid>
                {selectedClient.phone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 16 }} />
                      رقم الهاتف
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedClient.phone}
                    </Typography>
                  </Grid>
                )}
                {selectedClient.address && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16 }} />
                      العنوان
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {selectedClient.address}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    الحالة
                  </Typography>
                  <Chip
                    label={statusLabels[selectedClient.status] || selectedClient.status}
                    color={statusColors[selectedClient.status] || 'default'}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                {selectedClient.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                      تاريخ التسجيل
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.white, mb: 2 }}>
                      {new Date(selectedClient.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: colors.textSecondary }}>
            إغلاق
          </Button>
          {selectedClient?.status === 'pending' && (
            <>
              <StyledButton onClick={() => setActivateDialogOpen(true)} sx={{ mr: 1 }}>
                تفعيل
              </StyledButton>
              <Button
                onClick={() => setRejectDialogOpen(true)}
                sx={{
                  color: colors.error,
                  borderColor: colors.error,
                  '&:hover': { borderColor: colors.error, backgroundColor: alpha(colors.error, 0.1) },
                }}
                variant="outlined"
              >
                رفض
              </Button>
            </>
          )}
          {selectedClient?.status === 'active' && (
            <Button
              onClick={() => setSuspendDialogOpen(true)}
              sx={{
                color: colors.error,
                borderColor: colors.error,
                '&:hover': { borderColor: colors.error, backgroundColor: alpha(colors.error, 0.1) },
              }}
              variant="outlined"
            >
              تعليق
            </Button>
          )}
          {selectedClient?.status === 'suspended' && (
            <StyledButton onClick={() => setActivateDialogOpen(true)}>تفعيل</StyledButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Activate Confirmation */}
      <ConfirmationDialog
        open={activateDialogOpen}
        onClose={() => setActivateDialogOpen(false)}
        onConfirm={handleActivate}
        title="تفعيل العميل"
        message={`هل أنت متأكد من تفعيل العميل "${selectedClient?.name}"؟`}
        loading={actionLoading}
      />

      {/* Reject Confirmation */}
      <ConfirmationDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="رفض العميل"
        message={`هل أنت متأكد من رفض العميل "${selectedClient?.name}"؟`}
        loading={actionLoading}
      />

      {/* Suspend Confirmation */}
      <ConfirmationDialog
        open={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
        onConfirm={handleSuspend}
        title="تعليق العميل"
        message={`هل أنت متأكد من تعليق العميل "${selectedClient?.name}"؟`}
        loading={actionLoading}
      />

      {/* Add/Edit Client Dialog */}
      <Dialog
        open={addEditDialogOpen}
        onClose={() => {
          setAddEditDialogOpen(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            password_confirmation: '',
          });
          setIsEditMode(false);
          setSelectedClient(null);
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
            {isEditMode ? 'تعديل العميل' : 'إضافة عميل جديد'}
          </Typography>
          <IconButton onClick={() => {
            setAddEditDialogOpen(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              address: '',
              password: '',
              password_confirmation: '',
            });
            setIsEditMode(false);
            setSelectedClient(null);
          }} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <StyledTextField
              fullWidth
              label="الاسم"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <StyledTextField
              fullWidth
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <StyledTextField
              fullWidth
              label="رقم الهاتف"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <StyledTextField
              fullWidth
              label="العنوان"
              name="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={2}
            />
            {!isEditMode && (
              <>
                <StyledTextField
                  fullWidth
                  label="كلمة المرور"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="تأكيد كلمة المرور"
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  required
                />
              </>
            )}
            {isEditMode && (
              <>
                <StyledTextField
                  fullWidth
                  label="كلمة المرور الجديدة (اختياري)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="اتركه فارغاً إذا لم ترد تغيير كلمة المرور"
                />
                {formData.password && (
                  <StyledTextField
                    fullWidth
                    label="تأكيد كلمة المرور الجديدة"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  />
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setAddEditDialogOpen(false);
              setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                password: '',
                password_confirmation: '',
              });
              setIsEditMode(false);
              setSelectedClient(null);
            }}
            sx={{ color: colors.textSecondary }}
          >
            إلغاء
          </Button>
          <StyledButton
            onClick={handleSaveClient}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} sx={{ color: colors.black }} />
            ) : (
              isEditMode ? 'تحديث' : 'إضافة'
            )}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="حذف العميل"
        message={`هل أنت متأكد من حذف العميل "${selectedClient?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        loading={actionLoading}
      />

      {/* Archive Confirmation */}
      <ConfirmationDialog
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleArchive}
        title="أرشفة العميل"
        message={`هل أنت متأكد من أرشفة العميل "${selectedClient?.name}"؟`}
        loading={actionLoading}
      />

      {/* Restore Confirmation */}
      <ConfirmationDialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        onConfirm={handleRestore}
        title="إلغاء أرشفة العميل"
        message={`هل أنت متأكد من إلغاء أرشفة العميل "${selectedClient?.name}"؟`}
        loading={actionLoading}
      />
    </Box>
  );
}
