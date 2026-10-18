
import mongoose from 'mongoose';

export async function connectDB() {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is required to connect to MongoDB.');
  }

  // Reuse an existing connection when available.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(MONGO_URI);

  console.log('MongoDB connected.');

  return mongoose.connection;
}
