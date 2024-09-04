import { configureStore } from '@reduxjs/toolkit';
import salesReducer from '../features/sales/SalesSlice'; // Imports the sales reducer from the SalesSlice
import expensesReducer from '../features/expenses/ExpenseSlice'; // Imports the expenses reducer from the ExpenseSlice
import authReducer from '../features/auth/AuthSlice'; // Imports the auth reducer from the AuthSlice

// Configure the Redux store with the reducers
const store = configureStore({
  reducer: {
    // Defines the sales slice of state, managed by salesReducer
    sales: salesReducer,
    
    // Defines the expenses slice of state, managed by expensesReducer
    expenses: expensesReducer,
    
    // Defines the authentication slice of state, managed by authReducer
    auth: authReducer,
  },
});

// Define a RootState type that represents the entire Redux state
// This is useful for type-checking the useSelector hook
export type RootState = ReturnType<typeof store.getState>;

// Define AppDispatch type to represent the store's dispatch function
// This type is used to ensure actions are correctly dispatched with the right types
export type AppDispatch = typeof store.dispatch;

// Export the configured store as the default export
export default store;
