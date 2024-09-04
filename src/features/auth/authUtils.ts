import axios from 'axios';
import ENDPOINTS from '../../config/apiEndpoints';
import { login, logout } from './AuthSlice';
import { AppDispatch } from '../../app/store';

// Function to validate the token
export const validateToken = async (dispatch: AppDispatch): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(logout());
      return false;
    }

    const response = await axios.get(ENDPOINTS.AUTH.VALIDATE, {
      params: { token }
    });

    if (response.data === 'Token is valid') {
      return true; // Token is valid
    } else {
      return refreshAccessToken(dispatch); // Attempt to refresh token if validation fails
    }
  } catch (error) {
    dispatch(logout()); // Log out if there's an error during validation
    return false;
  }
};

// Function to refresh the access token
export const refreshAccessToken = async (dispatch: AppDispatch): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(ENDPOINTS.AUTH.REFRESH, null, {
      params: { token }
    });

    const { token: newToken, username, name, role, branchCode, staffPhone } = response.data;

    if (newToken) {
      dispatch(login({
        isAuthenticated: true,
        user: username,
        token: newToken,
        name: name,
        role: role,
        branchCode: branchCode,
        staffPhone: staffPhone,
      }));

      localStorage.setItem('token', newToken); // Update localStorage with new token
      return true;
    } else {
      dispatch(logout());
      return false;
    }
  } catch (error) {
    dispatch(logout()); // Log out if there's an error during refresh
    return false;
  }
};
