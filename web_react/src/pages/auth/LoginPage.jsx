import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import BloodtypeRoundedIcon from '@mui/icons-material/BloodtypeRounded';
import { yupResolver } from '@hookform/resolvers/yup';
import { alpha, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import ControlledPasswordField from '../../components/forms/ControlledPasswordField';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PATHS } from '../../routes/paths';
import { getErrorMessage } from '../../utils/errorUtils';
import { getDefaultRouteByRole } from '../../utils/roleUtils';

const loginSchema = yup.object({
  identifier: yup.string().required('Email or phone is required'),
  password: yup.string().required('Password is required'),
});

/* Floating medical icon */
const FloatingIcon = ({ icon: Icon, sx, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 0.12, y: 0 }}
    transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    style={{ position: 'absolute', pointerEvents: 'none', ...sx }}
  >
    <Icon sx={{ fontSize: 48, color: 'primary.main' }} />
  </motion.div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: { identifier: '', password: '' },
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isAuthenticated) await logout({ skipApi: true });
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Left panel — brand & medical identity ─── */}
      <Box
        sx={(theme) => ({
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 44%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
          px: 6,
          py: 8,
          overflow: 'hidden',
        })}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid', borderColor: alpha('#fff', 0.08), top: -80, left: -60 }} />
        <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid', borderColor: alpha('#fff', 0.06), bottom: -40, right: -30 }} />
        <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#fff', 0.04), top: '30%', right: '15%' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center', maxWidth: 400 }}>
            {/* Pulse icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: alpha('#fff', 0.12),
                  border: `2px solid ${alpha('#fff', 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FavoriteBorderRoundedIcon sx={{ fontSize: 40, color: '#fff' }} />
              </Box>
            </motion.div>

            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800 }}>
              Save Lives,<br />One Drop at a Time
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.7), fontSize: '1rem', lineHeight: 1.7 }}>
              A unified platform connecting donors, hospitals, and recipients for blood and organ donation management.
            </Typography>

            {/* Stats row */}
            <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
              {[
                { label: 'Donors', value: '1.2K+' },
                { label: 'Hospitals', value: '45+' },
                { label: 'Lives Saved', value: '890+' },
              ].map((stat) => (
                <Stack key={stat.label} alignItems="center">
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>{stat.value}</Typography>
                  <Typography sx={{ color: alpha('#fff', 0.5), fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </motion.div>
      </Box>

      {/* ── Right panel — login form ─── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 5 },
          py: 4,
          position: 'relative',
        }}
      >
        <FloatingIcon icon={BloodtypeRoundedIcon} sx={{ top: '12%', right: '10%' }} delay={0.3} />
        <FloatingIcon icon={LocalHospitalRoundedIcon} sx={{ bottom: '15%', left: '8%' }} delay={0.5} />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Stack spacing={3.5}>
            <Stack spacing={0.75}>
              {/* Mobile-only brand */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { md: 'none' }, mb: 1 }}>
                <Box sx={(t) => ({ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(t.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
                  <FavoriteBorderRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                </Box>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800 }}>Organ & Blood Bank</Typography>
              </Stack>

              <Typography variant="h4">Welcome back</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue to your dashboard
              </Typography>
            </Stack>

            <Card>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack spacing={2.5} component="form" onSubmit={onSubmit}>
                  <ControlledTextField
                    name="identifier"
                    control={control}
                    label="Email or Phone"
                    placeholder="you@example.com"
                  />
                  <ControlledPasswordField name="password" control={control} label="Password" />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ py: 1.25 }}
                  >
                    {isSubmitting ? <CircularProgress color="inherit" size={22} /> : 'Sign In'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Stack spacing={0.75} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Typography variant="body2" color="text.secondary">
                New here?{' '}
                <Typography
                  component={RouterLink}
                  to={PATHS.REGISTER}
                  sx={{ color: 'primary.main', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
                >
                  Create an account
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registering as institution?{' '}
                <Typography
                  component={RouterLink}
                  to={PATHS.REGISTER_HOSPITAL}
                  sx={{ color: 'primary.main', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
                >
                  Register Hospital
                </Typography>
              </Typography>
            </Stack>
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
};

export default LoginPage;
