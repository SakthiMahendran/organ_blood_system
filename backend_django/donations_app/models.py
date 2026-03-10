import uuid
from datetime import date, timedelta

from django.conf import settings
from django.db import models


class Donation(models.Model):
    DONATION_TYPE_CHOICES = (
        ('blood', 'Blood'),
        ('organ', 'Organ'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )

    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donations'
    )

    donation_type = models.CharField(max_length=10, choices=DONATION_TYPE_CHOICES)
    organ_name = models.CharField(max_length=50, blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    quantity_ml = models.PositiveIntegerField(blank=True, null=True)

    location = models.CharField(max_length=120, blank=True, null=True)
    hospital_name = models.CharField(max_length=120, blank=True, null=True)

    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.donor.username} - {self.donation_type} - {self.status}"


class BloodUnit(models.Model):
    WHOLE_BLOOD = "whole_blood"
    PACKED_RBC = "packed_rbc"
    PLATELETS = "platelets"
    FFP = "ffp"
    COMPONENT_CHOICES = (
        (WHOLE_BLOOD, "Whole Blood"),
        (PACKED_RBC, "Packed RBCs"),
        (PLATELETS, "Platelets"),
        (FFP, "Fresh Frozen Plasma"),
    )

    SHELF_LIFE_DAYS = {
        WHOLE_BLOOD: 35,
        PACKED_RBC: 42,
        PLATELETS: 5,
        FFP: 365,
    }

    AVAILABLE = "available"
    RESERVED = "reserved"
    USED = "used"
    EXPIRED = "expired"
    DISCARDED = "discarded"
    STATUS_CHOICES = (
        (AVAILABLE, "Available"),
        (RESERVED, "Reserved"),
        (USED, "Used"),
        (EXPIRED, "Expired"),
        (DISCARDED, "Discarded"),
    )

    unit_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    blood_group = models.CharField(max_length=5)
    component_type = models.CharField(max_length=20, choices=COMPONENT_CHOICES, default=WHOLE_BLOOD)
    donation = models.ForeignKey(Donation, on_delete=models.SET_NULL, blank=True, null=True, related_name="blood_units")
    collection_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=AVAILABLE)
    hospital_name = models.CharField(max_length=120)
    location = models.CharField(max_length=120, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["blood_group", "status"]),
            models.Index(fields=["expiry_date"]),
            models.Index(fields=["hospital_name"]),
        ]

    def __str__(self):
        return f"{self.unit_id} - {self.blood_group} ({self.component_type})"

    def save(self, *args, **kwargs):
        if not self.expiry_date:
            shelf_life = self.SHELF_LIFE_DAYS.get(self.component_type, 35)
            self.expiry_date = self.collection_date + timedelta(days=shelf_life)
        super().save(*args, **kwargs)

    @property
    def days_until_expiry(self):
        return (self.expiry_date - date.today()).days

    @property
    def expiry_status(self):
        days = self.days_until_expiry
        if days < 0:
            return "EXPIRED"
        if days < 3:
            return "RED"
        if days < 7:
            return "AMBER"
        return "GREEN"


class RedistributionSuggestion(models.Model):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    STATUS_CHOICES = (
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
        (COMPLETED, "Completed"),
    )

    source_hospital = models.CharField(max_length=120)
    target_hospital = models.CharField(max_length=120)
    blood_group = models.CharField(max_length=5)
    suggested_units = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        blank=True, null=True, related_name="reviewed_redistributions"
    )

    def __str__(self):
        return f"{self.source_hospital} -> {self.target_hospital} ({self.blood_group} x{self.suggested_units})"
