import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import EmptyState from './EmptyState';
import ListSkeleton from './ListSkeleton';
import { formatDateTime } from '../../utils/dateUtils';

const TYPE_ICON = {
  SOS_ALERT: { Icon: CampaignRoundedIcon, color: 'error' },
  MATCH: { Icon: FavoriteRoundedIcon, color: 'primary' },
  STATUS_UPDATE: { Icon: TaskAltRoundedIcon, color: 'success' },
  MILESTONE: { Icon: TaskAltRoundedIcon, color: 'secondary' },
  COOLDOWN_REMINDER: { Icon: NotificationsActiveRoundedIcon, color: 'warning' },
};

function getTypeConfig(item) {
  const key = Object.keys(TYPE_ICON).find((k) =>
    item.notification_type?.includes(k) || item.title?.toUpperCase().includes(k.replace('_', ' ')),
  );
  return TYPE_ICON[key] || { Icon: InfoRoundedIcon, color: 'primary' };
}

const NotificationListPanel = ({
  notifications,
  isLoading,
  onMarkRead,
  onMarkAllRead,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <ListSkeleton rows={5} />
        </CardContent>
      </Card>
    );
  }

  if (!notifications?.length) {
    return (
      <EmptyState
        icon={NotificationsActiveRoundedIcon}
        title="No notifications"
        description="You're all caught up. New notifications will appear here."
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Card>
      <CardContent sx={{ pb: '12px !important' }}>
        {onMarkAllRead && unreadCount > 0 && (
          <>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <Button
                size="small"
                startIcon={<MarkEmailReadRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={onMarkAllRead}
                sx={{ fontSize: '0.78rem' }}
              >
                Mark all read ({unreadCount})
              </Button>
            </Stack>
            <Divider sx={{ mb: 0 }} />
          </>
        )}
        <List sx={{ py: 0 }}>
          {notifications.map((item) => {
            const { Icon, color } = getTypeConfig(item);
            return (
              <ListItem
                key={item.id}
                sx={(theme) => ({
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  py: 1.5,
                  px: 0,
                  bgcolor: item.is_read ? 'transparent' : alpha(theme.palette.primary.main, 0.03),
                  transition: 'background-color 0.2s ease',
                  '&:last-child': { borderBottom: 'none' },
                })}
                secondaryAction={
                  !item.is_read && onMarkRead ? (
                    <Button
                      startIcon={<MarkEmailReadRoundedIcon sx={{ fontSize: 15 }} />}
                      size="small"
                      onClick={() => onMarkRead(item.id)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Read
                    </Button>
                  ) : null
                }
              >
                <Avatar
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    mr: 1.5,
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
                  })}
                >
                  <Icon sx={{ fontSize: 17, color: `${color}.main` }} />
                </Avatar>
                {!item.is_read && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mr: 1, flexShrink: 0 }} />
                )}
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: item.is_read ? 500 : 700, fontSize: '0.875rem' }}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                      {item.message} &middot; {formatDateTime(item.created_at)}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default NotificationListPanel;
