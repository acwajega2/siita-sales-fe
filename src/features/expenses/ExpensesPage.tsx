import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { validateToken } from '../auth/authUtils';
import { setExpenses, addExpense, removeExpense, setError, setLoading } from './ExpenseSlice';
import { RootState } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { MenuItem } from '@mui/material';

import {
  useTheme, Container, Typography, TextField, Button,
  Box, Modal, Toolbar, Avatar, InputAdornment, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ENDPOINTS from '../../config/apiEndpoints';

interface ExpensePageProps {
  isMobile: boolean;
  handleDrawerToggle: () => void;
}

interface Expense {
  transactionReference: string;
  branchCode: string;
  staffPhone: string;
  expenseDate: string;
  expenseAmount: number;
  expenseCategory: string;
  receiptImageUrl: string;
}

const ExpensesPage: React.FC<ExpensePageProps> = ({ isMobile, handleDrawerToggle }) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const [transactionReference, setTransactionReference] = useState(() => Math.random().toString(36).substring(2, 15));
  const [expenseDate, setExpenseDate] = useState(currentDate);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Others');
  const [receiptImageUrl, setReceiptImageUrl] = useState('https://via.placeholder.com/150');
  const [open, setOpen] = useState(false);

  const branchCode = useAppSelector((state: RootState) => state.auth.branchCode);
  const staffPhone = useAppSelector((state: RootState) => state.auth.staffPhone);
  const expenses = useAppSelector((state: RootState) => state.expenses.expenses);
  const status = useAppSelector((state: RootState) => state.expenses.status);
  const error = useAppSelector((state: RootState) => state.expenses.error);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    dispatch(setLoading());
    try {
      const response = branchCode === 'HQ001'
        ? await axios.get(ENDPOINTS.EXPENSES.LIST)
        : await axios.get(ENDPOINTS.EXPENSES.BY_BRANCH_CODE(branchCode || ''));
      const expensesData = response.data;
      dispatch(setExpenses(expensesData));
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      dispatch(setError('Failed to fetch expenses'));
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionReference && branchCode && staffPhone && expenseDate && expenseAmount && expenseCategory) {
      const newExpense = {
        transactionReference,
        branchCode,
        staffPhone,
        expenseDate,
        expenseAmount: parseFloat(expenseAmount),
        expenseCategory,
        receiptImageUrl,
      };

      try {
        const response = await axios.post(ENDPOINTS.EXPENSES.CREATE, newExpense);
        const createdExpense = response.data;
        dispatch(addExpense(createdExpense));
        setTransactionReference(Math.random().toString(36).substring(2, 15));
        setExpenseDate(currentDate);
        setExpenseAmount('');
        setExpenseCategory('Others');
        setReceiptImageUrl('https://via.placeholder.com/150');
        handleClose();
      } catch (error) {
        console.error('Failed to create expense:', error);
        dispatch(setError('Failed to create expense'));
      }
    } else {
      dispatch(setError('All fields must be filled out to submit an expense.'));
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const isValid = await validateToken(dispatch);
      if (!isValid) {
        navigate('/login');
      }
    };

    checkToken();
    fetchExpenses();
  }, [dispatch, navigate, branchCode]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRemoveExpense = (transactionReference: string) => {
    dispatch(removeExpense(transactionReference));
  };

  const theme = useTheme();
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());

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

        {status === 'failed' && error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2, mt: 10 }}>
          Add New Expense
        </Button>

        <Modal open={open} onClose={handleClose} aria-labelledby="add-expense-modal-title" aria-describedby="add-expense-modal-description">
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
            <Typography id="add-expense-modal-title" variant="h6" component="h2">
              Add New Expense
            </Typography>
            <Box component="form" onSubmit={handleAddExpense} sx={{ mt: 2 }}>
              <TextField
                label="Transaction Reference"
                variant="outlined"
                margin="normal"
                fullWidth
                value={transactionReference}
                disabled
                required
              />
              <TextField
                label="Branch Code"
                variant="outlined"
                margin="normal"
                fullWidth
                value={branchCode || ''}
                disabled
                required
              />
              <TextField
                label="Staff Phone"
                variant="outlined"
                margin="normal"
                fullWidth
                value={staffPhone || ''}
                disabled
                required
              />
              <TextField
                label="Expense Date"
                type="date"
                variant="outlined"
                margin="normal"
                fullWidth
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Expense Amount"
                type="number"
                variant="outlined"
                margin="normal"
                fullWidth
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
                }}
              />
              <TextField
                label="Expense Category"
                variant="outlined"
                margin="normal"
                fullWidth
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                select
                required
              >
                <MenuItem value="Electricity">Electricity</MenuItem>
                <MenuItem value="Transport">Transport</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </TextField>
              <TextField
                label="Receipt Image URL"
                variant="outlined"
                margin="normal"
                fullWidth
                value={receiptImageUrl}
                disabled
              />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Add Expense
              </Button>
            </Box>
          </Box>
        </Modal>

        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Expense Date</TableCell>
                <TableCell align="right">Amount (UGX)</TableCell>
                <TableCell align="right">Branch Code</TableCell>
                <TableCell align="right">Category</TableCell>
                <TableCell align="right">Staff Phone</TableCell>
               
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedExpenses.map((expense, index) => (
                <TableRow
                  key={expense.transactionReference}
                  sx={{
                    backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                  }}
                >
                  <TableCell align="left">{expense.expenseDate}</TableCell>
                  <TableCell align="right">{expense.expenseAmount.toLocaleString()}</TableCell>
                  <TableCell align="right">{expense.branchCode}</TableCell>
                  <TableCell align="right">{expense.expenseCategory}</TableCell>
                  <TableCell align="right">{expense.staffPhone}</TableCell>
                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ExpensesPage;
