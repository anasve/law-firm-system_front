import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { WelcomeBanner, StyledButton } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { financialService, getToken } from '../services';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';

const itemTypes = [
  { value: 'fee', label: 'Legal Fee' },
  { value: 'court_fee', label: 'Court Fee' },
  { value: 'stamp', label: 'Stamp' },
  { value: 'translation', label: 'Translation' },
  { value: 'copy', label: 'Copy/Document' },
  { value: 'document', label: 'Document' },
  { value: 'other', label: 'Other' },
];

export default function FixedPricesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fixedPrices, setFixedPrices] = useState([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFixedPrices();
  }, [navigate]);

  const fetchFixedPrices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await financialService.getFixedPrices();
      
      let pricesData = [];
      if (Array.isArray(response.data)) {
        pricesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        pricesData = response.data.data;
      }
      // Filter to show only active prices
      pricesData = pricesData.filter((price) => price.is_active);
      setFixedPrices(pricesData);
    } catch (error) {
      console.error('Failed to fetch fixed prices:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        response: error.response?.data,
      });
      if (error.response?.status !== 401) {
        const errorMessage = error.code === 'ECONNABORTED' 
          ? 'Request timeout. Please check your connection and try again.'
          : error.code === 'ERR_NETWORK' || error.message.includes('Network Error')
          ? 'Network error. Please check if the API server is running.'
          : error.response?.data?.message || error.message || 'Failed to load fixed prices. Please refresh the page.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
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
              Fixed Prices
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
              View all available fixed prices for legal services
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={fetchFixedPrices} sx={{ color: colors.gold }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </WelcomeBanner>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Name (Arabic)</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }} align="right">Price</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Unit</TableCell>
                <TableCell sx={{ color: colors.gold, fontWeight: 'bold' }}>Description</TableCell>
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
                  <TableCell sx={{ color: colors.textSecondary }}>
                    {price.description || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.lightBlack }}>
          <Typography variant="h6" sx={{ color: colors.white }}>
            No fixed prices available
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

