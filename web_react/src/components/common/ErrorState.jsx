import { Alert, Box, Button, Stack, Typography } from '@mui/material';

const ErrorState = ({ message, onRetry }) => (
  <Box sx={{ py: 4 }}>
    <Alert severity="error">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Typography variant="body2">{message || 'Unable to load data.'}</Typography>
        {onRetry ? (
          <Button variant="outlined" color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </Stack>
    </Alert>
  </Box>
);

export default ErrorState;
