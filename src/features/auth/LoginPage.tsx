import React, { useState } from 'react';
import { useAppDispatch } from '../../app/hooks'; // Importing the hook to dispatch actions to the Redux store
import { login } from './AuthSlice'; // Importing the login action from the auth slice
import { useNavigate } from 'react-router-dom'; // Importing the hook to navigate programmatically
import axios from 'axios'; // Importing axios for making HTTP requests
import ENDPOINTS from '../../config/apiEndpoints'; // Importing API endpoints configuration

// MUI Components
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material'; // Importing Material-UI components for styling

const LoginPage: React.FC = () => {
  // State hooks to manage input values and error message
  const [username, setUsername] = useState(''); // State to store the username input
  const [password, setPassword] = useState(''); // State to store the password input
  const [error, setError] = useState(''); // State to store error messages
  const dispatch = useAppDispatch(); // Hook to dispatch actions to the Redux store
  const navigate = useNavigate(); // Hook to navigate to different routes

  // Function to handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Sending a POST request to the login endpoint with the username and password
      const response = await axios.post(ENDPOINTS.AUTH.LOGIN, { username, password });

      // If a token is received in the response, proceed to handle successful login
      if (response.data.token) {
        const { token, username, name, role, branchCode, staffPhone } = response.data; // Destructuring the response data

        // Dispatch the login action with user details and token
        dispatch(login({
          isAuthenticated: true, // Set authentication state to true
          user: username, // Store the username
          token: token, // Store the JWT token
          name: name, // Store the user's full name
          role: role, // Store the user's role
          branchCode: branchCode, // Store the user's branch code
          staffPhone: staffPhone, // Store the user's staff phone number
        }));

        // Redirect to the dashboard upon successful login
        navigate('/dashboard');
      } else {
        // Set error message if no token is received
        setError('Login failed: No token received');
      }
    } catch (err) {
      // Set error message if an error occurs during login
      setError('Invalid username or password');
    }
  };

  // Render the login form UI
  return (
    <Container maxWidth="xs"> {/* Restrict container width to make it compact */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8, // Margin from the top
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        {/* Display error message if there is one */}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {/* Login form */}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            margin="normal"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state on change
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
