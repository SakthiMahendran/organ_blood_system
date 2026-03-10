from datetime import date, timedelta

from .models import DonorProfile

COOLDOWN_DAYS = DonorProfile.COOLDOWN_DAYS
DEFAULT_COOLDOWN = 56


def check_eligibility(data: dict) -> dict:
    """
    Rule-based donor eligibility checker.

    Accepts: age, weight_kg, last_donation_date (YYYY-MM-DD str or None),
             last_donation_type, recent_tattoo (bool), recent_travel (bool),
             is_pregnant (bool), recent_medications (bool)

    Returns: {eligible, reasons, next_eligible_date, cooldown_remaining_days}
    """
    reasons = []
    next_eligible = None
    cooldown_remaining = 0

    # Age check (18-65)
    age = data.get("age")
    if age is not None:
        try:
            age = int(age)
        except (ValueError, TypeError):
            age = None
    if age is not None:
        if age < 18:
            reasons.append("Must be at least 18 years old to donate.")
        elif age > 65:
            reasons.append("Donors above 65 years require additional medical clearance.")

    # Weight check (>= 50 kg)
    weight = data.get("weight_kg")
    if weight is not None:
        try:
            weight = float(weight)
        except (ValueError, TypeError):
            weight = None
    if weight is not None and weight < 50:
        reasons.append("Minimum weight for donation is 50 kg.")

    # Cooldown check
    last_donation_str = data.get("last_donation_date")
    last_type = data.get("last_donation_type", "whole_blood")
    if last_donation_str:
        try:
            last_date = date.fromisoformat(str(last_donation_str))
            cooldown = COOLDOWN_DAYS.get(last_type, DEFAULT_COOLDOWN)
            eligible_date = last_date + timedelta(days=cooldown)
            next_eligible = eligible_date.isoformat()
            remaining = (eligible_date - date.today()).days
            cooldown_remaining = max(0, remaining)
            if remaining > 0:
                reasons.append(
                    f"Cooldown period not met. You can donate again after {eligible_date.strftime('%B %d, %Y')} "
                    f"({remaining} days remaining)."
                )
        except (ValueError, TypeError):
            pass

    # Medical deferral checks
    if data.get("recent_tattoo"):
        reasons.append("Recent tattoo or piercing (within 3 months) requires deferral.")

    if data.get("recent_travel"):
        reasons.append("Recent travel to malaria-endemic areas may require deferral. Consult your doctor.")

    if data.get("is_pregnant"):
        reasons.append("Pregnancy is a temporary deferral condition for blood donation.")

    if data.get("recent_medications"):
        reasons.append("Certain medications may affect eligibility. Consult your doctor for clearance.")

    eligible = len(reasons) == 0

    return {
        "eligible": eligible,
        "reasons": reasons,
        "next_eligible_date": next_eligible,
        "cooldown_remaining_days": cooldown_remaining,
    }
