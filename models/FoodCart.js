const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const foodCartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  cartPod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CartPod',
    required: true
  },
  podLocationImage: {
    type: String,
    default: 'https://via.placeholder.com/200x200?text=No+Image'
  },
  cartImage: {
    type: String,
    default: 'https://via.placeholder.com/200x200?text=No+Image'
  },
  menuImages: [{
    type: String,
    default: ['https://via.placeholder.com/200x200?text=No+Image']
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
foodCartSchema.index({ location: '2dsphere' });

// Calculate average rating before saving
foodCartSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.averageRating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FoodCart', foodCartSchema); 