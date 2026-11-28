"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";

// Normalize various status shapes (string or boolean) into "todo", "in_progress", or "done"
function normalizeStatus(task) {
  if (task.completed === true || task.is_completed === true) {
    return "done";
  }

  const raw = String(task.status || task.state || "todo")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  if (
    raw === "done" ||
    raw === "completed" ||
    raw === "complete" ||
    raw === "closed"
  ) {
    return "done";
  }

  if (
    raw === "in_progress" ||
    raw === "inprogress" ||
    raw === "doing" ||
    raw === "active" ||
    raw === "started"
  ) {
    return "in_progress";
  }

  return "todo";
}

// Inspect a task's due date and return a Bootstrap badge when overdue (or upcoming)
function getDeadlineBadge(task, isDone) {
  const rawDate = task.due_date || task.deadline || task.dueDate;
  if (!rawDate) {
    return null;
  }

  // Extract YYYY-MM-DD so date-only strings compare cleanly against today
  const datePart = String(rawDate).split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  if (!isDone && datePart < today) {
    return {
      label: "Overdue",
      className: "badge rounded-pill text-bg-danger",
    };
  }

  if (!isDone && datePart === today) {
    return {
      label: "Due today",
      className: "badge rounded-pill text-bg-warning text-dark",
    };
  }

  return {
    label: `Due ${datePart}`,
    className: "badge rounded-pill text-bg-light border text-muted",
  };
}

export default function TasksPage() {
  // Store all tasks across projects
  const [tasks, setTasks] = useState([]);
  // Optional lookup map of project ID -> project name/title
  const [projectsById, setProjectsById] = useState({});
  // Track loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Track which task ID is currently updating its status
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Fetch tasks (and projects for nicer project labels) when the page loads
  useEffect(() => {
    async function fetchTasksAndProjects() {
      setLoading(true);
      setError("");

      try {
        const taskRes = await api.get("/tasks");
        const taskList = Array.isArray(taskRes.data)
          ? taskRes.data
          : taskRes.data?.data || [];
        setTasks(taskList);

        // Fetch projects separately so task display still works if /projects isn't needed
        try {
          const projRes = await api.get("/projects");
          const projList = Array.isArray(projRes.data)
            ? projRes.data
            : projRes.data?.data || [];
          const map = {};
          for (const proj of projList) {
            map[String(proj.id)] =
              proj.name || proj.title || "Untitled Project";
          }
          setProjectsById(map);
        } catch {
          setProjectsById({});
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load tasks from the API.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTasksAndProjects();
  }, []);

  // Update a task's status via PUT /tasks/{id}, sending existing fields so validation passes
  const handleStatusChange = async (task, nextStatus) => {
    setUpdatingTaskId(task.id);
    setError("");

    try {
      const payload = {
        ...task,
        name: task.name ?? task.title ?? "",
        title: task.title ?? task.name ?? "",
        status: nextStatus,
        completed: nextStatus === "done",
      };

      await api.put(`/tasks/${task.id}`, payload);

      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: nextStatus,
                completed: nextStatus === "done",
              }
            : item,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not update task status.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Group tasks into the three status sections
  const todoTasks = tasks.filter((t) => normalizeStatus(t) === "todo");
  const inProgressTasks = tasks.filter(
    (t) => normalizeStatus(t) === "in_progress",
  );
  const doneTasks = tasks.filter((t) => normalizeStatus(t) === "done");

  const sections = [
    {
      key: "todo",
      title: "To do",
      items: todoTasks,
      badgeClass: "text-bg-secondary",
    },
    {
      key: "in_progress",
      title: "In progress",
      items: inProgressTasks,
      badgeClass: "text-bg-primary",
    },
    {
      key: "done",
      title: "Done",
      items: doneTasks,
      badgeClass: "text-bg-success",
    },
  ];

  return (
    <div className="container-fluid py-3">
      {/* Breadcrumb back to Dashboard */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0 small">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">
              Dashboard
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Tasks
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="pb-3 mb-4 border-bottom">
        <h1 className="h4 mb-1">Tasks</h1>
        <p className="text-muted small mb-0">
          Every task across your projects. Open a project to add new tasks.
        </p>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {/* Loading Spinner or 3 Status Sections */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {sections.map((section) => (
            <div key={section.key} className="col-12 col-lg-4">
              <section className="card shadow-sm h-100">
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                  <h2 className="h6 mb-0 fw-semibold">{section.title}</h2>
                  <span className={`badge rounded-pill ${section.badgeClass}`}>
                    {section.items.length}
                  </span>
                </div>

                {section.items.length === 0 ? (
                  <div className="card-body text-muted small">
                    No tasks in {section.title.toLowerCase()}.
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {section.items.map((task) => {
                      const projectId = task.project_id || task.project?.id;
                      const projectName =
                        task.project?.name ||
                        task.project?.title ||
                        (projectId ? projectsById[String(projectId)] : null) ||
                        "No project";

                      const titleText =
                        task.title || task.name || "Untitled Task";
                      const currentNormalized = normalizeStatus(task);
                      const deadlineBadge = getDeadlineBadge(
                        task,
                        currentNormalized === "done",
                      );
                      const dueDateText =
                        task.due_date || task.deadline || task.dueDate;

                      return (
                        <li key={task.id} className="list-group-item px-3 py-3">
                          <div className="d-flex flex-column gap-2">
                            <div>
                              {projectId ? (
                                <Link
                                  href={`/projects/${projectId}`}
                                  className="fw-semibold text-dark text-decoration-none small d-block"
                                >
                                  {titleText}
                                </Link>
                              ) : (
                                <span className="fw-semibold text-dark small d-block">
                                  {titleText}
                                </span>
                              )}

                              <div className="text-muted small mt-1">
                                {projectName}
                                {dueDateText ? ` · due ${dueDateText}` : ""}
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center gap-2">
                              <select
                                aria-label={`Status for ${titleText}`}
                                className="form-select form-select-sm w-auto"
                                value={currentNormalized}
                                disabled={updatingTaskId === task.id}
                                onChange={(e) =>
                                  handleStatusChange(task, e.target.value)
                                }
                              >
                                <option value="todo">To do</option>
                                <option value="in_progress">In progress</option>
                                <option value="done">Done</option>
                              </select>

                              {deadlineBadge && (
                                <span className={deadlineBadge.className}>
                                  {deadlineBadge.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
