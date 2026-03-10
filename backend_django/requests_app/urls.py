from django.urls import path

from . import views

urlpatterns = [
    path("blood", views.create_blood_request, name="create-blood-request"),
    path("organ", views.create_organ_request, name="create-organ-request"),
    path("emergency", views.emergency_requests, name="emergency-requests"),
    path("my", views.my_requests, name="my-requests"),
    path("<int:request_id>", views.request_detail, name="request-detail"),
    # SOS endpoints
    path("<int:request_id>/sos-broadcast", views.sos_broadcast, name="sos-broadcast"),
    path("<int:request_id>/sos-respond", views.sos_respond, name="sos-respond"),
    path("<int:request_id>/sos-tracker", views.sos_tracker, name="sos-tracker"),
]
