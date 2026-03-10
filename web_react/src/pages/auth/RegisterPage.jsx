import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import { yupResolver } from '@hookform/resolvers/yup';
import { alpha, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
      name: '', email: '', phone: '', password: '',
      address: '', city: '', state: '', role: 'DONOR',
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute', width: 380, height: 380, borderRadius: '50%',
          background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 70%)`,
          top: '-8%', left: '-5%', pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ width: '100%', maxWidth: 560 }}
      >
        <Stack alignItems="center" spacing={3}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box
              sx={(theme) => ({
                width: 56, height: 56, borderRadius: 3,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              })}
            >
              <PersonAddRoundedIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
            </Box>
          </motion.div>

          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Create account</Typography>
            <Typography variant="body2" color="text.secondary">Register as Donor or Acceptor</Typography>
          </Stack>

          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: { xs: 3, sm: 3.5 } }}>
              <Stack spacing={2.5} component="form" onSubmit={onSubmit}>
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

                <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.3, fontSize: '0.9rem' }}>
                  {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Typography component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
              Sign in
            </Typography>
          </Typography>
        </Stack>
      </motion.div>
    </Box>
  );
};

export default RegisterPage;
