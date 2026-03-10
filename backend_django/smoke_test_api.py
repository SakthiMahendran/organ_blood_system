from datetime import date, timedelta
import json
import os
import random
import string

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from donors.models import DonorProfile
from hospitals.models import Hospital, HospitalStaffUser


def rand_suffix(n=6):
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(n))


def parse_json(response):
    try:
        return response.json()
    except Exception:
        try:
            return response.data
        except Exception:
            return {}


def get_data(response_json):
    if isinstance(response_json, dict):
        if 'data' in response_json:
            return response_json.get('data')
    return response_json


def set_user_password(user, password):
    user.set_password(password)
    user.save(update_fields=['password'])


User = get_user_model()
base_password = 'StrongPass123!'

# Seed core users
acceptor_user, _ = User.objects.get_or_create(
    username='smoke_acceptor',
    defaults={
        'email': 'smoke_acceptor@example.com',
        'phone': '9000000001',
        'user_type': 'ACCEPTOR',
        'address': 'Demo Address',
        'city': 'Pune',
        'state': 'Maharashtra',
        'location': 'Pune, Maharashtra',
    },
)
acceptor_user.user_type = 'ACCEPTOR'
acceptor_user.email = 'smoke_acceptor@example.com'
acceptor_user.phone = '9000000001'
acceptor_user.address = 'Demo Address'
acceptor_user.city = 'Pune'
acceptor_user.state = 'Maharashtra'
acceptor_user.location = 'Pune, Maharashtra'
acceptor_user.save()
set_user_password(acceptor_user, base_password)

donor_user, _ = User.objects.get_or_create(
    username='smoke_donor',
    defaults={
        'email': 'smoke_donor@example.com',
        'phone': '9000000002',
        'user_type': 'DONOR',
        'address': 'Donor Street',
        'city': 'Pune',
        'state': 'Maharashtra',
        'location': 'Pune, Maharashtra',
        'blood_group': 'O+',
    },
)
donor_user.user_type = 'DONOR'
donor_user.email = 'smoke_donor@example.com'
donor_user.phone = '9000000002'
donor_user.address = 'Donor Street'
donor_user.city = 'Pune'
donor_user.state = 'Maharashtra'
donor_user.location = 'Pune, Maharashtra'
donor_user.blood_group = 'O+'
donor_user.save()
set_user_password(donor_user, base_password)

hospital_user, _ = User.objects.get_or_create(
    username='smoke_hospital',
    defaults={
        'email': 'smoke_hospital@example.com',
        'phone': '9000000003',
        'user_type': 'HOSPITAL',
        'address': 'Hospital Road',
        'city': 'Pune',
        'state': 'Maharashtra',
        'location': 'Pune, Maharashtra',
    },
)
hospital_user.user_type = 'HOSPITAL'
hospital_user.email = 'smoke_hospital@example.com'
hospital_user.phone = '9000000003'
hospital_user.address = 'Hospital Road'
hospital_user.city = 'Pune'
hospital_user.state = 'Maharashtra'
hospital_user.location = 'Pune, Maharashtra'
hospital_user.save()
set_user_password(hospital_user, base_password)

admin_user, _ = User.objects.get_or_create(
    username='smoke_admin',
    defaults={
        'email': 'smoke_admin@example.com',
        'phone': '9000000004',
        'user_type': 'ADMIN',
        'address': 'Admin Block',
        'city': 'Pune',
        'state': 'Maharashtra',
        'location': 'Pune, Maharashtra',
        'is_staff': True,
        'is_superuser': True,
    },
)
admin_user.user_type = 'ADMIN'
admin_user.email = 'smoke_admin@example.com'
admin_user.phone = '9000000004'
admin_user.address = 'Admin Block'
admin_user.city = 'Pune'
admin_user.state = 'Maharashtra'
admin_user.location = 'Pune, Maharashtra'
admin_user.is_staff = True
admin_user.is_superuser = True
admin_user.save()
set_user_password(admin_user, base_password)

