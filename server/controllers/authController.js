import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edulead-super-secret-jwt-key-2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact admissions administration.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick demo switch accounts for reviewer convenience
// @route   GET /api/auth/demo-accounts
// @access  Public
export const getDemoAccounts = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role department');
    const demoAccounts = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      token: generateToken(u._id),
    }));

    res.json({
      success: true,
      data: demoAccounts,
    });
  } catch (error) {
    next(error);
  }
};
