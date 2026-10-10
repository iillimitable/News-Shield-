// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   ShieldCheck,
//   Mail,
//   Lock,
//   ArrowLeft,
// } from "lucide-react";

// export default function AdminLogin() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Handle input changes
//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Handle admin login
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     const email = form.email.trim().toLowerCase();
//     const password = form.password;

//     if (!email || !password) {
//       setError("Please enter admin email and password.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Send login request to backend
//       const response = await fetch(
//         "http://127.0.0.1:5001/api/auth/login",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email,
//             password,
//           }),
//         }
//       );

//       // Read response safely
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || data.error || "Admin login failed."
//         );
//       }

//       // Only allow users whose backend role is admin
//       if (
//         data.user?.role?.toLowerCase() !== "admin" ||
//         !data.token
//       ) {
//         throw new Error(
//           "Admin access denied. Please use an admin account."
//         );
//       }

//       // Save authentication details
//       localStorage.setItem("newsShieldToken", data.token);
//       localStorage.setItem(
//         "newsShieldUser",
//         JSON.stringify(data.user)
//       );

//       // Open admin dashboard
//       navigate("/admin/dashboard", { replace: true });
//     } catch (err) {
//       console.error("Admin login error:", err);

//       setError(
//         err.message ||
//           "Unable to connect to NewsShield backend."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
//       <div className="mx-auto max-w-md">
//         {/* Logo and heading */}
//         <div className="mb-8 text-center">
//           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
//             <ShieldCheck size={34} />
//           </div>

//           <h1 className="text-3xl font-bold">
//             Admin Login
//           </h1>

//           <p className="mt-2 text-slate-400">
//             Sign in to manage NewsShield.
//           </p>
//         </div>

//         {/* Login form */}
//         <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
//           {error && (
//             <div
//               role="alert"
//               className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
//             >
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="admin-email"
//                 className="mb-2 block text-sm font-medium text-slate-300"
//               >
//                 Admin Email
//               </label>

//               <div className="relative">
//                 <Mail
//                   size={18}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
//                 />

//                 <input
//                   id="admin-email"
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   placeholder="Enter admin email"
//                   autoComplete="username"
//                   required
//                   className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none transition focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 htmlFor="admin-password"
//                 className="mb-2 block text-sm font-medium text-slate-300"
//               >
//                 Password
//               </label>

//               <div className="relative">
//                 <Lock
//                   size={18}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
//                 />

//                 <input
//                   id="admin-password"
//                   type="password"
//                   name="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Enter admin password"
//                   autoComplete="current-password"
//                   required
//                   className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none transition focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {loading ? "Logging in..." : "Login as Admin"}
//             </button>
//           </form>

//           {/* Regular user login */}
//           <div className="mt-6 text-center">
//             <Link
//               to="/login"
//               className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
//             >
//               <ArrowLeft size={16} />
//               Back to User Login
//             </Link>
//           </div>
//         </div>

//         <p className="mt-6 text-center text-xs text-slate-500">
//           NewsShield · Secure Admin Access
//         </p>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
} from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle admin login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter admin email and password.");
      return;
    }

    setLoading(true);

    try {
      // Send login request to backend
      const response = await fetch(
        "http://localhost:5001/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      // Safely read backend response
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Login failed (${response.status}).`
        );
      }

      // Check admin role and token
      const role = String(data.user?.role || "").toLowerCase();

      if (!data.token || role !== "admin") {
        throw new Error(
          "Admin access denied. Check ADMIN_EMAIL and ADMIN_PASSWORD in backend .env, and confirm the admin account exists in MongoDB."
        );
      }

      // Save authentication details
      localStorage.setItem("newsShieldToken", data.token);
      localStorage.setItem(
        "newsShieldUser",
        JSON.stringify(data.user)
      );

      // Open admin dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.message || "Unable to connect to NewsShield backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md">
        {/* Logo and heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <ShieldCheck size={34} />
          </div>

          <h1 className="text-3xl font-bold">Admin Login</h1>

          <p className="mt-2 text-slate-400">
            Sign in to manage NewsShield.
          </p>
        </div>

        {/* Login form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Admin Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter admin email"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="admin-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>

          {/* Regular user login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              <ArrowLeft size={16} />
              Back to User Login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          NewsShield · Secure Admin Access
        </p>
      </div>
    </div>
  );
}
