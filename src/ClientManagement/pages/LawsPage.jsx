import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { WelcomeBanner, StyledTextField } from '../../AdminManagement/components/StyledComponents';
import { colors } from '../../AdminManagement/constants';
import { lawsService } from '../services';

const LawCard = styled(Paper)(({ theme }) => ({
  backgroundColor: colors.lightBlack,
  padding: theme.spacing(2),
  borderRadius: '12px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 16px ${alpha(colors.black, 0.3)}`,
    borderColor: colors.gold,
  },
}));

export default function LawsPage() {
  const [laws, setLaws] = useState([]);
  const [filteredLaws, setFilteredLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [lawDialogOpen, setLawDialogOpen] = useState(false);

  useEffect(() => {
    fetchLaws();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLaws(laws);
    } else {
      const filtered = laws.filter((law) =>
        law.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        law.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        law.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLaws(filtered);
    }
  }, [searchTerm, laws]);

  const fetchLaws = async () => {
    try {
      setLoading(true);
      const response = await lawsService.getLaws();
      console.log('Laws response:', response);
      console.log('Response data:', response.data);
      
      let lawsData = [];
      if (Array.isArray(response.data)) {
        lawsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        lawsData = response.data.data;
      } else if (response.data?.laws && Array.isArray(response.data.laws)) {
        lawsData = response.data.laws;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        lawsData = response.data.items;
      }
      
      console.log('Extracted laws data:', lawsData);
      setLaws(lawsData);
      setFilteredLaws(lawsData);
    } catch (error) {
      console.error('Failed to fetch laws:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        response: error.response?.data,
      });
      setLaws([]);
      setFilteredLaws([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLaw = async (lawId) => {
    try {
      const response = await lawsService.getLaw(lawId);
      setSelectedLaw(response.data);
      setLawDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch law details:', error);
    }
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Typography variant="h4" fontWeight="bold">
          Laws Library
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          Browse and search through all available laws and regulations.
        </Typography>
      </WelcomeBanner>

      {/* Search */}
      <Paper
        sx={{
          backgroundColor: colors.lightBlack,
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: `1px solid ${alpha(colors.gold, 0.1)}`,
        }}
      >
        <StyledTextField
          fullWidth
          placeholder="Search laws by title, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.gold }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Laws List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: colors.gold }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredLaws.length > 0 ? (
            filteredLaws.map((law) => (
              <Grid item xs={12} md={6} key={law.id}>
                <LawCard onClick={() => handleViewLaw(law.id)}>
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                    <DescriptionIcon sx={{ color: colors.gold, fontSize: 40, mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: colors.white, fontWeight: 'bold', mb: 1 }}>
                        {law.title}
                      </Typography>
                      {law.description && (
                        <Typography
                          variant="body2"
                          sx={{ color: colors.textSecondary, mb: 2 }}
                        >
                          {law.description.length > 150
                            ? `${law.description.substring(0, 150)}...`
                            : law.description}
                        </Typography>
                      )}
                      {law.category && (
                        <Chip
                          label={law.category}
                          size="small"
                          sx={{
                            backgroundColor: alpha(colors.gold, 0.1),
                            color: colors.gold,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    sx={{
                      color: colors.gold,
                      borderColor: colors.gold,
                      '&:hover': {
                        borderColor: colors.gold,
                        backgroundColor: alpha(colors.gold, 0.1),
                      },
                    }}
                  >
                    Read More
                  </Button>
                </LawCard>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.lightBlack }}>
                <Typography variant="h6" sx={{ color: colors.white }}>
                  {searchTerm ? 'No laws found matching your search' : 'No laws available'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Law Details Dialog */}
      <Dialog
        open={lawDialogOpen}
        onClose={() => setLawDialogOpen(false)}
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
            {selectedLaw?.title}
          </Typography>
          <IconButton onClick={() => setLawDialogOpen(false)} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLaw && (
            <Box>
              {selectedLaw.category && (
                <Chip
                  label={selectedLaw.category}
                  size="small"
                  sx={{
                    backgroundColor: alpha(colors.gold, 0.1),
                    color: colors.gold,
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                />
              )}
              {selectedLaw.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.gold, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.white,
                      lineHeight: 1.8,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {selectedLaw.description}
                  </Typography>
                </Box>
              )}
              {(selectedLaw.full_content || selectedLaw.fullContent) && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.gold, mb: 1 }}>
                    Full Content
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.white,
                      lineHeight: 1.8,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {selectedLaw.full_content || selectedLaw.fullContent}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setLawDialogOpen(false)} sx={{ color: colors.textSecondary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

