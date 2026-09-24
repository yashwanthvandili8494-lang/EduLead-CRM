import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import followupRoutes from './routes/followupRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'EduLead API',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Centralized error handler
app.use(errorHandler);

// Connect DB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`[Server] EduLead API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();
