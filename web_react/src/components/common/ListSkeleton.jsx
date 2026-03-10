import { Skeleton, Stack } from '@mui/material';

const ListSkeleton = ({ rows = 5 }) => (
  <Stack spacing={1.25} sx={{ py: 1 }}>
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} variant="rounded" height={52} />
    ))}
  </Stack>
);

export default ListSkeleton;
