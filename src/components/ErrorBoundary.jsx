import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Nunito', sans-serif", flexDirection: "column", gap: 16, padding: 40,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#202124" }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: "#5F6368", maxWidth: 400, textAlign: "center" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: "#4285F4", color: "#fff", fontSize: 14,
              fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
