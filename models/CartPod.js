const mongoose = require('mongoose');

const cartPodSchema = new mongoose.Schema({
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
  arrangementImage: {
    type: String,
    required: false
  },
  foodCarts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCart'
  }],
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
cartPodSchema.index({ location: '2dsphere' });

// Update the updatedAt timestamp before saving
cartPodSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CartPod', cartPodSchema); 