/// <reference types="google.maps" />

"use client";

import React, { useRef, useEffect, useState } from "react";

// ピン色定義
const PIN_ICONS = {
  origin: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  destination: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  waypoint: [
    "http://maps.google.com/mapfiles/ms/icons/green-dot.png", // 経由地1
    "http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png", // 経由地2
    "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png", // 経由地3
    "http://maps.google.com/mapfiles/ms/icons/purple-dot.png", // 経由地4
    "http://maps.google.com/mapfiles/ms/icons/orange-dot.png", // 経由地5
  ]
};

type PinType = "origin" | "destination" | { type: "waypoint", index: number };
type PinInfo = {
  type: PinType;
  marker: google.maps.Marker;
  position: google.maps.LatLngLiteral;
};

type Props = {
  useHighway: boolean;
  onRouteDraw: (pins: PinInfo[], km: number, route: google.maps.DirectionsRoute|null) => void;
};

export default function MapArea(props: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapIns = useRef<google.maps.Map | null>(null);

  const [pins, setPins] = useState<PinInfo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral | null>(null);
  const [showWaypointMenu, setShowWaypointMenu] = useState(false);
  const [waypointMenuOffset, setWaypointMenuOffset] = useState<number>(0);

  // 経路描画用
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current || mapIns.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.68, lng: 139.76 },
      zoom: 7,
      mapTypeId: "roadmap"
    });
    mapIns.current = map;

    const renderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#428dfb", strokeWeight: 4 },
      preserveViewport: true,
    });
    directionsRendererRef.current = renderer;

    // シングルクリックでサブメニュー
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const ev = e.domEvent as MouseEvent;
      // クリック位置の右上（+10, -10 の微調整）
      setMenuPos({ x: ev.clientX + 10, y: ev.clientY - 10 });
      setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setMenuOpen(true);
      setShowWaypointMenu(false);
      setWaypointMenuOffset(0);
    });
  }, []);

  // ピンの追加・置換
  const addOrReplacePin = (type: PinType, pos: google.maps.LatLngLiteral) => {
    setPins(prev => {
      let newPins = prev;
      // origin/destinationは1個まで、waypointはindex毎に1個まで
      if (type === "origin" || type === "destination") {
        newPins = prev.filter(p => p.type !== type);
      } else if (typeof type === "object" && type.type === "waypoint") {
        newPins = prev.filter(
          p => !(typeof p.type === "object" && p.type.type === "waypoint" && p.type.index === type.index)
        );
      }
      // マーカーも削除
      prev.forEach(p => {
        if (
          (type === "origin" && p.type === "origin") ||
          (type === "destination" && p.type === "destination") ||
          (
            typeof type === "object" && type.type === "waypoint" &&
            typeof p.type === "object" && p.type.type === "waypoint" && p.type.index === type.index
          )
        ) {
          p.marker.setMap(null);
        }
      });

      // 新規マーカー追加
      let iconUrl = "";
      if (type === "origin") iconUrl = PIN_ICONS.origin;
      else if (type === "destination") iconUrl = PIN_ICONS.destination;
      else if (typeof type === "object" && type.type === "waypoint") iconUrl = PIN_ICONS.waypoint[type.index];

      const marker = new window.google.maps.Marker({
        position: pos,
        map: mapIns.current!,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        }
      });

      return [...newPins, { type, marker, position: pos }];
    });
    setMenuOpen(false);
    setShowWaypointMenu(false);
    setWaypointMenuOffset(0);
  };

  // 運賃計算ボタンを押した時のみ経路描画
  const drawRoute = () => {
    if (!directionsRendererRef.current) return;
    const originPin = pins.find(p => p.type === "origin");
    const destPin = pins.find(p => p.type === "destination");
    if (!originPin || !destPin) {
      props.onRouteDraw(pins, 0, null);
      return;
    }
    // 経由地
    const waypoints = pins
      .filter(p => typeof p.type === "object" && p.type.type === "waypoint")
      .sort((a, b) => ((a.type as any).index - (b.type as any).index))
      .map(p => ({
        location: p.position,
        stopover: true
      }));

    // Directions APIで経路取得（avoidFerries: true, avoidHighways: !props.useHighway）
    new window.google.maps.DirectionsService().route({
      origin: originPin.position,
      destination: destPin.position,
      waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: !props.useHighway,
      avoidFerries: true,
    }, (result, status) => {
      if (status !== "OK" || !result || !result.routes.length) {
        directionsRendererRef.current!.setDirections({ routes: [] });
        props.onRouteDraw(pins, 0, null);
        return;
      }
      // フェリーを含まないルート
      const landOnly = result.routes.find(r =>
        !r.legs.some(l =>
          l.steps.some(s => (s.instructions||"").includes("フェリー"))
        )
      );
      const route = landOnly || result.routes[0];
      directionsRendererRef.current!.setDirections({
        ...result,
        routes: [route],
      });

      // 距離合計
      const totalMeters = route.legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
      props.onRouteDraw(pins, totalMeters / 1000, route);
    });
  };

  // サブメニューUI
  const menuItems = [
    {
      label: <span style={{ color: "blue", fontWeight: "bold" }}>出発地に設定</span>,
      onClick: () => addOrReplacePin("origin", clickedLatLng!),
      ref: useRef<HTMLButtonElement | null>(null),
    },
    {
      label: <span style={{ color: "red", fontWeight: "bold" }}>目的地に設定</span>,
      onClick: () => addOrReplacePin("destination", clickedLatLng!),
      ref: useRef<HTMLButtonElement | null>(null),
    },
    {
      label: <span style={{ color: "green", fontWeight: "bold" }}>経由地を設定</span>,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        // 経由地サブメニューはこのボタンの直下に出す
        const rect = e.currentTarget.getBoundingClientRect();
        setShowWaypointMenu(true);
        setWaypointMenuOffset(rect.top + rect.height - (menuPos?.y || 0));
      },
      ref: useRef<HTMLButtonElement | null>(null),
    }
  ];

  const renderMenu = () => {
    if (!menuOpen || !menuPos || !clickedLatLng) return null;
    return (
      <div
        style={{
          position: "absolute",
          left: menuPos.x,
          top: menuPos.y,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          borderRadius: 4,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          minWidth: 160,
        }}
      >
        {menuItems.map((item, idx) =>
          <button
            key={idx}
            style={{
              padding: 8,
              border: "none",
              background: "none",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 15
            }}
            onClick={item.onClick}
            ref={item.ref}
          >
            {item.label}
          </button>
        )}
      </div>
    );
  };

  // 経由地サブメニュー
  const renderWaypointMenu = () => {
    if (!showWaypointMenu || !menuPos || !clickedLatLng) return null;
    // 経由地サブメニューは「経由地を設定」ボタンの直下に出す
    return (
      <div
        style={{
          position: "absolute",
          left: menuPos.x,
          top: menuPos.y + waypointMenuOffset,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          borderRadius: 4,
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          minWidth: 160,
        }}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <button
            key={i}
            style={{
              color: "green",
              padding: 8,
              border: "none",
              background: "none",
              fontWeight: "bold",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 15
            }}
            onClick={() => addOrReplacePin({ type: "waypoint", index: i }, clickedLatLng)}
          >経由地{i + 1}に設定</button>
        ))}
      </div>
    );
  };

  // 地図エリア本体
  return (
    <div className="map-area" style={{ position: "relative", width: "100%", height: 420 }}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "420px", background: "#eee", border: "1px solid #bbb" }}
      />
      {renderMenu()}
      {renderWaypointMenu()}
      <div style={{ marginTop: 8, fontSize: 12, textAlign: "right", color: "#888" }}>
        地図上をクリックして出発地・目的地・経由地を設定してください
      </div>
      <div style={{ marginTop: 8 }}>
        <button
          style={{
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            border: "none",
            borderRadius: 6,
            padding: "10px 28px",
            cursor: "pointer"
          }}
          onClick={drawRoute}
        >
          経路を描画
        </button>
      </div>
    </div>
  );
}