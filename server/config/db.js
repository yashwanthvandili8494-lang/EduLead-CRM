import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const customUri = process.env.MONGO_URI;

  if (customUri) {
    try {
      console.log(`[DB] Attempting connection to custom MONGO_URI...`);
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[DB] Failed to connect to ${customUri}: ${err.message}`);
      console.log(`[DB] Falling back to high-resilience in-memory MongoDB engine...`);
    }
  }

  try {
    console.log(`[DB] Starting embedded MongoDB engine (mongodb-memory-server)...`);
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[DB] Connected to embedded in-memory MongoDB at: ${uri}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Critical: Failed to start embedded database:`, error.message);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[DB] Disconnected successfully');
  } catch (error) {
    console.error('[DB] Error during disconnection:', error.message);
  }
};
