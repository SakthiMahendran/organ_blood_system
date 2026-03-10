import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const UnauthorizedPage = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stack alignItems="center" spacing={2.5} sx={{ textAlign: 'center', maxWidth: 360 }}>
        <Box
          sx={(theme) => ({
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.error.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <LockRoundedIcon sx={{ fontSize: 40, color: 'error.main' }} />
        </Box>
        <Typography variant="h5">Access Denied</Typography>
        <Typography variant="body2" color="text.secondary">
          You don't have permission to view this page. Contact your administrator if you believe this is an error.
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 1 }}>
          Back to Login
        </Button>
      </Stack>
    </motion.div>
  </Box>
);

export default UnauthorizedPage;
