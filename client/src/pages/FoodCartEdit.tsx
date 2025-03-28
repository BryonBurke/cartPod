import React, { useEffect, useState } from 'react';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import cartPodService, { FoodCart } from '../services/cartPodService';

// Default image URLs from Cloudinary
const DEFAULT_IMAGES = {
  POD_LOCATION: 'https://res.cloudinary.com/demo/image/upload/v1/food-carts/default-pod-location.jpg',
  CART: 'https://res.cloudinary.com/demo/image/upload/v1/food-carts/default-cart.jpg',
  MENU: 'https://res.cloudinary.com/demo/image/upload/v1/food-carts/default-menu.jpg'
};

interface FoodCartFormData {
  name: string;
  podLocationImage: string;
  cartImage: string;
  menuImages: string[];
}

const FoodCartEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foodCart, setFoodCart] = useState<FoodCart | null>(null);
  const [formData, setFormData] = useState<FoodCartFormData>({
    name: '',
    podLocationImage: DEFAULT_IMAGES.POD_LOCATION,
    cartImage: DEFAULT_IMAGES.CART,
    menuImages: [DEFAULT_IMAGES.MENU],
  });

  useEffect(() => {
    const fetchFoodCart = async () => {
      try {
        if (!id) return;
        const cart = await cartPodService.getFoodCartById(id);
        setFoodCart(cart);
        setFormData({
          name: cart.name,
          podLocationImage: cart.podLocationImage || DEFAULT_IMAGES.POD_LOCATION,
          cartImage: cart.cartImage || DEFAULT_IMAGES.CART,
          menuImages: cart.menuImages.length > 0 ? cart.menuImages : [DEFAULT_IMAGES.MENU],
        });
      } catch (err) {
        console.error('Error fetching food cart:', err);
        setError('Failed to load food cart details. Please try again later.');
      }
    };

    fetchFoodCart();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof FoodCartFormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await cartPodService.uploadImage(formData);
      setFormData(prev => ({
        ...prev,
        [field]: response.imageUrl
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    }
  };

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await cartPodService.uploadImage(formData);
      setFormData(prev => ({
        ...prev,
        menuImages: [...prev.menuImages.filter(img => img !== DEFAULT_IMAGES.MENU), response.imageUrl]
      }));
    } catch (err) {
      console.error('Error uploading menu image:', err);
      setError('Failed to upload menu image. Please try again.');
    }
  };

  const removeMenuImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      menuImages: prev.menuImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!id) throw new Error('Food cart ID is required');

      // Only include images in the request if they're not the default images
      const foodCartData = {
        name: formData.name,
        ...(formData.podLocationImage !== DEFAULT_IMAGES.POD_LOCATION && { podLocationImage: formData.podLocationImage }),
        ...(formData.cartImage !== DEFAULT_IMAGES.CART && { cartImage: formData.cartImage }),
        ...(formData.menuImages.some(img => img !== DEFAULT_IMAGES.MENU) && {
          menuImages: formData.menuImages.filter(img => img !== DEFAULT_IMAGES.MENU)
        })
      };

      await cartPodService.updateFoodCart(id, foodCartData);
      navigate(`/food-cart/${id}`);
    } catch (err) {
      console.error('Error updating food cart:', err);
      setError('Failed to update food cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!foodCart) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
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
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            Edit Food Cart
          </Typography>
        </Box>
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
                  onClick={() => navigate(-1)}
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
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FoodCartEdit;