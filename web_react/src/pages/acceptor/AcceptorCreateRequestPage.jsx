import { yupResolver } from '@hookform/resolvers/yup';
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ControlledSelect from '../../components/forms/ControlledSelect';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useToast } from '../../contexts/ToastContext';
import { acceptorService } from '../../services/acceptorService';
import { BLOOD_GROUP_OPTIONS, ORGAN_TYPE_OPTIONS, URGENCY_OPTIONS } from '../../utils/options';
import { getErrorMessage, getValidationDetails } from '../../utils/errorUtils';

const emptyToNull = (value, originalValue) => (originalValue === '' || originalValue == null ? null : value);

const schema = yup.object({
  request_type: yup.string().oneOf(['BLOOD', 'ORGAN']).required(),
  blood_group: yup.string().nullable().when('request_type', {
    is: 'BLOOD',
    then: (baseSchema) => baseSchema.required('Blood group is required'),
  }),
  units_needed: yup.number().transform(emptyToNull).nullable().when('request_type', {
    is: 'BLOOD',
    then: (baseSchema) => baseSchema.typeError('Units should be numeric').min(1).max(9999, 'Maximum 9999 units allowed').required('Units are required'),
    otherwise: (baseSchema) => baseSchema.nullable().notRequired(),
  }),
  organ_type: yup.string().nullable().when('request_type', {
    is: 'ORGAN',
    then: (baseSchema) => baseSchema.required('Organ type is required'),
  }),
  required_date: yup.string().nullable(),
  urgency: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).required('Urgency is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  notes: yup.string().nullable(),
});

const defaultValues = {
  request_type: 'BLOOD',
  blood_group: '',
  units_needed: '',
  organ_type: '',
  required_date: '',
  urgency: 'MEDIUM',
  city: '',
  state: '',
  notes: '',
};

const AcceptorCreateRequestPage = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, reset, setError } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const requestType = watch('request_type');

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        blood_group: values.request_type === 'BLOOD' ? values.blood_group : null,
        units_needed: values.request_type === 'BLOOD' ? Number(values.units_needed) : null,
        organ_type: values.request_type === 'ORGAN' ? values.organ_type : null,
        required_date: values.required_date || null,
        urgency: values.urgency,
        city: values.city,
        state: values.state,
        notes: values.notes,
      };

      if (values.request_type === 'BLOOD') {
        await acceptorService.createBloodRequest(payload);
      } else {
        await acceptorService.createOrganRequest(payload);
      }

      showToast('Your request submitted successfully.', 'success');
      reset(defaultValues);
    } catch (apiError) {
      const details = getValidationDetails(apiError);

      if (details && typeof details === 'object') {
        Object.entries(details).forEach(([field, messages]) => {
          const messageText = Array.isArray(messages) ? messages[0] : String(messages);
          setError(field, { type: 'server', message: messageText });
        });
        showToast('Please correct the highlighted fields and submit again.', 'error');
      } else {
        showToast(getErrorMessage(apiError, 'Failed to create request.'), 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Create Request</Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ControlledSelect
                  name="request_type"
                  control={control}
                  label="Request Type"
                  options={[
                    { value: 'BLOOD', label: 'Blood' },
                    { value: 'ORGAN', label: 'Organ' },
                  ]}
                />
              </Grid2>
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

              {requestType === 'BLOOD' ? (
                <>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <ControlledSelect
                      name="blood_group"
                      control={control}
                      label="Blood Group"
                      options={BLOOD_GROUP_OPTIONS}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <ControlledTextField
                      name="units_needed"
                      control={control}
                      label="Units Needed"
                      type="number"
                      inputProps={{ min: 1, max: 9999 }}
                    />
                  </Grid2>
                </>
              ) : (
                <Grid2 size={{ xs: 12 }}>
                  <ControlledSelect name="organ_type" control={control} label="Organ Type" options={ORGAN_TYPE_OPTIONS} />
                </Grid2>
              )}

              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="city" control={control} label="City" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="state" control={control} label="State" />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <ControlledTextField name="notes" control={control} label="Additional Notes" multiline minRows={3} />
              </Grid2>
            </Grid2>

            <Alert severity="info">Hospital can approve and fulfill after matching and verification.</Alert>

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress color="inherit" size={20} /> : 'Submit Request'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AcceptorCreateRequestPage;
