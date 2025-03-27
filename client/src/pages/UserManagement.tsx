import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: Partial<User>) => Promise<void>;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          margin="normal"
          required
          select
          SelectProps={{
            native: true,
          }}
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchUsers();
    fetchCurrentUser();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/auth/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      const response = await api.put(`/auth/${selectedUser.id}`, userData);
      setUsers(users.map(user => 
        user.id === selectedUser.id ? response.data : user
      ));
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/map')}
        >
          Back to Map
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEditUser(user)}
                    disabled={user.id === currentUser?.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === currentUser?.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleUpdateUser}
      />
    </Box>
  );
};

export default UserManagement; 