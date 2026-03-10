import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ControlledSelect from '../../components/forms/ControlledSelect';
import ControlledPasswordField from '../../components/forms/ControlledPasswordField';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { USER_ROLE_OPTIONS } from '../../utils/options';
import { getDefaultRouteByRole } from '../../utils/roleUtils';

const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  password: yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  role: yup.string().oneOf(['DONOR', 'ACCEPTOR']).required('Role is required'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      address: '',
      city: '',
      state: '',
      role: 'DONOR',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const payload = {
        username: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        address: values.address,
        city: values.city,
        state: values.state,
        location: `${values.city}, ${values.state}`,
        user_type: values.role,
      };

      const user = await register(payload);
      showToast('Registration complete.', 'success');
      navigate(getDefaultRouteByRole(user?.user_type), { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error, 'Registration failed. Please check inputs.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Create Account
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Register as Donor or Acceptor.
          </Typography>

          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="name" control={control} label="Full Name" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="email" control={control} label="Email" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="phone" control={control} label="Phone" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledPasswordField name="password" control={control} label="Password" autoComplete="new-password" />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <ControlledTextField name="address" control={control} label="Address" multiline minRows={2} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="city" control={control} label="City" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledTextField name="state" control={control} label="State" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ControlledSelect name="role" label="Role" control={control} options={USER_ROLE_OPTIONS} />
              </Grid2>
            </Grid2>

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Register'}
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ mt: 2.5 }}>
            Already have an account?{' '}
            <Typography component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 700 }}>
              Login
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RegisterPage;


