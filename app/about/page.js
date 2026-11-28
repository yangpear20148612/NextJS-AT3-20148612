"use client";

import Link from "next/link";

// External arrow icon for the API documentation link
function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z" />
    </svg>
  );
}

// Descriptions of each section in the workspace
const appFeatures = [
  {
    title: "Dashboard",
    description:
      "Open tasks, overdue items, upcoming milestones, recent discussion and project progress in one view.",
  },
  {
    title: "Projects",
    description:
      "A workspace per project: an overview, tasks by status, milestones, and threaded discussion.",
  },
  {
    title: "Tasks",
    description:
      "Every task across every project, filterable by project, assignee and status, with checklists and comments.",
  },
  {
    title: "People",
    description: "The workspace directory, with each person's assigned tasks.",
  },
  {
    title: "Library",
    description:
      "Attachments and logged time, recorded against projects and tasks.",
  },
];

export default function AboutPage() {
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
            About
          </li>
        </ol>
      </nav>

      {/* Page header */}
      <header className="pb-3 mb-4 border-bottom">
        <h1 className="h4 mb-1">About</h1>
        <p className="text-muted small mb-0">
          A workspace for the MyJamJar API — projects, tasks, milestones,
          discussion, and time.
        </p>
      </header>

      {/* "What this app does" card section */}
      <section className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h2 className="h6 mb-0 fw-semibold">What this app does</h2>
        </div>

        <ul className="list-group list-group-flush">
          {appFeatures.map((feature) => (
            <li key={feature.title} className="list-group-item px-3 py-3">
              <div className="fw-semibold text-dark small">{feature.title}</div>
              <p className="text-muted small mb-0 mt-1">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* "API reference" card section */}
      <section className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h2 className="h6 mb-0 fw-semibold">API reference</h2>
        </div>

        <div className="card-body py-3">
          <a
            href="https://documenter.getpostman.com/view/30237461/2sBY4HT3hk"
            target="_blank"
            rel="noopener noreferrer"
            className="d-inline-flex align-items-center gap-2 text-decoration-none small fw-medium"
          >
            <span>MyJamJar API documentation</span>
            <ExternalLinkIcon />
          </a>
        </div>
      </section>

      {/* Footer note */}
      <footer className="text-muted small">
        © 2026 MyJamJar. All rights reserved.
      </footer>
    </div>
  );
}
