import { alpha, createTheme } from '@mui/material/styles';

export const createAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  /* ─── Medical palette ────────────────────────────────
     Primary:   Teal — calming, clinical, trustworthy
     Secondary: Emerald green — healing, vitality
     Error:     Warm red — emergency, critical
     Warning:   Amber — caution, attention
     Success:   Green — positive, healthy
  ─────────────────────────────────────────────────────── */
  const primary   = { main: '#0891B2', dark: '#0E7490', light: '#22D3EE', contrastText: '#fff' };
  const secondary = { main: '#10B981', dark: '#059669', light: '#34D399', contrastText: '#fff' };
  const error     = { main: '#EF4444', dark: '#DC2626', light: '#F87171' };
  const warning   = { main: '#F59E0B', dark: '#D97706', light: '#FBBF24' };
  const success   = { main: '#10B981', dark: '#059669', light: '#34D399' };
  const info      = { main: '#3B82F6', dark: '#2563EB', light: '#60A5FA' };

  const bg = {
    default: isDark ? '#0B1120' : '#F1F5F9',
    paper:   isDark ? '#111827' : '#FFFFFF',
  };

  const text = {
    primary:   isDark ? '#F1F5F9' : '#0F172A',
    secondary: isDark ? '#94A3B8' : '#64748B',
  };

  const divider = isDark ? alpha('#94A3B8', 0.12) : alpha('#0F172A', 0.08);

  const cardShadow = isDark
    ? `0 1px 3px ${alpha('#000', 0.3)}, 0 4px 16px ${alpha('#000', 0.2)}`
    : `0 1px 3px ${alpha('#0F172A', 0.04)}, 0 4px 20px ${alpha('#0F172A', 0.04)}`;

  const cardHoverShadow = isDark
    ? `0 4px 12px ${alpha('#000', 0.4)}, 0 8px 28px ${alpha('#000', 0.3)}`
    : `0 4px 12px ${alpha('#0F172A', 0.06)}, 0 8px 28px ${alpha('#0891B2', 0.06)}`;

  return createTheme({
    palette: { mode, primary, secondary, error, warning, success, info, background: bg, text, divider },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Manrope", "Inter", "Segoe UI", sans-serif',
      h3: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h4: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h5: { fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontWeight: 700, fontSize: '1.05rem' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600, fontSize: '0.82rem' },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      caption: { fontSize: '0.75rem', lineHeight: 1.5 },
      button: { fontWeight: 700, letterSpacing: '0.01em' },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: cardShadow,
            border: `1px solid ${divider}`,
            transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            '&:hover': { boxShadow: cardHoverShadow },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: { padding: 22, '&:last-child': { paddingBottom: 22 } },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 10,
            transition: 'all 0.2s ease',
          },
          contained: { '&:hover': { transform: 'translateY(-1px)' } },
          sizeSmall: { fontSize: '0.8rem', padding: '4px 12px' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
          sizeSmall: { fontSize: '0.72rem', height: 24 },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase',
              letterSpacing: '0.06em', color: text.secondary,
              borderBottom: `2px solid ${divider}`, paddingTop: 10, paddingBottom: 10,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              transition: 'background-color 0.15s ease',
              '&:hover': { backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#0891B2', 0.02) },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${divider}`, fontSize: '0.85rem', paddingTop: 12, paddingBottom: 12 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(primary.main, 0.12)}` },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
          standardInfo: {
            backgroundColor: isDark ? alpha(info.main, 0.08) : alpha(info.main, 0.06),
            border: `1px solid ${alpha(info.main, 0.15)}`,
          },
          standardSuccess: {
            backgroundColor: isDark ? alpha(success.main, 0.08) : alpha(success.main, 0.06),
            border: `1px solid ${alpha(success.main, 0.15)}`,
          },
          standardWarning: {
            backgroundColor: isDark ? alpha(warning.main, 0.08) : alpha(warning.main, 0.06),
            border: `1px solid ${alpha(warning.main, 0.15)}`,
          },
          standardError: {
            backgroundColor: isDark ? alpha(error.main, 0.08) : alpha(error.main, 0.06),
            border: `1px solid ${alpha(error.main, 0.15)}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 16 } },
        defaultProps: {
          slotProps: { backdrop: { sx: { backdropFilter: 'blur(6px)', bgcolor: alpha('#000', 0.25) } } },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 8, height: 6 } },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
        },
      },
      MuiSelect: {
        defaultProps: { variant: 'outlined', size: 'small' },
        styleOverrides: {
          outlined: { borderRadius: 10 },
        },
      },
      MuiFormControl: {
        defaultProps: { size: 'small' },
      },
      MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none' } } },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 8, fontWeight: 600, fontSize: '0.72rem', backgroundColor: isDark ? '#1E293B' : '#0F172A' },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: divider } },
      },
    },
  });
};

const theme = createAppTheme('light');
export default theme;
