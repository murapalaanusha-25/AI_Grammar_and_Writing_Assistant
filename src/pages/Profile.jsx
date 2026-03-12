// pages/Profile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  User, Mail, Lock, CheckCircle, AlertCircle,
  Save, ArrowLeft, Eye, EyeOff
} from "lucide-react";

export default function Profile() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const [name, setName]           = useState(displayName);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  const [nameLoading, setNameLoading]   = useState(false);
  const [pwLoading, setPwLoading]       = useState(false);
  const [nameMsg, setNameMsg]           = useState(null); // {type: "success"|"error", text}
  const [pwMsg, setPwMsg]               = useState(null);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setNameLoading(true); setNameMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      if (error) throw error;
      setNameMsg({ type: "success", text: "Name updated successfully." });
    } catch (e) {
      setNameMsg({ type: "error", text: e.message || "Failed to update name." });
    }
    setNameLoading(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw)           { setPwMsg({ type: "error", text: "Please enter your current password." }); return; }
    if (!newPw || !confirmPw) { setPwMsg({ type: "error", text: "Please fill in all fields." }); return; }
    if (newPw !== confirmPw)  { setPwMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (newPw.length < 6)     { setPwMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    if (currentPw === newPw)  { setPwMsg({ type: "error", text: "New password must be different from current password." }); return; }
    setPwLoading(true); setPwMsg(null);
    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPw,
      });
      if (signInError) {
        setPwMsg({ type: "error", text: "Current password is incorrect." });
        setPwLoading(false);
        return;
      }
      // Update password — AuthContext USER_UPDATED handler keeps session alive automatically
      const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
      if (updateError) throw updateError;
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwMsg({ type: "success", text: "Password updated successfully. You remain logged in." });
      // Blur any focused input to prevent browser re-autofilling
      if (document.activeElement) document.activeElement.blur();
    } catch (e) {
      setPwMsg({ type: "error", text: e.message || "Failed to change password." });
    }
    setPwLoading(false);
  };

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const s = strength(newPw);
  const sColor = ["", "#f04a6e", "#f0c44a", "#4ac8f0", "#c8f04a"][s];
  const sLabel = ["", "Weak", "Fair", "Good", "Strong"][s];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0c", fontFamily: "'DM Sans', sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(60px)} }
        input:focus { outline: none !important; }
        input::placeholder { color: rgba(255,255,255,0.18); }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(200,240,74,0.25) !important; }
        .pw-toggle:hover { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(rgba(200,240,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridMove 10s linear infinite" }} />
      <div style={{ position: "fixed", top: "-15%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,240,74,0.06) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 620, margin: "0 auto", padding: "40px 24px 80px", animation: "fadeUp 0.35s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* Back */}
        <button onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 28, padding: 0, transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, rgba(200,240,74,0.15), rgba(116,224,106,0.15))", border: "1px solid rgba(200,240,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#c8f04a", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.8 }}>{displayName}</h1>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={12} />{user?.email}
            </div>
          </div>
        </div>

        {/* Update Name */}
        <Section title="Display Name" Icon={User}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InputField
              label="Full name"
              value={name}
              onChange={setName}
              placeholder="Your name"
              Icon={User}
            />
            {nameMsg && <Msg type={nameMsg.type} text={nameMsg.text} />}
            <SaveButton loading={nameLoading} onClick={handleSaveName} label="Save Name" />
          </div>
        </Section>

        {/* Change Password */}
        <Section title="Change Password" Icon={Lock}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PasswordField label="Current password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} placeholder="Enter current password" autoComplete="current-password" />
            <div>
              <PasswordField label="New password" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Min. 6 characters" autoComplete="new-password" />
              {newPw && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= s ? sColor : "rgba(255,255,255,0.07)", transition: "background 0.3s" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: sColor, fontWeight: 600 }}>{sLabel}</span>
                </div>
              )}
            </div>
            <PasswordField label="Confirm new password" value={confirmPw} onChange={setConfirmPw} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Repeat new password" autoComplete="new-password" />
            {confirmPw && confirmPw === newPw && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#c8f04a" }}>
                <CheckCircle size={12} /> Passwords match
              </div>
            )}
            {pwMsg && <Msg type={pwMsg.type} text={pwMsg.text} />}
            <SaveButton loading={pwLoading} onClick={handleChangePassword} label="Change Password" />
          </div>
        </Section>

        {/* Account Info */}
        <Section title="Account Info" Icon={Mail}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Account ID" value={user?.id || "—"} mono copyable />
            <InfoRow label="Last sign in" value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} />
          </div>
        </Section>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, Icon, children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(200,240,74,0.09)", border: "1px solid rgba(200,240,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color="#c8f04a" strokeWidth={2} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, Icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5, display: "block", marginBottom: 7 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <Icon size={14} color="rgba(255,255,255,0.2)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: `1px solid ${focused ? "rgba(200,240,74,0.5)" : "rgba(255,255,255,0.08)"}`, background: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border 0.18s, background 0.18s", boxSizing: "border-box" }} />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder, autoComplete = "new-password" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5, display: "block", marginBottom: 7 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <Lock size={14} color="rgba(255,255,255,0.2)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ width: "100%", padding: "10px 40px 10px 36px", borderRadius: 10, border: `1px solid ${focused ? "rgba(200,240,74,0.5)" : "rgba(255,255,255,0.08)"}`, background: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border 0.18s", boxSizing: "border-box" }} />
        <button className="pw-toggle" onClick={onToggle} type="button"
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex", transition: "color 0.15s" }}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function SaveButton({ loading, onClick, label }) {
  return (
    <button className="save-btn" onClick={onClick} disabled={loading}
      style={{ alignSelf: "flex-start", padding: "10px 22px", borderRadius: 10, border: "none", background: loading ? "rgba(200,240,74,0.15)" : "linear-gradient(135deg, #c8f04a, #8ee04a)", color: loading ? "rgba(255,255,255,0.3)" : "#0a0a0c", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s", boxShadow: "0 4px 16px rgba(200,240,74,0.14)" }}>
      {loading ? "Saving..." : <><Save size={13} strokeWidth={2.5} />{label}</>}
    </button>
  );
}

function Msg({ type, text }) {
  const isOk = type === "success";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 10, background: isOk ? "rgba(200,240,74,0.08)" : "rgba(240,74,110,0.1)", border: `1px solid ${isOk ? "rgba(200,240,74,0.25)" : "rgba(240,74,110,0.25)"}`, color: isOk ? "#c8f04a" : "#f04a6e", fontSize: 13 }}>
      {isOk ? <CheckCircle size={14} /> : <AlertCircle size={14} />}{text}
    </div>
  );
}

function InfoRow({ label, value, mono, copyable }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.05)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: mono ? "'DM Mono', monospace" : "'DM Sans', sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }} title={value}>{value}</span>
        {copyable && (
          <button onClick={handleCopy} title="Copy"
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, color: copied ? "#c8f04a" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 10, padding: "2px 7px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap" }}>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}