import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import AdminFeedback from "./pages/AdminFeedback";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
return ( <BrowserRouter> <Navbar />

```
  <Routes>
    {/* Public Routes */}

    <Route
      path="/"
      element={<Home />}
    />

    <Route
      path="/login"
      element={<Login />}
    />

    <Route
      path="/register"
      element={<Register />}
    />

    {/* Protected Routes */}

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/history"
      element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/feedback"
      element={<ProtectedRoute><AdminFeedback /></ProtectedRoute>}
    />

    <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

    {/* 404 Route */}

    <Route
      path="*"
      element={<NotFound />}
    />
  </Routes>
</BrowserRouter>

);
}

export default App;
