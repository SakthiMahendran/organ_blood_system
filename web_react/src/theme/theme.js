import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#0b6e99',
        dark: '#075372',
        light: '#4f9fbe',
      },
      secondary: {
        main: '#00a878',
      },
      background: {
        default: isDark ? '#0f1724' : '#f3f7fb',
        paper: isDark ? '#182334' : '#ffffff',
      },
      text: {
        primary: isDark ? '#eaf1fb' : '#1a2433',
        secondary: isDark ? 'rgba(234, 241, 251, 0.72)' : 'rgba(26, 36, 51, 0.64)',
      },
      success: {
        main: '#1b8f4c',
      },
      warning: {
        main: '#d98100',
      },
      error: {
        main: '#c7332f',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: 'Manrope, Segoe UI, sans-serif',
      h3: {
        fontWeight: 800,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark
              ? '0 12px 22px rgba(0, 0, 0, 0.34)'
              : '0 14px 28px rgba(15, 28, 47, 0.06)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 10,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

const theme = createAppTheme('light');
export default theme;
