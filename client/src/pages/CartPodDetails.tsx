import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import cartPodService, { CartPod, FoodCart } from '../services/cartPodService';

const CartPodDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cartPod, setCartPod] = useState<CartPod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartPod = async () => {
      try {
        if (!id) return;
        const pod = await cartPodService.getCartPodById(id);
        setCartPod(pod);
      } catch (err) {
        console.error('Error fetching cart pod:', err);
        setError('Failed to load cart pod details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartPod();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!cartPod) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <Alert severity="info">Cart pod not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {cartPod.name}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/cart-pod/${id}/add-food-cart`)}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Add Food Cart
          </Button>
        </Box>
        {cartPod.description && (
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {cartPod.description}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Food Carts
        </Typography>
        {cartPod.foodCarts && cartPod.foodCarts.length > 0 ? (
          <ul>
            {cartPod.foodCarts.map((cart: FoodCart, index: number) => (
              <li key={index}>
                <Typography variant="body1">{cart.name}</Typography>
                {cart.description && (
                  <Typography variant="body2" color="text.secondary">
                    {cart.description}
                  </Typography>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No food carts currently assigned
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CartPodDetails; 