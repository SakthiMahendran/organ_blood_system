import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { ROLE_MENU } from '../../routes/routeConfig';
import { normalizeRole } from '../../utils/roleUtils';

const drawerWidth = 250;

const SideMenu = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(() => ROLE_MENU[normalizeRole(user?.user_type)] || [], [user?.user_type]);

  const drawerContent = (
    <>
      <Toolbar />
      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                onMobileClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(15, 28, 47, 0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { drawerWidth };
export default SideMenu;
