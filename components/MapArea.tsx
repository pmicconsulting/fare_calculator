import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { RegionType } from "../lib/codeMaps";

type PinType = "origin" | "destination";
type PinInfo = {
  type: PinType;
  marker: google.maps.Marker;
  position: google.maps.LatLngLiteral;
};

type Props = {
  useHighway: boolean;
  region?: RegionType; // 追加
  onRouteDraw: (
    pins: PinInfo[],
    km: number,
    route: google.maps.DirectionsRoute | null
  ) => void;
};

const REGION_COORDINATES: Record<RegionType, { lat: number; lng: number; zoom: number }> = {
  北海道: { lat: 43.064615, lng: 141.346807, zoom: 7 },
  東北: { lat: 38.260, lng: 140.880, zoom: 7 },
  関東: { lat: 35.689, lng: 139.692, zoom: 8 },
  北陸信越: { lat: 36.565, lng: 137.658, zoom: 7 },
  中部: { lat: 35.180, lng: 136.906, zoom: 8 },
  近畿: { lat: 34.686, lng: 135.520, zoom: 8 },
  中国: { lat: 34.667, lng: 133.935, zoom: 7 },
  四国: { lat: 33.842, lng: 133.565, zoom: 8 },
  九州: { lat: 32.790, lng: 130.742, zoom: 7 },
  沖縄: { lat: 26.212, lng: 127.681, zoom: 8 },
};

const MapArea = forwardRef(function MapArea(props: Props, ref) {
  const { useHighway, region = "関東", onRouteDraw } = props; // regionを追加、デフォルトは関東
  const mapRef = useRef<HTMLDivElement>(null);
  const mapIns = useRef<google.maps.Map | null>(null);

  const [pins, setPins] = useState<PinInfo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral | null>(null);

  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current || mapIns.current) return;
    
    // 初期表示の地域座標を取得
    const initialRegion = REGION_COORDINATES[region];
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: initialRegion.lat, lng: initialRegion.lng }, // 変更
      zoom: initialRegion.zoom, // 変更
      mapTypeId: "roadmap",
    });
    mapIns.current = map;

    const renderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#0000FF" },
      preserveViewport: true,
    });
    directionsRendererRef.current = renderer;

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const ev = e.domEvent as MouseEvent;
      
      // 地図コンテナの位置を取得
      const mapContainer = mapRef.current;
      if (!mapContainer) return;
      
      const rect = mapContainer.getBoundingClientRect();
      
      // ビューポート座標から地図コンテナに対する相対座標を計算
      const relativeX = ev.clientX - rect.left;
      const relativeY = ev.clientY - rect.top;
      
      // メニューをカーソルの右上に表示（少しずらす）
      setMenuPos({ 
        x: relativeX + 10,  // 右に10pxずらす
        y: relativeY - 30   // 上に30pxずらす（メニューの高さを考慮）
      });
      setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setMenuOpen(true);
    });
  }, []);

  // 地域変更時のズーム処理を追加（新規useEffect）
  useEffect(() => {
    if (!mapIns.current || !region) return;

    const regionConfig = REGION_COORDINATES[region];
    if (regionConfig) {
      // スムーズに移動
      mapIns.current.panTo({ lat: regionConfig.lat, lng: regionConfig.lng });
      setTimeout(() => {
        mapIns.current?.setZoom(regionConfig.zoom);
      }, 300);
    }
  }, [region]);

  const addOrReplacePin = (type: PinType, pos: google.maps.LatLngLiteral) => {
    // 既存ピンを地図から削除
    const oldPin = pins.find((p) => p.type === type);
    if (oldPin) {
      oldPin.marker.setMap(null);
    }
    // 新しいピンを作成
    const iconUrl =
      type === "origin"
        ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        : "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    const marker = new window.google.maps.Marker({
      position: pos,
      map: mapIns.current!,
      icon: {
        url: iconUrl,
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32),
      },
    });
    // pins状態を更新（同じtypeのピンは除外して新しいピンを追加）
    setPins((prev) => [
      ...prev.filter((p) => p.type !== type),
      { type, marker, position: pos },
    ]);
    setMenuOpen(false);
  };

  // 経路描画（親から呼び出し用）
  const drawRoute = () => {
    if (!directionsRendererRef.current) return;
    const originPin = pins.find((p) => p.type === "origin");
    const destPin = pins.find((p) => p.type === "destination");
    if (!originPin || !destPin) {
      directionsRendererRef.current.setDirections({ routes: [] });
      onRouteDraw(pins, 0, null);
      return;
    }

    new window.google.maps.DirectionsService().route(
      {
        origin: originPin.position,
        destination: destPin.position,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: !useHighway,
        avoidFerries: true,
      },
      (result, status) => {
        if (status !== "OK" || !result || !result.routes.length) {
          directionsRendererRef.current!.setDirections({ routes: [] });
          onRouteDraw(pins, 0, null);
          return;
        }
        const landOnly = result.routes.find(
          (r) =>
            !r.legs.some((l) =>
              l.steps.some((s) => (s.instructions || "").includes("フェリー"))
            )
        );
        const route = landOnly || result.routes[0];
        directionsRendererRef.current!.setDirections({
          ...result,
          routes: [route],
        });
        const totalMeters = route.legs.reduce(
          (sum, leg) => sum + (leg.distance?.value || 0),
          0
        );
        onRouteDraw(pins, totalMeters / 1000, route);
      }
    );
  };

  useImperativeHandle(ref, () => ({
    drawRoute,
  }));

  const menuItems = [
    {
      label: (
        <span style={{ color: "blue", fontWeight: "bold" }}>出発地に設定</span>
      ),
      onClick: () => addOrReplacePin("origin", clickedLatLng!),
    },
    {
      label: (
        <span style={{ color: "red", fontWeight: "bold" }}>目的地に設定</span>
      ),
      onClick: () => addOrReplacePin("destination", clickedLatLng!),
    },
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
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            style={{
              padding: 8,
              border: "none",
              background: "none",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 15,
            }}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      className="map-area"
      style={{ position: "relative", width: "100%", height: 420 }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "420px",
          background: "#eee",
          border: "1px solid #bbb",
        }}
      />
      {renderMenu()}
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          textAlign: "right",
          color: "#888",
        }}
      >
        地図上をクリックして出発地・目的地を設定してください
      </div>
    </div>
  );
});

export default MapArea;