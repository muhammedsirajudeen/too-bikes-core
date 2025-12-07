import mongoose from "mongoose";
import {env} from "./env.config";
import logger from "@/utils/logger.utils";

export async function connectDb() {
    const MONGO_URI = env.MONGO_URI as string;
    
    if (!MONGO_URI) {
        const errorMsg = "MONGO_URI environment variable is not set. Please create a .env.local file with MONGO_URI.";
        console.error(errorMsg);
        logger.error(errorMsg);
        // Don't exit in development - allow the app to continue but API calls will fail gracefully
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        return;
    }
    
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        logger.info("MongoDB connected successfully");
    } catch (error) {
        const errorMsg = `MongoDB connection error: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        logger.error(errorMsg);
        // Don't exit in development - allow the app to continue but API calls will fail gracefully
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
}