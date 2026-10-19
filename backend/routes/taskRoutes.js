const express = require("express");

const router = express.Router();

const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskNotifications
} = require("../controllers/taskController");

const validateTaskId = require("../middleware/validateTaskId");
const { optionalAuth } = require("../middleware/authMiddleware");

// Apply optionalAuth to all task routes so req.user is set when token is present
router.use(optionalAuth);

// GET /tasks/notifications (or /api/tasks/notifications)
router.get("/notifications", getTaskNotifications);

// GET /tasks
router.get("/", getAllTasks);

// GET /tasks/:id
router.get("/:id", validateTaskId, getTaskById);

// POST /tasks
router.post("/", createTask);

// PUT /tasks/:id
router.put("/:id", validateTaskId, updateTask);

// DELETE /tasks/:id
router.delete("/:id", validateTaskId, deleteTask);

module.exports = router;
