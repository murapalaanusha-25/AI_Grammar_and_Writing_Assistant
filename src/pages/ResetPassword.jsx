// pages/ResetPassword.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PenLine, Lock, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const s = strength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][s];
  const strengthColor = ["", "#f04a6e", "#f0c44a", "#4ac8f0", "#c8f04a"][s];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    const { error } = await resetPassword(password);
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => navigate("/login"), 3000); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0c", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "24px", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gridMove{ from{transform:translateY(0)} to{transform:translateY(60px)} }
        .auth-input:focus  { border-color: rgba(200,240,74,0.5) !important; background: rgba(255,255,255,0.05) !important; }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .submit-btn:hover  { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(200,240,74,0.28) !important; }
        .auth-link         { color: #c8f04a; text-decoration: none; font-weight: 600; }
        .auth-link:hover   { text-decoration: underline; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(200,240,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridMove 10s linear infinite" }} />
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,240,74,0.06) 0%, transparent 68%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, animation: "fadeUp 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #c8f04a, #74e06a)", marginBottom: 16 }}>
            <PenLine size={22} color="#0a0a0c" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: -0.8 }}>Set new password</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0 }}>Choose a strong password for your account</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32 }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: "50%", background: "rgba(200,240,74,0.1)", border: "1px solid rgba(200,240,74,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <CheckCircle size={26} color="#c8f04a" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Password updated</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", lineHeight: 1.6 }}>
                Your password has been reset successfully. Redirecting you to sign in...
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
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, display: "block", marginBottom: 7 }}>New password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" autoComplete="new-password"
                      style={{ width: "100%", padding: "11px 13px 11px 38px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "all 0.18s", boxSizing: "border-box" }} />
                  </div>
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= s ? strengthColor : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, display: "block", marginBottom: 7 }}>Confirm new password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input className="auth-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••" autoComplete="new-password"
                      style={{ width: "100%", padding: "11px 13px 11px 38px", borderRadius: 10, border: `1px solid ${confirm && confirm !== password ? "rgba(240,74,110,0.4)" : "rgba(255,255,255,0.09)"}`, background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "all 0.18s", boxSizing: "border-box" }} />
                  </div>
                  {confirm && confirm === password && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 12, color: "#c8f04a" }}>
                      <CheckCircle size={12} /> Passwords match
                    </div>
                  )}
                </div>

                <button className="submit-btn" type="submit" disabled={loading}
                  style={{ padding: "13px", borderRadius: 12, border: "none", background: loading ? "rgba(200,240,74,0.2)" : "linear-gradient(135deg, #c8f04a, #8ee04a)", color: loading ? "rgba(255,255,255,0.3)" : "#0a0a0c", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 20px rgba(200,240,74,0.15)" }}>
                  {loading
                    ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a0a0c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Updating...</>
                    : <><ArrowRight size={15} strokeWidth={2.5} />Update password</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
