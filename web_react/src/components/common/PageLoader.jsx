import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const PageLoader = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ textAlign: 'center' }}
    >
      <CircularProgress size={36} thickness={3.5} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontWeight: 500 }}>
        Loading...
      </Typography>
    </motion.div>
  </Box>
);

export default PageLoader;
