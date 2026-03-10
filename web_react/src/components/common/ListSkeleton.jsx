import { Skeleton, Stack } from '@mui/material';
import { motion } from 'framer-motion';

const ListSkeleton = ({ rows = 5 }) => (
  <Stack spacing={1} sx={{ py: 1 }}>
    {Array.from({ length: rows }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.06 }}
      >
        <Skeleton
          variant="rounded"
          height={48}
          sx={{ borderRadius: 2.5 }}
        />
      </motion.div>
    ))}
  </Stack>
);

export default ListSkeleton;
