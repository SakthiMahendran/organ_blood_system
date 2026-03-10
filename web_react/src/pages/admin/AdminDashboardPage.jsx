import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
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
import { useEffect, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import StatCard from '../../components/common/StatCard';
import { useToast } from '../../contexts/ToastContext';
import { adminService } from '../../services/adminService';
import { bloodUnitService } from '../../services/bloodUnitService';
import { getErrorMessage } from '../../utils/errorUtils';

const AdminDashboardPage = () => {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [redistributions, setRedistributions] = useState([]);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    setError('');
    try {
      const [summaryData, redistData] = await Promise.all([
        adminService.getSummary(),
        bloodUnitService.getRedistributionSuggestions({ status: 'pending' }).catch(() => []),
      ]);
      setSummary(summaryData);
      setRedistributions(Array.isArray(redistData) ? redistData : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load admin dashboard.'));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateSuggestions = async () => {
    setGenerating(true);
    try {
      const result = await bloodUnitService.generateRedistribution();
      showToast(`Generated ${result.generated} redistribution suggestion(s).`, 'success');
      loadData();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to generate suggestions.'), 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRedistributionAction = async (id, status) => {
    try {
      await bloodUnitService.updateRedistribution(id, status);
      showToast(`Suggestion ${status}.`, 'success');
      setRedistributions((prev) => prev.filter((s) => s.id !== id));
    } catch (apiError) {
      showToast(getErrorMessage(apiError, `Failed to ${status} suggestion.`), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          System overview, user management, and redistribution control.
        </Typography>
      </Stack>

      {/* ─── Platform Summary ─── */}
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total Users"
            value={summary?.total_users ?? '-'}
            icon={GroupRoundedIcon}
            color="primary"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total Donors"
            value={summary?.total_donors ?? '-'}
            icon={VolunteerActivismRoundedIcon}
            color="secondary"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Verified Donors"
            value={summary?.verified_donors ?? '-'}
            icon={VerifiedUserRoundedIcon}
            color="success"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Active Requests"
            value={summary?.active_requests ?? '-'}
            icon={PendingActionsRoundedIcon}
            color="warning"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Fulfilled Requests"
            value={summary?.fulfilled_requests ?? '-'}
            icon={TaskAltRoundedIcon}
            color="success"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Pending Redistributions"
            value={redistributions.length}
            icon={SwapHorizRoundedIcon}
            color="info"
          />
        </Grid2>
      </Grid2>

      {/* ─── Redistribution Suggestions ─── */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SwapHorizRoundedIcon color="primary" />
              <Typography variant="h6">Cross-Hospital Redistribution</Typography>
            </Stack>
            <Button
              variant="outlined"
              startIcon={<AutorenewRoundedIcon />}
              onClick={generateSuggestions}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Suggestions'}
            </Button>
          </Stack>

          {redistributions.length === 0 ? (
            <EmptyState
              title="No pending suggestions"
              description="Click 'Generate Suggestions' to scan for redistribution opportunities between hospitals."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Source Hospital</TableCell>
                  <TableCell>Target Hospital</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell align="center">Units</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {redistributions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocalHospitalRoundedIcon fontSize="small" color="action" />
                        <Typography variant="body2">{suggestion.source_hospital}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ArrowForwardRoundedIcon fontSize="small" color="action" />
                        <Typography variant="body2">{suggestion.target_hospital}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={suggestion.blood_group} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>{suggestion.suggested_units}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 250, display: 'block' }}>
                        {suggestion.reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleRoundedIcon />}
                          onClick={() => handleRedistributionAction(suggestion.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRedistributionAction(suggestion.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </Stack>
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

export default AdminDashboardPage;
