import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.yourdomain.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export the apiClient for use in other parts of the application
export default apiClient;

// Adding an empty export to make this file a module
export {};
