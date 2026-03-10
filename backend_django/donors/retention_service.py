from datetime import date

from notifications_app.models import Notification
from notifications_app.services import create_notification

from .models import DonorProfile


def _get_quarter(d):
    """Return quarter string like '2026-Q1'."""
    return f"{d.year}-Q{(d.month - 1) // 3 + 1}"


def update_donation_stats(donor_profile):
    """Recalculate total_donations and update streak after a new donation."""
    from donations_app.models import Donation

    total = Donation.objects.filter(
        donor=donor_profile.user, status="completed"
    ).count()
    donor_profile.total_donations = total

    # Update streak
    current_quarter = _get_quarter(date.today())
    if donor_profile.last_streak_quarter:
        if donor_profile.last_streak_quarter == current_quarter:
            pass  # Already counted this quarter
        else:
            # Check if consecutive quarter
            last_q = donor_profile.last_streak_quarter
            last_year, last_q_num = int(last_q[:4]), int(last_q[-1])
            curr_year, curr_q_num = int(current_quarter[:4]), int(current_quarter[-1])

            expected_year = last_year + (1 if last_q_num == 4 else 0)
            expected_q = (last_q_num % 4) + 1

            if curr_year == expected_year and curr_q_num == expected_q:
                donor_profile.donation_streak += 1
            else:
                donor_profile.donation_streak = 1
            donor_profile.last_streak_quarter = current_quarter
    else:
        donor_profile.donation_streak = 1
        donor_profile.last_streak_quarter = current_quarter

    donor_profile.save(update_fields=[
        "total_donations", "donation_streak", "last_streak_quarter", "updated_at"
    ])

    check_and_send_milestone(donor_profile)


def check_and_send_milestone(donor_profile):
    """Send MILESTONE notification if a threshold was crossed."""
    for threshold, name in DonorProfile.MILESTONE_BADGES:
        if donor_profile.total_donations == threshold:
            create_notification(
                user=donor_profile.user,
                title=f"Milestone unlocked: {name}!",
                message=f"Congratulations! You've reached {threshold} donations and earned the '{name}' badge.",
                notification_type=Notification.TYPE_MILESTONE,
                metadata={"badge": name, "total_donations": threshold},
            )
            break


def generate_impact_message(donation, hospital_name=None):
    """
    When a donated unit is used, create an IMPACT notification.
    Called when a BloodUnit linked to a donation is marked 'used'.
    """
    donor_user = donation.donor
    hospital = hospital_name or donation.hospital_name or "a hospital"
    donation_date = donation.created_at.strftime("%B %d, %Y") if donation.created_at else "recently"

    create_notification(
        user=donor_user,
        title="Your donation made an impact!",
        message=f"Your donation from {donation_date} was used at {hospital}. You may have helped save a life.",
        notification_type=Notification.TYPE_IMPACT,
        metadata={"donation_id": donation.id, "hospital": hospital},
    )
