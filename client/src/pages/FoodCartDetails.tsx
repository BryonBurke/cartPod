import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import cartPodService, { FoodCart } from '../services/cartPodService';

const FoodCartDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [foodCart, setFoodCart] = useState<FoodCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodCart = async () => {
      try {
        if (!id) return;
        const cart = await cartPodService.getFoodCartById(id);
        setFoodCart(cart);
      } catch (err) {
        console.error('Error fetching food cart:', err);
        setError('Failed to load food cart details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodCart();
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

  if (!foodCart) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <Alert severity="info">Food cart not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Back
          </Button>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', flex: 1 }}>
            {foodCart.name}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/food-cart/${id}/edit`)}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Edit
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Cart Image
            </Typography>
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px',
              bgcolor: 'grey.50',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <img
                src={foodCart.cartImage}
                alt={foodCart.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  padding: '16px'
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Pod Location Image
            </Typography>
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px',
              bgcolor: 'grey.50',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <img
                src={foodCart.podLocationImage}
                alt="Pod Location"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  padding: '16px'
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Menu Images
            </Typography>
            <Grid container spacing={2}>
              {foodCart.menuImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      minHeight: '300px',
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
                      <img
                        src={image}
                        alt={`Menu ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          padding: '16px'
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {foodCart.reviews && foodCart.reviews.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reviews
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {foodCart.averageRating.toFixed(1)} / 5
              </Typography>
              {foodCart.reviews.map((review, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {review.user}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {review.rating} / 5
                  </Typography>
                  <Typography variant="body1">
                    {review.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default FoodCartDetails; 