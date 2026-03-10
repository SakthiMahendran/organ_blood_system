from datetime import date, timedelta

from django.conf import settings
from django.db import models


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

    WHOLE_BLOOD = "whole_blood"
    POWER_RED = "power_red"
    PLATELETS = "platelets"
    PLASMA = "plasma"
    DONATION_TYPE_CHOICES = (
        (WHOLE_BLOOD, "Whole Blood"),
        (POWER_RED, "Power Red"),
        (PLATELETS, "Platelets"),
        (PLASMA, "Plasma"),
    )

    COOLDOWN_DAYS = {
        WHOLE_BLOOD: 56,
        POWER_RED: 112,
        PLATELETS: 7,
        PLASMA: 28,
    }

    MILESTONE_BADGES = [
        (1, "First Drop"),
        (5, "Regular"),
        (10, "Champion"),
        (25, "Lifesaver"),
        (50, "Legend"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="donor_profile",
    )

    blood_group = models.CharField(max_length=5)
    organ_willing = models.BooleanField(default=False)
    organ_types = models.JSONField(default=list, blank=True)
    last_blood_donation_date = models.DateField(blank=True, null=True)
    last_donation_type = models.CharField(
        max_length=20, choices=DONATION_TYPE_CHOICES, blank=True, null=True
    )
    total_donations = models.PositiveIntegerField(default=0)
    donation_streak = models.PositiveIntegerField(default=0)
    last_streak_quarter = models.CharField(max_length=10, blank=True, null=True)
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

    @property
    def next_eligible_date(self):
        if not self.last_blood_donation_date:
            return None
        cooldown = self.COOLDOWN_DAYS.get(self.last_donation_type, 56)
        return self.last_blood_donation_date + timedelta(days=cooldown)

    @property
    def cooldown_remaining_days(self):
        eligible = self.next_eligible_date
        if eligible is None:
            return 0
        remaining = (eligible - date.today()).days
        return max(0, remaining)

    @property
    def is_cooldown_passed(self):
        return self.cooldown_remaining_days == 0

    @property
    def milestone_badge(self):
        badge = None
        for threshold, name in self.MILESTONE_BADGES:
            if self.total_donations >= threshold:
                badge = name
        return badge

    @property
    def next_milestone(self):
        for threshold, name in self.MILESTONE_BADGES:
            if self.total_donations < threshold:
                return {"name": name, "target": threshold, "remaining": threshold - self.total_donations}
        return None

    @property
    def is_eligible_for_sos(self):
        return (
            self.availability_status == self.AVAILABLE
            and self.verification_status == self.VERIFIED
            and self.is_cooldown_passed
        )
