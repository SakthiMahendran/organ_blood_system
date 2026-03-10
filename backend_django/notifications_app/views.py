from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    notifications = Notification.objects.filter(user=request.user)[:200]
    return Response({"success": True, "data": NotificationSerializer(notifications, many=True).data})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_read(request, notification_id):
    notification = Notification.objects.filter(id=notification_id, user=request.user).first()
    if not notification:
        return Response(
            {
                "success": False,
                "error": {"code": "NOT_FOUND", "message": "Notification not found"},
            },
            status=404,
        )

    notification.is_read = True
    notification.save(update_fields=["is_read"])
    return Response({"success": True, "data": {"id": notification.id, "is_read": True}})
