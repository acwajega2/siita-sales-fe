import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { validateToken } from '../features/auth/authUtils';
import { logout } from '../features/auth/AuthSlice';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Box, Drawer, Toolbar } from '@mui/material'; // Removed unused Typography import
import { useTheme, useMediaQuery } from '@mui/material';

import MainContent from '../pages/MainContent';
import Sidebar from '../pages/Sidebar';
import SalesPage from '../features/sales/SalesPage';
import ExpensesPage from '../features/expenses/ExpensesPage';
import { fetchSales } from '../features/sales/SalesSlice';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const salesData = useAppSelector((state) => state.sales.sales);
  const expensesData = useAppSelector((state) => state.expenses.expenses);
  const branchCode = useAppSelector((state) => state.auth.branchCode);

  console.log(branchCode);

  useEffect(() => {
    const checkTokenAndFetchSales = async () => {
      const isValid = await validateToken(dispatch);
      if (!isValid) {
        navigate('/login');
      } else {
        if (branchCode) {
          dispatch(fetchSales(branchCode)); // Only dispatch if branchCode is not null
        }
      }
    };

    checkTokenAndFetchSales();
  }, [dispatch, navigate, branchCode]); // Included branchCode in dependencies

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F4F6F8' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            boxShadow: isMobile ? 'none' : '2px 0 5px rgba(0, 0, 0, 0.1)',
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        <Sidebar handleLogout={handleLogout} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          p: isMobile ? 2 : 3,
          backgroundColor: '#ffff',
          minHeight: '100%',
          height: 'auto',
        }}
      >
        <Toolbar />
        
        <Routes>
          <Route
            path="dashboard"
            element={
              <MainContent
                isMobile={isMobile}
                handleDrawerToggle={handleDrawerToggle}
                isAuthenticated={isAuthenticated}
                salesData={salesData}
                expensesData={expensesData}
              />
            }
          />
          <Route path="sales" element={<SalesPage isMobile={isMobile} handleDrawerToggle={handleDrawerToggle} />} />
          <Route path="expenses" element={<ExpensesPage isMobile={isMobile} handleDrawerToggle={handleDrawerToggle} />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;
