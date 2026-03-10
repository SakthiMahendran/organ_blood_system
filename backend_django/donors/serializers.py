from rest_framework import serializers
from .models import DonorProfile


class DonorProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    next_eligible_date = serializers.DateField(read_only=True)
    cooldown_remaining_days = serializers.IntegerField(read_only=True)
    is_cooldown_passed = serializers.BooleanField(read_only=True)
    milestone_badge = serializers.CharField(read_only=True, allow_null=True)
    next_milestone = serializers.DictField(read_only=True, allow_null=True)

    class Meta:
        model = DonorProfile
        fields = (
            "id",
            "user",
            "user_email",
            "blood_group",
            "organ_willing",
            "organ_types",
            "last_blood_donation_date",
            "last_donation_type",
            "total_donations",
            "donation_streak",
            "availability_status",
            "verification_status",
            "medical_notes",
            "city",
            "state",
            "updated_at",
            "next_eligible_date",
            "cooldown_remaining_days",
            "is_cooldown_passed",
            "milestone_badge",
            "next_milestone",
        )
        read_only_fields = ("id", "user", "verification_status", "updated_at", "total_donations", "donation_streak")

    def validate(self, attrs):
        organ_willing = attrs.get("organ_willing", getattr(self.instance, "organ_willing", False))
        organ_types = attrs.get("organ_types", getattr(self.instance, "organ_types", []))

        if organ_willing and not organ_types:
            raise serializers.ValidationError({"organ_types": "organ_types is required when organ_willing is true."})
        return attrs
