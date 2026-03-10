from django.urls import path

from . import views

urlpatterns = [
    path("blood", views.create_blood_request, name="create-blood-request"),
    path("organ", views.create_organ_request, name="create-organ-request"),
    path("emergency", views.emergency_requests, name="emergency-requests"),
    path("my", views.my_requests, name="my-requests"),
    path("<int:request_id>", views.request_detail, name="request-detail"),
]
