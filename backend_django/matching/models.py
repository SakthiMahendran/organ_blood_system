from django.conf import settings
from django.db import models


class Match(models.Model):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"

    RESPONSE_CHOICES = (
        (PENDING, "Pending"),
        (ACCEPTED, "Accepted"),
        (DECLINED, "Declined"),
    )

    request = models.ForeignKey("requests_app.Request", on_delete=models.CASCADE, related_name="matches")
    donor_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches")
    match_score = models.FloatField(default=0.0)
    donor_response = models.CharField(max_length=12, choices=RESPONSE_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["request", "donor_user"], name="unique_request_donor_match")]
        indexes = [
            models.Index(fields=["request"]),
            models.Index(fields=["donor_user"]),
            models.Index(fields=["donor_response"]),
        ]

    def __str__(self):
        return f"Match(request={self.request_id}, donor={self.donor_user_id}, score={self.match_score})"
