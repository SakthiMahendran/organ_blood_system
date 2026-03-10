import { Card, CardContent, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/common/StatCard';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorUtils';

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setError('');
    try {
      const data = await adminService.getSummary();
      setSummary(data);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load admin summary metrics.'));
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadSummary} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Admin Dashboard</Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Total Users" value={summary?.total_users ?? '-'} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Total Donors" value={summary?.total_donors ?? '-'} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Verified Donors" value={summary?.verified_donors ?? '-'} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
          <StatCard title="Active Requests" value={summary?.active_requests ?? '-'} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
          <StatCard title="Fulfilled Requests" value={summary?.fulfilled_requests ?? '-'} />
        </Grid2>
      </Grid2>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            This dashboard summarizes platform health, donor verification progress, and request lifecycle outcomes.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AdminDashboardPage;


