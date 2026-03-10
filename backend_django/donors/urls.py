from django.urls import path

from . import views

urlpatterns = [
    path("profile", views.donor_profile, name="donor-profile"),
    path("availability", views.donor_availability, name="donor-availability"),
    path("matches", views.donor_matches, name="donor-matches"),
    path("matches/<int:match_id>/respond", views.respond_to_match, name="donor-match-respond"),
]
