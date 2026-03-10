import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import {
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import EmptyState from './EmptyState';
import ListSkeleton from './ListSkeleton';
import { formatDateTime } from '../../utils/dateUtils';

const NotificationListPanel = ({
  title = 'Notifications',
  notifications,
  isLoading,
  onMarkRead,
  showMarkReadAction = true,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {title}
          </Typography>
          <ListSkeleton rows={5} />
        </CardContent>
      </Card>
    );
  }

  if (!notifications?.length) {
    return (
      <EmptyState
        title="No notifications"
        description="You are all caught up. New notifications will appear here."
      />
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        <List sx={{ py: 0 }}>
          {notifications.map((item) => (
            <ListItem
              key={item.id}
              divider
              secondaryAction={
                showMarkReadAction && !item.is_read ? (
                  <Button
                    startIcon={<MarkEmailReadRoundedIcon />}
                    size="small"
                    onClick={() => onMarkRead(item.id)}
                  >
                    Mark read
                  </Button>
                ) : null
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: item.is_read ? 600 : 800 }}>{item.title}</Typography>
                    {!item.is_read ? <Chip label="Unread" size="small" color="primary" /> : null}
                  </Stack>
                }
                secondary={`${item.message} • ${formatDateTime(item.created_at)}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default NotificationListPanel;
