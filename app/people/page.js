"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";
export default function PeoplePage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/users");
        setUsers(res.data?.data || []);
        setMeta(res.data?.meta || null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load users from the API.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">People</h1>
        {meta && (
          <span className="badge text-bg-secondary">
            Page {meta.current_page} · {users.length} shown
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="alert alert-light border">No users found.</div>
      ) : (
        <div className="row g-3">
          {users.map((user) => (
            <div key={user.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <h2 className="h6 fw-semibold mb-0">{user.name}</h2>
                      <span
                        className={`badge ${
                          user.email?.verified
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {user.email?.verified ? "Verified" : "Unverified"}
                      </span>
                    </div>

                    <p className="text-muted small mb-2">
                      {user.email?.address}
                    </p>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span
                      className="text-muted small"
                      title={user.created?.string}
                    >
                      Joined {user.created?.human}
                    </span>

                    <Link
                      href={`/people/${user.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
