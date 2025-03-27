import React, { useState, useEffect } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div>
      {/* Existing code */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); navigate('/map'); }}>
          Map
        </MenuItem>
        {user?.role === 'admin' && (
          <MenuItem onClick={() => { handleClose(); navigate('/users'); }}>
            User Management
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

export default Navbar; 