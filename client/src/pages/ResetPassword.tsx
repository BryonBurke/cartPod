import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { 
        token,
        password 
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Alert severity="error">
            Invalid reset link. Please request a new password reset.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/forgot-password')}
            sx={{ mt: 2 }}
          >
            Request New Reset Link
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={3}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please enter your new password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert severity="success">
            Password has been reset successfully. Redirecting to login...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              helperText="Password must be at least 6 characters long and contain at least one number, one lowercase letter, and one uppercase letter."
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Box mt={3} display="flex" gap={2}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Back to Login
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword; 