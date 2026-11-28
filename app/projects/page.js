"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";

export default function ProjectsPage() {
  // Store the list of projects returned by the Laravel API
  const [projects, setProjects] = useState([]);
  // Track initial loading and error messages for the page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Control whether the "New project" card/dialog is visible
  const [isCreating, setIsCreating] = useState(false);
  // Controlled form state for the new project inputs
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  // Track submission state and form-specific errors
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch all projects from the API when the page mounts
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/projects");
        // Support both paginated/wrapped responses ({ data: [...] }) and plain arrays
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setProjects(list);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load projects from the API.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Reset form fields and close the "New project" card/dialog
  const handleCancel = () => {
    setProjectName("");
    setProjectDescription("");
    setFormError("");
    setIsCreating(false);
  };

  // Send a POST request to create a new project and prepend it to the list
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

      // Extract the newly created project object from common API response shapes
      const createdProject = res.data?.data || res.data;

      if (createdProject && createdProject.id) {
        setProjects((prev) => [createdProject, ...prev]);
      } else {
        // Fallback if the API doesn't return the created record directly
        const refreshed = await api.get("/projects");
        const list = Array.isArray(refreshed.data)
          ? refreshed.data
          : refreshed.data?.data || [];
        setProjects(list);
      }

      handleCancel();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Could not create project. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      {/* Breadcrumb navigation back to Dashboard */}
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

      {/* Page header with title, helper description, and "+ New project" trigger */}
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

      {/* Collapsible card/dialog for creating a new project */}
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
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Global fetch error banner */}
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {/* Projects list container using a <div>, <ul>, and <li> items */}
      <div className="projects-list-section">
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
            {projects.map((project) => (
              <li
                key={project.id}
                className="project-item list-group-item list-group-item-action py-3"
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="text-decoration-none text-dark d-flex justify-content-between align-items-center gap-3"
                >
                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate">
                      {project.name || project.title || "Untitled Project"}
                    </div>
                    {project.description && (
                      <p className="text-muted small mb-0 text-truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span className="text-muted small flex-shrink-0">Open →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
