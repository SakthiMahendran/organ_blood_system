from django.urls import path

from . import views

urlpatterns = [
    path("donors", views.search_donors, name="search-donors"),
]
