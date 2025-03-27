# CartPod - Food Cart Management Platform

A platform for managing cart pods and food carts, featuring A-GPS location tracking and comprehensive cart management features.

## Features

- Cart Pod Management
  - Name and GPS location tracking
  - Pod arrangement visualization
  - Food cart organization
- Food Cart Management
  - Detailed cart information
  - Menu management
  - Customer reviews
  - Owner dashboard
  - Secure owner editing

## Tech Stack

- Backend: Node.js, Express, MongoDB
- Frontend: React
- Authentication: JWT
- Image Storage: Cloudinary
- Location Services: A-GPS

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
4. Start the development server:
   ```bash
   npm run dev:full
   ```

## API Endpoints

### Cart Pods
- GET /api/cartpods - Get all cart pods
- GET /api/cartpods/:id - Get specific cart pod
- POST /api/cartpods - Create new cart pod
- PUT /api/cartpods/:id - Update cart pod
- DELETE /api/cartpods/:id - Delete cart pod

### Food Carts
- GET /api/foodcarts - Get all food carts
- GET /api/foodcarts/:id - Get specific food cart
- POST /api/foodcarts - Create new food cart
- PUT /api/foodcarts/:id - Update food cart
- DELETE /api/foodcarts/:id - Delete food cart

### Authentication
- POST /api/auth/register - Register new owner
- POST /api/auth/login - Login owner
- GET /api/auth/me - Get current owner profile 