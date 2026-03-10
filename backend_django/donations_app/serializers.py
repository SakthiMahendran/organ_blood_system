from rest_framework import serializers
from .models import BloodUnit, Donation, RedistributionSuggestion


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


class BloodUnitSerializer(serializers.ModelSerializer):
    days_until_expiry = serializers.IntegerField(read_only=True)
    expiry_status = serializers.CharField(read_only=True)

    class Meta:
        model = BloodUnit
        fields = (
            "id", "unit_id", "blood_group", "component_type", "donation",
            "collection_date", "expiry_date", "status", "hospital_name",
            "location", "created_at", "days_until_expiry", "expiry_status",
        )
        read_only_fields = ("id", "unit_id", "expiry_date", "created_at")


class RedistributionSuggestionSerializer(serializers.ModelSerializer):
    reviewed_by_email = serializers.EmailField(source="reviewed_by.email", read_only=True, allow_null=True)

    class Meta:
        model = RedistributionSuggestion
        fields = "__all__"
        read_only_fields = ("id", "created_at", "reviewed_at", "reviewed_by")
