import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import connectDB from './db/connectDB.js';
import app from './app.js';

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await connectDB().then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
      });
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
}

startServer();
