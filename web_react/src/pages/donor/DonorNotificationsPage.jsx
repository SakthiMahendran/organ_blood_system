import { Stack, Typography } from '@mui/material';

import NotificationListPanel from '../../components/common/NotificationListPanel';
import { useNotifications } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';

const DonorNotificationsPage = () => {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const { showToast } = useToast();

  const handleMarkRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update notification.'), 'error');
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      showToast('All notifications marked as read.', 'success');
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to mark all notifications.'), 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Notifications</Typography>
      <NotificationListPanel
        notifications={notifications}
        isLoading={isLoading}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAll}
      />
    </Stack>
  );
};

export default DonorNotificationsPage;
