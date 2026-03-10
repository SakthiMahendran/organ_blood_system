from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_MATCH_ALERT = "MATCH_ALERT"
    TYPE_REQUEST_UPDATE = "REQUEST_UPDATE"
    TYPE_VERIFY_STATUS = "VERIFY_STATUS"

    TYPE_CHOICES = (
        (TYPE_MATCH_ALERT, "Match Alert"),
        (TYPE_REQUEST_UPDATE, "Request Update"),
        (TYPE_VERIFY_STATUS, "Verification Status"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=180)
    message = models.TextField()
    type = models.CharField(max_length=40, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.user_id} - {self.type}"
