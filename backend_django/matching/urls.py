from django.urls import path
from . import views

urlpatterns = [
    path("run", views.run_matching_view, name="run-matching"),
    path("candidates", views.matching_candidates, name="matching-candidates"),
    path("results/<int:request_id>", views.match_results_view, name="match-results"),
    path("respond/<int:match_id>", views.donor_response_view, name="donor-response"),
    path("search", views.search_donors, name="search-donors"),
]
