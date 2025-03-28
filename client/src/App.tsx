import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Map from './pages/Map';
import CartPodForm from './pages/CartPodForm';
import CartPodDetails from './pages/CartPodDetails';
import FoodCartForm from './pages/FoodCartForm';
import FoodCartDetails from './pages/FoodCartDetails';
import UserManagement from './pages/UserManagement';
import LandingPage from './pages/LandingPage';
import authService from './services/authService';

// Initialize axios interceptors
authService.setupAxiosInterceptors();

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/map" element={<Map />} />
          <Route path="/cart-pod/:id" element={<CartPodDetails />} />
          <Route path="/food-cart/:id" element={<FoodCartDetails />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route
            path="/cart-pod/new"
            element={
              <ProtectedRoute>
                <CartPodForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-cart/new"
            element={
              <ProtectedRoute>
                <FoodCartForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 