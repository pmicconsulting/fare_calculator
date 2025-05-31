"use client";
import React, { useRef, useEffect } from "react";

// Named export for correct import
export interface MapContainerProps {
  onClick: (e: google.maps.MapMouseEvent) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ onClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.68, lng: 139.76 },
      zoom: 7,
      mapTypeId: "roadmap",
    });

    map.addListener("click", (e: google.maps.MapMouseEvent) => onClick(e));
    (window as any).map = map;
    (window as any).renderer = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true
    });

    return () => {
      (window as any).map = undefined;
      (window as any).renderer = undefined;
    };
  }, [onClick]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: 400, background: "#eee", border: "1px solid #bbb" }} />
  );
};