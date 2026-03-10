import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => (
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
          <SearchOffRoundedIcon sx={{ fontSize: 40, color: 'error.main' }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', opacity: 0.15 }}>
          404
        </Typography>
        <Typography variant="h5">Page not found</Typography>
        <Typography variant="body2" color="text.secondary">
          The page you're looking for doesn't exist or has been moved to a different location.
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 1 }}>
          Back to Login
        </Button>
      </Stack>
    </motion.div>
  </Box>
);

export default NotFoundPage;
