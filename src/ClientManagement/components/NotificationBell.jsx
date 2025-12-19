import React, { useState, useEffect, useRef } from 'react';
import { Badge, IconButton, Popover, Box, Typography, Button, Divider, List, ListItemButton, CircularProgress, Tooltip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { colors } from '../../AdminManagement/constants';
import { notificationsService } from '../services';

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
  const [allMarkedAsRead, setAllMarkedAsRead] = useState(false);
  const allMarkedAsReadRef = useRef(false);

  const open = Boolean(anchorEl);
  
  // Keep ref in sync with state
  useEffect(() => {
    allMarkedAsReadRef.current = allMarkedAsRead;
  }, [allMarkedAsRead]);

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

  // Update unread count when popover opens (user views notifications)
  useEffect(() => {
    if (open) {
      // Refresh unread count when user opens the notifications popover
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [open]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsService.getUnreadCount();
      // Use unread_count from API response (Laravel returns it)
      const count = response.data?.unread_count || response.data?.count || 0;
      // If we marked all as read, keep count at 0 unless there are truly new notifications
      // Use ref to get the latest value (avoid closure issues)
      if (allMarkedAsReadRef.current) {
        // Calculate from local notifications to ensure accuracy
        const localCount = notifications.filter(n => !n.read_at).length;
        // If local count is 0, keep it at 0 (we marked all as read)
        // If local count > 0, it means new notifications arrived, so use API count
        if (localCount === 0) {
          setUnreadCount(0);
        } else {
          // New notifications arrived after marking all as read
          setUnreadCount(count);
          setAllMarkedAsRead(false);
        }
      } else {
        setUnreadCount(count);
        // Update flag based on count
        if (count === 0) {
          setAllMarkedAsRead(true);
        }
      }
    } catch (error) {
      // If endpoint doesn't exist (404), silently calculate from local notifications
      if (error.response?.status === 404) {
        // Endpoint not implemented in backend - handle silently
        const localCount = notifications.filter(n => !n.read_at).length;
        setUnreadCount(localCount);
        setAllMarkedAsRead(localCount === 0);
      } else {
        // Log detailed error information
        console.error('Failed to fetch unread count:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          response: error.response?.data,
        });
        // Fallback to local count
        const localCount = notifications.filter(n => !n.read_at).length;
        setUnreadCount(localCount);
        setAllMarkedAsRead(localCount === 0);
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
      // Merge with existing notifications to preserve read_at status
      setNotifications(prev => {
        const prevMap = new Map(prev.map(n => [n.id, n]));
        const merged = data.map(n => {
          const existing = prevMap.get(n.id);
          // If notification was marked as read locally but API doesn't have read_at, preserve it
          if (existing?.read_at && !n.read_at) {
            return { ...n, read_at: existing.read_at };
          }
          return n;
        });
        // Calculate unread count from merged notifications
        const localUnreadCount = merged.filter(n => !n.read_at).length;
        // If we marked all as read, ensure all notifications have read_at
        // Use ref to get the latest value (avoid closure issues)
        if (allMarkedAsReadRef.current && localUnreadCount > 0) {
          // Force all notifications to have read_at
          const readTimestamp = new Date().toISOString();
          const allRead = merged.map(n => ({ ...n, read_at: n.read_at || readTimestamp }));
          setUnreadCount(0);
          return allRead;
        }
        // Otherwise use local calculation
        setUnreadCount(localUnreadCount);
        // Update flag based on local count
        if (localUnreadCount === 0) {
          setAllMarkedAsRead(true);
        } else {
          setAllMarkedAsRead(false);
        }
        return merged;
      });
    } catch (error) {
      // If endpoint doesn't exist (404), silently fail
      if (error.response?.status === 404) {
        // Endpoint not implemented in backend - handle silently
        setNotifications([]);
        setUnreadCount(0);
      } else {
        // Log detailed error information
        console.error('Failed to fetch notifications:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          response: error.response?.data,
        });
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Fetch both notifications and unread count when opening
    fetchNotifications();
    fetchUnreadCount();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationsService.markAsRead(id);
      // Update local state immediately for better UX
      const readTimestamp = new Date().toISOString();
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: readTimestamp } : n)
      );
      // Use unread_count from API response (Laravel returns it)
      if (response.data?.unread_count !== undefined) {
        setUnreadCount(response.data.unread_count);
      } else {
        // Fallback: recalculate from local notifications
        setNotifications(prev => {
          const updated = prev.map(n => n.id === id ? { ...n, read_at: readTimestamp } : n);
          const unreadCount = updated.filter(n => !n.read_at).length;
          setUnreadCount(unreadCount);
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Set flag to indicate all notifications are marked as read
      setAllMarkedAsRead(true);
      
      const response = await notificationsService.markAllAsRead();
      // Update local state immediately for better UX
      const readTimestamp = new Date().toISOString();
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, read_at: n.read_at || readTimestamp }));
        // Ensure unread count is 0 after marking all as read
        setUnreadCount(0);
        return updated;
      });
      // Use unread_count from API response if available (Laravel returns it)
      if (response.data?.unread_count !== undefined) {
        setUnreadCount(response.data.unread_count);
      } else {
        setUnreadCount(0);
      }
      // Refresh notifications from server, but preserve read_at for all notifications
      // fetchNotifications will use allMarkedAsRead flag to ensure count stays 0
      await fetchNotifications();
      // Double check: force unread count to 0 after marking all as read
      setUnreadCount(0);
      // Also refresh unread count to ensure consistency
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Still update UI optimistically if API call fails
      const readTimestamp = new Date().toISOString();
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, read_at: n.read_at || readTimestamp }));
        setUnreadCount(0);
        return updated;
      });
      setAllMarkedAsRead(true);
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
                  <Box sx={{ width: '100%' }}>
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
                  </Box>
                </NotificationItem>
              ))}
            </List>
          )}
        </Box>
      </NotificationPopover>
    </>
  );
}

