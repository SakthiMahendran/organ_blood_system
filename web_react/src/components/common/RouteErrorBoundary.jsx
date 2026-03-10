import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { Component } from 'react';

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected render error',
    };
  }

  componentDidCatch(error, errorInfo) {
    // Keep detailed stack in console for debugging.
    // eslint-disable-next-line no-console
    console.error('Route render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ py: 2 }}>
          <Alert severity="error" variant="filled">
            <AlertTitle>Page Render Failed</AlertTitle>
            <Typography variant="body2">
              {this.state.errorMessage}
            </Typography>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
