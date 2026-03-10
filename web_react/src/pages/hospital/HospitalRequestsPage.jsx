import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import UrgencyChip from '../../components/common/UrgencyChip';
import { useToast } from '../../contexts/ToastContext';
import { hospitalService } from '../../services/hospitalService';
import { matchingService } from '../../services/matchingService';
import { sosService } from '../../services/sosService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const STATUS_COLORS = {
  SUBMITTED: 'info',
  MATCHING: 'warning',
  MATCHED: 'secondary',
  APPROVED: 'primary',
  FULFILLED: 'success',
  CANCELLED: 'error',
};

const HospitalRequestsPage = () => {
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sosTracker, setSOSTracker] = useState(null);
  const [sosTrackerId, setSOSTrackerId] = useState(null);

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    request: null,
    status: 'APPROVED',
    notes: '',
  });

  const loadRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await hospitalService.getHospitalRequests();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => (b.priority_score || 0) - (a.priority_score || 0),
      );
      setRequests(sorted);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load hospital requests.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openStatusDialog = (requestItem, status) => {
    setStatusDialog({ open: true, request: requestItem, status, notes: requestItem.notes || '' });
  };

  const closeStatusDialog = () => {
    setStatusDialog({ open: false, request: null, status: 'APPROVED', notes: '' });
  };

  const updateStatus = async () => {
    if (!statusDialog.request) return;
    try {
      await hospitalService.updateRequestStatus(statusDialog.request.id, statusDialog.status, statusDialog.notes);
      showToast(`Request marked ${statusDialog.status}.`, 'success');
      closeStatusDialog();
      await loadRequests();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update request status.'), 'error');
    }
  };

  const runMatching = async (requestId) => {
    try {
      await matchingService.runMatching(requestId);
      showToast('Matching completed for request.', 'success');
      await loadRequests();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to run matching.'), 'error');
    }
  };

  const sendSOS = async (requestId) => {
    try {
      const result = await sosService.broadcastSOS(requestId);
      showToast(`SOS sent to ${result.donors_notified} eligible donors.`, 'success');
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to send SOS.'), 'error');
    }
  };

  const viewSOSTracker = async (requestId) => {
    try {
      const data = await sosService.getSOSTracker(requestId);
      setSOSTracker(data);
      setSOSTrackerId(requestId);
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to load SOS tracker.'), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadRequests} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Hospital Requests</Typography>

      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : requests.length === 0 ? (
            <EmptyState
              title="No incoming requests"
              description="Incoming submitted requests and your hospital requests will appear here."
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Need</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((requestItem) => (
                  <TableRow
                    key={requestItem.id}
                    sx={(theme) => ({
                      ...(requestItem.urgency === 'CRITICAL' && {
                        '& td:first-of-type': {
                          borderLeft: `4px solid ${theme.palette.error.main}`,
                          paddingLeft: '12px',
                        },
                        bgcolor: alpha(theme.palette.error.main, 0.04),
                      }),
                      ...(requestItem.urgency === 'HIGH' && {
                        '& td:first-of-type': {
                          borderLeft: `4px solid ${theme.palette.warning.main}`,
                          paddingLeft: '12px',
                        },
                      }),
                    })}
                  >
                    <TableCell>#{requestItem.id}</TableCell>
                    <TableCell>{requestItem.request_type}</TableCell>
                    <TableCell>
                      {requestItem.request_type === 'BLOOD'
                        ? `${requestItem.blood_group} (${requestItem.units_needed || 0} units)`
                        : requestItem.organ_type}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5} alignItems="flex-start">
                        <UrgencyChip urgency={requestItem.urgency} />
                        {requestItem.original_urgency && requestItem.original_urgency !== requestItem.urgency && (
                          <Tooltip title={`Auto-escalated from ${requestItem.original_urgency}`}>
                            <Chip
                              size="small"
                              icon={<TrendingUpRoundedIcon />}
                              label={`from ${requestItem.original_urgency}`}
                              variant="outlined"
                              color="warning"
                              sx={{ fontSize: 10 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {Math.round(requestItem.priority_score || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={requestItem.status}
                        color={STATUS_COLORS[requestItem.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(requestItem.updated_at)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        {requestItem.urgency === 'CRITICAL' && !['FULFILLED', 'CANCELLED'].includes(requestItem.status) && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<CampaignRoundedIcon />}
                              onClick={() => sendSOS(requestItem.id)}
                            >
                              SOS
                            </Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => viewSOSTracker(requestItem.id)}>
                              Tracker
                            </Button>
                          </>
                        )}
                        <Button size="small" variant="outlined" onClick={() => runMatching(requestItem.id)}>
                          Match
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openStatusDialog(requestItem, 'APPROVED')}
                          disabled={['APPROVED', 'FULFILLED', 'CANCELLED'].includes(requestItem.status)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          onClick={() => openStatusDialog(requestItem, 'FULFILLED')}
                          disabled={['FULFILLED', 'CANCELLED'].includes(requestItem.status)}
                        >
                          Fulfill
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

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={closeStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Request #{statusDialog.request?.id} to {statusDialog.status}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            margin="normal"
            label="Notes"
            value={statusDialog.notes}
            onChange={(event) => setStatusDialog((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog}>Cancel</Button>
          <Button variant="contained" onClick={updateStatus}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* SOS Tracker Dialog */}
      <Dialog open={!!sosTracker} onClose={() => setSOSTracker(null)} maxWidth="sm" fullWidth>
        <DialogTitle>SOS Response Tracker — Request #{sosTrackerId}</DialogTitle>
        <DialogContent>
          {sosTracker && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2}>
                <Chip label={`${sosTracker.coming} Coming`} color="success" />
                <Chip label={`${sosTracker.pending} Pending`} color="warning" />
                <Chip label={`${sosTracker.cannot_make_it} Declined`} color="error" />
              </Stack>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {sosTracker.coming} of {sosTracker.total_notified} donors confirmed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={sosTracker.total_notified > 0 ? (sosTracker.coming / sosTracker.total_notified) * 100 : 0}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {sosTracker.responses?.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Donor</TableCell>
                      <TableCell>Response</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sosTracker.responses.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.donor_name}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.response}
                            color={r.response === 'coming' ? 'success' : r.response === 'cannot_make_it' ? 'error' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSOSTracker(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default HospitalRequestsPage;
