import mongoose from "mongoose";

export class DatabaseUnavailableError extends Error {
  constructor(cause) {
    super("Could not connect to MongoDB.");
    this.name = "DatabaseUnavailableError";
    this.cause = cause;
  }
}

const cache = globalThis.studyHubMongoose ?? (globalThis.studyHubMongoose = {
  connection: null,
  promise: null
});

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseUnavailableError(new Error("MONGODB_URI is not configured."));

  if (cache.connection?.connection.readyState === 1) return cache.connection;
  if (cache.connection) {
    cache.connection = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri).then((connection) => {
      cache.connection = connection;
      return connection;
    }).catch((error) => {
      cache.promise = null;
      throw new DatabaseUnavailableError(error);
    });
  }

  return cache.promise;
}
