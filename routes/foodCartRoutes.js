const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FoodCart = require('../models/FoodCart');
const CartPod = require('../models/CartPod');
const { auth, isOwner } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Default image URLs
const DEFAULT_IMAGES = {
  POD_LOCATION: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/food-carts/default-pod-location.jpg`,
  CART: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/food-carts/default-cart.jpg`,
  MENU: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/food-carts/default-menu.jpg`
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all food carts
router.get('/', async (req, res) => {
  try {
    const foodCarts = await FoodCart.find()
      .populate('cartPod', 'name location')
      .populate('owner', 'name email');
    res.json(foodCarts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get food cart by ID
router.get('/:id', async (req, res) => {
  try {
    const foodCart = await FoodCart.findById(req.params.id)
      .populate('cartPod', 'name location')
      .populate('owner', 'name email');
    if (!foodCart) {
      return res.status(404).json({ error: 'Food cart not found' });
    }
    res.json(foodCart);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new food cart
router.post('/',
  auth,
  isOwner,
  upload.fields([
    { name: 'podLocationImage', maxCount: 1 },
    { name: 'cartImage', maxCount: 1 },
    { name: 'menuImages', maxCount: 5 }
  ]),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('cartPod').isMongoId().withMessage('Invalid cart pod ID'),
    body('location').custom((value) => {
      try {
        console.log('Validating location:', value);
        const location = typeof value === 'string' ? JSON.parse(value) : value;
        console.log('Parsed location:', location);
        if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
          throw new Error('Invalid coordinates format');
        }
        return true;
      } catch (error) {
        console.error('Location validation error:', error);
        throw new Error('Invalid location format');
      }
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if cart pod exists
      const cartPod = await CartPod.findById(req.body.cartPod);
      if (!cartPod) {
        return res.status(404).json({ error: 'Cart pod not found' });
      }

      // Upload images to Cloudinary or use defaults
      let podLocationImageUrl = DEFAULT_IMAGES.POD_LOCATION;
      let cartImageUrl = DEFAULT_IMAGES.CART;
      const menuImageUrls = [DEFAULT_IMAGES.MENU];

      if (req.files?.podLocationImage?.[0]) {
        podLocationImageUrl = await uploadToCloudinary(req.files.podLocationImage[0]);
      }

      if (req.files?.cartImage?.[0]) {
        cartImageUrl = await uploadToCloudinary(req.files.cartImage[0]);
      }

      if (req.files?.menuImages) {
        menuImageUrls.length = 0; // Clear default menu image
        for (const file of req.files.menuImages) {
          const url = await uploadToCloudinary(file);
          menuImageUrls.push(url);
        }
      }

      // Create food cart
      const foodCart = new FoodCart({
        name: req.body.name,
        cartPod: req.body.cartPod,
        location: typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location,
        podLocationImage: podLocationImageUrl,
        cartImage: cartImageUrl,
        menuImages: menuImageUrls,
        owner: req.user.id
      });

      await foodCart.save();

      // Add food cart to cart pod's foodCarts array
      cartPod.foodCarts.push(foodCart._id);
      await cartPod.save();

      res.status(201).json(foodCart);
    } catch (error) {
      console.error('Error creating food cart:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
);

// Helper function to upload to Cloudinary
async function uploadToCloudinary(file) {
  if (!file) return null;
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'food-carts'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
}

// Update food cart
router.put('/:id',
  auth,
  isOwner,
  upload.fields([
    { name: 'podLocationImage', maxCount: 1 },
    { name: 'cartImage', maxCount: 1 },
    { name: 'menuImage', maxCount: 1 }
  ]),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('location.coordinates').optional().isArray().withMessage('Coordinates must be an array'),
    body('location.coordinates').optional().custom((value) => {
      if (value.length !== 2) {
        throw new Error('Coordinates must be [longitude, latitude]');
      }
      return true;
    }),
    body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
    body('businessType').optional().isIn(['food_cart', 'food_truck', 'popup_shop', 'other']).withMessage('Invalid business type'),
    body('businessDescription').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('businessAddress').optional().trim().notEmpty().withMessage('Business address cannot be empty'),
    body('businessCity').optional().trim().notEmpty().withMessage('Business city cannot be empty'),
    body('businessState').optional().isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
    body('businessZip').optional().isLength({ min: 5, max: 5 }).withMessage('ZIP code must be 5 digits'),
    body('businessPhone').optional().matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('businessEmail').optional().isEmail().withMessage('Invalid email address'),
    body('businessWebsite').optional().isURL().withMessage('Invalid website URL'),
    body('businessHours').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM) - ([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).withMessage('Invalid hours format'),
    body('cuisineType').optional().isIn(['american', 'mexican', 'italian', 'chinese', 'japanese', 'indian', 'thai', 'mediterranean', 'fusion', 'other']).withMessage('Invalid cuisine type'),
    body('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range'),
    body('dietaryOptions').optional().isArray().withMessage('Dietary options must be an array'),
    body('dietaryOptions.*').optional().isIn(['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'nut-free', 'dairy-free']).withMessage('Invalid dietary option'),
    body('paymentMethods').optional().isArray().withMessage('Payment methods must be an array'),
    body('paymentMethods.*').optional().isIn(['cash', 'credit', 'debit', 'mobile']).withMessage('Invalid payment method'),
    body('deliveryOptions').optional().isArray().withMessage('Delivery options must be an array'),
    body('deliveryOptions.*').optional().isIn(['pickup', 'delivery', 'catering']).withMessage('Invalid delivery option'),
    body('socialMedia.*').optional().isURL().withMessage('Invalid social media URL')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const foodCart = await FoodCart.findById(req.params.id);
      if (!foodCart) {
        return res.status(404).json({ error: 'Food cart not found' });
      }

      // Check if user owns this food cart
      if (foodCart.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updateFields = { ...req.body };
      if (req.files?.podLocationImage?.[0]) {
        updateFields.podLocationImage = req.files.podLocationImage[0].buffer.toString('base64');
      }
      if (req.files?.cartImage?.[0]) {
        updateFields.cartImage = req.files.cartImage[0].buffer.toString('base64');
      }
      if (req.files?.menuImage?.[0]) {
        updateFields.menuImage = req.files.menuImage[0].buffer.toString('base64');
      }

      Object.assign(foodCart, updateFields);
      await foodCart.save();

      res.json(foodCart);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete food cart
router.delete('/:id',
  auth,
  isOwner,
  async (req, res) => {
    try {
      const foodCart = await FoodCart.findById(req.params.id);
      if (!foodCart) {
        return res.status(404).json({ error: 'Food cart not found' });
      }

      // Check if user owns this food cart
      if (foodCart.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Remove food cart from cart pod
      await CartPod.findByIdAndUpdate(foodCart.cartPod, {
        $pull: { foodCarts: foodCart._id }
      });

      await foodCart.deleteOne();
      res.json({ message: 'Food cart deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Add review to food cart
router.post('/:id/reviews',
  auth,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const foodCart = await FoodCart.findById(req.params.id);
      if (!foodCart) {
        return res.status(404).json({ error: 'Food cart not found' });
      }

      const review = {
        rating: req.body.rating,
        comment: req.body.comment,
        user: req.user.name
      };

      foodCart.reviews.push(review);
      await foodCart.save();

      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Find food carts near a location
router.get('/near/:longitude/:latitude/:maxDistance', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.params;
    const foodCarts = await FoodCart.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance) * 1000 // Convert km to meters
        }
      }
    })
    .populate('cartPod', 'name location')
    .populate('owner', 'name email');

    res.json(foodCarts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get food carts by cart pod ID
router.get('/cartpod/:cartPodId', async (req, res) => {
  try {
    const foodCarts = await FoodCart.find({ cartPod: req.params.cartPodId })
      .populate('owner', 'name email');
    res.json(foodCarts);
  } catch (error) {
    console.error('Error fetching food carts by cart pod:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Upload single image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = await uploadToCloudinary(req.file);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router; 