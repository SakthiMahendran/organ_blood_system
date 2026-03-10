import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HospitalRegisterPage from '../pages/auth/HospitalRegisterPage';
import AcceptorCreateRequestPage from '../pages/acceptor/AcceptorCreateRequestPage';
import AcceptorDashboardPage from '../pages/acceptor/AcceptorDashboardPage';
import AcceptorNotificationsPage from '../pages/acceptor/AcceptorNotificationsPage';
import AcceptorSearchDonorsPage from '../pages/acceptor/AcceptorSearchDonorsPage';
import AcceptorTrackRequestsPage from '../pages/acceptor/AcceptorTrackRequestsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import AdminAuditPage from '../pages/admin/AdminAuditPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminHospitalsPage from '../pages/admin/AdminHospitalsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import UnauthorizedPage from '../pages/common/UnauthorizedPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import AIAssistantPage from '../pages/common/AIAssistantPage';
import DonorDashboardPage from '../pages/donor/DonorDashboardPage';
import DonorMatchesPage from '../pages/donor/DonorMatchesPage';
import DonorNotificationsPage from '../pages/donor/DonorNotificationsPage';
import DonorProfilePage from '../pages/donor/DonorProfilePage';
import HospitalDashboardPage from '../pages/hospital/HospitalDashboardPage';
import HospitalRequestsPage from '../pages/hospital/HospitalRequestsPage';
import HospitalVerifyDonorsPage from '../pages/hospital/HospitalVerifyDonorsPage';
import { PATHS } from './paths';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

const AppRoutes = () => (
  <Routes>
    <Route
      path={PATHS.LOGIN}
      element={(
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      )}
    />
    <Route
      path={PATHS.REGISTER}
      element={(
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      )}
    />
    <Route
      path={PATHS.REGISTER_HOSPITAL}
      element={(
        <PublicOnlyRoute>
          <HospitalRegisterPage />
        </PublicOnlyRoute>
      )}
    />

    <Route element={<ProtectedRoute allowedRoles={['DONOR']} />}>
      <Route path="/donor" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DonorDashboardPage />} />
        <Route path="profile" element={<DonorProfilePage />} />
        <Route path="matches" element={<DonorMatchesPage />} />
        <Route path="notifications" element={<DonorNotificationsPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['ACCEPTOR']} />}>
      <Route path="/acceptor" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AcceptorDashboardPage />} />
        <Route path="create-request" element={<AcceptorCreateRequestPage />} />
        <Route path="track-requests" element={<AcceptorTrackRequestsPage />} />
        <Route path="search-donors" element={<AcceptorSearchDonorsPage />} />
        <Route path="notifications" element={<AcceptorNotificationsPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['HOSPITAL']} />}>
      <Route path="/hospital" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HospitalDashboardPage />} />
        <Route path="verify-donors" element={<HospitalVerifyDonorsPage />} />
        <Route path="requests" element={<HospitalRequestsPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
      <Route path="/admin" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="hospitals" element={<AdminHospitalsPage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
      </Route>
    </Route>

    <Route path={PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />
    <Route path="/" element={<Navigate to={PATHS.LOGIN} replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
