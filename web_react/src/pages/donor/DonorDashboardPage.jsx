import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  Button,
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
import { Link as RouterLink } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import StatCard from '../../components/common/StatCard';
import { donorService } from '../../services/donorService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const DonorDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [profileData, matchesData] = await Promise.all([
        donorService.getProfile().catch((apiError) => {
          if (apiError?.response?.status === 404) {
            return null;
          }
          throw apiError;
        }),
        donorService.getMatches(),
      ]);
      setProfile(profileData);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load donor dashboard.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingMatches = useMemo(
    () => matches.filter((matchItem) => matchItem.donor_response === 'PENDING').length,
    [matches],
  );

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Donor Dashboard</Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Availability"
            value={profile?.availability_status || 'Not Set'}
            subtitle="Update this from profile page"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Verification" value={profile?.verification_status || 'Pending'} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Matches" value={matches.length} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pending Responses" value={pendingMatches} />
        </Grid2>
      </Grid2>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Recent Matches</Typography>
            <Button component={RouterLink} to="/donor/matches" endIcon={<ArrowForwardRoundedIcon />}>
              View all
            </Button>
          </Stack>

          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : matches.length === 0 ? (
            <EmptyState
              title="No matches yet"
              description="When hospitals run matching, your eligible requests will appear here."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Request</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.slice(0, 5).map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.request}</TableCell>
                    <TableCell>{Math.round(item.match_score)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.donor_response}
                        color={item.donor_response === 'ACCEPTED' ? 'success' : item.donor_response === 'DECLINED' ? 'error' : 'warning'}
                        size="small"
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

export default DonorDashboardPage;


