from rest_framework import serializers
from .models import Donation


class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source="donor.username", read_only=True)

    class Meta:
        model = Donation
        fields = "__all__"
        read_only_fields = ("id", "donor", "created_at", "updated_at")

    def validate(self, data):
        donation_type = data.get("donation_type")
        if donation_type == "organ" and not data.get("organ_name"):
            raise serializers.ValidationError({"organ_name": "Organ name is required for organ donations."})
        if donation_type == "blood" and not data.get("blood_group"):
            raise serializers.ValidationError({"blood_group": "Blood group is required for blood donations."})
        return data
