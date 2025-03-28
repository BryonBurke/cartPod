import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import cartPodService from '../services/cartPodService';

// Default placeholder image URL
const DEFAULT_IMAGE = 'https://via.placeholder.com/200x200?text=No+Image';

interface FoodCartFormData {
  name: string;
  podLocationImage: string;
  cartImage: string;
  menuImages: string[];
}

const FoodCartForm: React.FC = () => {
  const { cartPodId } = useParams<{ cartPodId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartPod, setCartPod] = useState<any>(null);
  const [formData, setFormData] = useState<FoodCartFormData>({
    name: '',
    podLocationImage: DEFAULT_IMAGE,
    cartImage: DEFAULT_IMAGE,
    menuImages: [DEFAULT_IMAGE],
  });

  useEffect(() => {
    const fetchCartPod = async () => {
      try {
        if (!cartPodId) return;
        const pod = await cartPodService.getCartPodById(cartPodId);
        setCartPod(pod);
      } catch (err) {
        console.error('Error fetching cart pod:', err);
        setError('Failed to load cart pod details.');
      }
    };

    fetchCartPod();
  }, [cartPodId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof FoodCartFormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await cartPodService.uploadImage(formData);
      setFormData(prev => ({
        ...prev,
        [field]: response.imageUrl,
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await cartPodService.uploadImage(formData);
      setFormData(prev => ({
        ...prev,
        menuImages: [...prev.menuImages, response.imageUrl],
      }));
    } catch (err) {
      console.error('Error uploading menu image:', err);
      setError('Failed to upload menu image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeMenuImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      menuImages: prev.menuImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!cartPodId) throw new Error('Cart pod ID is required');

      // Only include images in the request if they're not the default image
      const foodCartData = {
        name: formData.name,
        location: cartPod.location,
        cartPod: cartPodId,
        ...(formData.podLocationImage !== DEFAULT_IMAGE && { podLocationImage: formData.podLocationImage }),
        ...(formData.cartImage !== DEFAULT_IMAGE && { cartImage: formData.cartImage }),
        ...(formData.menuImages.some(img => img !== DEFAULT_IMAGE) && {
          menuImages: formData.menuImages.filter(img => img !== DEFAULT_IMAGE)
        })
      };

      await cartPodService.addFoodCartToPod(cartPodId, foodCartData);
      navigate(`/cart-pod/${cartPodId}`);
    } catch (err) {
      console.error('Error adding food cart:', err);
      setError('Failed to add food cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartPod) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Food Cart to {cartPod.name}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Food Cart Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Pod Location Image (Optional)
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleImageUpload(e, 'podLocationImage')}
                style={{ display: 'none' }}
                id="pod-location-image"
              />
              <label htmlFor="pod-location-image">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={loading}
                >
                  Upload Pod Location Image
                </Button>
              </label>
              <Box mt={1}>
                <img
                  src={formData.podLocationImage}
                  alt="Pod Location"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Cart Image (Optional)
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleImageUpload(e, 'cartImage')}
                style={{ display: 'none' }}
                id="cart-image"
              />
              <label htmlFor="cart-image">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={loading}
                >
                  Upload Cart Image
                </Button>
              </label>
              <Box mt={1}>
                <img
                  src={formData.cartImage}
                  alt="Cart"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Menu Images (Optional)
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={handleMenuImageUpload}
                style={{ display: 'none' }}
                id="menu-images"
              />
              <label htmlFor="menu-images">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={loading}
                >
                  Add Menu Image
                </Button>
              </label>
              <Box mt={2}>
                {formData.menuImages.map((image, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                    <img
                      src={image}
                      alt={`Menu ${index + 1}`}
                      style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeMenuImage(index)}
                      disabled={loading || formData.menuImages.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/cart-pod/${cartPodId}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !formData.name}
                >
                  {loading ? <CircularProgress size={24} /> : 'Add Food Cart'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FoodCartForm; 