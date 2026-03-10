from django.db import models
from django.conf import settings


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
    organ_name = models.CharField(max_length=50, blank=True, null=True)   # only for organ
    blood_group = models.CharField(max_length=5, blank=True, null=True)   # only for blood
    quantity_ml = models.PositiveIntegerField(blank=True, null=True)       # blood amount in ml

    location = models.CharField(max_length=120, blank=True, null=True)
    hospital_name = models.CharField(max_length=120, blank=True, null=True)

    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.donor.username} - {self.donation_type} - {self.status}"
