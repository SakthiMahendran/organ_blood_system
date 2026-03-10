# Organ & Blood Bank Donation & Donor Finder - Web Frontend

Production-ready React frontend for the Django REST backend.

## Stack
- React + Vite
- React Router
- Axios
- Context + Reducer state management
- Material UI (MUI)
- React Hook Form + Yup validation

## Project Setup
1. Open terminal in `web_react`.
2. Create environment file:
   - Copy `.env.example` to `.env`
3. Install dependencies:
   - `npm install`
4. Start dev server:
   - `npm run dev`

Default API URL:
- `VITE_API_BASE_URL=http://localhost:8000/api`

## Important API Mapping
All endpoint paths are centralized in:
- `src/services/apiMap.js`

If any backend endpoint differs, edit only this file.

## Folder Structure
```text
web_react/
  src/
    components/
      common/
      forms/
      layout/
    contexts/
    pages/
      auth/
      donor/
      acceptor/
      hospital/
      admin/
      common/
    reducers/
    routes/
    services/
    theme/
    utils/
```

## Implemented Features
- JWT login/register/logout with access token attach interceptor
- Refresh token flow (with automatic retry)
- Role-based route protection
- Shared authenticated shell (Top navbar + Side drawer)
- Notification bell with unread count
- Donor profile update, availability toggle, matches accept/decline
- Acceptor create/track/cancel requests and donor search
- Hospital donor verification, request status update, matching run trigger
- Admin users/hospitals management + audit + summary metrics
- Loading states, empty states, and error snackbars

## Role Routes
### Public
- `/login`
- `/register`

### Donor
- `/donor/dashboard`
- `/donor/profile`
- `/donor/matches`
- `/donor/notifications`

### Acceptor
- `/acceptor/dashboard`
- `/acceptor/create-request`
- `/acceptor/track-requests`
- `/acceptor/search-donors`
- `/acceptor/notifications`

### Hospital
- `/hospital/dashboard`
- `/hospital/verify-donors`
- `/hospital/requests`

### Admin
- `/admin/dashboard`
- `/admin/users`
- `/admin/hospitals`
- `/admin/audit`

## Flow Testing Checklist
1. Authentication
- Register as `DONOR` and verify redirect to donor dashboard.
- Register as `ACCEPTOR` and verify redirect to acceptor dashboard.
- Login with email/phone in `identifier` field.
- Expire access token and verify refresh token auto-renews.
- Remove refresh token and verify forced logout on 401.

2. Donor
- Open `/donor/profile`, create/update profile.
- Toggle availability and verify state update.
- Open `/donor/matches`, accept/decline a pending match.
- Open `/donor/notifications`, mark notifications as read.

3. Acceptor
- Create blood request and organ request.
- Open track page, edit a request, cancel a request.
- Search donors with blood filters and organ filters.

4. Hospital
- Open pending donor verifications and verify/reject donor.
- Open hospital requests, run matching, mark approved/fulfilled.

5. Admin
- Open summary dashboard metrics.
- Activate/deactivate users.
- Update hospital status (pending/approved/suspended).
- Filter and view audit logs.

## Notes
- API service modules are in `src/services/*`.
- Route setup is in `src/routes/*`.
- Reusable UI components are in `src/components/*`.
