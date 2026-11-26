"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [projRes, taskRes, mileRes, commRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
          api.get("/milestones"),
          api.get("/comments"),
        ]);

        const extract = (res) =>
          Array.isArray(res.data) ? res.data : res.data?.data || [];

        setProjects(extract(projRes));
        setTasks(extract(taskRes));
        setMilestones(extract(mileRes));
        setComments(extract(commRes));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load dashboard data. Please check your login or API connection.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  // Derived metrics for the 4 top cards
  const openTasks = tasks.filter(
    (t) => t.status !== "done" && t.status !== "completed" && !t.completed,
  );

  const overdueTasks = openTasks.filter(
    (t) => t.due_date && t.due_date < today,
  );

  const milestonesDue = milestones.filter(
    (m) => m.status !== "completed" && !m.completed,
  );

  // Top 6 projects for bottom grid
  const featuredProjects = projects.slice(0, 6);

  // Recent 5 comments
  const recentComments = comments.slice(0, 5);

  return (
    <div className="container-fluid py-3">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Top Row: 4 Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-muted small fw-semibold">Projects</div>
                  <div className="fs-3 fw-bold mt-1">{projects.length}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-muted small fw-semibold">Open tasks</div>
                  <div className="fs-3 fw-bold mt-1">{openTasks.length}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-muted small fw-semibold">
                    Overdue tasks
                  </div>
                  <div className="fs-3 fw-bold text-danger mt-1">
                    {overdueTasks.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-muted small fw-semibold">
                    Milestones due
                  </div>
                  <div className="fs-3 fw-bold mt-1">
                    {milestonesDue.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Middle Row: 2 Grid Columns (Needs attention & Recent discussion) */}
          <div className="row g-4 mb-4">
            {/* Left Column: Needs attention */}
            <div className="col-12 col-lg-6">
              <section className="card shadow-sm h-100">
                <div className="card-header bg-white py-3">
                  <h2 className="h6 mb-0 fw-semibold">Needs attention</h2>
                </div>

                {overdueTasks.length === 0 ? (
                  <div className="card-body text-muted small">
                    No overdue tasks right now.
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {overdueTasks.slice(0, 6).map((task) => {
                      const projectTitle =
                        task.project?.name ||
                        task.project?.title ||
                        "No project";

                      const rowContent = (
                        <div className="d-flex align-items-center justify-content-between gap-3">
                          <div className="text-truncate">
                            <div className="fw-medium text-dark text-truncate small">
                              {task.title || task.name}
                            </div>
                            <div className="text-muted small">
                              {projectTitle} · due {task.due_date}
                            </div>
                          </div>
                          <span className="badge rounded-pill text-bg-danger">
                            Overdue
                          </span>
                        </div>
                      );

                      return (
                        <li
                          key={task.id}
                          className="list-group-item list-group-item-action px-3 py-3"
                        >
                          {task.project_id ? (
                            <Link
                              href={`/projects/${task.project_id}`}
                              className="text-decoration-none d-block"
                            >
                              {rowContent}
                            </Link>
                          ) : (
                            rowContent
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            {/* Right Column: Recent discussion */}
            <div className="col-12 col-lg-6">
              <section className="card shadow-sm h-100">
                <div className="card-header bg-white py-3">
                  <h2 className="h6 mb-0 fw-semibold">Recent discussion</h2>
                </div>

                {recentComments.length === 0 ? (
                  <div className="card-body text-muted small">
                    No recent comments yet.
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {recentComments.map((comment) => {
                      const authorName =
                        comment.user?.name || comment.author || "Team member";
                      const targetLabel = comment.task_id
                        ? "on a task"
                        : "on a project";
                      const timeLabel =
                        comment.created_at_human ||
                        (comment.created_at
                          ? comment.created_at.split("T")[0]
                          : "");

                      return (
                        <li
                          key={comment.id}
                          className="list-group-item px-3 py-3"
                        >
                          <div className="d-flex flex-wrap align-items-baseline gap-2">
                            <span className="fw-semibold text-dark small">
                              {authorName}
                            </span>
                            <span className="text-muted small">
                              {targetLabel}
                              {timeLabel ? ` · ${timeLabel}` : ""}
                            </span>
                          </div>
                          <p className="mb-0 mt-1 text-secondary small">
                            {comment.body || comment.content}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>

          {/* 3. Bottom Section: Projects (6 cards in 3-column grid) */}
          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0 fw-semibold">Projects</h2>
              <Link
                href="/projects"
                className="btn btn-outline-secondary btn-sm"
              >
                View all
              </Link>
            </div>

            {featuredProjects.length === 0 ? (
              <div className="alert alert-light border text-muted small">
                No projects found.
              </div>
            ) : (
              <div className="row g-3">
                {featuredProjects.map((project) => {
                  const projectTasks = tasks.filter(
                    (t) => String(t.project_id) === String(project.id),
                  );
                  const totalTasks = project.tasks_count ?? projectTasks.length;
                  const doneTasks =
                    project.completed_tasks_count ??
                    projectTasks.filter(
                      (t) =>
                        t.status === "done" ||
                        t.status === "completed" ||
                        t.completed,
                    ).length;

                  const percent =
                    totalTasks > 0
                      ? Math.round((doneTasks / totalTasks) * 100)
                      : 0;

                  const nextMilestone = milestones.find(
                    (m) =>
                      String(m.project_id) === String(project.id) &&
                      m.status !== "completed" &&
                      !m.completed,
                  );

                  return (
                    <div key={project.id} className="col-12 col-sm-6 col-lg-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="card h-100 shadow-sm text-decoration-none text-dark"
                      >
                        <div className="card-body">
                          <p className="fw-semibold text-truncate mb-2 small">
                            {project.name || project.title}
                          </p>

                          <div
                            className="progress mb-2"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${percent}%` }}
                              aria-valuenow={percent}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>

                          <p className="text-muted small mb-1">
                            {doneTasks} of {totalTasks} tasks done
                          </p>
                          <p className="text-muted small text-truncate mb-0">
                            {nextMilestone
                              ? `Next: ${nextMilestone.title || nextMilestone.name}`
                              : "No upcoming milestone"}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
