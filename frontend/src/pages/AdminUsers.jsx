
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  Users,
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";

const API = "http://localhost:5001/api/admin/users";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // Custom delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch registered users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("newsShieldToken");

      const response = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load users.");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user details
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API}/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("newsShieldToken")}`,
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user.");
      }

      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  // Open custom confirmation dialog
  const handleDelete = (user) => {
    setDeleteTarget(user);
  };

  // Delete user only after confirmation
  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`${API}/${deleteTarget._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("newsShieldToken")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setUsers((previous) =>
        previous.filter((item) => item._id !== deleteTarget._id)
      );

      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Failed to delete user.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle =
    "mt-2 mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500";

  const actionButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6 text-slate-100">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Manage Users
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            View, update and delete registered NewsShield users.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className={actionButton}
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Total users */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-400">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {users.length}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Edit user form */}
      {editingUser && (
        <form
          onSubmit={handleUpdate}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Edit User</h2>

            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close edit form"
            >
              <X size={19} />
            </button>
          </div>

          <label className="text-sm font-medium text-slate-300">
            Name
            <input
              required
              value={editingUser.name || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              className={inputStyle}
              placeholder="Enter name"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            Email
            <input
              required
              type="email"
              value={editingUser.email || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              className={inputStyle}
              placeholder="Enter email"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            Role
            <select
              value={editingUser.role || "user"}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              className={inputStyle}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setEditingUser(null)}
              disabled={saving}
              className={actionButton}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {["#", "Name", "Email", "Role", "Joined", "Actions"].map(
                  (heading) => (
                    <th key={heading} className="px-5 py-4 font-semibold">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    <RefreshCw
                      size={20}
                      className="mx-auto mb-3 animate-spin text-cyan-400"
                    />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No registered users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4 font-medium text-white">
                      {user.name}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          user.role === "admin"
                            ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                            : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUser({ ...user })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete User?"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmText="Yes, Delete User"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
      />
    </div>
  );
}

export default AdminUsers;

