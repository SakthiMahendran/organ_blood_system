import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardContent, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ControlledPasswordField from '../../components/forms/ControlledPasswordField';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { PATHS } from '../../routes/paths';
import { getDefaultRouteByRole } from '../../utils/roleUtils';

const loginSchema = yup.object({
  identifier: yup.string().required('Email or phone is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      // Ensure account switching does not keep stale role/session redirect state.
      if (isAuthenticated) {
        await logout({ skipApi: true });
      }

      const user = await login(values);
      showToast('Login successful.', 'success');
      navigate(getDefaultRouteByRole(user?.user_type), { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error, 'Login failed. Please check your credentials.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 9 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Login to the Organ & Blood Bank Donation System.
          </Typography>

          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            <ControlledTextField
              name="identifier"
              control={control}
              label="Email or Phone"
              placeholder="you@example.com or +91xxxxxxxxxx"
            />
            <ControlledPasswordField name="password" control={control} label="Password" />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress color="inherit" size={22} /> : 'Login'}
            </Button>
          </Stack>

          <Stack spacing={0.5} sx={{ mt: 2.5 }}>
            <Typography variant="body2">
              New here?{' '}
              <Typography component={RouterLink} to={PATHS.REGISTER} sx={{ color: 'primary.main', fontWeight: 700 }}>
                Create an account
              </Typography>
            </Typography>
            <Typography variant="body2">
              Registering as institution?{' '}
              <Typography component={RouterLink} to={PATHS.REGISTER_HOSPITAL} sx={{ color: 'primary.main', fontWeight: 700 }}>
                Register Hospital / Blood Bank
              </Typography>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
