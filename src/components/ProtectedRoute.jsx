// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0c",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: 28, height: 28,
          border: "2.5px solid rgba(255,255,255,0.1)",
          borderTopColor: "#c8f04a",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
