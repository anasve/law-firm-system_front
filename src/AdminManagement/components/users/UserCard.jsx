import React from 'react';
import {
  Card, CardContent, CardActions, Divider, IconButton, Tooltip, Avatar, Typography
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { colors } from '../../constants';
import { buildImageUrl } from '../../utils/helpers';

const UserCardStyled = styled(Card)({ 
  background: colors.lightBlack, 
  color: colors.white, 
  borderRadius: '16px', 
  border: `1px solid ${alpha(colors.gold, 0.1)}`, 
  display: 'flex', 
  flexDirection: 'column', 
  height: '100%', 
  width: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease', 
  '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 10px 20px ${alpha(colors.black, 0.5)}` } 
});

export default function UserCard({ user, type, onEdit, onArchive, onUnarchive, onView, onDelete, isArchivedView = false }) {
  const isLawyer = type === 'lawyer';
  const isArchived = isArchivedView;
  const userImageUrl = buildImageUrl(user.image_url || user.photo || user.image);

  return (
    <UserCardStyled>
      <CardContent sx={{ flexGrow: 1, p: 1.5, textAlign: 'center' }}>
        <Avatar src={userImageUrl} sx={{ width: 64, height: 64, margin: '0 auto 8px', bgcolor: colors.gold, color: colors.black, fontSize: 24 }}>
          {user.name?.charAt(0) || ''}
        </Avatar>
        <Typography variant="h6" fontWeight="bold" noWrap sx={{ fontSize: '1rem', mb: 0.5 }}>
          {user.name}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 0, fontSize: '0.85rem' }}>
          Age: {user.age || 'Not specified'}
        </Typography>
        {isLawyer ? (
          <Typography variant="body2" color={colors.gold} sx={{ mb: 0.5, fontSize: '0.85rem' }} noWrap>
            {user.specialty || ''}
          </Typography>
        ) : (
          <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            {user.position || ''}
          </Typography>
        )}
      </CardContent>
      <Divider sx={{ borderColor: alpha(colors.gold, 0.1) }} />
      <CardActions sx={{ justifyContent: 'center', background: alpha(colors.black, 0.3), py: 1 }}>
        <Tooltip title="View Details">
          <IconButton onClick={() => onView(user, type)} size="small" sx={{ color: colors.textSecondary }}>
            <VisibilityOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit">
          <IconButton onClick={() => onEdit(user, type)} size="small" sx={{ color: colors.textSecondary }}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        {isArchived ? (
          <Tooltip title="Unarchive">
            <IconButton onClick={() => onUnarchive(user)} size="small" sx={{ color: '#66bb6a' }}>
              <UnarchiveOutlinedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Archive">
            <IconButton onClick={() => onArchive(user)} size="small" sx={{ color: colors.textSecondary }}>
              <ArchiveOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}

        {isArchivedView && (
          <Tooltip title="Delete Permanently">
            <IconButton onClick={() => onDelete(user, type)} size="small" sx={{ color: '#d32f2f' }}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </UserCardStyled>
  );
}

