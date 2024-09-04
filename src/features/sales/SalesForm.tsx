// SalesForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import {useAppSelector } from '../../app/hooks';
import ENDPOINTS from '../../config/apiEndpoints';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  InputAdornment,
  Alert,
} from '@mui/material';

interface SalesFormProps {
  handleClose: () => void;
  fetchSales: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ handleClose, fetchSales }) => {
  const [transactionReference, setTransactionReference] = useState(() =>
    Math.random().toString(36).substring(2, 15)
  );
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleAmount, setSaleAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [error, setError] = useState<string | null>(null);

  const staffPhone = useAppSelector((state) => state.auth.staffPhone);
  const branchCode = useAppSelector((state) => state.auth.branchCode);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (staffPhone && saleDate && branchCode && saleAmount && paymentMethod && transactionReference) {
      const newSale = {
        staffPhone,
        saleDate,
        branchCode,
        saleAmount: parseFloat(saleAmount),
        paymentMethod,
        transactionReference,
      };

      try {
        const response = await axios.post(ENDPOINTS.SALES.CREATE, newSale);
        if (response.status === 201) {
          setTransactionReference(Math.random().toString(36).substring(2, 15));
          setSaleDate(new Date().toISOString().split('T')[0]);
          setSaleAmount('');
          setPaymentMethod('Cash');
          setError(null);
          handleClose(); // Close the modal
          fetchSales();  // Fetch updated sales list
        }
      } catch (error) {
        console.error('Failed to create sale:', error);
        setError('Failed to create sale. Please try again later.');
      }
    } else {
      setError('Please fill in all fields before submitting.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Transaction Reference"
        variant="outlined"
        value={transactionReference}
        required
        fullWidth
        disabled
      />
      <TextField
        label="Staff Phone"
        variant="outlined"
        value={staffPhone || ''}
        required
        fullWidth
        disabled
      />
      <TextField
        label="Sale Date"
        type="date"
        variant="outlined"
        value={saleDate}
        onChange={(e) => setSaleDate(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Branch Code"
        variant="outlined"
        value={branchCode || ''}
        required
        fullWidth
        disabled
      />
      <TextField
        label="Sale Amount"
        type="number"
        variant="outlined"
        value={saleAmount}
        onChange={(e) => setSaleAmount(e.target.value)}
        required
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
        }}
      />
      <TextField
        label="Payment Method"
        variant="outlined"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        required
        fullWidth
        select
      >
        <MenuItem value="Cash">Cash</MenuItem>
        <MenuItem value="Card">Card</MenuItem>
        <MenuItem value="Mobile Money">Mobile Money</MenuItem>
      </TextField>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 1 }}
      >
        Add Sale
      </Button>
    </Box>
  );
};

export default SalesForm;
