import { Stack, Typography } from '@mui/material';

import NotificationListPanel from '../../components/common/NotificationListPanel';
import { useNotifications } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';

const AcceptorNotificationsPage = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const { showToast } = useToast();

  const handleMarkRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      showToast('Notification marked as read.', 'success');
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update notification.'), 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Notifications</Typography>
      <NotificationListPanel notifications={notifications} isLoading={isLoading} onMarkRead={handleMarkRead} />
    </Stack>
  );
};

export default AcceptorNotificationsPage;
