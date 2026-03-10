from datetime import date

from django.db import transaction

from donors.models import DonorProfile
from notifications_app.models import Notification
from notifications_app.services import create_notification
from requests_app.models import Request

from .models import Match


URGENCY_BOOST = {
    Request.CRITICAL: 15,
    Request.HIGH: 10,
    Request.MEDIUM: 5,
    Request.LOW: 0,
}

# Donor blood group -> compatible recipient blood groups.
BLOOD_COMPATIBILITY = {
    'O-': {'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'},
    'O+': {'O+', 'A+', 'B+', 'AB+'},
    'A-': {'A-', 'A+', 'AB-', 'AB+'},
    'A+': {'A+', 'AB+'},
    'B-': {'B-', 'B+', 'AB-', 'AB+'},
    'B+': {'B+', 'AB+'},
    'AB-': {'AB-', 'AB+'},
    'AB+': {'AB+'},
}


def normalize_blood_group(value: str | None) -> str:
    return (value or '').strip().upper()


def is_blood_compatible(donor_group: str | None, recipient_group: str | None) -> bool:
    donor = normalize_blood_group(donor_group)
    recipient = normalize_blood_group(recipient_group)
    if not donor or not recipient:
        return False
    return recipient in BLOOD_COMPATIBILITY.get(donor, set())


def _eligible_donors_for_request(request_obj: Request):
    qs = DonorProfile.objects.select_related('user').filter(
        availability_status=DonorProfile.AVAILABLE,
        verification_status=DonorProfile.VERIFIED,
    )

    if request_obj.request_type == Request.BLOOD:
        req_group = normalize_blood_group(request_obj.blood_group)
        return [p for p in qs if is_blood_compatible(p.blood_group, req_group)]

    organ_type = (request_obj.organ_type or '').strip().lower()
    qs = qs.filter(organ_willing=True)
    return [
        p for p in qs
        if any(str(item).strip().lower() == organ_type for item in (p.organ_types or []))
    ]


def _score_candidate(request_obj: Request, donor: DonorProfile) -> float:
    score = 0.0

    if donor.city and request_obj.city and donor.city.lower() == request_obj.city.lower():
        score += 25
    if donor.state and request_obj.state and donor.state.lower() == request_obj.state.lower():
        score += 10

    if donor.verification_status == DonorProfile.VERIFIED:
        score += 12
    if donor.availability_status == DonorProfile.AVAILABLE:
        score += 8

    if request_obj.request_type == Request.BLOOD:
        donor_group = normalize_blood_group(donor.blood_group)
        req_group = normalize_blood_group(request_obj.blood_group)
        if donor_group == req_group:
            score += 35
        elif is_blood_compatible(donor_group, req_group):
            score += 20

        if donor.last_blood_donation_date:
            days_since = (date.today() - donor.last_blood_donation_date).days
            if days_since > 90:
                score += 10
            elif days_since > 60:
                score += 4

    else:
        if donor.organ_willing:
            score += 10

        requested_organ = (request_obj.organ_type or '').strip().lower()
        if requested_organ and any(str(item).strip().lower() == requested_organ for item in (donor.organ_types or [])):
            score += 30

    score += URGENCY_BOOST.get(request_obj.urgency, 0)
    return round(max(0.0, min(100.0, score)), 2)


@transaction.atomic
def run_matching(request_obj: Request, limit: int = 20):
    if request_obj.status in {Request.CANCELLED, Request.FULFILLED}:
        return []

    # Move to MATCHING only for early lifecycle states.
    # If a request is already APPROVED, keep that status while generating matches.
    if request_obj.status in {Request.DRAFT, Request.SUBMITTED}:
        request_obj.status = Request.MATCHING
        request_obj.save(update_fields=['status', 'updated_at'])

    candidates = _eligible_donors_for_request(request_obj)
    scored = [(candidate, _score_candidate(request_obj, candidate)) for candidate in candidates]
    scored.sort(key=lambda item: item[1], reverse=True)

    matches = []
    for donor, score in scored[:limit]:
        match, _ = Match.objects.update_or_create(
            request=request_obj,
            donor_user=donor.user,
            defaults={'match_score': score, 'donor_response': Match.PENDING},
        )
        matches.append(match)

        create_notification(
            user=donor.user,
            title='New donation match',
            message=f'A new request may match your profile (request #{request_obj.id}).',
            notification_type=Notification.TYPE_MATCH_ALERT,
        )

    return matches
