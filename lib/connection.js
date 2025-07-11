import mongoose from "mongoose";
import logger from "../logger/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`[DB_SUCCESS] [CONNECTION] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.fatal("[SYSTEM] [CONNECTION] Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
