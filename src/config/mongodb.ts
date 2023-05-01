import * as dotenv from "dotenv";
const { MongoClient } = require("mongodb");

// Load environment variables
dotenv.config();

// MongoDB connection config
const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_BASE_URL = process.env.MONGODB_BASE_URL;
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS;
const MONGODB_URL = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_BASE_URL}/${MONGODB_OPTIONS}`
const client = new MongoClient(MONGODB_URL);

export { client, MONGODB_URL as MongoURL };