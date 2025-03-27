import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import cartPodService, { CartPod } from '../services/cartPodService';
import authService from '../services/authService';

interface CartPodFormData {
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  arrangementImage?: string;
}

const CartPodForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CartPodFormData>({
    name: '',
    location: {
      type: 'Point',
      coordinates: [0, 0],
    },
  });

  useEffect(() => {
    // If we have coordinates from the map, set them
    if (location.state?.coordinates) {
      setFormData(prev => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: location.state.coordinates,
        },
      }));
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // The auth token will be automatically added by the axios interceptor
      await cartPodService.createCartPod(formData);
      setSuccess(true);
      // Redirect back to map after a short delay
      setTimeout(() => {
        navigate('/map');
      }, 1500);
    } catch (err) {
      console.error('Error creating cart pod:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('You must be logged in to create a cart pod. Please log in and try again.');
      } else {
        setError('Failed to create cart pod. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Cart Pod
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Cart pod created successfully! Redirecting to map...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Longitude"
            name="longitude"
            value={formData.location.coordinates[0]}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                location: {
                  ...prev.location,
                  coordinates: [parseFloat(e.target.value), prev.location.coordinates[1]],
                },
              }));
            }}
            required
            type="number"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Latitude"
            name="latitude"
            value={formData.location.coordinates[1]}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                location: {
                  ...prev.location,
                  coordinates: [prev.location.coordinates[0], parseFloat(e.target.value)],
                },
              }));
            }}
            required
            type="number"
            margin="normal"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Cart Pod'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/map')}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CartPodForm; 