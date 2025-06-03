import React, { useState } from "react";
export default function MenuOverlay({
  pos, onSelect, waypoints, isDuplicatePin
}: {
  pos: { x: number, y: number },
  onSelect: (type: string, idx?: number) => void,
  waypoints: (google.maps.LatLngLiteral | null)[],
  isDuplicatePin: (latlng: google.maps.LatLngLiteral) => boolean
}) {
  const [showWaypoints, setShowWaypoints] = useState(false);
  return (
    <div
      className="menu-overlay"
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
        zIndex: 1000,
        padding: 4,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
      <span className="menu-link" onClick={() => onSelect("origin")}>出発地</span>
      <span className="menu-link" onClick={() => onSelect("destination")}>到着地</span>
      <span className="menu-link" onClick={() => setShowWaypoints(v => !v)}>経由地</span>
      {showWaypoints && (
        <div style={{ marginLeft: 10, marginTop: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {[0, 1, 2, 3, 4].map(idx => (
            <span
              key={idx}
              className={`menu-link waypoint-link ${waypoints[idx] ? "set" : ""}`}
              onClick={() => {
                if (!waypoints[idx]) onSelect("waypoint", idx);
              }}
              style={{
                color: waypoints[idx] ? "#aaa" : "#222",
                cursor: waypoints[idx] ? "not-allowed" : "pointer"
              }}
            >
              経由地{idx + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}