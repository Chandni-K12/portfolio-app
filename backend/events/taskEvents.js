const EventEmitter = require("events");

class TaskEventEmitter extends EventEmitter {}

const taskEmitter = new TaskEventEmitter();

// In-memory store for generated background notifications
const notificationsStore = [];

// Asynchronous Notification Listener for 'task-created' event
taskEmitter.on("task-created", (eventData) => {
    // Executed asynchronously via setImmediate after main API response tick
    setImmediate(() => {
        const asyncTimestamp = new Date().toISOString();
        const { task, user, emittedAt } = eventData;
        const assignedUser = user ? `${user.name} (${user.email})` : "Unassigned / Guest";

        const notificationLog = {
            id: notificationsStore.length + 1,
            event: "task-created",
            taskTitle: task.title,
            taskId: task._id || task.id,
            assignedUser,
            syncApiTime: emittedAt,
            asyncProcessedAt: asyncTimestamp
        };

        notificationsStore.unshift(notificationLog); // Store latest notification first

        console.log("\n==================================================");
        console.log("[NOTIFICATION SYSTEM] Background Notification Processed!");
        console.log(`  -> Event Name        : task-created`);
        console.log(`  -> Task Title        : "${task.title}"`);
        console.log(`  -> Task ID           : ${task._id || task.id}`);
        console.log(`  -> Assigned User     : ${assignedUser}`);
        console.log(`  -> Sync API Time     : ${emittedAt}`);
        console.log(`  -> Async Exec Time   : ${asyncTimestamp}`);
        console.log("==================================================\n");
    });
});

const getNotifications = () => notificationsStore;

module.exports = { taskEmitter, getNotifications };
