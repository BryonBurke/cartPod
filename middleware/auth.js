const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const isOwner = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied. Owner only.' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
};

module.exports = { auth, isOwner, isAdmin }; 