from django.urls import path

from . import views

urlpatterns = [
    path("requests", views.hospital_requests, name="hospital-requests"),
    path("verifications/pending", views.pending_verifications, name="hospital-verifications-pending"),
    path("verifications/<int:donor_id>", views.update_verification, name="hospital-verification-update"),
    path("requests/<int:request_id>/status", views.update_request_status, name="hospital-request-status"),
]
