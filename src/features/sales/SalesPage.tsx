import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { validateToken } from '../auth/authUtils';
import { useNavigate } from 'react-router-dom';
import SalesForm from './SalesForm';
import { RootState } from '../../app/store';
import { addSale } from './SalesSlice';
import {
  Container,
  Typography,
  Box,
  Button,
  Modal,
  Toolbar,
  Avatar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ENDPOINTS from '../../config/apiEndpoints';

interface SalesPageProps {
  isMobile: boolean;
  handleDrawerToggle: () => void;
}

const SalesPage: React.FC<SalesPageProps> = ({ isMobile, handleDrawerToggle }) => {
  const sales = useAppSelector((state: RootState) => state.sales.sales) || [];
  const branchCode = useAppSelector((state: RootState) => state.auth.branchCode);
  const token = useAppSelector((state: RootState) => state.auth.token); // Access the token from the auth state
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      navigate('/login'); // Redirect to login if the token is missing
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}` // Add the authorization header
        }
      };

      console.log(token);

      let response;
      if (branchCode === 'HQ001') {
        response = await axios.get(ENDPOINTS.SALES.LIST, config); // Pass config with the request
      } else {
        response = await axios.get(ENDPOINTS.SALES.BRANCH_SALES_BY_CODE(branchCode || ''), config); // Pass config with the request
      }

      const salesData = Array.isArray(response.data) ? response.data : [];
      dispatch(addSale(salesData)); // Populate sales list with API response
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      setError('Failed to fetch sales. Please try again later.');
    }
  };

  const validateUserToken = async () => {
    const isValid = await validateToken(dispatch);
    if (!isValid) {
      navigate('/login');
    }
  };

  useEffect(() => {
    validateUserToken();
    fetchSales();
  }, [branchCode]); // Fetch sales when branchCode changes

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const theme = useTheme();

  const sortedSales = [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Toolbar
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: theme.spacing(8),
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
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
              <MenuIcon sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
          )}
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, textAlign: 'center', margin: '0 auto', maxWidth: '600px' }}>
            Welcome to the Analytics Dashboard
          </Typography>
          <Avatar sx={{ bgcolor: '#1E3A8A', color: '#FFFFFF' }}>CW</Avatar>
        </Toolbar>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mt: 8 }}>
          Register New Sale
        </Button>

        <Modal open={open} onClose={handleClose} aria-labelledby="sales-form-modal-title" aria-describedby="sales-form-modal-description">
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
            <Typography id="sales-form-modal-title" variant="h6" component="h2">
              Register New Sale
            </Typography>
            <SalesForm handleClose={handleClose} fetchSales={fetchSales} />
          </Box>
        </Modal>

        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Sale Date</TableCell>
                <TableCell align="right">Amount (UGX)</TableCell>
                <TableCell align="right">Branch Code</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSales.map((sale, index) => (
                <TableRow
                  key={sale.transactionReference || index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                  }}
                >
                  <TableCell align="left">{sale.saleDate}</TableCell>
                  <TableCell align="right">{sale.saleAmount.toLocaleString()}</TableCell>
                  <TableCell align="right">{sale.transactionReference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default SalesPage;
