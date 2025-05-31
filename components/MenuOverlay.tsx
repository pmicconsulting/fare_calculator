"use client";
import React from "react";

// Named export for correct import in other files
export interface MenuOverlayProps {
  mode: "main" | "waypoint";
  x: number;
  y: number;
  onSelect: (type: string) => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({ mode, x, y, onSelect }) => {
  if (mode === "main") {
    return (
      <div
        style={{
          position: "absolute",
          top: y,
          left: x,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          borderRadius: 4,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button style={{ color: "blue", padding: "8px 12px", background: "none", border: "none", textAlign: "left" }}
          onClick={() => onSelect("origin")}
        >出発地を設定</button>
        <button style={{ color: "red", padding: "8px 12px", background: "none", border: "none", textAlign: "left" }}
          onClick={() => onSelect("destination")}
        >目的地を設定</button>
        <button style={{ color: "#b59a00", padding: "8px 12px", background: "none", border: "none", textAlign: "left" }}
          onClick={() => onSelect("waypoint-menu")}
        >経由地を設定</button>
      </div>
    );
  }

  if (mode === "waypoint") {
    return (
      <div
        style={{
          position: "absolute",
          top: y,
          left: x,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          borderRadius: 4,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {["①", "②", "③", "④", "⑤"].map((n, i) =>
          <button key={i}
            style={{ color: "#ffaa00", padding: "8px 12px", background: "none", border: "none", textAlign: "left", fontWeight: "bold" }}
            onClick={() => onSelect("waypoint" + i)}
          >経由地{n}に設定</button>
        )}
      </div>
    );
  }

  return null;
};