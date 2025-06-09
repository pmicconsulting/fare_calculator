import React, { useRef, useState } from "react";
import MenuOverlay from "./MenuOverlay";

type GoogleMapProps = {
  waypoints: (google.maps.LatLngLiteral | null)[];
  isDuplicatePin: (latlng: google.maps.LatLngLiteral) => boolean;
  onMenuSelect: (type: string, idx?: number) => void;
};

const GoogleMap: React.FC<GoogleMapProps> = ({ waypoints, isDuplicatePin, onMenuSelect }) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);

  // Google Maps API の地図上クリックイベントから呼ばれる
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    // native dom eventから座標取得
    const domEvent = e.domEvent as MouseEvent;
    if (domEvent) {
      setMenuPos({
        x: domEvent.clientX,
        y: domEvent.clientY,
      });
      setShowMenu(true);
    }
  };

  // サブメニューで何か選択されたら閉じる
  const handleMenuSelect = (type: string, idx?: number) => {
    onMenuSelect(type, idx);
    setShowMenu(false);
  };

  // 地図本体の描画やGoogle Maps API初期化は省略
  // ここでは地図エリアをクリック→MenuOverlay表示の流れを例示
  return (
    <div
      ref={mapRef}
      className="map-container"
      style={{ width: "900px", height: "600px", position: "relative" }}
    >
      {/* ここにGoogle Mapsを埋め込む */}
      <div
        style={{ width: "100%", height: "100%" }}
        onClick={(e) => {
          // Google Maps APIの場合はAPIのクリックイベントを利用してください
          // ここでは通常のReactイベントとして例示
          setMenuPos({
            x: (e as React.MouseEvent).clientX,
            y: (e as React.MouseEvent).clientY,
          });
          setShowMenu(true);
        }}
      >
        地図をここに表示
      </div>

      {showMenu && (
        <MenuOverlay
          pos={menuPos}
          onSelect={handleMenuSelect}
          waypoints={waypoints}
          isDuplicatePin={isDuplicatePin}
        />
      )}
    </div>
  );
};

export default GoogleMap;