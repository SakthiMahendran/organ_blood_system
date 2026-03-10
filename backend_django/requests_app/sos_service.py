import math

from django.utils import timezone

from donors.models import DonorProfile
from matching.services import is_blood_compatible, normalize_blood_group
from notifications_app.models import Notification
from notifications_app.services import create_notification


def _haversine_km(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lng points."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def broadcast_sos(request_obj, radius_km=15):
    """
    Find eligible donors and send SOS alerts for a CRITICAL request.
    Returns dict with donors_notified count and donor IDs.
    """
    req_group = normalize_blood_group(request_obj.blood_group)

    # Get all eligible donor profiles
    donors = DonorProfile.objects.select_related("user").filter(
        availability_status=DonorProfile.AVAILABLE,
        verification_status=DonorProfile.VERIFIED,
    )

    eligible_donors = []
    for donor in donors:
        # Check blood compatibility
        if req_group and not is_blood_compatible(donor.blood_group, req_group):
            continue

        # Check cooldown
        if not donor.is_cooldown_passed:
            continue

        # Check distance if coordinates are available
        donor_user = donor.user
        if (
            donor_user.latitude is not None
            and donor_user.longitude is not None
            and request_obj.created_by.latitude is not None
            and request_obj.created_by.longitude is not None
        ):
            dist = _haversine_km(
                donor_user.latitude, donor_user.longitude,
                request_obj.created_by.latitude, request_obj.created_by.longitude,
            )
            if dist > radius_km:
                continue

        eligible_donors.append(donor)

    # Send SOS notifications
    hospital_name = ""
    if request_obj.hospital:
        hospital_name = request_obj.hospital.name
    elif request_obj.city:
        hospital_name = request_obj.city

    notified_ids = []
    for donor in eligible_donors:
        create_notification(
            user=donor.user,
            title="SOS: Emergency Blood Needed!",
            message=(
                f"URGENT: {req_group or 'Any'} blood type needed at {hospital_name}. "
                f"Request #{request_obj.id} is CRITICAL. Please respond if you can help."
            ),
            notification_type=Notification.TYPE_SOS_ALERT,
            related_request=request_obj,
            metadata={
                "request_id": request_obj.id,
                "blood_group": req_group,
                "hospital": hospital_name,
                "urgency": request_obj.urgency,
            },
        )
        notified_ids.append(donor.user_id)

    return {
        "donors_notified": len(notified_ids),
        "donor_ids": notified_ids,
    }


def respond_to_sos(donor_user, request_id, response_value):
    """
    Record donor's response to an SOS alert.
    response_value: "coming" or "cannot_make_it"
    """
    notification = Notification.objects.filter(
        user=donor_user,
        type=Notification.TYPE_SOS_ALERT,
        related_request_id=request_id,
    ).first()

    if not notification:
        return None

    notification.metadata["response"] = response_value
    notification.metadata["responded_at"] = timezone.now().isoformat()
    notification.is_read = True
    notification.save()

    # Create response notification for request owner
    from requests_app.models import Request
    req = Request.objects.filter(id=request_id).first()
    if req:
        create_notification(
            user=req.created_by,
            title="SOS Response Received",
            message=f"Donor {donor_user.username} responded '{response_value}' to SOS for request #{request_id}.",
            notification_type=Notification.TYPE_SOS_RESPONSE,
            related_request=req,
            metadata={"donor_id": donor_user.id, "response": response_value},
        )

    return notification


def get_sos_tracker(request_id):
    """Get SOS response summary for a request."""
    notifications = Notification.objects.filter(
        type=Notification.TYPE_SOS_ALERT,
        related_request_id=request_id,
    ).select_related("user")

    total = notifications.count()
    coming = 0
    cannot = 0
    pending = 0

    responses = []
    for notif in notifications:
        resp = notif.metadata.get("response")
        responses.append({
            "donor_id": notif.user_id,
            "donor_name": notif.user.username,
            "response": resp or "pending",
            "responded_at": notif.metadata.get("responded_at"),
        })
        if resp == "coming":
            coming += 1
        elif resp == "cannot_make_it":
            cannot += 1
        else:
            pending += 1

    return {
        "total_notified": total,
        "coming": coming,
        "cannot_make_it": cannot,
        "pending": pending,
        "responses": responses,
    }
