import {
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useMemo, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import StatCard from '../../components/common/StatCard';
import { acceptorService } from '../../services/acceptorService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const AcceptorDashboardPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await acceptorService.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load dashboard data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeRequests = useMemo(
    () => requests.filter((item) => !['FULFILLED', 'CANCELLED'].includes(item.status)).length,
    [requests],
  );

  const fulfilledRequests = useMemo(
    () => requests.filter((item) => item.status === 'FULFILLED').length,
    [requests],
  );

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Acceptor Dashboard</Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <StatCard title="Total Requests" value={requests.length} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <StatCard title="Active Requests" value={activeRequests} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <StatCard title="Fulfilled" value={fulfilledRequests} />
        </Grid2>
      </Grid2>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Recent Requests
          </Typography>

          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : requests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Create your first blood or organ request to start matching donors."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.slice(0, 8).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>{item.request_type}</TableCell>
                    <TableCell>{item.urgency}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status}
                        color={item.status === 'FULFILLED' ? 'success' : item.status === 'CANCELLED' ? 'error' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(item.created_at)}</TableCell>
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

export default AcceptorDashboardPage;


