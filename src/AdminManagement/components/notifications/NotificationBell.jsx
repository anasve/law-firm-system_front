import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, Box, Typography, Button, Divider, List, ListItem, ListItemText, ListItemButton, CircularProgress, Tooltip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { colors } from '../../constants';
import { notificationsService } from '../../services';

const NotificationPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: colors.black,
    border: `1px solid ${alpha(colors.gold, 0.2)}`,
    borderRadius: '12px',
    minWidth: '380px',
    maxWidth: '420px',
    maxHeight: '600px',
    marginTop: '8px',
  },
}));

const NotificationItem = styled(ListItemButton)(({ theme, unread }) => ({
  backgroundColor: unread ? alpha(colors.gold, 0.05) : 'transparent',
  borderLeft: unread ? `3px solid ${colors.gold}` : 'none',
  padding: theme.spacing(1.5, 2),
  margin: theme.spacing(0.5, 1),
  borderRadius: '8px',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(colors.gold, 0.1),
  },
}));

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsService.getUnreadCount();
      setUnreadCount(response.data?.count || response.data?.unread_count || 0);
    } catch (error) {
      // If endpoint doesn't exist (404), silently fail
      if (error.response?.status === 404) {
        console.warn('Notifications endpoint not implemented in backend');
        setUnreadCount(0);
      } else {
        console.error('Failed to fetch unread count:', error);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.getNotifications({ limit: 10 });
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.notifications || []);
      setNotifications(data);
    } catch (error) {
      // If endpoint doesn't exist (404), silently fail
      if (error.response?.status === 404) {
        console.warn('Notifications endpoint not implemented in backend');
        setNotifications([]);
      } else {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isUnread = (notification) => {
    return !notification.read_at;
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          sx={{
            color: colors.white,
            '&:hover': {
              backgroundColor: alpha(colors.gold, 0.1),
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? (
              <NotificationsIcon sx={{ color: colors.gold }} />
            ) : (
              <NotificationsNoneIcon sx={{ color: colors.white }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: colors.white, fontWeight: 'bold' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{
                  color: colors.gold,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha(colors.gold, 0.1),
                  },
                }}
              >
                Mark all as read
              </Button>
            )}
          </Box>

          <Divider sx={{ borderColor: alpha(colors.gold, 0.2), mb: 1 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} sx={{ color: colors.gold }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" sx={{ color: alpha(colors.white, 0.6) }}>
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  unread={isUnread(notification)}
                  onClick={() => {
                    if (isUnread(notification)) {
                      handleMarkAsRead(notification.id);
                    }
                    handleClose();
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: isUnread(notification) ? colors.white : alpha(colors.white, 0.7),
                          fontWeight: isUnread(notification) ? 'bold' : 'normal',
                          mb: 0.5,
                        }}
                      >
                        {notification.data?.title || notification.title || 'Notification'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha(colors.white, 0.6),
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {notification.data?.message || notification.message || notification.body || ''}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha(colors.gold, 0.7),
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formatTime(notification.created_at || notification.created_at)}
                        </Typography>
                      </>
                    }
                  />
                </NotificationItem>
              ))}
            </List>
          )}
        </Box>
      </NotificationPopover>
    </>
  );
}

