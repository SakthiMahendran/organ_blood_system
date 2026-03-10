import { yupResolver } from '@hookform/resolvers/yup';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Stack,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import ControlledPasswordField from '../../components/forms/ControlledPasswordField';
import ControlledSelect from '../../components/forms/ControlledSelect';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/authService';
import { PATHS } from '../../routes/paths';
import { BLOOD_GROUP_OPTIONS } from '../../utils/options';
import { getErrorMessage, getValidationDetails } from '../../utils/errorUtils';

const INSTITUTION_TYPE_OPTIONS = [
  'Hospital',
  'Blood Bank',
  'Clinic',
  'Multi-speciality',
  'Government Hospital',
  'Private Hospital',
].map((value) => ({ value, label: value }));

const phoneRegex = /^\+?[0-9]{7,15}$/;
const pincodeRegex = /^[0-9]{4,10}$/;

const schema = yup.object({
  hospital_name: yup.string().required('Hospital / Blood Bank name is required'),
  registration_number: yup.string().required('Registration / license number is required'),
  institution_type: yup.string().required('Institution type is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().matches(phoneRegex, 'Enter a valid phone number').required('Phone is required'),

  address_line_1: yup.string().required('Address line 1 is required'),
  address_line_2: yup.string().nullable(),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().matches(pincodeRegex, 'Enter a valid pincode').required('Pincode is required'),

  contact_person_name: yup.string().required('Contact person name is required'),
  contact_person_role: yup.string().required('Contact person role/designation is required'),
  contact_person_phone: yup
    .string()
    .matches(phoneRegex, 'Enter a valid contact number')
    .required('Contact number is required'),

  blood_bank_available: yup.boolean().default(false),
  organ_transplant_support: yup.boolean().default(false),
  emergency_response: yup.boolean().default(false),
  supported_blood_groups: yup.array().of(yup.string()).min(1, 'Select at least one supported blood group'),

  password: yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),

  license_document_name: yup.string().nullable(),
  hospital_id_proof_name: yup.string().nullable(),
});

const HospitalRegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseFileName, setLicenseFileName] = useState('');
  const [idProofFileName, setIdProofFileName] = useState('');

  const defaultValues = useMemo(
    () => ({
      role: 'hospital',
      hospital_name: '',
      registration_number: '',
      institution_type: '',
      email: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      contact_person_name: '',
      contact_person_role: '',
      contact_person_phone: '',
      blood_bank_available: false,
      organ_transplant_support: false,
      emergency_response: false,
      supported_blood_groups: [],
      password: '',
      confirm_password: '',
      license_document_name: '',
      hospital_id_proof_name: '',
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const applyApiValidation = (apiError) => {
    const details = getValidationDetails(apiError);
    if (!details || typeof details !== 'object') {
      return;
    }

    Object.entries(details).forEach(([field, value]) => {
      const message = Array.isArray(value) ? value[0] : typeof value === 'string' ? value : 'Invalid value';
      if (field in defaultValues) {
        setError(field, { type: 'server', message });
      }
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      // TODO: Switch to multipart/form-data when backend file upload endpoints are added.
      const payload = {
        ...values,
        role: 'hospital',
        license_document_name: licenseFileName || values.license_document_name || '',
        hospital_id_proof_name: idProofFileName || values.hospital_id_proof_name || '',
      };

      await authService.registerHospital(payload);
      showToast('Hospital registration submitted successfully. Awaiting admin approval.', 'success');
      navigate(PATHS.LOGIN, { replace: true });
    } catch (apiError) {
      applyApiValidation(apiError);
      showToast(getErrorMessage(apiError, 'Hospital registration failed. Please check your input.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  });

  const toggleBloodGroup = (currentValues, value) => {
    if (currentValues.includes(value)) {
      return currentValues.filter((item) => item !== value);
    }
    return [...currentValues, value];
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 5, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={onSubmit}>
              <Stack spacing={0.75}>
                <Typography variant="h4">Hospital / Blood Bank Registration</Typography>
                <Typography color="text.secondary">
                  Submit your institution profile for admin verification.
                </Typography>
              </Stack>

              <Divider />
              <Typography variant="h6">Institution Details</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <ControlledTextField name="hospital_name" control={control} label="Hospital / Blood Bank Name" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <ControlledTextField
                    name="registration_number"
                    control={control}
                    label="Registration Number / License Number"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <ControlledSelect
                    name="institution_type"
                    control={control}
                    label="Institution Type"
                    options={INSTITUTION_TYPE_OPTIONS}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <ControlledTextField name="email" control={control} label="Email" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <ControlledTextField name="phone" control={control} label="Phone" />
                </Grid2>
              </Grid2>

              <Divider />
              <Typography variant="h6">Location</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <ControlledTextField name="address_line_1" control={control} label="Address Line 1" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <ControlledTextField name="address_line_2" control={control} label="Address Line 2 (Optional)" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <ControlledTextField name="city" control={control} label="City" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <ControlledTextField name="state" control={control} label="State" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <ControlledTextField name="pincode" control={control} label="Pincode" />
                </Grid2>
              </Grid2>

              <Divider />
              <Typography variant="h6">Authorized Contact Person</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <ControlledTextField name="contact_person_name" control={control} label="Full Name" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <ControlledTextField name="contact_person_role" control={control} label="Role / Designation" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <ControlledTextField name="contact_person_phone" control={control} label="Contact Number" />
                </Grid2>
              </Grid2>

              <Divider />
              <Typography variant="h6">Capabilities</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="blood_bank_available"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />}
                        label="Blood bank available"
                      />
                    )}
                  />
                  <Controller
                    name="organ_transplant_support"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />}
                        label="Organ transplant support"
                      />
                    )}
                  />
                  <Controller
                    name="emergency_response"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />}
                        label="Emergency response available"
                      />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="supported_blood_groups"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormControl error={Boolean(fieldState.error)}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Supported Blood Groups
                        </Typography>
                        <FormGroup row>
                          {BLOOD_GROUP_OPTIONS.map((option) => (
                            <FormControlLabel
                              key={option.value}
                              label={option.label}
                              control={(
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onChange={() => field.onChange(toggleBloodGroup(field.value || [], option.value))}
                                />
                              )}
                            />
                          ))}
                        </FormGroup>
                        {fieldState.error ? <FormHelperText>{fieldState.error.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid2>
              </Grid2>

              <Divider />
              <Typography variant="h6">Account Setup</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <ControlledPasswordField name="password" control={control} label="Password" autoComplete="new-password" />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <ControlledPasswordField
                    name="confirm_password"
                    control={control}
                    label="Confirm Password"
                    autoComplete="new-password"
                  />
                </Grid2>
              </Grid2>

              <Divider />
              <Typography variant="h6">Compliance / Verification</Typography>
              <Stack spacing={1.25}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                  <Button component="label" variant="outlined" startIcon={<UploadFileRoundedIcon />}>
                    License Document (Optional)
                    <input
                      hidden
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        const fileName = file?.name || '';
                        setLicenseFileName(fileName);
                        setValue('license_document_name', fileName, { shouldValidate: true });
                      }}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {licenseFileName ? `Selected: ${licenseFileName}` : 'No license document selected.'}
                  </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                  <Button component="label" variant="outlined" startIcon={<UploadFileRoundedIcon />}>
                    Hospital ID Proof (Optional)
                    <input
                      hidden
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        const fileName = file?.name || '';
                        setIdProofFileName(fileName);
                        setValue('hospital_id_proof_name', fileName, { shouldValidate: true });
                      }}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {idProofFileName ? `Selected: ${idProofFileName}` : 'No ID proof selected.'}
                  </Typography>
                </Stack>

                <Alert severity="info">
                  File uploads are currently captured as placeholders and can be switched to full document upload API later.
                </Alert>
              </Stack>

              {errors?.non_field_errors ? <Alert severity="error">{errors.non_field_errors.message}</Alert> : null}

              <Button type="submit" size="large" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Submit for Verification'}
              </Button>

              <Typography variant="body2">
                Already have a hospital account?{' '}
                <Typography component={RouterLink} to={PATHS.LOGIN} sx={{ color: 'primary.main', fontWeight: 700 }}>
                  Back to login
                </Typography>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default HospitalRegisterPage;
