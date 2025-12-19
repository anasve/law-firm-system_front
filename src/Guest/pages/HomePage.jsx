import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Container,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Gavel as GavelIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../AdminManagement/constants';
import { guestService } from '../services';

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '600px',
  background: `linear-gradient(135deg, ${colors.black} 0%, ${alpha('#1E1E1E', 0.95)} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 50% 50%, ${alpha(colors.gold, 0.1)} 0%, transparent 70%)`,
  },
}));

const StyledButton = styled(Button)({
  backgroundColor: colors.gold,
  color: colors.black,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  borderRadius: '12px',
  padding: '14px 32px',
  fontSize: '1.1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: colors.darkGold,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 16px ${alpha(colors.gold, 0.3)}`,
  },
});

const SectionCard = styled(Card)({
  backgroundColor: colors.lightBlack,
  color: colors.white,
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  height: '100%',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 24px ${alpha(colors.black, 0.5)}`,
    borderColor: colors.gold,
  },
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    color: colors.white,
    backgroundColor: alpha(colors.black, 0.4),
    borderRadius: '12px',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: alpha(colors.gold, 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha(colors.gold, 0.6),
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.gold,
    },
  },
  '& input': {
    color: colors.white,
  },
});

export default function HomePage() {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [laws, setLaws] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [lawyerDialogOpen, setLawyerDialogOpen] = useState(false);
  const [lawDialogOpen, setLawDialogOpen] = useState(false);
  const [selectedLaw, setSelectedLaw] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [searchTerm, selectedSpecialization]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lawsRes, specializationsRes, lawyersRes] = await Promise.all([
        guestService.getLaws(),
        guestService.getSpecializations(),
        guestService.getLawyers(),
      ]);
      
      console.log('Laws response:', lawsRes);
      console.log('Lawyers response:', lawyersRes);
      console.log('Specializations response:', specializationsRes);
      
      // Handle different response formats for laws
      let lawsData = [];
      if (Array.isArray(lawsRes.data)) {
        lawsData = lawsRes.data;
      } else if (lawsRes.data?.data && Array.isArray(lawsRes.data.data)) {
        lawsData = lawsRes.data.data;
      } else if (lawsRes.data?.laws && Array.isArray(lawsRes.data.laws)) {
        lawsData = lawsRes.data.laws;
      }
      setLaws(lawsData);
      console.log('Extracted laws:', lawsData);
      
      // Handle different response formats for lawyers
      let lawyersData = [];
      if (Array.isArray(lawyersRes.data)) {
        lawyersData = lawyersRes.data;
      } else if (lawyersRes.data?.data && Array.isArray(lawyersRes.data.data)) {
        lawyersData = lawyersRes.data.data;
      } else if (lawyersRes.data?.lawyers && Array.isArray(lawyersRes.data.lawyers)) {
        lawyersData = lawyersRes.data.lawyers;
      }
      setLawyers(lawyersData);
      console.log('Extracted lawyers:', lawyersData);
      
      // Handle different response formats for specializations
      let specializationsData = [];
      if (Array.isArray(specializationsRes.data)) {
        specializationsData = specializationsRes.data;
      } else if (specializationsRes.data?.data && Array.isArray(specializationsRes.data.data)) {
        specializationsData = specializationsRes.data.data;
      } else if (specializationsRes.data?.specializations && Array.isArray(specializationsRes.data.specializations)) {
        specializationsData = specializationsRes.data.specializations;
      }
      setSpecializations(specializationsData);
      console.log('Extracted specializations:', specializationsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      console.error('Error response:', error.response);
      setLaws([]);
      setLawyers([]);
      setSpecializations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedSpecialization) params.specialization_id = selectedSpecialization;
      const response = await guestService.getLawyers(params);
      console.log('Fetch lawyers response:', response);
      
      // Handle different response formats
      let lawyersData = [];
      if (Array.isArray(response.data)) {
        lawyersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        lawyersData = response.data.data;
      } else if (response.data?.lawyers && Array.isArray(response.data.lawyers)) {
        lawyersData = response.data.lawyers;
      }
      setLawyers(lawyersData);
      console.log('Filtered lawyers:', lawyersData);
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
      console.error('Error response:', error.response);
      setLawyers([]);
    }
  };

  const handleRequestConsultation = () => {
    navigate('/register');
  };

  const handleViewLawyer = async (lawyerId) => {
    try {
      const response = await guestService.getLawyer(lawyerId);
      setSelectedLawyer(response.data);
      setLawyerDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch lawyer details:', error);
    }
  };

  const handleViewLaw = async (lawId) => {
    try {
      const response = await guestService.getLaw(lawId);
      setSelectedLaw(response.data);
      setLawDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch law details:', error);
    }
  };

  return (
    <Box sx={{ backgroundColor: colors.black, minHeight: '100vh' }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', color: colors.white }}>
            <GavelIcon sx={{ fontSize: 80, color: colors.gold, mb: 3 }} />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 'bold',
                mb: 2,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Lawyer Pro Platform
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: colors.textSecondary,
                mb: 4,
                maxWidth: '800px',
                mx: 'auto',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              منصة قانونية متكاملة تربط بين العملاء والمحامين المحترفين
              <br />
              احصل على استشارات قانونية من أفضل المحامين في المنطقة
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <StyledButton
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleRequestConsultation}
              >
                طلب استشارة الآن
              </StyledButton>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: colors.gold,
                  borderColor: colors.gold,
                  borderRadius: '12px',
                  padding: '14px 32px',
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: colors.darkGold,
                    backgroundColor: alpha(colors.gold, 0.1),
                  },
                }}
                onClick={() => navigate('/login')}
              >
                تسجيل الدخول
              </Button>
            </Box>
          </Box>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            color: colors.white,
            mb: 6,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          لماذا Lawyer Pro؟
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <SectionCard>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: colors.gold,
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 40, color: colors.black }} />
                </Avatar>
                <Typography variant="h5" sx={{ color: colors.white, mb: 2, fontWeight: 'bold' }}>
                  محامين محترفين
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  فريق من المحامين المؤهلين والخبراء في مختلف التخصصات القانونية
                </Typography>
              </CardContent>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionCard>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: colors.gold,
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <GavelIcon sx={{ fontSize: 40, color: colors.black }} />
                </Avatar>
                <Typography variant="h5" sx={{ color: colors.white, mb: 2, fontWeight: 'bold' }}>
                  استشارات سريعة
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  احصل على استشارات قانونية فورية من خلال منصتنا الآمنة والموثوقة
                </Typography>
              </CardContent>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionCard>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: colors.gold,
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 40, color: colors.black }} />
                </Avatar>
                <Typography variant="h5" sx={{ color: colors.white, mb: 2, fontWeight: 'bold' }}>
                  مكتبة قانونية
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  تصفح مكتبة شاملة من القوانين والتشريعات القانونية
                </Typography>
              </CardContent>
            </SectionCard>
          </Grid>
        </Grid>
      </Container>

      {/* Lawyers Section */}
      <Box sx={{ backgroundColor: colors.lightBlack, py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              color: colors.white,
              mb: 4,
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            محامونا المحترفون
          </Typography>

          {/* Search and Filter */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <StyledTextField
              placeholder="ابحث عن محامي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: '250px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.gold }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Array.isArray(specializations) && specializations.map((spec) => (
                <Chip
                  key={spec.id}
                  label={spec.name}
                  onClick={() =>
                    setSelectedSpecialization(
                      selectedSpecialization === spec.id ? null : spec.id
                    )
                  }
                  sx={{
                    backgroundColor:
                      selectedSpecialization === spec.id
                        ? colors.gold
                        : alpha(colors.gold, 0.2),
                    color:
                      selectedSpecialization === spec.id ? colors.black : colors.gold,
                    '&:hover': {
                      backgroundColor: colors.gold,
                      color: colors.black,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Grid container spacing={3}>
            {Array.isArray(lawyers) && lawyers.slice(0, 6).map((lawyer) => (
              <Grid item xs={12} sm={6} md={4} key={lawyer.id}>
                <SectionCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: colors.gold,
                          width: 60,
                          height: 60,
                          mr: 2,
                          fontSize: '1.5rem',
                        }}
                      >
                        {lawyer.name?.charAt(0) || 'L'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: colors.white, fontWeight: 'bold' }}>
                          {lawyer.name}
                        </Typography>
                        {lawyer.specialization && (
                          <Typography variant="body2" sx={{ color: colors.gold }}>
                            {lawyer.specialization.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {lawyer.email && (
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        {lawyer.email}
                      </Typography>
                    )}
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        mt: 2,
                        color: colors.gold,
                        borderColor: colors.gold,
                        '&:hover': {
                          borderColor: colors.darkGold,
                          backgroundColor: alpha(colors.gold, 0.1),
                        },
                      }}
                      onClick={() => handleViewLawyer(lawyer.id)}
                    >
                      عرض التفاصيل
                    </Button>
                  </CardContent>
                </SectionCard>
              </Grid>
            ))}
          </Grid>

          {lawyers.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.black }}>
              <Typography variant="h6" sx={{ color: colors.white }}>
                لا يوجد محامين متاحين حالياً
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>

      {/* Laws Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            color: colors.white,
            mb: 6,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          مكتبة القوانين
        </Typography>
        <Grid container spacing={3}>
          {Array.isArray(laws) && laws.slice(0, 6).map((law) => (
            <Grid item xs={12} md={6} key={law.id}>
              <SectionCard>
                <CardContent>
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
                          {law.description.substring(0, 150)}...
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    sx={{
                      color: colors.gold,
                      borderColor: colors.gold,
                      '&:hover': {
                        borderColor: colors.darkGold,
                        backgroundColor: alpha(colors.gold, 0.1),
                      },
                    }}
                    onClick={() => handleViewLaw(law.id)}
                  >
                    قراءة المزيد
                  </Button>
                </CardContent>
              </SectionCard>
            </Grid>
          ))}
        </Grid>

        {laws.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.lightBlack, mt: 4 }}>
            <Typography variant="h6" sx={{ color: colors.white }}>
              لا توجد قوانين متاحة حالياً
            </Typography>
          </Paper>
        )}
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: colors.lightBlack,
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              color: colors.white,
              mb: 3,
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            جاهز لطلب استشارة قانونية؟
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: colors.textSecondary, mb: 4 }}
          >
            سجل الآن واحصل على استشارة من أفضل المحامين
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <StyledButton
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleRequestConsultation}
            >
              إنشاء حساب الآن
            </StyledButton>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/job-application')}
              sx={{
                color: colors.gold,
                borderColor: colors.gold,
                '&:hover': {
                  borderColor: colors.gold,
                  backgroundColor: alpha(colors.gold, 0.1),
                },
              }}
            >
              Apply for Job
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Lawyer Details Dialog */}
      <Dialog
        open={lawyerDialogOpen}
        onClose={() => setLawyerDialogOpen(false)}
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
          <Typography variant="h5" sx={{ color: colors.white, fontWeight: 'bold' }}>
            تفاصيل المحامي
          </Typography>
          <IconButton onClick={() => setLawyerDialogOpen(false)} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLawyer && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: colors.gold,
                    width: 80,
                    height: 80,
                    mr: 3,
                    fontSize: '2rem',
                  }}
                >
                  {selectedLawyer.name?.charAt(0) || 'L'}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: colors.white, fontWeight: 'bold', mb: 1 }}>
                    {selectedLawyer.name}
                  </Typography>
                  {selectedLawyer.specialization && (
                    <Chip
                      label={selectedLawyer.specialization.name}
                      sx={{
                        backgroundColor: colors.gold,
                        color: colors.black,
                      }}
                    />
                  )}
                </Box>
              </Box>
              {selectedLawyer.email && (
                <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 2 }}>
                  <EmailIcon sx={{ verticalAlign: 'middle', mr: 1, color: colors.gold }} />
                  {selectedLawyer.email}
                </Typography>
              )}
              {selectedLawyer.description && (
                <Typography variant="body1" sx={{ color: colors.white, mt: 2 }}>
                  {selectedLawyer.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setLawyerDialogOpen(false)}
            sx={{ color: colors.textSecondary }}
          >
            إغلاق
          </Button>
          <StyledButton onClick={handleRequestConsultation}>
            طلب استشارة
          </StyledButton>
        </DialogActions>
      </Dialog>

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
            تفاصيل القانون
          </Typography>
          <IconButton onClick={() => setLawDialogOpen(false)} sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLaw && (
            <Box>
              <Typography variant="h4" sx={{ color: colors.white, fontWeight: 'bold', mb: 3 }}>
                {selectedLaw.title}
              </Typography>
              {selectedLaw.description && (
                <Typography
                  variant="body1"
                  sx={{ color: colors.white, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                >
                  {selectedLaw.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setLawDialogOpen(false)}
            sx={{ color: colors.textSecondary }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

