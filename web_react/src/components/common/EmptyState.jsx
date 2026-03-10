import { Box, Button, Typography } from '@mui/material';

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <Box
    sx={{
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 3,
      p: 4,
      textAlign: 'center',
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant="h6" sx={{ mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: actionLabel ? 2 : 0 }}>
      {description}
    </Typography>
    {actionLabel ? (
      <Button variant="contained" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </Box>
);

export default EmptyState;
