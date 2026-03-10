from django.db import models
from django.conf import settings

class RecipientProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipient_profile"
    )

    location = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)

    hospital_name = models.CharField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"RecipientProfile({self.user.username})"