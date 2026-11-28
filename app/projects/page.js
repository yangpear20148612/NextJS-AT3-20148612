"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";

// Pen icon for editing a project
function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M352.9 21.2L308 66.1 445.9 204 490.8 159.1C504.4 145.6 512 127.2 512 108s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0s-37.6 7.6-51.1 21.2zM274.1 100L58.9 315.1c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6L412 237.9 274.1 100z" />
    </svg>
  );
}

// Trash icon for deleting a project
function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 448 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z" />
    </svg>
  );
}

// Trim a description down to at most 6 words for compact list display
function shortenToSixWords(text) {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= 6) return text.trim();
  return `${words.slice(0, 6).join(" ")}…`;
}

export default function ProjectsPage() {
  // Store projects and tasks so we can calculate "X/Y tasks done" per project
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for creating a new project
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // State for editing an existing project
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Track which project ID is currently being deleted to disable its button while busy
  const [deletingId, setDeletingId] = useState(null);

  // Load projects (and tasks if available) on initial render
  useEffect(() => {
    async function fetchProjectsAndTasks() {
      setLoading(true);
      setError("");

      try {
        const projRes = await api.get("/projects");
        const projList = Array.isArray(projRes.data)
          ? projRes.data
          : projRes.data?.data || [];
        setProjects(projList);

        // Fetch tasks separately so project progress still works if /tasks isn't needed
        try {
          const taskRes = await api.get("/tasks");
          const taskList = Array.isArray(taskRes.data)
            ? taskRes.data
            : taskRes.data?.data || [];
          setTasks(taskList);
        } catch {
          setTasks([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load projects from the API.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjectsAndTasks();
  }, []);

  // Compute task completion counts and progress percentage for a given project
  const getProjectProgress = (project) => {
    const matchingTasks = tasks.filter(
      (task) => String(task.project_id) === String(project.id),
    );
    const total = project.tasks_count ?? matchingTasks.length;
    const done =
      project.completed_tasks_count ??
      matchingTasks.filter(
        (task) =>
          task.status === "done" ||
          task.status === "completed" ||
          Boolean(task.completed),
      ).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return { done, total, percent };
  };

  // Reset and close the "New project" form card
  const handleCancelCreate = () => {
    setProjectName("");
    setProjectDescription("");
    setFormError("");
    setIsCreating(false);
  };

  // Create a new project via POST /projects
  const handleAddProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setFormError("Please enter a project name.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await api.post("/projects", {
        name: projectName.trim(),
        description: projectDescription.trim(),
      });

      const created = res.data?.data || res.data;
      if (created && created.id) {
        setProjects((prev) => [created, ...prev]);
      } else {
        const refreshed = await api.get("/projects");
        const list = Array.isArray(refreshed.data)
          ? refreshed.data
          : refreshed.data?.data || [];
        setProjects(list);
      }

      handleCancelCreate();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Could not create project. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Open the inline edit form pre-filled with the full project data
  const startEditing = (project) => {
    setEditingProjectId(project.id);
    setEditName(project.name || project.title || "");
    setEditDescription(project.description || "");
    setEditError("");
  };

  // Cancel editing mode
  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditName("");
    setEditDescription("");
    setEditError("");
  };

  // Save changes to an existing project via PUT /projects/[id]
  const handleUpdateProject = async (e, projectId) => {
    e.preventDefault();

    if (!editName.trim()) {
      setEditError("Project name cannot be empty.");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    try {
      const res = await api.put(`/projects/${projectId}`, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      const updated = res.data?.data || res.data;

      setProjects((prev) =>
        prev.map((item) =>
          item.id === projectId
            ? {
                ...item,
                ...(updated && typeof updated === "object" ? updated : {}),
                name: updated?.name ?? editName.trim(),
                description: updated?.description ?? editDescription.trim(),
              }
            : item,
        ),
      );

      cancelEditing();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update project.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete a project via DELETE /projects/[id]
  const handleDeleteProject = async (project) => {
    const label = project.name || project.title || "this project";
    if (!window.confirm(`Delete "${label}"?`)) {
      return;
    }

    setDeletingId(project.id);
    setError("");

    try {
      await api.delete(`/projects/${project.id}`);
      setProjects((prev) => prev.filter((item) => item.id !== project.id));
      if (editingProjectId === project.id) {
        cancelEditing();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

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
            Projects
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="d-flex flex-wrap justify-content-between align-items-start gap-3 pb-3 mb-4 border-bottom">
        <div>
          <h1 className="h4 mb-1">Projects</h1>
          <p className="text-muted small mb-0">
            Open a project to see its tasks, milestones and discussion.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setFormError("");
            setIsCreating(true);
          }}
        >
          + New project
        </button>
      </header>

      {/* Create New Project Card */}
      {isCreating && (
        <section aria-label="New project form" className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">New project</h2>

            {formError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProject}>
              <div className="mb-3">
                <label
                  htmlFor="project-name"
                  className="form-label d-flex align-items-center fw-medium"
                >
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  className="form-control"
                  placeholder="Enter a project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="project-description"
                  className="form-label d-flex align-items-center fw-medium"
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  rows={4}
                  className="form-control"
                  placeholder="Describe the project"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add project"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCancelCreate}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {/* Projects List Container */}
      <div className="projects-list-section overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="alert alert-light border text-muted small">
            No projects found. Click <strong>+ New project</strong> to create
            one.
          </div>
        ) : (
          <ul className="list-group">
            {projects.map((project) => {
              const { done, total, percent } = getProjectProgress(project);
              const isEditing = editingProjectId === project.id;

              return (
                <li
                  key={project.id}
                  className="list-group-item px-3 py-3 overflow-hidden"
                >
                  {isEditing ? (
                    /* Inline edit form preserves the full description for editing */
                    <form onSubmit={(e) => handleUpdateProject(e, project.id)}>
                      {editError && (
                        <div
                          className="alert alert-danger py-2 small"
                          role="alert"
                        >
                          {editError}
                        </div>
                      )}

                      <div className="mb-2">
                        <label
                          htmlFor={`edit-name-${project.id}`}
                          className="form-label small fw-medium mb-1"
                        >
                          Project Name
                        </label>
                        <input
                          id={`edit-name-${project.id}`}
                          type="text"
                          className="form-control form-control-sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-2">
                        <label
                          htmlFor={`edit-desc-${project.id}`}
                          className="form-label small fw-medium mb-1"
                        >
                          Description
                        </label>
                        <textarea
                          id={`edit-desc-${project.id}`}
                          rows={3}
                          className="form-control form-control-sm"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={savingEdit}
                        >
                          {savingEdit ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={cancelEditing}
                          disabled={savingEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Flex row kept strictly within parent width using min-w-0 + overflow-hidden */
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-decoration-none text-dark flex-grow-1 min-w-0 overflow-hidden"
                      >
                        <span className="d-block fw-semibold small text-truncate">
                          {project.name || project.title || "Untitled Project"}
                        </span>

                        {project.description && (
                          <span className="d-block text-muted small text-truncate mt-1">
                            {shortenToSixWords(project.description)}
                          </span>
                        )}

                        {/* Status progress bar + task completion ratio */}
                        <span className="d-flex align-items-center gap-3 mt-2">
                          <span
                            className="progress flex-shrink-0"
                            style={{ width: "96px", height: "6px" }}
                          >
                            <span
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${percent}%` }}
                              aria-valuenow={percent}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </span>
                          <span className="text-muted small">
                            {done}/{total} tasks done
                          </span>
                        </span>
                      </Link>

                      <button
                        type="button"
                        aria-label="Edit project"
                        title="Edit project"
                        className="btn btn-outline-secondary btn-sm flex-shrink-0"
                        onClick={() => startEditing(project)}
                      >
                        <EditIcon />
                      </button>

                      <button
                        type="button"
                        aria-label="Delete project"
                        title="Delete project"
                        className="btn btn-outline-danger btn-sm flex-shrink-0"
                        disabled={deletingId === project.id}
                        onClick={() => handleDeleteProject(project)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
