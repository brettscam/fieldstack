import { useState } from "react";
import { BRAND, FONT } from "../lib/design";
import Icons from "../components/Icons";

export default function Login({ onAuth, onDemo }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await onAuth(mode, email, password);
      if (mode === "signup") {
        setSuccess("Check your email for a confirmation link.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: `1px solid ${BRAND.border}`, fontSize: 14, fontFamily: FONT,
    fontWeight: 500, color: BRAND.textPrimary, outline: "none",
    background: BRAND.surface, transition: "border-color 0.15s ease",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${BRAND.surface} 0%, ${BRAND.blueSoft} 100%)`,
      fontFamily: FONT,
    }}>
      <div style={{
        width: 400, background: BRAND.white, borderRadius: 20,
        padding: "40px 36px", boxShadow: `0 8px 40px ${BRAND.shadow}`,
        animation: "fs-scaleIn 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `linear-gradient(135deg, ${BRAND.blue} 0%, #6EA8FE 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icons.Hardhat size={22} color={BRAND.white} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 24, color: BRAND.textPrimary, letterSpacing: -0.5 }}>
            FieldStack
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 6 }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500 }}>
            {mode === "signin" ? "Sign in to manage your projects" : "Get started with FieldStack"}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: BRAND.redSoft, color: BRAND.red,
              fontSize: 13, fontWeight: 600,
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: BRAND.greenSoft, color: BRAND.green,
              fontSize: 13, fontWeight: 600,
            }}>{success}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", borderRadius: 10, border: "none",
            background: loading ? BRAND.blueMuted : BRAND.blue,
            color: BRAND.white, fontSize: 14, fontWeight: 700, fontFamily: FONT,
            cursor: loading ? "default" : "pointer", marginTop: 4,
            boxShadow: `0 2px 8px ${BRAND.shadow}`,
            transition: "background 0.15s ease",
          }}>
            {loading ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500 }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <span
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }}
            style={{ fontSize: 13, color: BRAND.blue, fontWeight: 600, cursor: "pointer" }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </span>
        </div>

        {/* Demo access */}
        {onDemo && (
          <div style={{ marginTop: 24, borderTop: `1px solid ${BRAND.border}`, paddingTop: 20, textAlign: "center" }}>
            <button onClick={onDemo} style={{
              width: "100%", padding: "12px", borderRadius: 10,
              border: `1.5px solid ${BRAND.border}`,
              background: BRAND.white, color: BRAND.textSecondary,
              fontSize: 14, fontWeight: 600, fontFamily: FONT,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
              transition: "all 0.15s ease",
            }} className="fs-view-btn">
              <Icons.Hardhat size={18} color={BRAND.blue} />
              <span>Explore Demo</span>
              <span style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 500 }}>No account needed</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
