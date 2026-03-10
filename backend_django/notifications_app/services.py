from .models import Notification


def create_notification(*, user, title: str, message: str, notification_type: str,
                        related_request=None, metadata=None):
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=notification_type,
        related_request=related_request,
        metadata=metadata or {},
    )
