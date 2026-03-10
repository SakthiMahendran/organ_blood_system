import { yupResolver } from '@hookform/resolvers/yup';
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
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import ControlledSelect from '../../components/forms/ControlledSelect';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useToast } from '../../contexts/ToastContext';
import { acceptorService } from '../../services/acceptorService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { BLOOD_GROUP_OPTIONS, ORGAN_TYPE_OPTIONS, URGENCY_OPTIONS } from '../../utils/options';

const updateSchema = yup.object({
  blood_group: yup.string().nullable(),
  units_needed: yup.number().transform((value, originalValue) => (originalValue === '' ? null : value)).nullable(),
  organ_type: yup.string().nullable(),
  urgency: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).required(),
  required_date: yup.string().nullable(),
  city: yup.string().required(),
  state: yup.string().required(),
  notes: yup.string().nullable(),
});

const AcceptorTrackRequestsPage = () => {
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRequest, setEditingRequest] = useState(null);
  const [deletingRequest, setDeletingRequest] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(updateSchema),
    defaultValues: {
      blood_group: '',
      units_needed: '',
      organ_type: '',
      urgency: 'MEDIUM',
      required_date: '',
      city: '',
      state: '',
      notes: '',
    },
  });

  const loadRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await acceptorService.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load requests.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openEditDialog = (requestItem) => {
    setEditingRequest(requestItem);
    reset({
      blood_group: requestItem.blood_group || '',
      units_needed: requestItem.units_needed || '',
      organ_type: requestItem.organ_type || '',
      urgency: requestItem.urgency,
      required_date: requestItem.required_date || '',
      city: requestItem.city,
      state: requestItem.state,
      notes: requestItem.notes || '',
    });
  };

  const closeEditDialog = () => {
    setEditingRequest(null);
  };

  const canCancel = (status) => !['FULFILLED', 'CANCELLED'].includes(status);

  const canEdit = useMemo(() => (status) => !['FULFILLED', 'CANCELLED'].includes(status), []);

  const submitUpdate = handleSubmit(async (values) => {
    if (!editingRequest) {
      return;
    }

    try {
      await acceptorService.updateRequest(editingRequest.id, {
        blood_group: editingRequest.request_type === 'BLOOD' ? values.blood_group : null,
        units_needed: editingRequest.request_type === 'BLOOD' ? (values.units_needed ? Number(values.units_needed) : null) : null,
        organ_type: editingRequest.request_type === 'ORGAN' ? values.organ_type : null,
        urgency: values.urgency,
        required_date: values.required_date || null,
        city: values.city,
        state: values.state,
        notes: values.notes,
      });
      showToast('Request updated.', 'success');
      closeEditDialog();
      await loadRequests();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update request.'), 'error');
    }
  });

  const confirmCancel = async () => {
    if (!deletingRequest) {
      return;
    }

    try {
      await acceptorService.cancelRequest(deletingRequest.id);
      showToast('Request cancelled.', 'success');
      setDeletingRequest(null);
      await loadRequests();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to cancel request.'), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadRequests} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Track Requests</Typography>

      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : requests.length === 0 ? (
            <EmptyState
              title="No requests to track"
              description="Create a new request and its lifecycle will show up here."
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
                {requests.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>{item.request_type}</TableCell>
                    <TableCell>{item.request_type === 'BLOOD' ? `${item.blood_group} (${item.units_needed || 0} units)` : item.organ_type}</TableCell>
                    <TableCell>{item.urgency}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status}
                        color={item.status === 'FULFILLED' ? 'success' : item.status === 'CANCELLED' ? 'error' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(item.updated_at)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined" onClick={() => openEditDialog(item)} disabled={!canEdit(item.status)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => setDeletingRequest(item)} disabled={!canCancel(item.status)}>
                          Cancel
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

      <Dialog open={Boolean(editingRequest)} onClose={closeEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Request #{editingRequest?.id}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid2 container spacing={2}>
              {editingRequest?.request_type === 'BLOOD' ? (
                <>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <ControlledSelect name="blood_group" control={control} label="Blood Group" options={BLOOD_GROUP_OPTIONS} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <ControlledTextField
                      name="units_needed"
                      control={control}
                      label="Units Needed"
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  </Grid2>
                </>
              ) : (
                <Grid2 size={{ xs: 12 }}>
                  <ControlledSelect name="organ_type" control={control} label="Organ Type" options={ORGAN_TYPE_OPTIONS} />
                </Grid2>
              )}

              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledSelect name="urgency" control={control} label="Urgency" options={URGENCY_OPTIONS} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledTextField
                  name="required_date"
                  control={control}
                  label="Required Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledTextField name="city" control={control} label="City" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledTextField name="state" control={control} label="State" />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <ControlledTextField name="notes" control={control} label="Notes" multiline minRows={3} />
              </Grid2>
            </Grid2>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Close</Button>
          <Button variant="contained" onClick={submitUpdate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingRequest)}
        title="Cancel Request"
        description={`Do you want to cancel request #${deletingRequest?.id}? This action cannot be reversed.`}
        confirmLabel="Cancel Request"
        onCancel={() => setDeletingRequest(null)}
        onConfirm={confirmCancel}
      />
    </Stack>
  );
};

export default AcceptorTrackRequestsPage;




