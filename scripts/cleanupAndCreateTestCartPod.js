require('dotenv').config();
const mongoose = require('mongoose');
const CartPod = require('../models/CartPod');

const testCartPods = [
  {
    name: 'Downtown Cart Pod',
    location: {
      type: 'Point',
      coordinates: [-122.6789, 45.5155] // Downtown Portland
    },
    arrangementImage: null,
    foodCarts: []
  },
  {
    name: 'Pearl District Cart Pod',
    location: {
      type: 'Point',
      coordinates: [-122.6822, 45.5231] // Pearl District
    },
    arrangementImage: null,
    foodCarts: []
  },
  {
    name: 'Northwest Cart Pod',
    location: {
      type: 'Point',
      coordinates: [-122.6925, 45.5269] // Northwest Portland
    },
    arrangementImage: null,
    foodCarts: []
  }
];

async function cleanupAndCreateTestCartPod() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing cart pods
    console.log('Deleting all existing cart pods...');
    await CartPod.deleteMany({});
    console.log('Deleted all existing cart pods');

    // Create new test cart pods
    console.log('Creating test cart pods...');
    for (const podData of testCartPods) {
      const createdPod = await CartPod.create(podData);
      console.log('Test cart pod created successfully:', createdPod);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanupAndCreateTestCartPod(); 