from rest_framework import serializers
from .models import Request


class RequestSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = Request
        fields = (
            "id",
            "created_by",
            "created_by_email",
            "request_type",
            "blood_group",
            "organ_type",
            "units_needed",
            "required_date",
            "urgency",
            "city",
            "state",
            "hospital",
            "status",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "status", "created_at", "updated_at")

    def validate(self, attrs):
        request_type = attrs.get("request_type", getattr(self.instance, "request_type", None))
        blood_group = attrs.get("blood_group", getattr(self.instance, "blood_group", None))
        units_needed = attrs.get("units_needed", getattr(self.instance, "units_needed", None))
        organ_type = attrs.get("organ_type", getattr(self.instance, "organ_type", None))

        if request_type == Request.BLOOD:
            if not blood_group:
                raise serializers.ValidationError({"blood_group": "blood_group is required for blood requests."})
            if not units_needed:
                raise serializers.ValidationError({"units_needed": "units_needed is required for blood requests."})
        elif request_type == Request.ORGAN:
            if not organ_type:
                raise serializers.ValidationError({"organ_type": "organ_type is required for organ requests."})
        return attrs


class RequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ("blood_group", "organ_type", "units_needed", "required_date", "urgency", "city", "state", "hospital", "notes")
