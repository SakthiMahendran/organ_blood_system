import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import StatCard from '../../components/common/StatCard';
import { useNotifications } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import { donorService } from '../../services/donorService';
import { sosService } from '../../services/sosService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const DonorDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [cooldown, setCooldown] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { notifications } = useNotifications();
  const { showToast } = useToast();

  // Filter SOS alerts from notifications
  const sosAlerts = useMemo(
    () => (notifications || []).filter((n) => n.type === 'SOS_ALERT' && !n.is_read),
    [notifications],
  );

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [profileData, matchesData, cooldownData, milestoneData] = await Promise.all([
        donorService.getProfile().catch((apiError) => {
          if (apiError?.response?.status === 404) return null;
          throw apiError;
        }),
        donorService.getMatches(),
        donorService.getCooldownStatus().catch(() => null),
        donorService.getMilestones().catch(() => null),
      ]);
      setProfile(profileData);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setCooldown(cooldownData);
      setMilestones(milestoneData);
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

  const handleSOSResponse = async (requestId, response) => {
    try {
      await sosService.respondToSOS(requestId, response);
      showToast(response === 'coming' ? "Thank you! The hospital has been notified." : 'Response recorded.', 'success');
      loadData();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to respond to SOS.'), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Donor Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Track your donations, eligibility, and impact at a glance.
        </Typography>
      </Stack>

      {/* ─── SOS Alerts ─── */}
      {sosAlerts.length > 0 && (
        <Stack spacing={1.5}>
          {sosAlerts.map((alert) => (
            <Alert
              key={alert.id}
              severity="error"
              variant="filled"
              icon={<NotificationsActiveRoundedIcon />}
              sx={{ '& .MuiAlert-message': { width: '100%' } }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{alert.title}</Typography>
                  <Typography variant="body2">{alert.message}</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleSOSResponse(alert.metadata?.request_id || alert.related_request, 'coming')}
                  >
                    I'm Coming
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    onClick={() => handleSOSResponse(alert.metadata?.request_id || alert.related_request, 'cannot_make_it')}
                  >
                    Can't Make It
                  </Button>
                </Stack>
              </Stack>
            </Alert>
          ))}
        </Stack>
      )}

      {/* ─── Stat Cards ─── */}
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Availability"
            value={profile?.availability_status || 'Not Set'}
            subtitle="Update from profile page"
            icon={CheckCircleRoundedIcon}
            color={profile?.availability_status === 'AVAILABLE' ? 'success' : 'warning'}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Verification"
            value={profile?.verification_status || 'Pending'}
            icon={VerifiedRoundedIcon}
            color={profile?.verification_status === 'VERIFIED' ? 'success' : 'info'}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Matches" value={matches.length} icon={HandshakeRoundedIcon} color="primary" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pending Responses" value={pendingMatches} icon={HourglassTopRoundedIcon} color="warning" />
        </Grid2>
      </Grid2>

      {/* ─── Cooldown & Milestones Row ─── */}
      <Grid2 container spacing={2}>
        {/* Cooldown Card */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FavoriteRoundedIcon color="error" />
                  <Typography variant="h6">Donation Cooldown</Typography>
                </Stack>

                {cooldown ? (
                  cooldown.is_eligible ? (
                    <Alert severity="success" icon={<CheckCircleRoundedIcon />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        You're eligible to donate now!
                      </Typography>
                    </Alert>
                  ) : (
                    <Stack spacing={1.5}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {cooldown.cooldown_remaining_days} days remaining
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, 100 - (cooldown.cooldown_remaining_days / 56) * 100)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Next eligible: {cooldown.next_eligible_date || 'Unknown'}
                      </Typography>
                    </Stack>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No donation history recorded yet. Complete your first donation!
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Milestone Card */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmojiEventsRoundedIcon sx={{ color: '#f5a623' }} />
                  <Typography variant="h6">Milestones</Typography>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: milestones?.milestone_badge ? 'secondary.main' : 'action.disabledBackground',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <VolunteerActivismRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
                  </Box>
                  <Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {milestones?.milestone_badge || 'No Badge Yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {milestones?.total_donations ?? 0} total donations
                    </Typography>
                  </Stack>
                </Stack>

                {milestones?.next_milestone && (
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Next: {milestones.next_milestone.name} ({milestones.next_milestone.remaining} more)
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((milestones.next_milestone.target - milestones.next_milestone.remaining) /
                          milestones.next_milestone.target) *
                        100
                      }
                      color="secondary"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Stack>
                )}

                {(milestones?.donation_streak ?? 0) > 0 && (
                  <Chip
                    icon={<LocalFireDepartmentRoundedIcon />}
                    label={`${milestones.donation_streak} quarter streak!`}
                    color="warning"
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                )}

                {milestones?.impact_messages?.length > 0 && (
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">Recent Impact</Typography>
                    {milestones.impact_messages.slice(0, 2).map((msg, i) => (
                      <Typography key={i} variant="caption" color="text.secondary">
                        {msg.message}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* ─── Recent Matches Table ─── */}
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
                        color={
                          item.donor_response === 'ACCEPTED'
                            ? 'success'
                            : item.donor_response === 'DECLINED'
                              ? 'error'
                              : 'warning'
                        }
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
