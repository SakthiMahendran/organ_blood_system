import { Box, Button, Card, CardContent, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => (
  <Container maxWidth="sm" sx={{ py: 10 }}>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Page Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The page you requested does not exist or moved.
        </Typography>
        <Box>
          <Button component={RouterLink} to="/login" variant="contained">
            Back to Login
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Container>
);

export default NotFoundPage;
