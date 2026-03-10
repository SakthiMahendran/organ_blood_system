from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from audit_app.services import audit_log
from donors.models import DonorProfile
from requests_app.models import Request

from .models import Match
from .serializers import MatchSerializer
from .services import is_blood_compatible, normalize_blood_group, run_matching

ALLOWED_DONOR_RESPONSES = {'ACCEPTED', 'REJECTED', 'PENDING'}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def run_matching_view(request):
    user_role = getattr(request.user, 'user_type', '')
    if user_role not in {'HOSPITAL', 'ADMIN'}:
        return Response(
            {'success': False, 'error': {'code': 'FORBIDDEN', 'message': 'Hospital/Admin only'}},
            status=403,
        )

    request_id = request.query_params.get('request_id') or request.data.get('request_id')
    if not request_id:
        return Response(
            {'success': False, 'error': {'code': 'BAD_REQUEST', 'message': 'request_id is required'}},
            status=400,
        )

    req = Request.objects.filter(id=request_id).first()
    if not req:
        return Response(
            {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Request not found'}},
            status=404,
        )

    matches = run_matching(req)

    try:
        if matches and getattr(req, 'status', None) == Request.MATCHING:
            req.status = Request.MATCHED
            req.save(update_fields=['status', 'updated_at'])
    except Exception:
        pass

    audit_log(
        actor=request.user,
        action='MATCHING_RUN',
        entity_type='Request',
        entity_id=req.id,
        metadata={'matches_created': len(matches) if matches else 0},
    )

    return Response({'success': True, 'data': MatchSerializer(matches, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matching_candidates(request):
    search_type = (request.query_params.get('type') or 'blood').lower()
    blood_group = request.query_params.get('blood_group')
    organ = request.query_params.get('organ_type') or request.query_params.get('organ')
    city = request.query_params.get('city')
    state = request.query_params.get('state')
    urgency = (request.query_params.get('urgency') or 'MEDIUM').upper()

    qs = DonorProfile.objects.select_related('user').filter(
        verification_status=DonorProfile.VERIFIED,
        availability_status=DonorProfile.AVAILABLE,
    )

    if city:
        qs = qs.filter(city__iexact=city)
    if state:
        qs = qs.filter(state__iexact=state)

    urgency_boost = {
        'LOW': 0,
        'MEDIUM': 5,
        'HIGH': 10,
        'CRITICAL': 15,
    }

    candidates = []
    target_group = normalize_blood_group(blood_group)
    target_organ = (organ or '').strip().lower()

    for profile in qs[:300]:
        score = 45.0
        reasons = []

        if search_type == 'blood' and target_group:
            donor_group = normalize_blood_group(profile.blood_group)
            if donor_group == target_group:
                score += 28
                reasons.append('Exact blood-group match')
            elif is_blood_compatible(donor_group, target_group):
                score += 16
                reasons.append('Compatible blood-group match')
            else:
                continue

        elif search_type == 'organ' and target_organ:
            organ_match = any(str(item).strip().lower() == target_organ for item in (profile.organ_types or []))
            if organ_match:
                score += 24
                reasons.append('Requested organ is in donor preference list')
            else:
                continue

        if city and (profile.city or '').lower() == city.lower():
            score += 8
            reasons.append('City aligned')
        if state and (profile.state or '').lower() == state.lower():
            score += 7
            reasons.append('State aligned')

        score += urgency_boost.get(urgency, 5)
        if urgency in {'HIGH', 'CRITICAL'}:
            reasons.append('Urgency-priority boosted')

        score = max(0.0, min(100.0, score))

        if score >= 85:
            tier = 'HIGH'
            recommended_action = 'Immediate contact recommended'
        elif score >= 70:
            tier = 'MEDIUM'
            recommended_action = 'Prioritize in next outreach batch'
        else:
            tier = 'LOW'
            recommended_action = 'Keep as fallback candidate'

        confidence = max(55.0, min(99.0, score - 4))

        candidates.append(
            {
                'id': profile.id,
                'name': profile.user.username,
                'request_type': search_type.upper(),
                'blood_group': profile.blood_group,
                'organ_type': (profile.organ_types or [None])[0] if profile.organ_types else None,
                'city': profile.city,
                'state': profile.state,
                'urgency': urgency,
                'status': 'PENDING',
                'availability_status': profile.availability_status,
                'compatibility_score': round(score, 2),
                'confidence': round(confidence, 2),
                'compatibility_tier': tier,
                'recommended_action': recommended_action,
                'ai_summary': f'{tier} confidence candidate for {search_type} request.',
                'reasons': reasons if reasons else ['General eligibility match'],
            }
        )

    candidates.sort(key=lambda item: item['compatibility_score'], reverse=True)

    return Response({'success': True, 'data': candidates[:200]})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_results_view(request, request_id: int):
    user_role = getattr(request.user, 'user_type', '')
    if user_role not in {'HOSPITAL', 'ADMIN'}:
        return Response(
            {'success': False, 'error': {'code': 'FORBIDDEN', 'message': 'Hospital/Admin only'}},
            status=403,
        )

    matches = Match.objects.filter(request_id=request_id).order_by('-match_score')

    data = []
    for m in matches:
        data.append(
            {
                'id': m.id,
                'request': m.request_id,
                'donor_user': m.donor_user_id,
                'donor_email': getattr(m.donor_user, 'email', None),
                'match_score': float(m.match_score),
                'donor_response': m.donor_response,
                'created_at': m.created_at,
            }
        )

    return Response({'success': True, 'data': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def donor_response_view(request, match_id: int):
    user_role = getattr(request.user, 'user_type', '')

    response_value = request.data.get('response')
    if not response_value:
        return Response(
            {'success': False, 'error': {'code': 'BAD_REQUEST', 'message': 'response is required'}},
            status=400,
        )

    response_value = str(response_value).strip().upper()

    if response_value not in ALLOWED_DONOR_RESPONSES:
        return Response(
            {
                'success': False,
                'error': {
                    'code': 'BAD_REQUEST',
                    'message': f'Invalid response. Allowed: {sorted(ALLOWED_DONOR_RESPONSES)}',
                },
            },
            status=400,
        )

    match = Match.objects.select_related('donor_user').filter(id=match_id).first()
    if not match:
        return Response(
            {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Match not found'}},
            status=404,
        )

    if user_role != 'ADMIN' and match.donor_user_id != request.user.id:
        return Response(
            {'success': False, 'error': {'code': 'FORBIDDEN', 'message': 'Not allowed'}},
            status=403,
        )

    match.donor_response = response_value
    match.save(update_fields=['donor_response'])

    audit_log(
        actor=request.user,
        action='DONOR_RESPONSE',
        entity_type='Match',
        entity_id=match.id,
        metadata={'donor_response': match.donor_response},
    )

    return Response(
        {
            'success': True,
            'data': {
                'id': match.id,
                'request': match.request_id,
                'donor_user': match.donor_user_id,
                'donor_email': getattr(match.donor_user, 'email', None),
                'match_score': float(match.match_score),
                'donor_response': match.donor_response,
                'created_at': match.created_at,
            },
        }
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_donors(request):
    search_type = (request.query_params.get('type') or 'blood').lower()
    city = request.query_params.get('city')
    state = request.query_params.get('state')

    qs = DonorProfile.objects.select_related('user').filter(
        availability_status=DonorProfile.AVAILABLE,
        verification_status=DonorProfile.VERIFIED,
    )

    if city:
        qs = qs.filter(city__iexact=city)
    if state:
        qs = qs.filter(state__iexact=state)

    if search_type == 'blood':
        blood_group = request.query_params.get('blood_group')
        if blood_group:
            qs = qs.filter(blood_group__iexact=blood_group)

    elif search_type == 'organ':
        organ = (request.query_params.get('organ') or '').strip().lower()
        qs = [
            p
            for p in qs
            if p.organ_willing
            and any(str(item).strip().lower() == organ for item in (p.organ_types or []))
        ]

    else:
        return Response(
            {'success': False, 'error': {'code': 'BAD_REQUEST', 'message': 'type must be blood or organ'}},
            status=400,
        )

    data = [
        {
            'id': p.id,
            'user_id': p.user_id,
            'name': p.user.username,
            'blood_group': p.blood_group,
            'organ_willing': p.organ_willing,
            'organ_types': p.organ_types,
            'city': p.city,
            'state': p.state,
            'verification_status': p.verification_status,
            'availability_status': p.availability_status,
        }
        for p in list(qs)[:200]
    ]

    return Response({'success': True, 'data': data})
