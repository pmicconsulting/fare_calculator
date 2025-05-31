"use client";

import React, { useState, useRef, useCallback } from "react";
import { MenuOverlay } from "./MenuOverlay"; // Named import
import { MapContainer } from "./MapContainer"; // Named import

export default function GoogleMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMode, setMenuMode] = useState<"main" | "waypoint">("main");
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral | null>(null);

  // Pin refs
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const waypointMarkersRef = useRef<(google.maps.Marker | null)[]>([null, null, null, null, null]);

  // Handle map click to show menu
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const relX = e.domEvent.clientX - rect.left;
    const relY = e.domEvent.clientY - rect.top;
    setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setMenuPos({ x: relX, y: relY - 40 });
    setMenuMode("main");
    setMenuOpen(true);
  }, []);

  // Handle menu selection for pin types
  const handleMenuSelect = (sel: string) => {
    if (sel === "origin" && clickedLatLng) {
      originMarkerRef.current?.setMap(null);
      originMarkerRef.current = new window.google.maps.Marker({
        position: clickedLatLng,
        map: window.map!,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      });
      setMenuOpen(false);
    }
    else if (sel === "destination" && clickedLatLng) {
      destinationMarkerRef.current?.setMap(null);
      destinationMarkerRef.current = new window.google.maps.Marker({
        position: clickedLatLng,
        map: window.map!,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      });
      setMenuOpen(false);
    }
    else if (sel === "waypoint-menu") {
      setMenuMode("waypoint");
    }
    else if (sel.startsWith("waypoint") && clickedLatLng) {
      const idx = parseInt(sel.slice(8), 10);
      waypointMarkersRef.current[idx]?.setMap(null);
      waypointMarkersRef.current[idx] = new window.google.maps.Marker({
        position: clickedLatLng,
        map: window.map!,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      });
      setMenuOpen(false);
    }
  };

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{ position: "relative", width: "100%", height: 400 }}
      >
        <MapContainer onClick={handleMapClick} />
        {menuOpen && (
          <MenuOverlay
            mode={menuMode}
            x={menuPos.x}
            y={menuPos.y}
            onSelect={handleMenuSelect}
          />
        )}
      </div>
      {/* ここに他のUIや結果表示を追加 */}
    </div>
  );
}