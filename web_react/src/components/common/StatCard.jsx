import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { alpha, Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => (
  <MotionCard
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    sx={(theme) => ({
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderRadius: '4px 0 0 4px',
        bgcolor: `${color}.main`,
      },
    })}
  >
    <CardContent>
      <Stack direction="row" spacing={1.75} alignItems="flex-start">
        {Icon && (
          <Avatar
            sx={(theme) => ({
              bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
              width: 44,
              height: 44,
            })}
          >
            <Icon sx={{ fontSize: 22, color: `${color}.main` }} />
          </Avatar>
        )}

        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.68rem', mb: 0.25 }} noWrap>
            {title}
          </Typography>

          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {value}
            </Typography>

            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                {trend.direction === 'up' ? (
                  <TrendingUpRoundedIcon sx={{ fontSize: 15, color: 'success.main' }} />
                ) : (
                  <TrendingDownRoundedIcon sx={{ fontSize: 15, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, fontSize: '0.7rem', color: trend.direction === 'up' ? 'success.main' : 'error.main' }}
                >
                  {trend.value}
                </Typography>
              </Stack>
            )}
          </Stack>

          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.72rem' }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </MotionCard>
);

export default StatCard;
