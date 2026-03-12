// pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  CheckCircle, RefreshCw, Target, GitCompare,
  ArrowRight, PenLine, Zap, TrendingUp
} from "lucide-react";

const features = [
  { Icon: CheckCircle, label: "Grammar & Spelling",  desc: "Fix errors and spelling mistakes with one click.", color: "#c8f04a",  path: "/assistant", tab: "grammar"    },
  { Icon: RefreshCw,   label: "Paraphrase",           desc: "Rewrite in formal, casual, academic or persuasive tone.", color: "#4ac8f0",  path: "/assistant", tab: "paraphrase" },
  { Icon: Target,      label: "Clarity Score",        desc: "Get a readability score and sentence-level feedback.", color: "#f0c44a",  path: "/assistant", tab: "clarity"    },
  { Icon: GitCompare,  label: "Compare Versions",     desc: "Paste wrong text — see every correction highlighted.", color: "#c84af0",  path: "/assistant", tab: "compare"    },
];

const stats = [
  { label: "Features Available", value: "4",    Icon: Zap        },
  { label: "Tones Supported",    value: "4",    Icon: PenLine    },
  { label: "Model",         value: "Groq Llama 3.3", Icon: TrendingUp },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const firstName = displayName.split(" ")[0];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0c", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gridMove{ from{transform:translateY(0)} to{transform:translateY(60px)} }
        .feature-card:hover { border-color: rgba(255,255,255,0.15) !important; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important; }
        .start-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(200,240,74,0.28) !important; }
      `}</style>

      {/* Grid bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(rgba(200,240,74,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.025) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridMove 10s linear infinite" }} />
      <div style={{ position: "fixed", top: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,240,74,0.06) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 52, animation: "fadeUp 0.4s ease" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#c8f04a", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
            Dashboard
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, margin: "0 0 10px", letterSpacing: -1.5, lineHeight: 1.15, background: "linear-gradient(140deg, #fff 55%, rgba(200,240,74,0.75))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Good to see you,<br />{firstName}.
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", margin: 0 }}>
            What would you like to improve today?
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 40 }}>
          {stats.map(({ label, value, Icon }, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, animation: `fadeUp ${0.3 + i * 0.08}s ease` }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(200,240,74,0.1)", border: "1px solid rgba(200,240,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color="#c8f04a" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5, fontFamily: "'DM Mono', monospace" }}>{value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>All Features</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {features.map(({ Icon, label, desc, color, path, tab }, i) => (
              <div key={i} className="feature-card"
                onClick={() => navigate(path, { state: { tab } })}
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s", animation: `fadeUp ${0.35 + i * 0.07}s ease` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color={color} strokeWidth={2} />
                  </div>
                  <ArrowRight size={16} color="rgba(255,255,255,0.2)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 40, background: "rgba(200,240,74,0.06)", border: "1px solid rgba(200,240,74,0.15)", borderRadius: 20, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, animation: "fadeUp 0.6s ease" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 5 }}>Ready to write better?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Open the Writing Assistant and start improving your text.</div>
          </div>
          <button className="start-btn"
            onClick={() => navigate("/assistant")}
            style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #c8f04a, #8ee04a)", color: "#0a0a0c", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 20px rgba(200,240,74,0.15)", whiteSpace: "nowrap" }}>
            <PenLine size={15} strokeWidth={2.5} /> Open Writing Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
