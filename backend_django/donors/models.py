from django.db import models
from django.conf import settings


class DonorProfile(models.Model):
    AVAILABLE = "AVAILABLE"
    NOT_AVAILABLE = "NOT_AVAILABLE"
    AVAILABILITY_CHOICES = (
        (AVAILABLE, "Available"),
        (NOT_AVAILABLE, "Not Available"),
    )

    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    VERIFICATION_CHOICES = (
        (PENDING, "Pending"),
        (VERIFIED, "Verified"),
        (REJECTED, "Rejected"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="donor_profile",
    )

    blood_group = models.CharField(max_length=5)
    organ_willing = models.BooleanField(default=False)
    organ_types = models.JSONField(default=list, blank=True)
    last_blood_donation_date = models.DateField(blank=True, null=True)
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default=AVAILABLE)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_CHOICES, default=PENDING)
    medical_notes = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["blood_group"]),
            models.Index(fields=["city"]),
            models.Index(fields=["verification_status"]),
            models.Index(fields=["availability_status"]),
        ]

    def __str__(self):
        return f"DonorProfile({self.user.username}, {self.blood_group})"
