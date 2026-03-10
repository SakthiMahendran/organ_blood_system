from django.conf import settings
from django.db import models
from django.utils import timezone


class Request(models.Model):
    BLOOD = "BLOOD"
    ORGAN = "ORGAN"
    REQUEST_TYPE_CHOICES = (
        (BLOOD, "Blood"),
        (ORGAN, "Organ"),
    )

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    URGENCY_CHOICES = (
        (LOW, "Low"),
        (MEDIUM, "Medium"),
        (HIGH, "High"),
        (CRITICAL, "Critical"),
    )

    URGENCY_WEIGHTS = {
        LOW: 10,
        MEDIUM: 30,
        HIGH: 60,
        CRITICAL: 100,
    }

    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    MATCHING = "MATCHING"
    MATCHED = "MATCHED"
    APPROVED = "APPROVED"
    FULFILLED = "FULFILLED"
    CANCELLED = "CANCELLED"

    STATUS_CHOICES = (
        (DRAFT, "Draft"),
        (SUBMITTED, "Submitted"),
        (MATCHING, "Matching"),
        (MATCHED, "Matched"),
        (APPROVED, "Approved"),
        (FULFILLED, "Fulfilled"),
        (CANCELLED, "Cancelled"),
    )

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="requests")
    request_type = models.CharField(max_length=10, choices=REQUEST_TYPE_CHOICES)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    organ_type = models.CharField(max_length=80, blank=True, null=True)
    units_needed = models.PositiveIntegerField(blank=True, null=True)
    required_date = models.DateField(blank=True, null=True)
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default=MEDIUM)
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    hospital = models.ForeignKey(
        "hospitals.Hospital",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="requests",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=SUBMITTED)
    notes = models.TextField(blank=True, null=True)

    # Priority routing fields
    priority_score = models.FloatField(default=0, db_index=True)
    original_urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, blank=True, null=True)
    escalated_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["request_type"]),
            models.Index(fields=["urgency"]),
            models.Index(fields=["city"]),
            models.Index(fields=["created_by"]),
            models.Index(fields=["-priority_score"]),
        ]

    def __str__(self):
        return f"Request({self.id}, {self.request_type}, {self.status})"

    def compute_priority_score(self):
        urgency_weight = self.URGENCY_WEIGHTS.get(self.urgency, 30)

        hours_waiting = 0
        if self.created_at:
            delta = timezone.now() - self.created_at
            hours_waiting = delta.total_seconds() / 3600
        time_penalty = min(40, (hours_waiting / 12) * 5)

        units_factor = min(20, (self.units_needed or 1) * 2)

        return round(urgency_weight + time_penalty + units_factor, 2)

    def save(self, *args, **kwargs):
        if not kwargs.pop("skip_priority", False):
            self.priority_score = self.compute_priority_score()
        super().save(*args, **kwargs)
