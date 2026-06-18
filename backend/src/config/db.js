import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vision2system';
    const conn = await mongoose.connect(connStr);
    console.log(`Database connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // In production, we might want to throw or fallback to an abstract SQL driver.
    // For now we log and proceed or exit.
    process.exit(1);
  }
};
