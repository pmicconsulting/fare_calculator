// src/components/MapContainer.tsx
import React, { useRef, useEffect } from "react";

export interface MapContainerProps {
  onClick: (e: google.maps.MapMouseEvent) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ onClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const renderer = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstance.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37, lng: 138 },
      zoom: 6,
      mapTypeId: "roadmap",
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstance.current = map;
    renderer.current = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#0000FF" },
      preserveViewport: true,
    });
    map.addListener("click", onClick);
  }, [onClick]);

  return <div ref={mapRef} style={{ width: "100%", height: 400, position: "relative" }} />;
};
