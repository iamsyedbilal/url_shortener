import { connect } from 'mongoose';
import logger from '../utils/logger.js';

async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is missing.');
    }
    const connectionInstance = await connect(
      `${mongoUri}/${process.env.DB_NAME}`
    );
    logger.info({
      message: `MongoDB connected: ${connectionInstance.connection.host}`,
    });
  } catch (error) {
    logger.error({
      message: `Error connecting to MongoDB: ${error}`,
    });
    process.exit(1);
  }
}

export default connectDB;
