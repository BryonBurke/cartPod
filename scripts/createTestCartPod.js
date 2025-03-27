require('dotenv').config();
const mongoose = require('mongoose');
const CartPod = require('../models/CartPod');

const testCartPod = {
  name: "Test Cart Pod",
  location: {
    type: "Point",
    coordinates: [-122.6789, 45.5155] // Portland, OR coordinates
  },
  arrangementImage: null,
  foodCarts: []
};

async function createTestCartPod() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const cartPod = new CartPod(testCartPod);
    await cartPod.save();
    console.log('Test cart pod created successfully:', cartPod);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test cart pod:', error);
  }
}

createTestCartPod(); 