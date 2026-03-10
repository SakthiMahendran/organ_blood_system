import { alpha, Chip } from '@mui/material';

const URGENCY_CONFIG = {
  CRITICAL: { color: 'error',   label: 'Critical' },
  HIGH:     { color: 'warning', label: 'High' },
  MEDIUM:   { color: 'info',    label: 'Medium' },
  LOW:      { color: 'success', label: 'Low' },
};

const UrgencyChip = ({ urgency, size = 'small', ...rest }) => {
  const config = URGENCY_CONFIG[urgency?.toUpperCase()] || { color: 'default', label: urgency || 'Unknown' };
  const isCritical = urgency?.toUpperCase() === 'CRITICAL';

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={(theme) => ({
        fontWeight: 700,
        letterSpacing: '0.02em',
        ...(isCritical && {
          animation: 'urgency-pulse 2s ease-in-out infinite',
          '@keyframes urgency-pulse': {
            '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.35)}` },
            '50%': { boxShadow: `0 0 0 6px ${alpha(theme.palette.error.main, 0)}` },
          },
        }),
      })}
      {...rest}
    />
  );
};

export default UrgencyChip;
