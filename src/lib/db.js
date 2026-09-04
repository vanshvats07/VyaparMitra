import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Reusable MongoDB Atlas connection for Next.js App Router and dev hot-reloading.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Please define MONGODB_URI in your .env.local file."
    );
  }

  // If already connected, reuse existing connection
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      dbName: "vyaparmitra",
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset cached promise so future requests can retry
        cached.promise = null;

        let friendlyMsg = `MongoDB connection failed: ${err.message}`;
        if (
          err.name === "MongooseServerSelectionError" ||
          err.message.includes("whitelist") ||
          err.message.includes("ECONNREFUSED")
        ) {
          friendlyMsg =
            `Could not reach MongoDB Atlas cluster. Please ensure your current IP address ` +
            `is added to the Atlas Network Access Whitelist (https://www.mongodb.com/docs/atlas/security-whitelist/). ` +
            `Details: ${err.message}`;
        } else if (err.code === 8000 || err.message.includes("Authentication failed")) {
          friendlyMsg =
            `MongoDB Atlas authentication failed. Please verify the username and password in MONGODB_URI. ` +
            `Details: ${err.message}`;
        }

        const enrichedError = new Error(friendlyMsg);
        enrichedError.cause = err;
        throw enrichedError;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}