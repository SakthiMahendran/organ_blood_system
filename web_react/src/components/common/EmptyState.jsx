import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const EmptyState = ({ title, description, actionLabel, onAction, icon: Icon = InboxRoundedIcon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35 }}
  >
    <Box
      sx={(theme) => ({
        border: `1.5px dashed ${theme.palette.divider}`,
        borderRadius: 4,
        py: 5,
        px: 3,
        textAlign: 'center',
        bgcolor: alpha(theme.palette.background.paper, 0.5),
      })}
    >
      <Stack alignItems="center" spacing={1.5}>
        <Box
          sx={(theme) => ({
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.07),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Icon sx={{ fontSize: 28, color: 'text.secondary', opacity: 0.5 }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
          {description}
        </Typography>
        {actionLabel ? (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  </motion.div>
);

export default EmptyState;
