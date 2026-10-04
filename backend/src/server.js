import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGODB_URI;

const server = app.listen(port, () => {
  console.log(`Study Hub API listening on http://localhost:${port}`);
});

if (!mongoUri) {
  console.log("MongoDB is not configured yet; data routes will respond with 503 until it is set up.");
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log("Connected to MongoDB."))
    .catch((error) => {
      console.error("Could not connect to MongoDB:", error.message);
    });
}

function shutdown() {
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
