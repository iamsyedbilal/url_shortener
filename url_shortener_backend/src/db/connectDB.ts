import { connect } from 'mongoose';

async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is missing.');
    }
    const connectionInstance = await connect(
      `${mongoUri}/${process.env.DB_NAME}`
    );
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
}

export default connectDB;
