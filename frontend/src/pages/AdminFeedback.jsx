
import { useEffect, useState } from "react";
import {
  RefreshCw,
  MessageSquare,
  Star,
  ThumbsUp,
  Users,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import ConfirmDialog from "../components/ConfirmDialog";

const API_URL = "http://localhost:5001/api/admin/feedback";

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    averageRating: 0,
    helpfulCount: 0,
    helpfulPercentage: 0,
    categories: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingFeedback, setEditingFeedback] = useState(null);

  // Custom delete popup ke liye state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    rating: 5,
    category: "Other",
    helpful: true,
    comment: "",
  });

  // Backend se feedback fetch karo
  const fetchFeedback = async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const token = localStorage.getItem("newsShieldToken");

      if (!token) {
        throw new Error("Admin token nahi mila. Dobara login karein.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Feedback load nahi ho saka.");
      }

      setFeedbackList(data.feedback || []);
      setStatistics({
        total: data.statistics?.total || 0,
        averageRating: data.statistics?.averageRating || 0,
        helpfulCount: data.statistics?.helpfulCount || 0,
        helpfulPercentage: data.statistics?.helpfulPercentage || 0,
        categories: data.statistics?.categories || {},
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Edit form open karo
  const handleEdit = (item) => {
    setEditingFeedback(item);
    setFormData({
      rating: item.rating ?? 5,
      category: item.category || "Other",
      helpful: Boolean(item.helpful),
      comment: item.comment || "",
    });
    setError("");
    setNotice("");
  };

  // Edited values ko frontend preview mein update karo
  const handleSave = (e) => {
    e.preventDefault();

    setFeedbackList((previous) =>
      previous.map((item) =>
        item._id === editingFeedback._id
          ? { ...item, ...formData }
          : item
      )
    );

    setEditingFeedback(null);
    setNotice(
      "Frontend preview updated. Permanent database save ke liye backend API connect karni hogi."
    );
  };

  // Delete button click par custom popup open karo
  const handleDelete = (item) => {
    setDeleteTarget(item);
    setError("");
    setNotice("");
  };

  // Confirmation ke baad frontend preview se remove karo
  const confirmDelete = () => {
    if (!deleteTarget) return;

    setFeedbackList((previous) =>
      previous.filter(
        (feedback) => feedback._id !== deleteTarget._id
      )
    );

    setDeleteTarget(null);

    setNotice(
      "Feedback frontend preview se remove hua hai. Permanent deletion ke liye backend API connect karni hogi."
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const statCards = [
    {
      title: "Total Feedback",
      value: feedbackList.length,
      icon: MessageSquare,
    },
    {
      title: "Average Rating",
      value: `${statistics.averageRating}/5`,
      icon: Star,
    },
    {
      title: "Helpful Feedback",
      value: statistics.helpfulCount,
      icon: ThumbsUp,
    },
    {
      title: "Helpful Percentage",
      value: `${statistics.helpfulPercentage}%`,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Feedback Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Users ke feedback, ratings aur comments manage karein.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFeedback}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Temporary action notice */}
      {notice && (
        <div className="mb-5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
          {notice}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Feedback load nahi hua</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Edit feedback form */}
      {editingFeedback && (
        <div className="mb-8 rounded-xl border border-cyan-500/30 bg-slate-900 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Edit Feedback</h2>
            <button
              type="button"
              onClick={() => setEditingFeedback(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close edit form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Rating
              </label>
              <select
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-white sm:max-w-xs"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} / 5
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-white"
              >
                {[
                  "Correct result",
                  "Incorrect result",
                  "Unclear explanation",
                  "Insufficient evidence",
                  "Irrelevant sources",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Helpful?
              </label>
              <select
                value={String(formData.helpful)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    helpful: e.target.value === "true",
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-white sm:max-w-xs"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Comment
              </label>
              <textarea
                rows={4}
                value={formData.comment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    comment: e.target.value,
                  })
                }
                placeholder="Enter feedback comment..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                <Save size={17} />
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setEditingFeedback(null)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{card.title}</p>
                <Icon size={21} className="text-cyan-400" />
              </div>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Feedback category summary */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Feedback Categories
        </h2>

        {Object.keys(statistics.categories).length === 0 ? (
          <p className="text-sm text-slate-400">
            Abhi category statistics available nahi hain.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(statistics.categories).map(
              ([category, count]) => (
                <div
                  key={category}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  <p className="text-sm text-slate-300">{category}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">
                    {count}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Feedback records */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold">User Feedback</h2>
          <p className="mt-1 text-sm text-slate-400">
            Total records: {feedbackList.length}
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">
            Loading feedback...
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquare
              size={36}
              className="mx-auto mb-3 text-slate-600"
            />
            <p className="font-medium">No feedback found</p>
            <p className="mt-2 text-sm text-slate-400">
              Users ke feedback submit karne par records yahan dikhenge.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Result</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Helpful?</th>
                  <th className="px-5 py-4">Comment</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {feedbackList.map((item) => (
                  <tr
                    key={item._id}
                    className="align-top hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {item.userId?.name || "Unknown user"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.userId?.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          item.verificationResult === "Real"
                            ? "bg-green-500/10 text-green-400"
                            : item.verificationResult === "Fake"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {item.verificationResult || "Unverified"}
                      </span>

                      {item.verificationId?.title && (
                        <p className="mt-2 max-w-[220px] text-xs text-slate-400">
                          {item.verificationId.title}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        <Star size={15} fill="currentColor" />
                        {item.rating ?? 0}/5
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.category || "Other"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          item.helpful
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {item.helpful ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="max-w-[260px] whitespace-pre-wrap break-words px-5 py-4 text-slate-300">
                      {item.comment || "No comment"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit feedback"
                          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-400 hover:bg-cyan-500/20"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          title="Delete feedback"
                          className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NewsShield custom delete confirmation popup */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Feedback?"
        message="Kya aap is feedback ko list se remove karna chahte hain? Yeh action sirf frontend preview ko update karega."
        confirmText="Yes, Remove"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
