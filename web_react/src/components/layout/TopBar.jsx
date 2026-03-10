import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import {
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
    try {
      await markAsRead(notificationId);
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to update notification.'), 'error');
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      showToast('All notifications marked as read.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to mark all notifications.'), 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18, 33, 52, 0.92)' : 'rgba(15, 28, 47, 0.88)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton color="inherit" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
            <MenuRoundedIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Organ & Blood Bank
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.75)">
              Role: {user?.user_type || 'N/A'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)}>
              <Badge color="error" badgeContent={unreadCount} max={99}>
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { width: 360, maxWidth: 'calc(100vw - 24px)' } }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">Notifications</Typography>
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 700 }}
              onClick={handleMarkAll}
            >
              Mark all read
            </Typography>
          </Stack>
          <Divider />
          <List sx={{ py: 0 }}>
            {recentNotifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="No notifications yet" />
              </ListItem>
            ) : (
              recentNotifications.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton onClick={() => handleMarkRead(item.id)}>
                    <ListItemText
                      primary={item.title}
                      secondary={item.message}
                      primaryTypographyProps={{
                        fontWeight: item.is_read ? 500 : 700,
                        fontSize: 14,
                      }}
                      secondaryTypographyProps={{
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        },
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
