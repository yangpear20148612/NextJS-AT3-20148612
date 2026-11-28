"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";

export default function LibraryPage() {
  // Store library resources/items returned by the API
  const [items, setItems] = useState([]);
  // Optional lookup map of project ID -> project name/title if items belong to a project
  const [projectsById, setProjectsById] = useState({});
  // Track initial loading state and API errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch library items when the page loads
  useEffect(() => {
    async function fetchLibrary() {
      setLoading(true);
      setError("");

      try {
        // Adjust "/library" if your Laravel route uses another path (such as "/resources" or "/files")
        const res = await api.get("/library");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setItems(list);

        // Fetch projects separately so project labels work when available
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
          err.response?.data?.message ||
            "Failed to load library items from the API.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLibrary();
  }, []);

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
            Library
          </li>
        </ol>
      </nav>

      {/* Page header */}
      <header className="pb-3 mb-4 border-bottom">
        <h1 className="h4 mb-1">Library</h1>
        <p className="text-muted small mb-0">
          Shared files, notes, and reference resources across your workspace.
        </p>
      </header>

      {/* Error banner if the API request fails */}
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {/* Library items list */}
      <div className="library-list-section">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="alert alert-light border text-muted small">
            No items in the library yet.
          </div>
        ) : (
          <ul className="list-group">
            {items.map((item, index) => {
              // Support common field names returned by Laravel resources
              const title =
                item.title || item.name || item.file_name || "Untitled Item";
              const description = item.description || item.summary || "";
              const category =
                item.type || item.category || item.mime_type || "";
              const projectId = item.project_id || item.project?.id;
              const projectName =
                item.project?.name ||
                item.project?.title ||
                (projectId ? projectsById[String(projectId)] : null);
              const resourceUrl = item.url || item.file_url || item.link || "";

              return (
                <li
                  key={item.id ?? index}
                  className="list-group-item d-flex justify-content-between align-items-start gap-3 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span className="fw-semibold text-dark text-truncate">
                        {title}
                      </span>
                      {category && (
                        <span className="badge rounded-pill text-bg-light border text-secondary">
                          {category}
                        </span>
                      )}
                    </div>

                    {description && (
                      <p className="text-muted small mb-1 mt-1">
                        {description}
                      </p>
                    )}

                    {(projectName || item.updated_at || item.created_at) && (
                      <div className="text-muted small">
                        {projectName && <span>Project: {projectName}</span>}
                        {projectName &&
                          (item.updated_at || item.created_at) &&
                          " · "}
                        {(item.updated_at || item.created_at) && (
                          <span>
                            {
                              String(item.updated_at || item.created_at).split(
                                "T",
                              )[0]
                            }
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Link to external file/URL if provided, or to its related project */}
                  {resourceUrl ? (
                    <a
                      href={resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary btn-sm flex-shrink-0"
                    >
                      Open
                    </a>
                  ) : (
                    projectId && (
                      <Link
                        href={`/projects/${projectId}`}
                        className="btn btn-outline-secondary btn-sm flex-shrink-0"
                      >
                        Project
                      </Link>
                    )
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
