const jwt = require('jsonwebtoken');
const User = require('../models/user')
const bcrypt = require('bcryptjs');


const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with that email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Server error during registration',
    });
  }
};


const loginUser = async (req, res) => {
  try {
 
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
    });
  }
};


const getMe = async (req, res) => {
  try {
  
    const { _id, name, email, role } = req.user;
    res.status(200).json({ _id, name, email, role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const { name, currentPassword, newPassword } = req.body;

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: 'Current password is required',
        });
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(401).json({
          message: 'Current password is incorrect',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'New password must be at least 6 characters',
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(
        newPassword,
        salt
      );
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: 'Server error during profile update',
    });
  }
};

module.exports = { registerUser, loginUser, getMe, updateMe };