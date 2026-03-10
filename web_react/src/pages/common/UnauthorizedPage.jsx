import { Card, CardContent, Container, Typography } from '@mui/material';

const UnauthorizedPage = () => (
  <Container maxWidth="sm" sx={{ py: 10 }}>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Access Denied
        </Typography>
        <Typography color="text.secondary">You do not have permission to view this route.</Typography>
      </CardContent>
    </Card>
  </Container>
);

export default UnauthorizedPage;
