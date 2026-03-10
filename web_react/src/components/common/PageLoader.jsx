import { Box, CircularProgress } from '@mui/material';

const PageLoader = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <CircularProgress />
  </Box>
);

export default PageLoader;
