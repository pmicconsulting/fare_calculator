import React, { useRef, useEffect, useState } from "react";
import MapContainer from "./MapContainer";

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

interface Props {
  onPinsChange?: (pins: PinInfo[]) => void;
}

const MapArea: React.FC<Props> = ({ onPinsChange }) => {
  const [pins, setPins] = useState<PinInfo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral | null>(null);
  const [showWaypointMenu, setShowWaypointMenu] = useState(false);

  const mapIns = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!window.google || !(window as any).map) return;
    mapIns.current = (window as any).map as google.maps.Map;
  }, []);

  // 地図クリック時の処理
  const handleMapClick = (e: google.maps.MapMouseEvent, relative: { x: number; y: number }) => {
    if (!e.latLng) return;
    setMenuPos({ x: relative.x + 10, y: relative.y + 10 });
    setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setMenuOpen(true);
    setShowWaypointMenu(false);
  };

  // ピン追加・置換
  const addOrReplacePin = (type: PinType, pos: google.maps.LatLngLiteral) => {
    if (!mapIns.current || !pos) return; // マップが取得できない場合は何もしない

    setPins((prev) => {
      let newPins = prev;
      // origin/destinationは1個まで、waypointはindex毎に1個まで
      if (type === "origin" || type === "destination") {
        newPins = prev.filter((p) => p.type !== type);
      } else if (typeof type === "object" && type.type === "waypoint") {
        newPins = prev.filter(
          (p) =>
            !(typeof p.type === "object" && p.type.type === "waypoint" && p.type.index === type.index)
        );
      }
      prev.forEach((p) => {
        if (
          (type === "origin" && p.type === "origin") ||
          (type === "destination" && p.type === "destination") ||
          (typeof type === "object" && type.type === "waypoint" &&
            typeof p.type === "object" && p.type.type === "waypoint" && p.type.index === type.index)
        ) {
          p.marker.setMap(null);
        }
      });

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
    if (onPinsChange) setTimeout(() => onPinsChange(pins), 0);
  };

  // サブメニュー
  const renderMenu = () =>
    menuOpen && menuPos && clickedLatLng ? (
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
          minWidth: 170,
        }}
      >
        <button
          style={{ color: "blue", fontWeight: "bold", padding: 8, border: "none", background: "none", textAlign: "left", fontSize: 15, cursor: "pointer" }}
          onClick={() => addOrReplacePin("origin", clickedLatLng!)}
        >出発地に設定</button>
        <button
          style={{ color: "red", fontWeight: "bold", padding: 8, border: "none", background: "none", textAlign: "left", fontSize: 15, cursor: "pointer" }}
          onClick={() => addOrReplacePin("destination", clickedLatLng!)}
        >目的地に設定</button>
        <button
          style={{ color: "#ffaa00", fontWeight: "bold", padding: 8, border: "none", background: "none", textAlign: "left", fontSize: 15, cursor: "pointer" }}
          onClick={() => setShowWaypointMenu(true)}
        >経由地を設定</button>
      </div>
    ) : null;

  // 経由地サブメニュー（完全に重ねて表示。overflowやz-index対策済み）
  const renderWaypointMenu = () =>
    showWaypointMenu && menuPos && clickedLatLng ? (
      <div
        style={{
          position: "absolute",
          left: menuPos.x + 10,
          top: menuPos.y + 36,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          borderRadius: 4,
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          minWidth: 170,
        }}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <button
            key={i}
            style={{
              color: "#ffaa00",
              padding: "8px 10px",
              border: "none",
              background: "none",
              fontWeight: "bold",
              textAlign: "left",
              fontSize: 15,
              cursor: "pointer"
            }}
            onClick={() => addOrReplacePin({ type: "waypoint", index: i }, clickedLatLng)}
          >経由地{i + 1}に設定</button>
        ))}
      </div>
    ) : null;

  return (
    <div style={{ position: "relative", width: "100%", height: 420 }}>
      <MapContainer onMapClick={handleMapClick} />
      {renderMenu()}
      {renderWaypointMenu()}
      <div style={{ marginTop: 8, fontSize: 12, textAlign: "right", color: "#888" }}>
        地図上をクリックして出発地・目的地・経由地を設定してください
      </div>
    </div>
  );
};

export default MapArea;