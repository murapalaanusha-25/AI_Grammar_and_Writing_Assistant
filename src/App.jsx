// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login            from "./pages/Login";
import Register         from "./pages/Register";
import ForgotPassword   from "./pages/ForgotPassword";
import ResetPassword    from "./pages/ResetPassword";
import Dashboard        from "./pages/Dashboard";
import WritingAssistant from "./pages/WritingAssistant";
import Profile          from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><WritingAssistant /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}