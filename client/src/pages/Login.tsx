import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import authService from '../services/authService';
import { SelectChangeEvent } from '@mui/material';
import api from '../services/api';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [signUpDialogOpen, setSignUpDialogOpen] = useState(false);
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'owner',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/map');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.token);
      navigate('/map');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setResetDialogOpen(true);
  };

  const handleResetSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/reset-password', { email: resetEmail });
      setError('Password reset instructions have been sent to your email.');
      setResetDialogOpen(false);
      setResetEmail('');
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Validate password match
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password length
    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Validate name
    if (!signUpData.name.trim()) {
      setError('Name is required.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate role
    if (!['owner', 'admin'].includes(signUpData.role)) {
      setError('Invalid role selected.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.register({
        name: signUpData.name.trim(),
        email: signUpData.email.toLowerCase(),
        password: signUpData.password,
        role: signUpData.role as 'owner' | 'admin',
      });
      setError('Account created successfully. You can now log in.');
      setSignUpDialogOpen(false);
      setSignUpData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'owner',
      });
    } catch (err) {
      console.error('Sign up error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        if (err.response.data.error) {
          // Handle "User already exists" error
          setError(err.response.data.error);
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          // Handle express-validator errors
          const firstError = err.response.data.errors[0];
          setError(firstError.msg);
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Login
        </Typography>

        {error && (
          <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            margin="normal"
            required
            disabled={loading}
          />
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              color="primary"
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', justifyContent: 'flex-end' }}>
            <MuiLink
              component="button"
              type="button"
              variant="body2"
              onClick={() => setSignUpDialogOpen(true)}
              disabled={loading}
            >
              Sign up
            </MuiLink>
          </Box>
        </form>
      </Paper>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleResetSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sign Up Dialog */}
      <Dialog open={signUpDialogOpen} onClose={() => setSignUpDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Account</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={signUpData.name}
            onChange={handleTextInputChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={signUpData.email}
            onChange={handleTextInputChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={signUpData.password}
            onChange={handleTextInputChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={signUpData.confirmPassword}
            onChange={handleTextInputChange}
            required
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={signUpData.role}
              onChange={handleSelectChange}
              label="Role"
            >
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignUpDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSignUp}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 