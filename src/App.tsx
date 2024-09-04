import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './features/auth/LoginPage';
import PrivateRoute from './routes/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private route for the main dashboard */}
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/*" element={<Dashboard />} /> {/* Corrected to handle nested routes */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
