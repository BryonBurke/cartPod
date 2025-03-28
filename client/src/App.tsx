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
import FoodCartEdit from './pages/FoodCartEdit';
import UserManagement from './pages/UserManagement';
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
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <Map />
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
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route
            path="/cart-pod-form"
            element={
              <ProtectedRoute>
                <CartPodForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart-pod/:id"
            element={
              <ProtectedRoute>
                <CartPodDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart-pod/:cartPodId/add-food-cart"
            element={
              <ProtectedRoute>
                <FoodCartForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-cart/:id"
            element={
              <ProtectedRoute>
                <FoodCartDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-cart/:id/edit"
            element={
              <ProtectedRoute>
                <FoodCartEdit />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 