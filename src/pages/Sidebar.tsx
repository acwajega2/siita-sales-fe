// src/components/Sidebar.tsx

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface SidebarProps {
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleLogout }) => {
  return (
    <Box className="drawerContent">
      <Toolbar>
        <Typography variant="h6" className="drawerTypography">
          Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem component={RouterLink} to="/dashboard">
          <DashboardIcon sx={{ mr: 2, color: '#FFFFFF' }} />
          <ListItemText primary="Dashboard Overview" sx={{  color: '#FFFFFF' }}/>
        </ListItem>
        <ListItem component={RouterLink} to="/sales">
          <BarChartIcon sx={{ mr: 2, color: '#FFFFFF' }} />
          <ListItemText primary="Sales Page" sx={{  color: '#FFFFFF' }}/>
        </ListItem>
        <ListItem component={RouterLink} to="/expenses">
          <AttachMoneyIcon sx={{ mr: 2, color: '#FFFFFF' }} />
          <ListItemText primary="Expenses Page" sx={{  color: '#FFFFFF' }}/>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          className="drawerButton"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
