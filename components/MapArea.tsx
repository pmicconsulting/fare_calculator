import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

type PinType = "origin" | "destination";
type PinInfo = {
  type: PinType;
  marker: google.maps.Marker;
  position: google.maps.LatLngLiteral;
};

type Props = {
  useHighway: boolean;
  onRouteDraw: (
    pins: PinInfo[],
    km: number,
    route: google.maps.DirectionsRoute | null
  ) => void;
};

const MapArea = forwardRef(function MapArea(props: Props, ref) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapIns = useRef<google.maps.Map | null>(null);

  const [pins, setPins] = useState<PinInfo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral | null>(null);

  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current || mapIns.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37, lng: 138 },
      zoom: 6,
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
      setMenuPos({ x: ev.clientX, y: ev.clientY });
      setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setMenuOpen(true);
    });
  }, []);

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
      props.onRouteDraw(pins, 0, null);
      return;
    }

    new window.google.maps.DirectionsService().route(
      {
        origin: originPin.position,
        destination: destPin.position,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: !props.useHighway,
        avoidFerries: true,
      },
      (result, status) => {
        if (status !== "OK" || !result || !result.routes.length) {
          directionsRendererRef.current!.setDirections({ routes: [] });
          props.onRouteDraw(pins, 0, null);
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
        props.onRouteDraw(pins, totalMeters / 1000, route);
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