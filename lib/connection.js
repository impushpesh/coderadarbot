import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green(`MongoDB connected: ${conn.connection.host}`));
  } catch (error) {
    console.error(chalk.red("MongoDB connection failed:"), error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
