from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "user_type",
            "blood_group",
            "address",
            "city",
            "state",
            "is_active",
            "created_at",
            "updated_at",
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "phone",
            "password",
            "user_type",
            "blood_group",
            "address",
            "city",
            "state",
            "location",
        )

    def validate_user_type(self, value):
        normalized = (value or "").strip().upper()
        if normalized not in {User.ROLE_DONOR, User.ROLE_ACCEPTOR}:
            raise serializers.ValidationError("Public registration supports DONOR or ACCEPTOR only.")
        return normalized

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class HospitalRegisterSerializer(serializers.Serializer):
    role = serializers.CharField(default="hospital")
    hospital_name = serializers.CharField(max_length=180)
    registration_number = serializers.CharField(max_length=80)
    institution_type = serializers.ChoiceField(
        choices=[
            "Hospital",
            "Blood Bank",
            "Clinic",
            "Multi-speciality",
            "Government Hospital",
            "Private Hospital",
        ]
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)

    address_line_1 = serializers.CharField(max_length=255)
    address_line_2 = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(max_length=80)
    state = serializers.CharField(max_length=80)
    pincode = serializers.CharField(max_length=12)

    contact_person_name = serializers.CharField(max_length=120)
    contact_person_role = serializers.CharField(max_length=120)
    contact_person_phone = serializers.CharField(max_length=20)

    blood_bank_available = serializers.BooleanField(default=False)
    organ_transplant_support = serializers.BooleanField(default=False)
    emergency_response = serializers.BooleanField(default=False)
    supported_blood_groups = serializers.ListField(
        child=serializers.CharField(max_length=5),
        allow_empty=True,
    )

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    # Placeholder metadata until multipart upload is integrated.
    license_document_name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    hospital_id_proof_name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        role = (attrs.get("role") or "").strip().lower()
        if role and role != "hospital":
            raise serializers.ValidationError({"role": "role must be hospital."})

        return attrs


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Username or email")
    password = serializers.CharField(write_only=True)
