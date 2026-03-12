// components/Navbar.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PenLine, LayoutDashboard, LogOut, ChevronDown, User } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const navLinks = [
    { path: "/dashboard",  label: "Dashboard",        Icon: LayoutDashboard },
    { path: "/assistant",  label: "Writing Assistant", Icon: PenLine         },
  ];

  return (
    <>
      <style>{`
        .nav-link:hover { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
        .nav-link.active { background: rgba(200,240,74,0.1) !important; color: #c8f04a !important; }
        .user-menu-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .menu-item:hover { background: rgba(255,255,255,0.06) !important; }
        .signout-item:hover { background: rgba(240,74,110,0.1) !important; color: #f04a6e !important; }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,12,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60,
        fontFamily: "'DM Sans', sans-serif"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #c8f04a, #74e06a)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <PenLine size={15} color="#0a0a0c" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>WriteAI</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navLinks.map(({ path, label, Icon }) => (
            <button key={path} className={`nav-link${location.pathname === path ? " active" : ""}`}
              onClick={() => navigate(path)}
              style={{
                padding: "7px 14px", borderRadius: 9, border: "none",
                background: "transparent",
                color: location.pathname === path ? "#c8f04a" : "rgba(255,255,255,0.45)",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif"
              }}>
              <Icon size={14} strokeWidth={2} />{label}
            </button>
          ))}
        </div>

        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button className="user-menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "6px 10px 6px 6px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", cursor: "pointer",
              transition: "background 0.15s", fontFamily: "'DM Sans', sans-serif"
            }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #c8f04a40, #74e06a40)",
              border: "1px solid rgba(200,240,74,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#c8f04a",
              fontFamily: "'DM Mono', monospace"
            }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </span>
            <ChevronDown size={13} color="rgba(255,255,255,0.35)"
              style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "#141416", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: 6, minWidth: 200,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              animation: "fadeUp 0.18s ease"
            }}>
              <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{displayName}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{user?.email}</div>
              </div>
              <button className="menu-item"
                onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}>
                <User size={13} /> Profile
              </button>
              <button className="signout-item"
                onClick={handleSignOut}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}