import React, { useEffect, useRef } from "react";

// directions, geocodes, dir1, dir2, ferry
export default function DynamicMap(props: any) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsRenderer2 = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 36, lng: 137 },
        zoom: 6,
      });
    }
    // ピン描画
    props.geocodes?.forEach((g: any, i: number) => {
      new window.google.maps.Marker({
        position: g,
        map: mapInstance.current!,
        icon: i === 0 ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          : (i === props.geocodes.length - 1 ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png")
      });
    });
    // 経路描画
    if (props.directions) {
      if (!directionsRenderer.current) {
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({ suppressMarkers: true });
        directionsRenderer.current.setMap(mapInstance.current);
      }
      directionsRenderer.current.setDirections(props.directions);
    }
    // フェリー2経路
    if (props.ferry) {
      if (!directionsRenderer.current) {
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({ suppressMarkers: true, polylineOptions: { strokeColor: "#285" } });
        directionsRenderer.current.setMap(mapInstance.current);
      }
      if (!directionsRenderer2.current) {
        directionsRenderer2.current = new window.google.maps.DirectionsRenderer({ suppressMarkers: true, polylineOptions: { strokeColor: "#e38" } });
        directionsRenderer2.current.setMap(mapInstance.current);
      }
      if (props.dir1) directionsRenderer.current.setDirections(props.dir1);
      if (props.dir2) directionsRenderer2.current.setDirections(props.dir2);
    }
  }, [props.directions, props.dir1, props.dir2, props.geocodes]);

  return <div ref={mapRef} className="map-container" style={{ marginTop: 20 }} />;
}