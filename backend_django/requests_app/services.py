from requests_app.models import Request


ALLOWED_TRANSITIONS = {
    Request.DRAFT: {Request.SUBMITTED, Request.CANCELLED},
    Request.SUBMITTED: {Request.MATCHING, Request.CANCELLED},
    Request.MATCHING: {Request.MATCHED, Request.CANCELLED},
    Request.MATCHED: {Request.APPROVED, Request.CANCELLED},
    Request.APPROVED: {Request.FULFILLED, Request.CANCELLED},
    Request.FULFILLED: set(),
    Request.CANCELLED: set(),
}


def can_transition(current_status: str, target_status: str) -> bool:
    return target_status in ALLOWED_TRANSITIONS.get(current_status, set())


def transition_request(request_obj: Request, target_status: str):
    if not can_transition(request_obj.status, target_status):
        raise ValueError(f"Invalid transition: {request_obj.status} -> {target_status}")

    request_obj.status = target_status
    request_obj.save(update_fields=["status", "updated_at"])
    return request_obj
