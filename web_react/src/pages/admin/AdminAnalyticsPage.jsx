import {
  Card,
  CardContent,
  LinearProgress,
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

import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import StatCard from '../../components/common/StatCard';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorUtils';

const formatLabel = (value) =>
  String(value || '-')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getAnalytics();
      setAnalytics(data || null);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load analytics dashboard.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadAnalytics} />;
  }

  if (isLoading) {
    return <ListSkeleton rows={8} />;
  }

  const requestsByStatus = Object.entries(analytics?.requests_by_status || {});
  const bloodGroupDistribution = Object.entries(analytics?.blood_group_distribution || {});
  const emergencyTrend = Array.isArray(analytics?.emergency_trend) ? analytics.emergency_trend : [];
  const donationActivity = Array.isArray(analytics?.donation_activity) ? analytics.donation_activity : [];
  const maxEmergency = Math.max(1, ...emergencyTrend);
  const maxActivity = Math.max(1, ...donationActivity);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Analytics Dashboard</Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Donors" value={analytics?.total_donors ?? 0} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Recipients" value={analytics?.total_recipients ?? 0} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Requests" value={analytics?.total_requests ?? 0} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Emergency Requests" value={analytics?.emergency_requests ?? 0} />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Requests by Status</Typography>
              {requestsByStatus.length === 0 ? (
                <Typography color="text.secondary">No request data available.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requestsByStatus.map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>{formatLabel(status)}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Blood Group Distribution</Typography>
              {bloodGroupDistribution.length === 0 ? (
                <Typography color="text.secondary">No donor distribution data available.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Blood Group</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bloodGroupDistribution.map(([group, count]) => (
                      <TableRow key={group}>
                        <TableCell>{group}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Emergency Trend (Last 7 Days)</Typography>
              <Stack spacing={1.2}>
                {emergencyTrend.map((value, index) => (
                  <Stack key={`emergency-${index}`} spacing={0.4}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">Day {index + 1}</Typography>
                      <Typography variant="caption">{value}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={(value / maxEmergency) * 100} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Donation Activity (Last 7 Days)</Typography>
              <Stack spacing={1.2}>
                {donationActivity.map((value, index) => (
                  <Stack key={`activity-${index}`} spacing={0.4}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">Day {index + 1}</Typography>
                      <Typography variant="caption">{value}</Typography>
                    </Stack>
                    <LinearProgress color="success" variant="determinate" value={(value / maxActivity) * 100} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Stack>
  );
};

export default AdminAnalyticsPage;
