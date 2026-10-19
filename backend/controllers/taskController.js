const mongoose = require("mongoose");
const Task = require("../models/Task");
const taskCache = require("../config/cache");
const { taskEmitter, getNotifications } = require("../events/taskEvents");

// Helper function to invalidate task cache
const invalidateCache = (userId) => {
    const keysToInvalidate = ["tasks_all"];
    if (userId) {
        keysToInvalidate.push(`tasks_user_${userId}`);
    }
    keysToInvalidate.forEach((key) => taskCache.del(key));
    console.log(`[CACHE INVALIDATED] Keys removed: ${keysToInvalidate.join(", ")}`);
};

// GET all tasks (with node-cache in-memory caching)
const getAllTasks = async (req, res) => {
    const startTime = performance.now();
    const cacheKey = req.user ? `tasks_user_${req.user._id}` : "tasks_all";

    try {
        // 1. Check if tasks exist in cache
        const cachedTasks = taskCache.get(cacheKey);

        if (cachedTasks) {
            const endTime = performance.now();
            const responseTime = (endTime - startTime).toFixed(2);

            res.setHeader("X-Cache", "HIT");
            res.setHeader("X-Response-Time", `${responseTime}ms`);
            console.log(`[CACHE HIT] Key: "${cacheKey}" | Response Time: ${responseTime}ms`);

            return res.status(200).json(cachedTasks);
        }

        // 2. Cache MISS -> Query MongoDB database
        const query = req.user
            ? { $or: [{ user: req.user._id }, { user: { $exists: false } }] }
            : {};
        const tasks = await Task.find(query).sort({ createdAt: -1 });

        // 3. Store in cache for 60 seconds (TTL)
        taskCache.set(cacheKey, tasks, 60);

        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);

        res.setHeader("X-Cache", "MISS");
        res.setHeader("X-Response-Time", `${responseTime}ms`);
        console.log(`[CACHE MISS] Key: "${cacheKey}" | MongoDB Query Time: ${responseTime}ms`);

        res.status(200).json(tasks);
    } catch (error) {
        console.error("GET ALL TASKS ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
};

// GET task by ID
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({
            message: "Invalid task ID"
        });
    }
};

// POST create task (Mutates database -> Invalidate Cache)
const createTask = async (req, res) => {
    try {
        const { title, description = "", priority = "medium", completed = false } = req.body;

        const taskData = {
            title,
            description,
            priority,
            completed
        };

        if (req.user) {
            taskData.user = req.user._id;
        }

        const newTask = new Task(taskData);
        const savedTask = await newTask.save();

        // Invalidate cache on write
        invalidateCache(req.user?._id);

        const syncTimestamp = new Date().toISOString();
        console.log(`\n[SYNC API RESPONSE 201] Responding immediately for task "${savedTask.title}" at: ${syncTimestamp}`);

        // Emit 'task-created' event asynchronously (handled by background listener without blocking API response)
        taskEmitter.emit("task-created", {
            task: savedTask,
            user: req.user,
            emittedAt: syncTimestamp
        });

        res.status(201).json(savedTask);
    } catch (error) {
        console.error("CREATE TASK ERROR:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: Object.values(error.errors).map((err) => err.message)
            });
        }

        res.status(500).json({
            message: "Failed to create task"
        });
    }
};

// PUT update task (Mutates database -> Invalidate Cache)
const updateTask = async (req, res) => {
    try {
        const { title, description, priority, completed } = req.body;
        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (priority !== undefined) updates.priority = priority;
        if (completed !== undefined) updates.completed = completed;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Invalidate cache on write
        invalidateCache(req.user?._id);

        res.status(200).json(task);
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: Object.values(error.errors).map((err) => err.message)
            });
        }

        res.status(400).json({
            message: "Invalid task data or ID"
        });
    }
};

// DELETE task (Mutates database -> Invalidate Cache)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Invalidate cache on write
        invalidateCache(req.user?._id);

        res.status(200).json({
            message: "Task deleted successfully",
            task
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid task ID"
        });
    }
};

// GET background notification logs
const getTaskNotifications = (req, res) => {
    res.status(200).json({
        totalNotifications: getNotifications().length,
        notifications: getNotifications()
    });
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskNotifications
};
