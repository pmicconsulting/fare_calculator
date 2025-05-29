// src/components/MapContainer.tsx
import React, { useRef, useEffect } from "react";

export interface MapContainerProps {
  onClick: (e: google.maps.MapMouseEvent) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ onClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.68, lng: 139.76 },
      zoom: 6,
    });

    // ←ここ重要！親から渡された onClick を使う
    map.addListener("click", (e: google.maps.MapMouseEvent) => onClick(e));
    window.map = map;
    window.renderer = new window.google.maps.DirectionsRenderer({ map });
  }, [onClick]);

  return <div ref={mapRef} style={{ width: "100%", height: 400 }} />;
};
