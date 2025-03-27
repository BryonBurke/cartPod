import React from 'react';
import { Typography, Box, Button } from '@mui/material';
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
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/cart-pods')}
        >
          View Cart Pods
        </Button>
      </Box>
    </Box>
  );
};

export default Home; 