hospital, _ = Hospital.objects.get_or_create(
    license_id='SMOKE-HOSP-001',
    defaults={
        'name': 'Smoke Test Hospital',
        'address': 'Test Address',
        'city': 'Pune',
        'state': 'Maharashtra',
        'approval_status': 'APPROVED',
    },
)
if hospital.approval_status != 'APPROVED':
    hospital.approval_status = 'APPROVED'
    hospital.save(update_fields=['approval_status'])
HospitalStaffUser.objects.get_or_create(hospital=hospital, user=hospital_user)

DonorProfile.objects.update_or_create(
    user=donor_user,
    defaults={
        'blood_group': 'O+',
        'organ_willing': True,
        'organ_types': ['Kidney'],
        'last_blood_donation_date': date.today() - timedelta(days=120),
        'availability_status': DonorProfile.AVAILABLE,
        'verification_status': DonorProfile.VERIFIED,
        'medical_notes': 'Smoke test donor profile',
        'city': 'Pune',
        'state': 'Maharashtra',
    },
)

results = []


def run_step(name, method, path, payload=None, token=None, expected=None):
    client = APIClient()
    if token:
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    if method == 'GET':
        response = client.get(path, format='json')
    elif method == 'POST':
        response = client.post(path, payload or {}, format='json')
    elif method == 'PATCH':
        response = client.patch(path, payload or {}, format='json')
    else:
        raise ValueError(f'Unsupported method: {method}')

    ok = expected is None or response.status_code in expected
    body = parse_json(response)

    results.append({
        'name': name,
        'method': method,
        'path': path,
        'status': response.status_code,
        'ok': ok,
        'body': body,
    })

    return response, body


# 1) Register (unique user)
uniq = rand_suffix()
register_payload = {
    'username': f'smoke_register_{uniq}',
    'email': f'smoke_register_{uniq}@example.com',
    'phone': f'91{random.randint(100000000, 999999999)}',
    'password': base_password,
    'address': 'Reg Address',
    'city': 'Pune',
    'state': 'Maharashtra',
    'location': 'Pune, Maharashtra',
    'user_type': 'ACCEPTOR',
}
reg_resp, reg_body = run_step('Auth Register', 'POST', '/api/auth/register', register_payload, expected={201})

# 2) Login acceptor
login_acceptor_resp, login_acceptor_body = run_step(
    'Auth Login Acceptor',
    'POST',
    '/api/auth/login',
    {'identifier': 'smoke_acceptor@example.com', 'password': base_password},
    expected={200},
)
acceptor_token = (((get_data(login_acceptor_body) or {}).get('tokens') or {}).get('access'))

# 3) Me endpoint
run_step('Auth Me', 'GET', '/api/auth/me', token=acceptor_token, expected={200})

# 4) Create blood request
blood_payload = {
    'blood_group': 'O+',
    'units_needed': 2,
    'required_date': str(date.today() + timedelta(days=2)),
    'urgency': 'HIGH',
    'city': 'Pune',
    'state': 'Maharashtra',
    'notes': 'Smoke test blood request',
    'hospital': hospital.id,
}
create_req_resp, create_req_body = run_step(
    'Acceptor Create Blood Request',
    'POST',
    '/api/requests/blood',
    blood_payload,
    token=acceptor_token,
    expected={201},
)
request_id = ((get_data(create_req_body) or {}).get('id'))

# 5) Emergency request
emergency_payload = {
    'request_type': 'BLOOD',
    'blood_group': 'O+',
    'city': 'Pune',
    'state': 'Maharashtra',
    'notes': 'Smoke emergency request',
    'hospital': hospital.id,
}
run_step(
    'Acceptor Create Emergency Request',
    'POST',
    '/api/requests/emergency',
    emergency_payload,
    token=acceptor_token,
    expected={201},
)

# 6) Track my requests
run_step('Acceptor My Requests', 'GET', '/api/requests/my', token=acceptor_token, expected={200})

# 7) Search donors
run_step(
    'Search Donors',
    'GET',
    '/api/search/donors?type=blood&blood_group=O%2B&city=Pune&state=Maharashtra',
    token=acceptor_token,
    expected={200},
)

