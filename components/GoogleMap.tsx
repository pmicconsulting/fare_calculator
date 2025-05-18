"use client";
import React, { useRef, useEffect, useState } from 'react';

declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

export default function GoogleMap() {
  // 発地・着地・距離を保持するstate
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // 地図コンテナとマーカー配列をrefで保持
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    // Maps API読み込み後に呼ばれるcallback
    window.initMap = () => {
      if (!mapRef.current || !window.google) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 35.681236, lng: 139.767125 },
        zoom: 13,
      });

      // クリックで発地・着地の設定とマーカー設置
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };

        if (!origin) {
          // 発地設定
          setOrigin(pos);
          const marker = new window.google.maps.Marker({ position: pos, map, label: '出発' });
          markersRef.current.push(marker);
        } else if (!destination) {
          // 着地設定
          setDestination(pos);
          const marker = new window.google.maps.Marker({ position: pos, map, label: '到着' });
          markersRef.current.push(marker);
        } else {
          // リセットして再指定
          markersRef.current.forEach(m => m.setMap(null));
          markersRef.current = [];
          setOrigin(pos);
          setDestination(null);
          setDistanceKm(null);
          const marker = new window.google.maps.Marker({ position: pos, map, label: '出発' });
          markersRef.current.push(marker);
        }
      });
    };

    // スクリプト既読なら即init
    if (window.google && typeof window.initMap === 'function') {
      window.initMap();
    }
  }, [origin, destination]);

  // 2-3: Distance Matrix API 呼び出しを実装
  const handleGetDistance = () => {
    if (!origin || !destination) return;
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: 'DRIVING',
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK') {
          const km = response.rows[0].elements[0].distance.value / 1000;
          setDistanceKm(km);
        } else {
          alert(`距離取得エラー: ${status}`);
        }
      }
    );
  };

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
      <button
        onClick={handleGetDistance}
        disabled={!origin || !destination}
        style={{ marginTop: '8px', padding: '8px 12px' }}
      >
        距離を取得
      </button>
      {distanceKm != null && (
        <p>距離：{distanceKm.toFixed(1)} km</p>
      )}
    </div>
  );
}
