import React from 'react';
import { Typography, Box, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to CartPod
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Your platform for managing food cart pods
      </Typography>
      <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/cart-pods')}
          >
            View Cart Pods
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/map')}
          >
            Find Carts on Map
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home; 