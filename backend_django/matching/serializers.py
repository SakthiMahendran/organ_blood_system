from rest_framework import serializers

from .models import Match


class RequestSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    request_type = serializers.CharField()
    blood_group = serializers.CharField(allow_null=True)
    organ_type = serializers.CharField(allow_null=True)
    urgency = serializers.CharField()
    hospital_name = serializers.SerializerMethodField()

    def get_hospital_name(self, obj):
        try:
            return obj.hospital.name if obj.hospital else None
        except Exception:
            return None


class MatchSerializer(serializers.ModelSerializer):
    donor_email = serializers.EmailField(source="donor_user.email", read_only=True)
    request_details = RequestSummarySerializer(source="request", read_only=True)

    class Meta:
        model = Match
        fields = ("id", "request", "donor_user", "donor_email", "match_score", "donor_response", "created_at", "request_details")
