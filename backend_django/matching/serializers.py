from rest_framework import serializers

from .models import Match


class MatchSerializer(serializers.ModelSerializer):
    donor_email = serializers.EmailField(source="donor_user.email", read_only=True)

    class Meta:
        model = Match
        fields = ("id", "request", "donor_user", "donor_email", "match_score", "donor_response", "created_at")
