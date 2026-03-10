import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import {
  alpha,
  Box,
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

/** Returns last N calendar dates as short labels (e.g. "Mar 4") */
function lastNDayLabels(n) {
  const labels = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
}

const BAR_COLORS = {
  error: '#EF4444',
  success: '#10B981',
};

const ChartBar = ({ label, value, max, color = 'primary' }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const hex = BAR_COLORS[color];
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>{value}</Typography>
      </Stack>
      <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: (t) => alpha(t.palette.divider, 3) }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0,
            height: '100%',
            width: `${pct}%`,
            borderRadius: 3,
            bgcolor: hex || 'primary.main',
            transition: 'width 0.6s ease',
          }}
        />
      </Box>
    </Stack>
  );
};

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

  if (error) return <ErrorState message={error} onRetry={loadAnalytics} />;
  if (isLoading) return <ListSkeleton rows={8} />;

  const requestsByStatus = Object.entries(analytics?.requests_by_status || {});
  const bloodGroupDistribution = Object.entries(analytics?.blood_group_distribution || {});
  const emergencyTrend = Array.isArray(analytics?.emergency_trend) ? analytics.emergency_trend : [];
  const donationActivity = Array.isArray(analytics?.donation_activity) ? analytics.donation_activity : [];
  const maxEmergency = Math.max(1, ...emergencyTrend);
  const maxActivity = Math.max(1, ...donationActivity);
  const dayLabels = lastNDayLabels(Math.max(emergencyTrend.length, donationActivity.length, 7));

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Analytics Dashboard</Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Donors" value={analytics?.total_donors ?? 0} icon={GroupRoundedIcon} color="primary" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Recipients" value={analytics?.total_recipients ?? 0} icon={PersonAddAlt1RoundedIcon} color="secondary" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Requests" value={analytics?.total_requests ?? 0} icon={VolunteerActivismRoundedIcon} color="info" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Emergency Requests" value={analytics?.emergency_requests ?? 0} icon={CampaignRoundedIcon} color="error" />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Requests by Status</Typography>
              {requestsByStatus.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No request data available.</Typography>
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
              <Typography variant="h6" sx={{ mb: 2 }}>Blood Group Distribution</Typography>
              {bloodGroupDistribution.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No donor distribution data available.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Blood Group</TableCell>
                      <TableCell align="right">Donors</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bloodGroupDistribution.map(([group, count]) => (
                      <TableRow key={group}>
                        <TableCell sx={{ fontWeight: 600 }}>{group}</TableCell>
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
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Emergency Trend</Typography>
                <Typography variant="caption" color="text.secondary">Last 7 days</Typography>
              </Stack>
              {emergencyTrend.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No data.</Typography>
              ) : (
                <Stack spacing={1.4}>
                  {emergencyTrend.map((value, index) => (
                    <ChartBar
                      key={`emergency-${index}`}
                      label={dayLabels[index] || `Day ${index + 1}`}
                      value={value}
                      max={maxEmergency}
                      color="error"
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Donation Activity</Typography>
                <Typography variant="caption" color="text.secondary">Last 7 days</Typography>
              </Stack>
              {donationActivity.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No data.</Typography>
              ) : (
                <Stack spacing={1.4}>
                  {donationActivity.map((value, index) => (
                    <ChartBar
                      key={`activity-${index}`}
                      label={dayLabels[index] || `Day ${index + 1}`}
                      value={value}
                      max={maxActivity}
                      color="success"
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Stack>
  );
};

export default AdminAnalyticsPage;
