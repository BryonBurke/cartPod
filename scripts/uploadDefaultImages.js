const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const defaultImages = [
  {
    name: 'default-pod-location.jpg',
    description: 'Default pod location image'
  },
  {
    name: 'default-cart.jpg',
    description: 'Default food cart image'
  },
  {
    name: 'default-menu.jpg',
    description: 'Default menu image'
  }
];

async function uploadDefaultImages() {
  for (const image of defaultImages) {
    try {
      const result = await cloudinary.uploader.upload(
        path.join(__dirname, '..', 'assets', image.name),
        {
          folder: 'food-carts',
          resource_type: 'image',
          public_id: image.name.replace('.jpg', '')
        }
      );
      console.log(`Uploaded ${image.name}:`, result.secure_url);
    } catch (error) {
      console.error(`Error uploading ${image.name}:`, error);
    }
  }
}

uploadDefaultImages(); 