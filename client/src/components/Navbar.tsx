import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

interface User {
  id: string;
  email: string;
  role: 'owner' | 'admin';
}

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to get user data:', error);
        setUser(null);
        authService.logout();
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          CartPod
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            onClick={() => navigate('/map')}
            sx={{ mr: 2 }}
          >
            Map
          </Button>
          {user ? (
            <>
              <Typography component="span" sx={{ mr: 2 }}>
                {user.email} ({user.role})
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 