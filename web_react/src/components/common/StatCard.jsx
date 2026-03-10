import { Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ title, value, subtitle }) => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: subtitle ? 0.5 : 0 }}>
        {value}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
);

export default StatCard;
