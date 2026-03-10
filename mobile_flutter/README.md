# Organ & Blood Bank Donation System - Flutter Mobile App

Production-style Flutter frontend for Donor / Recipient / Hospital / Admin workflows.

## Stack
- Flutter (Material 3)
- Riverpod
- Dio
- go_router
- flutter_secure_storage
- Shimmer

## Upgraded Architecture
```text
lib/
  core/
    config/
      endpoints.dart
    demo/
    models/
    routing/
    theme/
    utils/
    widgets/
  features/
    auth/
    donor/
    acceptor/
    hospital/
    admin/
    matching/
    chatbot/
    blood_detection/
    emergency/
    analytics/
    inventory/
    settings/
  shared/
    widgets/
  services/
    dio_client.dart
    token_storage.dart
    service_providers.dart
  config/
    app_config.dart
  main.dart
```

## API Configuration
- Base URL resolver: `lib/config/app_config.dart`
- Single endpoint registry: `lib/core/config/endpoints.dart`
- Backward compatibility export: `lib/services/endpoints.dart`
- Default runtime base URLs:
  - Web: `http://localhost:8000/api`
  - Android emulator: `http://10.0.2.2:8000/api`
  - iOS/macOS/Windows/Linux: `http://127.0.0.1:8000/api`
- Override base URL for real devices/LAN:
  - `flutter run --dart-define=API_BASE_URL=http://<YOUR_LOCAL_IP>:8000/api`

If backend routes differ, edit only `endpoints.dart`.

## Auth + Security
- JWT login/register flow
- Access/refresh token stored in `flutter_secure_storage`
- Dio interceptor attaches `Authorization: Bearer <token>`
- On `401`: refresh + retry; if failed => clear tokens + force logout
- Role-based guard via `go_router` + auth state

## Implemented Modules

### Auth
- Splash
- Login (email/phone + password)
- Register (Donor/Acceptor)
- Offline demo role launcher (Donor/Acceptor/Hospital/Admin)

### Donor
- Dashboard (verification, availability, stats)
- Profile management
- Match list (accept/decline)
- Notifications with unread badge
- AI Matching screen
- AI Chatbot
- Blood Group Detection prototype
- Emergency monitor
- Settings

### Recipient (Acceptor)
- Dashboard + quick actions
- Create request (Blood/Organ)
- Track requests (filter + edit + cancel + lifecycle view)
- Smart donor search (availability + urgency + compatibility)
- Notifications
- AI Matching
- AI Chatbot
- Emergency one-tap request flow
- Settings

### Hospital
- Dashboard
- Verify donors
- Manage hospital requests (approve/fulfill + run matching)
- AI Matching
- Emergency monitor
- AI Chatbot
- Settings

### Admin
- Dashboard
- Manage users (activate/deactivate)
- Manage hospitals (approve/suspend)
- Audit logs
- Analytics (status + blood-group charts)
- Inventory management (low-stock alerts + updates)
- Emergency monitor
- AI Chatbot
- Settings

## Offline Demo Mode
- Login screen -> **Start Offline Demo**
- Works without backend/internet using in-memory data store
- All major modules are wired for demo mode

## Run
1. `flutter pub get`
2. `flutter run`

## Device Base URL Notes
- Android emulator uses `10.0.2.2` by default.
- Other platforms use localhost (`127.0.0.1`) by default.
- For a real phone, run with:
  - `flutter run --dart-define=API_BASE_URL=http://<YOUR_LOCAL_IP>:8000/api`

## Verification Checklist
1. Auth
- Register donor and acceptor accounts
- Login using email or phone
- Verify role-based redirect/guard
- Expire token and verify refresh/logout behavior

2. Donor
- Update profile fields and save
- Toggle availability
- Accept/decline matches
- Open AI matching/chatbot/blood detection/emergency/settings

3. Recipient
- Create blood request and organ request
- Edit and cancel requests
- Search donors with smart filters
- Trigger one-tap emergency request

4. Hospital
- Verify/reject donor entries
- Run matching for requests
- Update request status to approved/fulfilled

5. Admin
- Check dashboard summary
- Toggle user active status
- Approve/suspend hospitals
- Filter audit logs
- Open analytics and verify chart values
- Update inventory and verify low-inventory alerts

6. Notifications
- Confirm unread badge in top app bar
- Mark items as read and verify badge updates

## Quality Status
- `flutter analyze`: passed
- `flutter test`: passed
