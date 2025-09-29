const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Load environment variables based on environment
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Import routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student"); 
const adminRoutes = require("./routes/admin"); 

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 5000;

// Use your specific MongoDB URI as fallback if process.env.MONGODB_URI is not set
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://aravindpriyashanmugam_db_user:PvWFXfIokIiceX2V@arav28.oy28mlw.mongodb.net/?retryWrites=true&w=majority&appName=ARAV28";

// --- Middleware ---
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

// CORS configuration to allow access from your deployed frontend and localhost
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://sarah-app-jet.vercel.app"
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// --- Database Connection ---
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Recommended setting for robust connection against Atlas timeouts
    serverSelectionTimeoutMS: 30000, 
  })
  .then(() => console.log("✅ EduERP Backend Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes); // NEW: Student Data Routes
app.use("/api/admin", adminRoutes); 

// Root route
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "EduERP Backend Root Working 🚀" });
});

// Health check
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Server is running 🚀", env: process.env.NODE_ENV });
});

// Serve frontend build in production (ensure frontend/build path is correct)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EduERP Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});