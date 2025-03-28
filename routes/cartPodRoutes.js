const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CartPod = require('../models/CartPod');
const FoodCart = require('../models/FoodCart');
const { auth, isAdmin } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Get all cart pods
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all cart pods...');
    const cartPods = await CartPod.find().populate('foodCarts');
    console.log('Found cart pods:', cartPods);
    res.json(cartPods);
  } catch (error) {
    console.error('Error fetching cart pods:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get cart pod by ID
router.get('/:id', async (req, res) => {
  try {
    const cartPod = await CartPod.findById(req.params.id).populate('foodCarts');
    if (!cartPod) {
      return res.status(404).json({ error: 'Cart pod not found' });
    }
    res.json(cartPod);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new cart pod (authenticated users only)
router.post('/',
  auth,
  upload.single('arrangementImage'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('location.coordinates').isArray().withMessage('Coordinates must be an array'),
    body('location.coordinates').custom((value) => {
      if (value.length !== 2) {
        throw new Error('Coordinates must be [longitude, latitude]');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, location } = req.body;
      const arrangementImage = req.file ? req.file.buffer.toString('base64') : null;

      const cartPod = new CartPod({
        name,
        location: {
          type: 'Point',
          coordinates: location.coordinates
        },
        arrangementImage
      });

      await cartPod.save();
      res.status(201).json(cartPod);
    } catch (error) {
      console.error('Error creating cart pod:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
);

// Update cart pod (admin only)
router.put('/:id',
  auth,
  isAdmin,
  upload.single('arrangementImage'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('location.coordinates').optional().isArray().withMessage('Coordinates must be an array'),
    body('location.coordinates').optional().custom((value) => {
      if (value.length !== 2) {
        throw new Error('Coordinates must be [longitude, latitude]');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const cartPod = await CartPod.findById(req.params.id);
      if (!cartPod) {
        return res.status(404).json({ error: 'Cart pod not found' });
      }

      const { name, location } = req.body;
      if (name) cartPod.name = name;
      if (location) {
        cartPod.location = {
          type: 'Point',
          coordinates: location.coordinates
        };
      }
      if (req.file) {
        cartPod.arrangementImage = req.file.buffer.toString('base64');
      }

      await cartPod.save();
      res.json(cartPod);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete cart pod (admin only)
router.delete('/:id',
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const cartPod = await CartPod.findById(req.params.id);
      if (!cartPod) {
        return res.status(404).json({ error: 'Cart pod not found' });
      }

      await cartPod.deleteOne();
      res.json({ message: 'Cart pod deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Find cart pods near a location
router.get('/near/:longitude/:latitude/:maxDistance', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.params;
    const cartPods = await CartPod.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance) * 1000 // Convert km to meters
        }
      }
    }).populate('foodCarts');

    res.json(cartPods);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add food cart to cart pod (authenticated users only)
router.post('/:id/foodcarts',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('location').isObject().withMessage('Location is required'),
    body('location.type').equals('Point').withMessage('Location type must be Point'),
    body('location.coordinates').isArray().withMessage('Coordinates must be an array'),
    body('location.coordinates').custom((value) => {
      if (value.length !== 2) {
        throw new Error('Coordinates must be [longitude, latitude]');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const cartPod = await CartPod.findById(req.params.id);
      if (!cartPod) {
        return res.status(404).json({ error: 'Cart pod not found' });
      }

      const { name, location, podLocationImage, cartImage, menuImages } = req.body;

      const foodCart = new FoodCart({
        name,
        location,
        podLocationImage,
        cartImage,
        menuImages,
        cartPod: cartPod._id,
        owner: req.user._id // Assuming user ID is available from auth middleware
      });

      await foodCart.save();
      cartPod.foodCarts.push(foodCart._id);
      await cartPod.save();

      res.status(201).json(foodCart);
    } catch (error) {
      console.error('Error adding food cart:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
);

module.exports = router; 