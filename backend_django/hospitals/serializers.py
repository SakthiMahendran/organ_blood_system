from rest_framework import serializers

from .models import Hospital, HospitalStaffUser


class HospitalSerializer(serializers.ModelSerializer):
    verification_status = serializers.CharField(source="approval_status", read_only=True)

    class Meta:
        model = Hospital
        fields = (
            "id",
            "name",
            "license_id",
            "institution_type",
            "email",
            "phone",
            "address",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "pincode",
            "contact_person_name",
            "contact_person_role",
            "contact_person_phone",
            "blood_bank_available",
            "organ_transplant_support",
            "emergency_response",
            "supported_blood_groups",
            "license_document_name",
            "hospital_id_proof_name",
            "approval_status",
            "verification_status",
            "created_at",
            "updated_at",
        )


class HospitalStaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalStaffUser
        fields = ("id", "hospital", "user", "created_at")
