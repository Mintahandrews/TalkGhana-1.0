const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const ttsRoutes = require("./routes/tts");

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection with environment variable
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ghchatters";

// Improved MongoDB connection with better error handling
console.log(
  `Connecting to MongoDB at: ${MONGODB_URI.replace(
    /^(mongodb:\/)\/(.*:.*)@/,
    "mongodb://*****:*****@"
  )}`
);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    // Don't exit the process, just log the error
    console.log(
      "⚠️ Server will continue running, but MongoDB features will not work"
    );
  });

const db = mongoose.connection;

// Handle initial connection errors
db.on("error", (error) => {
  console.error("❌ MongoDB connection error:", error.message);
});

// Handle disconnection events
db.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected. Attempting to reconnect...");
});

// Handle successful reconnection
db.on("reconnected", () => {
  console.log("✅ MongoDB reconnected successfully");
});

// Register routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/tts", ttsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    mongo: mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
});
