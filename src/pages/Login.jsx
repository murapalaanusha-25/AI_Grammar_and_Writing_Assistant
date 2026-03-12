// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PenLine, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); }
    else navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0c",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: "24px",
      position: "relative", overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gridMove{ from{transform:translateY(0)} to{transform:translateY(60px)} }
        .auth-input:focus  { border-color: rgba(200,240,74,0.55) !important; background: rgba(255,255,255,0.07) !important; }
        .auth-input::placeholder { color: rgba(255,255,255,0.22); }
        .submit-btn:hover  { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(200,240,74,0.28) !important; }
        .auth-link         { color: #c8f04a; text-decoration: none; font-weight: 600; }
        .auth-link:hover   { text-decoration: underline; }
      `}</style>

      {/* Grid bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(200,240,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridMove 10s linear infinite" }} />
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,240,74,0.06) 0%, transparent 68%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(116,224,106,0.05) 0%, transparent 68%)", pointerEvents: "none" }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 420,
        animation: "fadeUp 0.4s cubic-bezier(0.4,0,0.2,1)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #c8f04a, #74e06a)", marginBottom: 16 }}>
            <PenLine size={22} color="#0a0a0c" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: -0.8 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0 }}>Sign in to your WriteAI account</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 32 }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "rgba(240,74,110,0.1)", border: "1px solid rgba(240,74,110,0.25)", color: "#f07090", fontSize: 13, marginBottom: 20 }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, display: "block", marginBottom: 7 }}>Email address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  style={{ width: "100%", padding: "11px 13px 11px 38px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "all 0.18s", boxSizing: "border-box" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 }}>Password</label>
                <Link to="/forgot-password" className="auth-link" style={{ fontSize: 12 }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width: "100%", padding: "11px 13px 11px 38px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "all 0.18s", boxSizing: "border-box" }} />
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}
              style={{ marginTop: 4, padding: "13px", borderRadius: 12, border: "none", background: loading ? "rgba(200,240,74,0.2)" : "linear-gradient(135deg, #c8f04a, #8ee04a)", color: loading ? "rgba(255,255,255,0.3)" : "#0a0a0c", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 20px rgba(200,240,74,0.15)" }}>
              {loading
                ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a0a0c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Signing in...</>
                : <><ArrowRight size={15} strokeWidth={2.5} />Sign in</>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 22 }}>
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}