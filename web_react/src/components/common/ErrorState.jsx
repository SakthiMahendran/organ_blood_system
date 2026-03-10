import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Box sx={{ py: 4 }}>
      <Box
        sx={(theme) => ({
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.error.main, 0.04),
          px: 3,
          py: 2.5,
        })}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <ErrorOutlineRoundedIcon sx={{ color: 'error.main', fontSize: 22 }} />
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
            {message || 'Unable to load data.'}
          </Typography>
          {onRetry ? (
            <Button variant="outlined" color="error" size="small" onClick={onRetry} sx={{ flexShrink: 0 }}>
              Retry
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Box>
  </motion.div>
);

export default ErrorState;
