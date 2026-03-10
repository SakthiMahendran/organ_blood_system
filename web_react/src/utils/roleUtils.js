import { ROLE_HOME } from '../routes/paths';

export const ROLES = {
  DONOR: 'DONOR',
  ACCEPTOR: 'ACCEPTOR',
  HOSPITAL: 'HOSPITAL',
  ADMIN: 'ADMIN',
};

export const normalizeRole = (role) => (role || '').toString().trim().toUpperCase();

export const getDefaultRouteByRole = (role) => ROLE_HOME[normalizeRole(role)] || '/login';

export const isRoleAllowed = (role, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  return allowedRoles.includes(normalizeRole(role));
};
