from django.urls import path

from . import views

urlpatterns = [
    path("profile", views.my_recipient_profile, name="recipient-profile"),
    path("profile/update", views.update_my_recipient_profile, name="recipient-profile-update"),
]
