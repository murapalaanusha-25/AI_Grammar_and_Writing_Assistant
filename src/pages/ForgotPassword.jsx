// pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PenLine, Mail, AlertCircle, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    const { error } = await forgotPassword(email);
    if (error) { setError(error.message); setLoading(false); }
    else setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0c", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "24px", position: "relative", overflow: "hidden" }}>
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

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(200,240,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridMove 10s linear infinite" }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,240,74,0.05) 0%, transparent 68%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, animation: "fadeUp 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #c8f04a, #74e06a)", marginBottom: 16 }}>
            <PenLine size={22} color="#0a0a0c" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: -0.8 }}>Forgot password?</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0 }}>No worries — we'll send you reset instructions</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 32 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: "50%", background: "rgba(200,240,74,0.1)", border: "1px solid rgba(200,240,74,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <CheckCircle size={26} color="#c8f04a" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Email sent</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", lineHeight: 1.6 }}>
                We sent a reset link to
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 20px" }}>{email}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 20px", lineHeight: 1.5 }}>
                Didn't receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} style={{ background: "none", border: "none", color: "#c8f04a", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  try again
                </button>
              </p>
            </div>
          ) : (
            <>
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
                <button className="submit-btn" type="submit" disabled={loading}
                  style={{ padding: "13px", borderRadius: 12, border: "none", background: loading ? "rgba(200,240,74,0.2)" : "linear-gradient(135deg, #c8f04a, #8ee04a)", color: loading ? "rgba(255,255,255,0.3)" : "#0a0a0c", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 20px rgba(200,240,74,0.15)" }}>
                  {loading
                    ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a0a0c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Sending...</>
                    : <><ArrowRight size={15} strokeWidth={2.5} />Send reset link</>}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 22 }}>
          <Link to="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}