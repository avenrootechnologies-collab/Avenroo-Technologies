import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.warn("database.connection.skipped", {
      reason: "MONGO_URI is not configured. Starting API without a database connection.",
    });
    return false;
  }

  try {
    logger.debug("database.connection.attempting", {
      hasMongoUri: true,
      serverSelectionTimeoutMS: 5000,
    });

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    logger.info("database.connection.connected", {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
    });
    return true;
  } catch (error) {
    logger.error("database.connection.failed", { error });
    return false;
  }
};

export const isDatabaseReady = () => mongoose.connection.readyState === 1;

export default connectDB;
