import { Card, CardContent, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useMemo, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import StatCard from '../../components/common/StatCard';
import { hospitalService } from '../../services/hospitalService';
import { getErrorMessage } from '../../utils/errorUtils';

const HospitalDashboardPage = () => {
  const [requests, setRequests] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [requestData, verificationData] = await Promise.all([
        hospitalService.getHospitalRequests(),
        hospitalService.getPendingVerifications(),
      ]);
      setRequests(Array.isArray(requestData) ? requestData : []);
      setPendingVerifications(Array.isArray(verificationData) ? verificationData : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load hospital dashboard.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedRequests = useMemo(
    () => requests.filter((item) => item.status === 'APPROVED').length,
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
      <Typography variant="h4">Hospital Dashboard</Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Hospital Requests" value={requests.length} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pending Verifications" value={pendingVerifications.length} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Approved Requests" value={approvedRequests} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Fulfilled Requests" value={fulfilledRequests} />
        </Grid2>
      </Grid2>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Workflow Snapshot
          </Typography>
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : requests.length === 0 && pendingVerifications.length === 0 ? (
            <EmptyState
              title="No activity found"
              description="Requests and verification tasks assigned to your hospital will appear here."
            />
          ) : (
            <Stack spacing={1}>
              <Typography color="text.secondary">1. Verify donor profiles from pending list.</Typography>
              <Typography color="text.secondary">2. Review and update request status to APPROVED/FULFILLED.</Typography>
              <Typography color="text.secondary">3. Run matching for submitted requests to notify donors.</Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default HospitalDashboardPage;


