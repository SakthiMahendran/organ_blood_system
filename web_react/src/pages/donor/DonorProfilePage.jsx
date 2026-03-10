import { yupResolver } from '@hookform/resolvers/yup';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ErrorState from '../../components/common/ErrorState';
import ControlledSelect from '../../components/forms/ControlledSelect';
import ControlledSwitch from '../../components/forms/ControlledSwitch';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useToast } from '../../contexts/ToastContext';
import { donorService } from '../../services/donorService';
import { BLOOD_GROUP_OPTIONS, ORGAN_TYPE_OPTIONS } from '../../utils/options';
import { getErrorMessage } from '../../utils/errorUtils';

const schema = yup.object({
  blood_group: yup.string().required('Blood group is required'),
  organ_willing: yup.boolean(),
  organ_types: yup.array().when('organ_willing', {
    is: true,
    then: (baseSchema) => baseSchema.min(1, 'Select at least one organ type'),
  }),
  last_blood_donation_date: yup.string().nullable(),
  medical_notes: yup.string().nullable(),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
});

const defaultValues = {
  blood_group: '',
  organ_willing: false,
  organ_types: [],
  last_blood_donation_date: '',
  medical_notes: '',
  city: '',
  state: '',
};

const DonorProfilePage = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('AVAILABLE');
  const [isAvailabilitySaving, setIsAvailabilitySaving] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const organWilling = watch('organ_willing');

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      const profile = await donorService.getProfile();
      reset({
        blood_group: profile?.blood_group || '',
        organ_willing: Boolean(profile?.organ_willing),
        organ_types: profile?.organ_types || [],
        last_blood_donation_date: profile?.last_blood_donation_date || '',
        medical_notes: profile?.medical_notes || '',
        city: profile?.city || '',
        state: profile?.state || '',
      });
      setAvailabilityStatus(profile?.availability_status || 'AVAILABLE');
    } catch (apiError) {
      if (apiError?.response?.status === 404) {
        reset(defaultValues);
        setAvailabilityStatus('AVAILABLE');
      } else {
        setError(getErrorMessage(apiError, 'Failed to load donor profile.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      await donorService.upsertProfile({
        ...values,
        organ_types: values.organ_willing ? values.organ_types : [],
      });
      showToast('Profile updated successfully.', 'success');
      await loadProfile();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update donor profile.'), 'error');
    } finally {
      setIsSaving(false);
    }
  });

  const handleAvailabilityToggle = async (checked) => {
    const nextStatus = checked ? 'AVAILABLE' : 'NOT_AVAILABLE';
    setAvailabilityStatus(nextStatus);
    setIsAvailabilitySaving(true);
    try {
      await donorService.updateAvailability(nextStatus);
      showToast('Availability updated.', 'success');
    } catch (apiError) {
      setAvailabilityStatus((previous) => (previous === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE'));
      showToast(getErrorMessage(apiError, 'Failed to update availability.'), 'error');
    } finally {
      setIsAvailabilitySaving(false);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProfile} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Donor Profile</Typography>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems="center">
            <Typography variant="h6">Availability</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography color="text.secondary">{availabilityStatus}</Typography>
              <Button
                variant={availabilityStatus === 'AVAILABLE' ? 'outlined' : 'contained'}
                onClick={() => handleAvailabilityToggle(availabilityStatus !== 'AVAILABLE')}
                disabled={isAvailabilitySaving}
              >
                {isAvailabilitySaving ? <CircularProgress color="inherit" size={18} /> : 'Toggle Availability'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledSelect name="blood_group" control={control} label="Blood Group" options={BLOOD_GROUP_OPTIONS} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledTextField
                  name="last_blood_donation_date"
                  control={control}
                  label="Last Donation Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledSwitch name="organ_willing" control={control} label="Willing to Donate Organ" />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <ControlledSelect
                  name="organ_types"
                  control={control}
                  label="Organ Types"
                  options={ORGAN_TYPE_OPTIONS}
                  multiple
                />
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="city" control={control} label="City" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="state" control={control} label="State" />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <ControlledTextField name="medical_notes" control={control} label="Medical Notes" multiline minRows={4} />
              </Grid2>
            </Grid2>

            {!organWilling ? (
              <Alert severity="info">Enable organ donation if you want to be matched for organ requests.</Alert>
            ) : null}

            <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={isSaving}>
              {isSaving ? <CircularProgress size={18} color="inherit" /> : 'Save Profile'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default DonorProfilePage;


