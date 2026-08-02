import dotenv from "dotenv";

dotenv.config();

export const env = {
    port: Number(process.env.PORT) || 5000,
    mongodbUri:
        process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/expenseflow",
    jwtSecret:
        process.env.JWT_SECRET || "expenseflow_super_secret_key",
    nodeEnv: process.env.NODE_ENV || "development"
};