import { Box, Toolbar } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import SideMenu, { drawerWidth } from './SideMenu';
import TopBar from './TopBar';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar onMenuClick={() => setMobileOpen((prev) => !prev)} />
      <SideMenu mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Toolbar />
        <Box sx={{ minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
