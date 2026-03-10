import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { alpha, Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { ROLE_MENU } from '../../routes/routeConfig';
import { normalizeRole } from '../../utils/roleUtils';

const drawerWidth = 260;

const SideMenu = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(() => ROLE_MENU[normalizeRole(user?.user_type)] || [], [user?.user_type]);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />

      {/* ── Brand header ─── */}
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 2.5, pt: 0.5, pb: 2 }}>
        <Box
          sx={(theme) => ({
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          })}
        >
          <FavoriteBorderRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        </Box>
        <Stack spacing={-0.25}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: 'text.primary', lineHeight: 1.2 }}>
            Organ & Blood Bank
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {normalizeRole(user?.user_type) || 'System'} Panel
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ mx: 2 }} />

      {/* ── Nav items ─── */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => { navigate(item.path); onMobileClose(); }}
              sx={(theme) => ({
                borderRadius: 2,
                mb: 0.3,
                py: 0.85,
                pl: 1.5,
                transition: 'all 0.18s ease',
                color: selected ? theme.palette.primary.main : theme.palette.text.primary,
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: selected
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.text.primary, 0.04),
                },
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                },
              })}
            >
              <ListItemIcon
                sx={(theme) => ({
                  minWidth: 34,
                  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'color 0.18s ease',
                })}
              >
                <Icon sx={{ fontSize: 19 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.84rem',
                  fontWeight: selected ? 700 : 500,
                }}
              />
              {selected && (
                <Box sx={(theme) => ({ width: 3, height: 18, borderRadius: 2, bgcolor: theme.palette.primary.main })} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* ── Footer ─── */}
      <Stack sx={{ px: 2.5, py: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.4, fontSize: '0.62rem' }}>
          v1.0 &middot; Medical Platform
        </Typography>
      </Stack>
    </Box>
  );

  const paperSx = (theme) => ({
    boxSizing: 'border-box',
    width: drawerWidth,
    bgcolor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  });

  return (
    <>
      <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose} ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': paperSx }}>
        {drawerContent}
      </Drawer>
      <Drawer variant="permanent" open
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': paperSx }}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export { drawerWidth };
export default SideMenu;
