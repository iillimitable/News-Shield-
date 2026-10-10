import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}) {
  const token = localStorage.getItem("newsShieldToken");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("newsShieldUser"));
  } catch {
    user = null;
  }

  // Login required
  if (!token || !user) {
    return (
      <Navigate
        to={adminOnly ? "/admin" : "/login"}
        replace
      />
    );
  }

  // Admin pages are only for admins
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // User pages are only for regular users
  if (!adminOnly && user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}