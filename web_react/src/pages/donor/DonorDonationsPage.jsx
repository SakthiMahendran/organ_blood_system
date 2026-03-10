import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { useForm } from 'react-hook-form';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import ControlledSelect from '../../components/forms/ControlledSelect';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { donationService } from '../../services/donationService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { useToast } from '../../contexts/ToastContext';

const STATUS_COLORS = {
  pending: 'warning',
  approved: 'info',
  completed: 'success',
  rejected: 'error',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      donation_type: 'blood',
      blood_group: '',
      organ_name: '',
      quantity_ml: '',
      hospital_name: '',
      location: '',
      notes: '',
    },
  });

  const donationType = watch('donation_type');

  const loadDonations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await donationService.getMyDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load donations.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const onCreateSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values };
      if (payload.donation_type === 'blood') {
        delete payload.organ_name;
      } else {
        delete payload.blood_group;
        delete payload.quantity_ml;
      }
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '') delete payload[k];
      });

      await donationService.createDonation(payload);
      showToast('Donation recorded successfully', 'success');
      setCreateOpen(false);
      reset();
      loadDonations();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to create donation.'), 'error');
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = async (donationId) => {
    try {
      await donationService.deleteDonation(donationId);
      showToast('Donation deleted', 'success');
      setDonations((prev) => prev.filter((d) => d.id !== donationId));
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to delete donation.'), 'error');
    }
  };

  if (error && donations.length === 0) {
    return <ErrorState message={error} onRetry={loadDonations} />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">My Donations</Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleRoundedIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Record Donation
        </Button>
      </Stack>

      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : donations.length === 0 ? (
            <EmptyState
              icon={VolunteerActivismRoundedIcon}
              title="No donations yet"
              description="Your donation history will appear here. Click 'Record Donation' to add your first one."
              actionLabel="Record Donation"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{d.donation_type}</TableCell>
                    <TableCell>
                      {d.donation_type === 'blood'
                        ? `${d.blood_group || '-'} (${d.quantity_ml || '-'} ml)`
                        : d.organ_name || '-'}
                    </TableCell>
                    <TableCell>{d.hospital_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={d.status}
                        color={STATUS_COLORS[d.status] || 'default'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(d.created_at)}</TableCell>
                    <TableCell align="right">
                      {d.status === 'pending' && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(d.id)}>
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record a Donation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} component="form" id="donation-form" onSubmit={onCreateSubmit} sx={{ mt: 1 }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <ControlledSelect
                  name="donation_type"
                  control={control}
                  label="Donation Type"
                  options={[
                    { value: 'blood', label: 'Blood' },
                    { value: 'organ', label: 'Organ' },
                  ]}
                />
              </Grid2>

              {donationType === 'blood' ? (
                <>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <ControlledSelect
                      name="blood_group"
                      control={control}
                      label="Blood Group"
                      options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <ControlledTextField
                      name="quantity_ml"
                      control={control}
                      label="Quantity (ml)"
                      type="number"
                    />
                  </Grid2>
                </>
              ) : (
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <ControlledTextField name="organ_name" control={control} label="Organ Name" />
                </Grid2>
              )}

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <ControlledTextField name="hospital_name" control={control} label="Hospital" />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <ControlledTextField name="location" control={control} label="Location" />
              </Grid2>
              <Grid2 size={12}>
                <ControlledTextField name="notes" control={control} label="Notes" multiline rows={2} />
              </Grid2>
            </Grid2>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button type="submit" form="donation-form" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Donation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DonorDonationsPage;
