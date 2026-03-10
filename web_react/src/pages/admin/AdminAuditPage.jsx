import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { adminService } from '../../services/adminService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { useForm } from 'react-hook-form';

const AdminAuditPage = () => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      actor_user_id: '',
      action: '',
    },
  });

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async (params = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getAuditLogs(params);
      setLogs(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load audit logs.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const onSearch = handleSubmit(async (values) => {
    await loadLogs({
      actor_user_id: values.actor_user_id || undefined,
      action: values.action || undefined,
    });
  });

  if (error) {
    return <ErrorState message={error} onRetry={() => loadLogs()} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Audit Logs</Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSearch}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledTextField
                  name="actor_user_id"
                  control={control}
                  label="Actor (Email, Username, or ID)"
                  helperText="You can search by user id, email, or username."
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledTextField name="action" control={control} label="Action Contains" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />} sx={{ mt: { md: 1 } }}>
                  Filter Logs
                </Button>
              </Grid2>
            </Grid2>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={8} />
          ) : logs.length === 0 ? (
            <EmptyState title="No audit entries" description="Try adjusting your filter criteria." />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Entity ID</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.actor_email || '-'}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell>{log.entity_id}</TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
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

export default AdminAuditPage;