# 8) AI matching candidates
run_step(
    'Matching Candidates',
    'GET',
    '/api/matching/candidates?role=ACCEPTOR&type=blood&blood_group=O%2B&city=Pune&state=Maharashtra&urgency=HIGH',
    token=acceptor_token,
    expected={200},
)

# 9) Hospital login + run matching
login_hosp_resp, login_hosp_body = run_step(
    'Auth Login Hospital',
    'POST',
    '/api/auth/login',
    {'identifier': 'smoke_hospital@example.com', 'password': base_password},
    expected={200},
)
hospital_token = (((get_data(login_hosp_body) or {}).get('tokens') or {}).get('access'))

if request_id:
    run_step(
        'Hospital Run Matching',
        'POST',
        '/api/matching/run',
        {'request_id': request_id},
        token=hospital_token,
        expected={200},
    )

# 10) Donor login + donor matches
login_donor_resp, login_donor_body = run_step(
    'Auth Login Donor',
    'POST',
    '/api/auth/login',
    {'identifier': 'smoke_donor@example.com', 'password': base_password},
    expected={200},
)
donor_token = (((get_data(login_donor_body) or {}).get('tokens') or {}).get('access'))

matches_resp, matches_body = run_step('Donor Matches', 'GET', '/api/donors/matches', token=donor_token, expected={200})
match_items = get_data(matches_body) or []
if isinstance(match_items, list) and match_items:
    first_match_id = match_items[0].get('id')
    if first_match_id:
        run_step(
            'Donor Respond Match',
            'POST',
            f'/api/donors/matches/{first_match_id}/respond',
            {'response': 'ACCEPTED'},
            token=donor_token,
            expected={200},
        )

# 11) AI endpoints
run_step(
    'AI Chatbot Ask',
    'POST',
    '/api/ai/chatbot/ask',
    {'message': 'How matching works?'},
    token=acceptor_token,
    expected={200},
)
run_step(
    'AI Blood Detect',
    'POST',
    '/api/ai/blood-group/detect',
    {'source': 'camera'},
    token=acceptor_token,
    expected={200},
)

# 12) Admin login + analytics/inventory/users/hospitals/audit
login_admin_resp, login_admin_body = run_step(
    'Auth Login Admin',
    'POST',
    '/api/auth/login',
    {'identifier': 'smoke_admin@example.com', 'password': base_password},
    expected={200},
)
admin_token = (((get_data(login_admin_body) or {}).get('tokens') or {}).get('access'))

run_step('Admin Summary', 'GET', '/api/admin/reports/summary', token=admin_token, expected={200})
run_step('Admin Analytics', 'GET', '/api/admin/reports/analytics', token=admin_token, expected={200})
run_step('Admin Inventory', 'GET', '/api/admin/inventory', token=admin_token, expected={200})
run_step(
    'Admin Inventory Update',
    'PATCH',
    '/api/admin/inventory/O+',
    {'units': 25, 'threshold': 8},
    token=admin_token,
    expected={200},
)
run_step('Admin Users', 'GET', '/api/admin/users', token=admin_token, expected={200})
run_step('Admin Hospitals', 'GET', '/api/admin/hospitals', token=admin_token, expected={200})
run_step('Admin Audit', 'GET', '/api/admin/audit', token=admin_token, expected={200})

# 13) Notifications for acceptor
run_step('Acceptor Notifications', 'GET', '/api/notifications/', token=acceptor_token, expected={200})

# Print report
print('\n=== SMOKE TEST REPORT ===')
pass_count = 0
for item in results:
    status = 'PASS' if item['ok'] else 'FAIL'
    if item['ok']:
        pass_count += 1
    print(f"[{status}] {item['name']} -> {item['method']} {item['path']} :: {item['status']}")

print(f"\nPassed {pass_count}/{len(results)} checks")

if pass_count != len(results):
    print('\n--- FAILURE DETAILS ---')
    for item in results:
        if not item['ok']:
            print(f"\n{item['name']} ({item['status']}):")
            print(json.dumps(item['body'], default=str, indent=2))

