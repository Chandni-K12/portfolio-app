import { useEffect, useMemo, useState } from "react";

const API_URL = "/api/tasks";
const priorityOptions = ["Low", "Medium", "High"];

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium"
};

function normalizeTask(task) {
  const priority = task.priority || "low";

  return {
    ...task,
    id: task.id || task._id,
    priority: priority.toLowerCase(),
    priorityLabel: priority.charAt(0).toUpperCase() + priority.slice(1)
  };
}

async function taskRequest(path = "", options = {}, token = "", handleLogout) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && handleLogout) {
    handleLogout();
    throw new Error("Session expired. Please sign in again.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.errors?.join(", ") || data?.message || "Task request failed";
    throw new Error(message);
  }

  return data;
}

function Projects({ token, handleLogout }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingTaskId, setEditingTaskId] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [pendingDeleteTask, setPendingDeleteTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoading(true);
      setError("");

      try {
        const data = await taskRequest("", {}, token, handleLogout);

        if (isMounted) {
          setTasks((data || []).map(normalizeTask));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [token, handleLogout]);

  const taskStats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;

    return {
      total: tasks.length,
      open: tasks.length - completed,
      completed
    };
  }, [tasks]);

  const refreshTasks = async () => {
    setPendingAction("refresh");
    setError("");
    setMessage("");

    try {
      const data = await taskRequest("", {}, token, handleLogout);
      setTasks((data || []).map(normalizeTask));
      setMessage("Tasks refreshed");
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTaskId("");
  };

  const updateTaskInList = (updatedTask) => {
    const task = normalizeTask(updatedTask);
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) => (currentTask.id === task.id ? task : currentTask))
    );
    setSelectedTask((currentTask) => (currentTask?.id === task.id ? task : currentTask));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setError("Task title is required");
      return;
    }

    setPendingAction(editingTaskId ? `update-${editingTaskId}` : "create");
    setError("");
    setMessage("");

    try {
      const payload = {
        title,
        description,
        priority: form.priority.toLowerCase()
      };
      const savedTask = editingTaskId
        ? await taskRequest(`/${editingTaskId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
          }, token, handleLogout)
        : await taskRequest("", {
            method: "POST",
            body: JSON.stringify(payload)
          }, token, handleLogout);

      if (editingTaskId) {
        updateTaskInList(savedTask);
        setMessage("Task updated successfully");
      } else {
        setTasks((currentTasks) => [normalizeTask(savedTask), ...currentTasks]);
        setMessage("Task added successfully");
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction("");
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priorityLabel || "Medium"
    });
    setError("");
    setMessage("");
  };

  const viewTask = async (task) => {
    setPendingAction(`view-${task.id}`);
    setError("");
    setMessage("");

    try {
      const data = await taskRequest(`/${task.id}`, {}, token, handleLogout);
      setSelectedTask(normalizeTask(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction("");
    }
  };

  const toggleTask = async (task) => {
    setPendingAction(`toggle-${task.id}`);
    setError("");
    setMessage("");

    try {
      const updatedTask = await taskRequest(`/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          completed: !task.completed
        })
      }, token, handleLogout);
      updateTaskInList(updatedTask);
      setMessage("Task status updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction("");
    }
  };

  const deleteTask = async (task) => {
    setPendingAction(`delete-${task.id}`);
    setError("");
    setMessage("");

    try {
      await taskRequest(`/${task.id}`, {
        method: "DELETE"
      }, token, handleLogout);
      setTasks((currentTasks) =>
        currentTasks.filter((currentTask) => currentTask.id !== task.id)
      );
      setSelectedTask((currentTask) => (currentTask?.id === task.id ? null : currentTask));
      setPendingDeleteTask(null);

      if (editingTaskId === task.id) {
        resetForm();
      }

      setMessage("Task deleted successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction("");
    }
  };

  const isSaving = pendingAction === "create" || pendingAction === `update-${editingTaskId}`;

  return (
    <main className="task-app">
      <section className="topbar">
        <div>
          <p className="task-eyebrow">Task Manager</p>
          <h1>Plan the work clearly.</h1>
        </div>
        <div className="stats" aria-label="Task summary">
          <span>
            <strong>{taskStats.open}</strong> Open
          </span>
          <span>
            <strong>{taskStats.completed}</strong> Done
          </span>
          <span>
            <strong>{taskStats.total}</strong> Total
          </span>
        </div>
      </section>

      <section className="workspace">
        <form className="task-form-v2" onSubmit={handleSubmit}>
          <div className="form-header">
            <div>
              <h2>{editingTaskId ? "Edit Task" : "Add Task"}</h2>
              <p>Write the task, add details, and set the priority.</p>
            </div>
            <button
              type="button"
              className="small-button"
              onClick={refreshTasks}
              disabled={pendingAction === "refresh"}
            >
              {pendingAction === "refresh" ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <label>
            <span>Task name</span>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Design dashboard screen"
              disabled={isSaving}
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add the important notes for this task"
              rows="5"
              disabled={isSaving}
            />
          </label>

          <fieldset>
            <legend>Priority</legend>
            <div className="priority-options">
              {priorityOptions.map((priority) => (
                <label key={priority} className="priority-choice">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={form.priority === priority}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                  <span>{priority}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="success">{message}</p> : null}

          <div className="form-actions">
            <button type="submit" disabled={isSaving}>
              {editingTaskId ? (isSaving ? "Updating..." : "Update Task") : isSaving ? "Adding..." : "Add Task"}
            </button>
            {editingTaskId ? (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={resetForm}
                disabled={isSaving}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <section className="task-panel" aria-label="Tasks">
          <div className="panel-header">
            <h2>Your Tasks</h2>
            <p>{isLoading ? "Loading tasks..." : `${tasks.length} tasks saved`}</p>
          </div>

          {selectedTask ? (
            <article className="selected-task-v2">
              <div>
                <p className="task-eyebrow">Selected Task</p>
                <h3>{selectedTask.title}</h3>
                <p>{selectedTask.description || "No description added."}</p>
              </div>
              <span className={`priority-pill priority-${selectedTask.priorityLabel}`}>
                {selectedTask.priorityLabel}
              </span>
            </article>
          ) : null}

          <div className="task-list-v2">
            {!isLoading && tasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks yet</h3>
                <p>Add your first task from the form.</p>
              </div>
            ) : null}

            {tasks.map((task) => (
              <article
                className={`task-item-v2 ${task.completed ? "is-complete" : ""}`}
                key={task.id}
              >
                <div className="task-main">
                  <div>
                    <div className="task-title-row">
                      <h3>{task.title}</h3>
                      <span className={`priority-pill priority-${task.priorityLabel}`}>
                        {task.priorityLabel || "Low"}
                      </span>
                    </div>
                    {task.description ? <p>{task.description}</p> : null}
                  </div>
                </div>

                <div className="task-actions-v2">
                  <button
                    type="button"
                    className="done-button"
                    onClick={() => viewTask(task)}
                    disabled={pendingAction === `view-${task.id}`}
                  >
                    {pendingAction === `view-${task.id}` ? "Viewing..." : "View"}
                  </button>
                  <button type="button" className="done-button" onClick={() => startEditing(task)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="done-button"
                    onClick={() => toggleTask(task)}
                    disabled={pendingAction === `toggle-${task.id}`}
                  >
                    {pendingAction === `toggle-${task.id}` ? "Saving..." : task.completed ? "Undo" : "Done"}
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => setPendingDeleteTask(task)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {pendingDeleteTask ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title">Delete task?</h2>
            <p>Are you sure you want to delete "{pendingDeleteTask.title}"?</p>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setPendingDeleteTask(null)}
                disabled={pendingAction === `delete-${pendingDeleteTask.id}`}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={() => deleteTask(pendingDeleteTask)}
                disabled={pendingAction === `delete-${pendingDeleteTask.id}`}
              >
                {pendingAction === `delete-${pendingDeleteTask.id}` ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default Projects;
