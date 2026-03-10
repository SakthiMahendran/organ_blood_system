from rest_framework import serializers
from .models import RecipientProfile

class RecipientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipientProfile
        fields = "__all__"
        read_only_fields = ("id", "user", "created_at")