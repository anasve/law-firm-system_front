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
} from '@mui/icons-material';
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
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuClientId, setMenuClientId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [tab]);

  useEffect(() => {
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
        default:
          response = await clientsService.getClients();
      }
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setError('فشل تحميل العملاء. يرجى المحاولة مرة أخرى.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower)
      );
    }

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
      await clientsService.suspendClient(selectedClient.id);
      setSuccess('تم تعليق العميل بنجاح');
      setSuspendDialogOpen(false);
      await fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل تعليق العميل');
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: colors.gold, fontSize: 32 }} />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {client.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14 }} />
                            {client.email}
                          </Typography>
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
    </Box>
  );
}
