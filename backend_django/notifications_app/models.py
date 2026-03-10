from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_MATCH_ALERT = "MATCH_ALERT"
    TYPE_REQUEST_UPDATE = "REQUEST_UPDATE"
    TYPE_VERIFY_STATUS = "VERIFY_STATUS"
    TYPE_SOS_ALERT = "SOS_ALERT"
    TYPE_SOS_RESPONSE = "SOS_RESPONSE"
    TYPE_COOLDOWN_REMINDER = "COOLDOWN_REMINDER"
    TYPE_MILESTONE = "MILESTONE"
    TYPE_IMPACT = "IMPACT"
    TYPE_ESCALATION = "ESCALATION"

    TYPE_CHOICES = (
        (TYPE_MATCH_ALERT, "Match Alert"),
        (TYPE_REQUEST_UPDATE, "Request Update"),
        (TYPE_VERIFY_STATUS, "Verification Status"),
        (TYPE_SOS_ALERT, "SOS Alert"),
        (TYPE_SOS_RESPONSE, "SOS Response"),
        (TYPE_COOLDOWN_REMINDER, "Cooldown Reminder"),
        (TYPE_MILESTONE, "Milestone"),
        (TYPE_IMPACT, "Impact"),
        (TYPE_ESCALATION, "Escalation"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=180)
    message = models.TextField()
    type = models.CharField(max_length=40, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    related_request = models.ForeignKey(
        "requests_app.Request",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="notifications",
    )
    metadata = models.JSONField(default=dict, blank=True)
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
