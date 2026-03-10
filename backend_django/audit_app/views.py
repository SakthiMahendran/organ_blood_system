from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts_app.permissions import IsAdminUserType
from donors.models import DonorProfile
from requests_app.models import Request

from .models import AuditLog
from .serializers import AuditLogSerializer

INVENTORY_OVERRIDES = {}
BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserType])
def audit_list(request):
    qs = AuditLog.objects.select_related('actor_user').all()

    actor_query = (
        request.query_params.get('actor_user_id')
        or request.query_params.get('actor')
        or request.query_params.get('actor_email')
        or ''
    ).strip()

    action = request.query_params.get('action')

    if actor_query:
        if actor_query.isdigit():
            qs = qs.filter(actor_user_id=int(actor_query))
        else:
            qs = qs.filter(
                Q(actor_user__email__icontains=actor_query)
                | Q(actor_user__username__icontains=actor_query)
            )

    if action:
        qs = qs.filter(action__icontains=action)

    serializer = AuditLogSerializer(qs[:500], many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserType])
def summary_report(request):
    User = get_user_model()

    data = {
        'total_users': User.objects.count(),
        'total_donors': User.objects.filter(user_type='DONOR').count(),
        'verified_donors': DonorProfile.objects.filter(verification_status=DonorProfile.VERIFIED).count(),
        'active_requests': Request.objects.exclude(status__in=[Request.FULFILLED, Request.CANCELLED]).count(),
        'fulfilled_requests': Request.objects.filter(status=Request.FULFILLED).count(),
    }
    return Response({'success': True, 'data': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserType])
def analytics_report(request):
    User = get_user_model()

    requests_by_status = {
        row['status']: row['count']
        for row in Request.objects.values('status').annotate(count=Count('id'))
    }

    blood_group_distribution = {
        row['blood_group']: row['count']
        for row in DonorProfile.objects.values('blood_group').annotate(count=Count('id'))
        if row['blood_group']
    }

    today = timezone.now().date()
    emergency_trend = []
    donation_activity = []

    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        day_requests = Request.objects.filter(created_at__date=day)
        emergency_trend.append(day_requests.filter(urgency=Request.CRITICAL).count())
        donation_activity.append(day_requests.count())

    data = {
        'total_donors': User.objects.filter(user_type='DONOR').count(),
        'total_recipients': User.objects.filter(user_type='ACCEPTOR').count(),
        'total_requests': Request.objects.count(),
        'emergency_requests': Request.objects.filter(urgency=Request.CRITICAL).count(),
        'requests_by_status': requests_by_status,
        'blood_group_distribution': blood_group_distribution,
        'emergency_trend': emergency_trend,
        'donation_activity': donation_activity,
    }

    return Response({'success': True, 'data': data})


def _build_inventory_data():
    donor_counts = {
        row['blood_group']: row['count']
        for row in DonorProfile.objects.values('blood_group').annotate(count=Count('id'))
        if row['blood_group']
    }

    demand_counts = {
        row['blood_group']: row['count']
        for row in Request.objects.filter(request_type=Request.BLOOD).exclude(status=Request.CANCELLED)
        .values('blood_group')
        .annotate(count=Count('id'))
        if row['blood_group']
    }

    items = []
    for group in BLOOD_GROUPS:
        units = max(0, donor_counts.get(group, 0) * 2 - demand_counts.get(group, 0))
        threshold = 5 if group in {'A+', 'B+', 'O+'} else 3
        updated_at = timezone.now()

        override = INVENTORY_OVERRIDES.get(group)
        if override:
            units = override.get('units', units)
            threshold = override.get('threshold', threshold)
            updated_at = override.get('updated_at', updated_at)

        items.append(
            {
                'blood_group': group,
                'units': units,
                'threshold': threshold,
                'updated_at': updated_at,
            }
        )

    return items


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserType])
def inventory_list(request):
    return Response({'success': True, 'data': _build_inventory_data()})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUserType])
def inventory_update(request, blood_group: str):
    group = blood_group.upper().strip()
    if group not in BLOOD_GROUPS:
        return Response(
            {'success': False, 'error': {'code': 'BAD_REQUEST', 'message': 'Invalid blood group'}},
            status=400,
        )

    units_raw = request.data.get('units')
    threshold_raw = request.data.get('threshold')

    try:
        units = int(units_raw) if units_raw is not None else None
        threshold = int(threshold_raw) if threshold_raw is not None else None
    except (TypeError, ValueError):
        return Response(
            {'success': False, 'error': {'code': 'BAD_REQUEST', 'message': 'units/threshold must be integers'}},
            status=400,
        )

    existing = INVENTORY_OVERRIDES.get(group, {})
    if units is not None:
        existing['units'] = max(0, units)
    if threshold is not None:
        existing['threshold'] = max(0, threshold)
    existing['updated_at'] = timezone.now()
    INVENTORY_OVERRIDES[group] = existing

    item = next((entry for entry in _build_inventory_data() if entry['blood_group'] == group), None)
    return Response({'success': True, 'data': item})
