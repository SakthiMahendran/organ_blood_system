from .models import Hospital, HospitalStaffUser


def get_hospital_for_user(user):
    staff = HospitalStaffUser.objects.select_related("hospital").filter(user=user).first()
    return staff.hospital if staff else None


def ensure_hospital_staff_mapping(user):
    if not user or getattr(user, "user_type", "") != "HOSPITAL":
        return None

    staff = HospitalStaffUser.objects.select_related("hospital").filter(user=user).first()
    if staff:
        return staff.hospital

    license_id = f"AUTO-HOSP-{user.id:05d}"
    hospital_name = (user.username or user.email or "Hospital").strip()
    address_line_1 = user.address or "Address not provided"

    hospital, _ = Hospital.objects.get_or_create(
        license_id=license_id,
        defaults={
            "name": f"{hospital_name} Hospital",
            "institution_type": "Hospital",
            "email": user.email,
            "phone": user.phone,
            "address": address_line_1,
            "address_line_1": address_line_1,
            "city": user.city or "City",
            "state": user.state or "State",
            "approval_status": Hospital.APPROVED,
        },
    )

    HospitalStaffUser.objects.get_or_create(
        user=user,
        defaults={"hospital": hospital},
    )

    return hospital
