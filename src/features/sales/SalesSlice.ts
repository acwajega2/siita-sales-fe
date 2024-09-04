// SalesSlice.ts
import { createSlice,createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ENDPOINTS from '../../config/apiEndpoints'; // Adjust the import based on your project structure
import axios from 'axios';


interface Sale {
  staffPhone: string;
  saleDate: string;
  branchCode: string;
  saleAmount: number;
  paymentMethod: string;
  transactionReference: string;
}

interface SalesState {
  sales: Sale[];
}

const initialState: SalesState = {
  sales: [],
};


// Thunk to fetch sales data
export const fetchSales = createAsyncThunk('sales/fetchSales', async (branchCode: string, { rejectWithValue }) => {
  try {
    let response;
    if (branchCode === 'HQ001') {
      response = await axios.get(ENDPOINTS.SALES.LIST);
    } else {
      response = await axios.get(ENDPOINTS.SALES.BRANCH_SALES_BY_CODE(branchCode));
    }
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch sales. Please try again later.');
  }
});

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addSale: (state, action: PayloadAction<Sale[]>) => {
      state.sales = action.payload; // Replace the existing sales list with the new sales
    },
    removeSale: (state, action: PayloadAction<string>) => {
      state.sales = state.sales.filter((sale) => sale.transactionReference !== action.payload);
    },
    updateSale: (state, action: PayloadAction<Sale>) => {
      const index = state.sales.findIndex((sale) => sale.transactionReference === action.payload.transactionReference);
      if (index !== -1) {
        state.sales[index] = action.payload;
      }
    },
  },
});

export const { addSale, removeSale, updateSale } = salesSlice.actions;

export default salesSlice.reducer;
