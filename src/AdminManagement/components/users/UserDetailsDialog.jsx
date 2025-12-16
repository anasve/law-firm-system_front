import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, IconButton, Box, Typography, Avatar, Chip, Divider,
  Grid, Button, CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { colors } from '../../constants';
import { buildImageUrl } from '../../utils/helpers';
import { usersService } from '../../services/usersService';
import { getToken } from '../../services/api';

export default function UserDetailsDialog({ open, onClose, user }) {
  const [fullUserData, setFullUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      const token = getToken();
      if (token) {
        setLoading(true);
        const fetchUser = user.type === 'lawyer' 
          ? usersService.getLawyerById(user.id)
          : usersService.getEmployeeById(user.id);
        
        fetchUser
          .then(res => {
            setFullUserData(res.data);
          })
          .catch(err => {
            console.error('Failed to fetch user details:', err);
            setFullUserData(user);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else if (!open) {
      setFullUserData(null);
    }
  }, [open, user]);

  if (!user) return null;
  const isLawyer = user.type === 'lawyer';
  const displayData = fullUserData || user;

  let specializationsList = [];
  if (isLawyer && displayData.specializations) {
    if (Array.isArray(displayData.specializations)) {
      specializationsList = displayData.specializations.map(s => s.name || s);
    } else if (typeof displayData.specializations === 'string') {
      specializationsList = displayData.specializations.split(',').map(s => s.trim());
    }
  }

  const certificateUrl = displayData.certificate_url || displayData.certificate || null;
  const fullCertificateUrl = buildImageUrl(certificateUrl);
  const imageUrl = buildImageUrl(displayData.image_url || displayData.photo || displayData.image);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: colors.lightBlack, color: colors.white, borderRadius: '16px', border: `1px solid ${alpha(colors.gold, 0.2)}` } }}>
      <DialogContent sx={{ p: 4, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, left: 8, color: colors.textSecondary }}>
          <CloseIcon />
        </IconButton>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: colors.gold }} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar src={imageUrl} sx={{ width: 120, height: 120, bgcolor: colors.gold, fontSize: 48, color: colors.black, mb: 2 }}>
                {displayData.name?.charAt(0) || ''}
              </Avatar>
              <Typography variant="h4" fontWeight="bold">{displayData.name}</Typography>
              <Typography color={colors.gold} variant="h6">
                {isLawyer ? (specializationsList.length > 0 ? specializationsList.join(', ') : displayData.specialty || '') : displayData.position}
              </Typography>
              <Chip label={displayData.status === 'active' ? 'Active' : 'Archived'} size="small" sx={{ bgcolor: displayData.status === 'active' ? alpha(colors.gold, 0.3) : '#555', color: colors.white, mt: 1 }} />
            </Box>
            <Divider sx={{ my: 2, borderColor: alpha(colors.white, 0.1) }} />
            <Grid container spacing={2} sx={{ textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <EmailOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                <Box>
                  <Typography color={colors.textSecondary} variant="body2">Email</Typography>
                  <Typography>{displayData.email || 'Not specified'}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <BadgeOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                <Box>
                  <Typography color={colors.textSecondary} variant="body2">Age</Typography>
                  <Typography>{displayData.age || 'Not specified'}</Typography>
                </Box>
              </Grid>
              {displayData.phone && (
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <PhoneOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                  <Box>
                    <Typography color={colors.textSecondary} variant="body2">Phone Number</Typography>
                    <Typography>{displayData.phone}</Typography>
                  </Box>
                </Grid>
              )}
              {displayData.address && (
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationOnOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                  <Box>
                    <Typography color={colors.textSecondary} variant="body2">Address</Typography>
                    <Typography>{displayData.address}</Typography>
                  </Box>
                </Grid>
              )}
              {isLawyer && specializationsList.length > 0 && (
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <GavelOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography color={colors.textSecondary} variant="body2" sx={{ mb: 1 }}>Specializations</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {specializationsList.map((spec, idx) => (
                        <Chip key={idx} label={spec} size="small" sx={{ bgcolor: alpha(colors.gold, 0.2), color: colors.gold, border: `1px solid ${alpha(colors.gold, 0.3)}` }} />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              )}
              {isLawyer && fullCertificateUrl && (
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <DescriptionOutlinedIcon sx={{ color: colors.gold, mt: 0.5 }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography color={colors.textSecondary} variant="body2" sx={{ mb: 1 }}>Lawyer Certificate</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      href={fullCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: colors.gold,
                        borderColor: colors.gold,
                        '&:hover': { borderColor: colors.darkGold, bgcolor: alpha(colors.gold, 0.1) }
                      }}
                      startIcon={<AttachFileIcon />}
                    >
                      View Certificate
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

