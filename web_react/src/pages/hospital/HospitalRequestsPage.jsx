import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { hospitalService } from '../../services/hospitalService';
import { matchingService } from '../../services/matchingService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const HospitalRequestsPage = () => {
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
      setRequests(Array.isArray(data) ? data : []);
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
    setStatusDialog({
      open: true,
      request: requestItem,
      status,
      notes: requestItem.notes || '',
    });
  };

  const closeStatusDialog = () => {
    setStatusDialog({
      open: false,
      request: null,
      status: 'APPROVED',
      notes: '',
    });
  };

  const updateStatus = async () => {
    if (!statusDialog.request) {
      return;
    }
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
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((requestItem) => (
                  <TableRow key={requestItem.id}>
                    <TableCell>#{requestItem.id}</TableCell>
                    <TableCell>{requestItem.request_type}</TableCell>
                    <TableCell>
                      {requestItem.request_type === 'BLOOD'
                        ? `${requestItem.blood_group} (${requestItem.units_needed || 0} units)`
                        : requestItem.organ_type}
                    </TableCell>
                    <TableCell>{requestItem.urgency}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={requestItem.status}
                        color={requestItem.status === 'FULFILLED' ? 'success' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(requestItem.updated_at)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined" onClick={() => runMatching(requestItem.id)}>
                          Run Matching
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
    </Stack>
  );
};

export default HospitalRequestsPage;
