import { Box, Toolbar } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import PageTransition from '../common/PageTransition';
import SideMenu, { drawerWidth } from './SideMenu';
import TopBar from './TopBar';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
