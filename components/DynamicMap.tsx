import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

const DynamicMap = forwardRef(function DynamicMap(props: any, ref) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsRenderer2 = useRef<google.maps.DirectionsRenderer | null>(null);

  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral | null>(null);

  // 地図の初期化とクリックイベントの登録
  useEffect(() => {
    // Google Maps APIが読み込まれているか確認
    if (!window.google || !window.google.maps) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          initializeMap();
        }
      }, 100);
      return;
    }
    
    initializeMap();
    
    function initializeMap() {
      if (!mapRef.current || mapInstance.current) {
        return;
      }
      
      try {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 36, lng: 137 },
          zoom: 6,
        });

        mapInstance.current.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          
          const ev = e.domEvent as MouseEvent;
          const mapContainer = mapRef.current;
          if (!mapContainer) return;
          
          const rect = mapContainer.getBoundingClientRect();
          const relativeX = ev.clientX - rect.left;
          const relativeY = ev.clientY - rect.top;
          
          setMenuPos({ 
            x: relativeX + 10,
            y: relativeY - 30
          });
          setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          setMenuOpen(true);
        });
      } catch (error) {
        // エラーログを削除
      }
    }
  }, []); // 空の依存配列で、初回のみ実行

  // props関連の処理を別のuseEffectに分離
  useEffect(() => {
    if (!mapInstance.current) return;

    // 既存のマーカーをクリア（必要に応じて）
    props.geocodes?.forEach((g: any, i: number) => {
      new window.google.maps.Marker({
        position: g,
        map: mapInstance.current!,
        icon: i === 0 ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          : (i === props.geocodes.length - 1 ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png")
      });
    });

    // directionsのpropsは無視する（drawRouteメソッドで処理するため）
    // 以下のコードをコメントアウトまたは削除
    /*
    if (props.directions) {
      if (!directionsRenderer.current) {
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({ suppressMarkers: true });
        directionsRenderer.current.setMap(mapInstance.current);
      }
      directionsRenderer.current.setDirections(props.directions);
    }
    */

    if (props.ferry) {
      if (!directionsRenderer.current) {
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({ 
          suppressMarkers: true, 
          polylineOptions: { 
            strokeColor: "#285",
            strokeOpacity: 1.0,
            strokeWeight: 4
          } 
        });
        directionsRenderer.current.setMap(mapInstance.current);
      }
      if (!directionsRenderer2.current) {
        directionsRenderer2.current = new window.google.maps.DirectionsRenderer({ 
          suppressMarkers: true, 
          polylineOptions: { 
            strokeColor: "#e38",
            strokeOpacity: 1.0,
            strokeWeight: 4
          } 
        });
        directionsRenderer2.current.setMap(mapInstance.current);
      }
      if (props.dir1) directionsRenderer.current.setDirections(props.dir1);
      if (props.dir2) directionsRenderer2.current.setDirections(props.dir2);
    }
  }, [props.geocodes, props.ferry, props.dir1, props.dir2]); // props.directionsを依存配列から削除

  const handleMenuSelect = (sel: string) => {
    setMenuOpen(false);
    if (sel === "origin" && clickedLatLng) {
      originMarkerRef.current?.setMap(null);
      originMarkerRef.current = new window.google.maps.Marker({
        position: clickedLatLng,
        map: mapInstance.current!,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      });
    }
    if (sel === "destination" && clickedLatLng) {
      destinationMarkerRef.current?.setMap(null);
      destinationMarkerRef.current = new window.google.maps.Marker({
        position: clickedLatLng,
        map: mapInstance.current!,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      });
    }
  };

  const renderMenu = () => {
    if (!menuOpen || !menuPos || !clickedLatLng) return null;
    return (
      <div
        style={{
          position: "absolute",
          left: `${menuPos.x}px`,
          top: `${menuPos.y}px`,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          borderRadius: 4,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          minWidth: 160,
          border: "1px solid #ccc",
        }}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <button
          style={{ 
            padding: "8px 16px", 
            border: "none", 
            background: "none", 
            cursor: "pointer", 
            textAlign: "left",
            hover: { background: "#f5f5f5" }
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          onClick={() => handleMenuSelect("origin")}
        >
          出発地に設定
        </button>
        <button
          style={{ 
            padding: "8px 16px", 
            border: "none", 
            background: "none", 
            cursor: "pointer", 
            textAlign: "left" 
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          onClick={() => handleMenuSelect("destination")}
        >
          目的地に設定
        </button>
      </div>
    );
  };

  // refで公開するメソッド
  useImperativeHandle(ref, () => ({
    drawRoute: () => {
      // 設定されたマーカーから経路を計算
      if (!originMarkerRef.current || !destinationMarkerRef.current) {
        props.onRouteDraw?.([], 0, null);
        return;
      }
      
      const origin = originMarkerRef.current.getPosition();
      const destination = destinationMarkerRef.current.getPosition();
      
      if (!origin || !destination) {
        return;
      }
      
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          avoidHighways: !props.useHighway,
          avoidFerries: true,
        },
        (result, status) => {
          if (status === "OK" && result) {
            const route = result.routes[0];
            const totalMeters = route.legs.reduce(
              (sum, leg) => sum + (leg.distance?.value || 0),
              0
            );
            
            // 既存のdirectionsRendererをクリア
            if (directionsRenderer.current) {
              directionsRenderer.current.setMap(null);
            }
            
            // 新しいdirectionsRendererを作成（実線で表示）
            directionsRenderer.current = new window.google.maps.DirectionsRenderer({
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#4285F4",  // 青色
                strokeOpacity: 1.0,      // 不透明度100%
                strokeWeight: 4,         // 線の太さ
              }
            });
            directionsRenderer.current.setMap(mapInstance.current);
            directionsRenderer.current.setDirections(result);
            
            // 地図を経路に合わせてズーム
            if (mapInstance.current && route.bounds) {
              mapInstance.current.fitBounds(route.bounds);
              // 少し余白を持たせる場合
              const listener = mapInstance.current.addListener('bounds_changed', () => {
                const currentZoom = mapInstance.current!.getZoom();
                if (currentZoom && currentZoom > 15) {
                  mapInstance.current!.setZoom(15); // 最大ズームレベルを制限
                }
                window.google.maps.event.removeListener(listener);
              });
            }
            
            // マーカー情報を返す（position は既にオブジェクト形式）
            const pins = [
              {
                type: "origin" as const,
                marker: originMarkerRef.current!,
                position: { lat: origin.lat(), lng: origin.lng() }
              },
              {
                type: "destination" as const,
                marker: destinationMarkerRef.current!,
                position: { lat: destination.lat(), lng: destination.lng() }
              }
            ];
            
            props.onRouteDraw?.(pins, totalMeters / 1000, route);
          } else {
            props.onRouteDraw?.([], 0, null);
          }
        }
      );
    }
  }));

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div 
        ref={mapRef} 
        className="map-container" 
        style={{ width: "100%", height: "400px", marginTop: 20 }}
      />
      {renderMenu()}
    </div>
  );
});

export default DynamicMap;