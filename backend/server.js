const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const logger = require("./middleware/logger");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 5000;

// Built-in middleware
app.use(express.json());

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    credentials: true
}));

// Logging middleware
app.use(logger);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/taskdb";

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Task Manager API is running"
    });
});

// Auth Routes
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

// Task Routes
app.use("/tasks", taskRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Global error handler
app.use(errorHandler);

// Only listen and connect when run directly (not during tests)
if (require.main === module) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB connected successfully");

            app.listen(PORT, () => {
                console.log(`Server running at http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error("MongoDB connection error:", error);
        });
}

module.exports = app;

