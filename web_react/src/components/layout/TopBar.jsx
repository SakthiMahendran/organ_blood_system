import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import {
  alpha,
  AppBar,
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useColorMode } from '../../contexts/ColorModeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { showToast } = useToast();

  const [anchorEl, setAnchorEl] = useState(null);

  const recentNotifications = useMemo(() => notifications.slice(0, 6), [notifications]);

  const handleMarkRead = async (notificationId) => {
    try { await markAsRead(notificationId); }
    catch (error) { showToast(getErrorMessage(error, 'Failed to update notification.'), 'error'); }
  };

  const handleMarkAll = async () => {
    try { await markAllAsRead(); showToast('All notifications marked as read.', 'success'); }
    catch (error) { showToast(getErrorMessage(error, 'Failed to mark all notifications.'), 'error'); }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={(theme) => ({
        bgcolor: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.82)
          : alpha('#fff', 0.82),
        backdropFilter: 'blur(16px) saturate(1.4)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      })}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 60 } }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={onMenuClick} sx={{ display: { md: 'none' }, color: 'text.primary' }}>
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, display: { xs: 'none', sm: 'block' } }}>
            Dashboard
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.25}>
          {/* User info */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
              {user?.username || user?.email || ''}
            </Typography>
          </Box>

          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleColorMode} sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightModeRoundedIcon sx={{ fontSize: 20 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.secondary' }}>
              <Badge color="error" badgeContent={unreadCount} max={99}
                sx={{ '& .MuiBadge-badge': { fontSize: '0.62rem', minWidth: 17, height: 17 } }}>
                <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.75, my: 1.5 }} />

          <Tooltip title="Sign out">
            <IconButton onClick={() => logout()} sx={{ color: 'text.secondary' }}>
              <LogoutRoundedIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 24px)', mt: 0.5, borderRadius: 3 } } }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }} onClick={handleMarkAll}>
              Mark all read
            </Typography>
          </Stack>
          <Divider />
          <List sx={{ py: 0, maxHeight: 340, overflowY: 'auto' }}>
            {recentNotifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="No notifications yet" primaryTypographyProps={{ color: 'text.secondary', fontSize: 14 }} />
              </ListItem>
            ) : (
              recentNotifications.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton onClick={() => handleMarkRead(item.id)}
                    sx={(theme) => ({ py: 1.25, bgcolor: item.is_read ? 'transparent' : alpha(theme.palette.primary.main, 0.03) })}>
                    {!item.is_read && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mr: 1.5, flexShrink: 0 }} />}
                    <ListItemText
                      primary={item.title}
                      secondary={item.message}
                      primaryTypographyProps={{ fontWeight: item.is_read ? 500 : 700, fontSize: 13 }}
                      secondaryTypographyProps={{
                        fontSize: 12,
                        sx: { overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
