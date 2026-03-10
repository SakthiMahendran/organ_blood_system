import { Button, Card, CardContent, Chip, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { adminService } from '../../services/adminService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const AdminUsersPage = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to fetch users.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await adminService.updateUserStatus(userId, isActive);
      showToast('User status updated.', 'success');
      await loadUsers();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update user status.'), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadUsers} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Manage Users</Typography>

      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={8} />
          ) : users.length === 0 ? (
            <EmptyState title="No users found" description="Registered users will appear here." />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={user.user_type} />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={user.is_active ? 'ACTIVE' : 'INACTIVE'} color={user.is_active ? 'success' : 'error'} />
                    </TableCell>
                    <TableCell>{formatDateTime(user.created_at)}</TableCell>
                    <TableCell align="right">
                      <Switch checked={Boolean(user.is_active)} onChange={(event) => toggleUserStatus(user.id, event.target.checked)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AdminUsersPage;
