from .models import Notification


def create_notification(*, user, title: str, message: str, notification_type: str):
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=notification_type,
    )
