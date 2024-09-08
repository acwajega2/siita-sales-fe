import React from 'react';
import {
  Box,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Container,
  Grid,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DailySalesChart from '../components/common/charts/DailySalesChart';
import DailyExpensesChart from '../components/common/charts/DailyExpensesChart';
import MonthlySalesChart from '../components/common/charts/MonthlySalesChart';
import MonthlyExpensesChart from '../components/common/charts/MonthlyExpensesChart';
import YtdSalesChart from '../components/common/charts/YtdSalesChart';
import YtdExpensesChart from '../components/common/charts/YtdExpensesChart';
import ProfitChart from '../components/common/charts/ProfitChart';
import TotalDailySalesChart from '../components/common/charts/TotalDailySalesChart'; // Import TotalDailySalesChart
import { Outlet } from 'react-router-dom';
import { useTheme } from '@mui/material';

interface MainContentProps {
  isMobile: boolean;
  handleDrawerToggle: () => void;
  isAuthenticated: boolean;
  salesData: Array<any>; // Replace with specific type if available
  expensesData: Array<any>; // Replace with specific type if available
}

const MainContent: React.FC<MainContentProps> = ({
  isMobile,
  handleDrawerToggle,
  isAuthenticated,
  salesData,
  expensesData,
}) => {
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Fixed Toolbar */}
      <Toolbar
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: theme.spacing(8), // Use theme spacing for consistent design
          bgcolor: theme.palette.background.paper,
          zIndex: theme.zIndex.appBar + 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: theme.spacing(3),
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon sx={{ color: theme.palette.text.secondary }} />
          </IconButton>
        )}
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            textAlign: 'center',
            margin: '0 auto',
            maxWidth: '600px',
          }}
        >
          Welcome to the Analytics Dashboard
        </Typography>
        <Avatar sx={{ bgcolor: '#1E3A8A', color: '#FFFFFF' }}>CW</Avatar>
      </Toolbar>

      {/* Main Content Section */}
      <Box sx={{ pt: theme.spacing(10), px: theme.spacing(4), bgcolor: '#fffff' }}>
        {isAuthenticated ? (
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {/* Move TotalDailySalesChart to the top */}
              <Grid item xs={12}>
                <TotalDailySalesChart salesData={salesData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <DailySalesChart salesData={salesData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <DailyExpensesChart expensesData={expensesData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <MonthlySalesChart salesData={salesData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <MonthlyExpensesChart expensesData={expensesData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <YtdSalesChart salesData={salesData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <YtdExpensesChart expensesData={expensesData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <ProfitChart salesData={salesData} expensesData={expensesData} />
              </Grid>
            </Grid>
          </Container>
        ) : (
          <Typography variant="body1" sx={{ mt: 2, color: 'red' }}>
            Please log in to see your dashboard.
          </Typography>
        )}
        {/* Outlet for nested routes */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainContent;
