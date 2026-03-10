import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';

import { PATHS } from './paths';

export const ROLE_MENU = {
  DONOR: [
    { label: 'Dashboard', path: PATHS.DONOR_DASHBOARD, icon: DashboardRoundedIcon },
    { label: 'Profile', path: PATHS.DONOR_PROFILE, icon: PersonRoundedIcon },
    { label: 'Matches', path: PATHS.DONOR_MATCHES, icon: FavoriteRoundedIcon },
    { label: 'Donations', path: PATHS.DONOR_DONATIONS, icon: VolunteerActivismRoundedIcon },
    { label: 'Notifications', path: PATHS.DONOR_NOTIFICATIONS, icon: NotificationsRoundedIcon },
    { label: 'AI Assistant', path: PATHS.DONOR_AI_ASSISTANT, icon: AutoAwesomeRoundedIcon },
  ],
  ACCEPTOR: [
    { label: 'Dashboard', path: PATHS.ACCEPTOR_DASHBOARD, icon: DashboardRoundedIcon },
    { label: 'Create Request', path: PATHS.ACCEPTOR_CREATE_REQUEST, icon: AddCircleRoundedIcon },
    { label: 'Track Requests', path: PATHS.ACCEPTOR_TRACK_REQUESTS, icon: TimelineRoundedIcon },
    { label: 'Search Donors', path: PATHS.ACCEPTOR_SEARCH_DONORS, icon: SearchRoundedIcon },
    { label: 'Notifications', path: PATHS.ACCEPTOR_NOTIFICATIONS, icon: NotificationsRoundedIcon },
    { label: 'AI Assistant', path: PATHS.ACCEPTOR_AI_ASSISTANT, icon: AutoAwesomeRoundedIcon },
  ],
  HOSPITAL: [
    { label: 'Dashboard', path: PATHS.HOSPITAL_DASHBOARD, icon: DashboardRoundedIcon },
    { label: 'Verify Donors', path: PATHS.HOSPITAL_VERIFY_DONORS, icon: VerifiedUserRoundedIcon },
    { label: 'Requests', path: PATHS.HOSPITAL_REQUESTS, icon: FactCheckRoundedIcon },
    { label: 'AI Assistant', path: PATHS.HOSPITAL_AI_ASSISTANT, icon: AutoAwesomeRoundedIcon },
  ],
  ADMIN: [
    { label: 'Dashboard', path: PATHS.ADMIN_DASHBOARD, icon: DashboardRoundedIcon },
    { label: 'Users', path: PATHS.ADMIN_USERS, icon: PeopleRoundedIcon },
    { label: 'Hospitals', path: PATHS.ADMIN_HOSPITALS, icon: LocalHospitalRoundedIcon },
    { label: 'Audit', path: PATHS.ADMIN_AUDIT, icon: ManageAccountsRoundedIcon },
    { label: 'Analytics', path: PATHS.ADMIN_ANALYTICS, icon: BarChartRoundedIcon },
    { label: 'Inventory', path: PATHS.ADMIN_INVENTORY, icon: InventoryRoundedIcon },
    { label: 'AI Assistant', path: PATHS.ADMIN_AI_ASSISTANT, icon: AutoAwesomeRoundedIcon },
  ],
};
