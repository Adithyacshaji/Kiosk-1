import { useState } from "react";
import { MapPin, Loader2, RefreshCw } from "lucide-react";

export default function LocationAlertCard({ onRetry }) {
  const [retrying, setRetrying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleRetry = async () => {
    setRetrying(true);
    setAttempts((a) => a + 1);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      className="pointer-events-auto"
      style={{
        position: "absolute",
        bottom: "96px",
        left: "16px",
        right: "16px",
        zIndex: 2500,
        background: "rgba(255,255,255,0.97)",
        
        
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.07)",
        padding: "20px",
        animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MapPin size={20} color="white" strokeWidth={2.2} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#111827", lineHeight: 1.3 }}>
            Location Access Needed
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
            Required to show your position on campus
          </p>
        </div>
      </div>

      {/* Body */}
      <p style={{ margin: "0 0 14px", fontSize: "13.5px", color: "#374151", lineHeight: 1.55 }}>
        Campus RouteX needs your GPS location to navigate you around campus and show your current position on the map.
      </p>

      {/* Escalating hint after failed attempts */}
      {attempts >= 1 && !retrying && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "10px",
            padding: "10px 12px",
            marginBottom: "14px",
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>⚠️</span>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#92400e", lineHeight: 1.5 }}>
            {attempts === 1
              ? "Still blocked. Try opening your browser settings and allowing location access for this site."
              : "Tap the 🔒 icon in your address bar → Site settings → Allow Location, then retry."}
          </p>
        </div>
      )}

      {/* Retry button */}
      <button
        onClick={handleRetry}
        disabled={retrying}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: "14px",
          border: "none",
          cursor: retrying ? "default" : "pointer",
          background: retrying
            ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
            : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "white",
          fontWeight: 700,
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.2s",
          boxShadow: retrying ? "none" : "0 4px 14px rgba(37,99,235,0.35)",
        }}
      >
        {retrying ? (
          <>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            <span>Checking for location…</span>
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            <span>{attempts === 0 ? "Retry" : "Try Again"}</span>
          </>
        )}
      </button>
    </div>
  );
}
