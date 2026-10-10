
import React, { useEffect, useState } from "react";
import {
  History,
  RefreshCw,
  FileSearch,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";

const API = "http://localhost:5001/api/admin/history";

export default function AdminHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  // Custom confirmation popup ke liye
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    reason: "",
    verdict: "Unverified",
    confidence: "0",
  });

  // Admin API request
  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem("newsShieldToken");

    if (!token) {
      throw new Error("Please login as admin first.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Request failed.");
    }

    return data;
  };

  // MongoDB se history load karo
  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest(API);
      setHistoryList(Array.isArray(data.history) ? data.history : []);
    } catch (err) {
      setError(err.message || "Unable to load history.");
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // User details
  const getUserDetails = (item) => {
    if (item.userId && typeof item.userId === "object") {
      return item.userId.name || item.userId.email || "Unknown User";
    }

    return item.userEmail || item.email || "Unknown User";
  };

  // Date format
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "N/A"
      : parsedDate.toLocaleString();
  };

  // Confidence percentage
  const getConfidence = (item) => {
    if (
      item.confidence === null ||
      item.confidence === undefined ||
      item.confidence === ""
    ) {
      return "N/A";
    }

    const number = Number(item.confidence);
    return Number.isFinite(number) ? `${number}%` : "N/A";
  };

  // Verdict colors
  const getVerdictStyle = (verdict) => {
    switch (String(verdict || "").toLowerCase()) {
      case "real":
        return "border-green-500/20 bg-green-500/10 text-green-400";
      case "fake":
        return "border-red-500/20 bg-red-500/10 text-red-400";
      default:
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    }
  };

  // Edit form open karo
  const handleEdit = (item) => {
    setError("");
    setSuccess("");
    setEditingRecord(item);

    setEditForm({
      title: item.title || item.news || item.claim || "",
      reason: item.reason || "",
      verdict: ["Real", "Fake", "Unverified"].includes(item.verdict)
        ? item.verdict
        : "Unverified",
      confidence:
        item.confidence === null || item.confidence === undefined
          ? "0"
          : String(item.confidence),
    });
  };

  // Edited record MongoDB mein save karo
  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editingRecord?._id) {
      setError("Invalid history record.");
      return;
    }

    const title = editForm.title.trim();
    const reason = editForm.reason.trim();
    const confidence = Number(editForm.confidence);

    if (!title) {
      setError("Please enter the news claim.");
      return;
    }

    if (
      editForm.confidence === "" ||
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 100
    ) {
      setError("Confidence must be between 0 and 100.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest(`${API}/${editingRecord._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          reason,
          verdict: editForm.verdict,
          confidence,
        }),
      });

      if (data.history) {
        setHistoryList((previous) =>
          previous.map((item) =>
            item._id === editingRecord._id
              ? { ...item, ...data.history }
              : item
          )
        );
      } else {
        await fetchHistory();
      }

      setEditingRecord(null);
      setSuccess(data.message || "Record updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update record.");
    } finally {
      setSaving(false);
    }
  };

  // Delete button par custom popup kholo
  const handleDelete = (item) => {
    if (!item._id) {
      setError("Invalid history record.");
      return;
    }

    setError("");
    setSuccess("");
    setDeleteTarget(item);
  };

  // Confirm hone par MongoDB se permanently delete karo
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    const item = deleteTarget;

    setDeletingId(item._id);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest(`${API}/${item._id}`, {
        method: "DELETE",
      });

      // Server success ke baad hi list se remove karo
      setHistoryList((previous) =>
        previous.filter((record) => record._id !== item._id)
      );

      if (editingRecord?._id === item._id) {
        setEditingRecord(null);
      }

      setDeleteTarget(null);
      setSuccess(data.message || "Record deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete record.");
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-200 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                <History className="text-cyan-400" size={25} />
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                News Verification History
              </h1>
            </div>

            <p className="text-sm text-slate-400">
              View and manage NewsShield verification records.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading || saving || deletingId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300"
          >
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Total records */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="rounded-xl bg-cyan-500/10 p-3">
            <FileSearch className="text-cyan-400" size={24} />
          </div>

          <div>
            <p className="text-sm text-slate-400">Total Records</p>
            <p className="text-2xl font-bold text-white">
              {historyList.length}
            </p>
          </div>
        </div>

        {/* Edit form */}
        {editingRecord && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Edit Verification Record
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Changes will be saved to the database.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingRecord(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                aria-label="Close edit form"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  News Claim
                </label>

                <textarea
                  required
                  maxLength={10000}
                  rows={3}
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                  placeholder="Enter news claim"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Reason
                </label>

                <textarea
                  maxLength={5000}
                  rows={3}
                  value={editForm.reason}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      reason: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                  placeholder="Enter verification reason"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Verdict
                  </label>

                  <select
                    value={editForm.verdict}
                    onChange={(event) =>
                      setEditForm((previous) => ({
                        ...previous,
                        verdict: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    <option value="Real">Real</option>
                    <option value="Fake">Fake</option>
                    <option value="Unverified">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Confidence (%)
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={editForm.confidence}
                    onChange={(event) =>
                      setEditForm((previous) => ({
                        ...previous,
                        confidence: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    placeholder="0–100"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditingRecord(null)}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* History table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900">
                <tr className="text-slate-400">
                  <th className="p-4 font-semibold">#</th>
                  <th className="p-4 font-semibold">News Claim</th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Verdict</th>
                  <th className="p-4 font-semibold">Confidence</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      Loading verification history...
                    </td>
                  </tr>
                ) : historyList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      No verification history found.
                    </td>
                  </tr>
                ) : (
                  historyList.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="p-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="max-w-sm p-4">
                        <p className="font-medium leading-6 text-white">
                          {item.title || item.news || item.claim || "Untitled claim"}
                        </p>

                        {item.reason && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                            {item.reason}
                          </p>
                        )}
                      </td>

                      <td className="p-4 text-slate-300">
                        {getUserDetails(item)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getVerdictStyle(
                            item.verdict
                          )}`}
                        >
                          {item.verdict || "Unverified"}
                        </span>
                      </td>

                      <td className="p-4 text-slate-300">
                        {getConfidence(item)}
                      </td>

                      <td className="whitespace-nowrap p-4 text-slate-400">
                        {formatDate(item.createdAt || item.date || item.updatedAt)}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            disabled={saving || deletingId !== null}
                            title="Edit record"
                            aria-label="Edit record"
                            className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-400 transition hover:bg-cyan-500/20 disabled:opacity-50"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId !== null || saving}
                            title="Delete record permanently"
                            aria-label="Delete record permanently"
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {deletingId === item._id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
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

        <p className="text-xs leading-5 text-slate-500">
          Admin changes are sent to the backend. Edit updates the claim,
          reason, verdict and confidence; Delete permanently removes the
          selected verification record.
        </p>
      </div>

      {/* NewsShield custom confirmation popup */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Verification Record?"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.title || deleteTarget.news || deleteTarget.claim || "Untitled claim"}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          if (deletingId === null) {
            setDeleteTarget(null);
          }
        }}
        loading={deletingId !== null}
      />
    </div>
  );
}
