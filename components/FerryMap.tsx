"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import { useGoogleMaps } from "../lib/GoogleMapsLoader";
import { useGeocoding } from "../hooks/useGeocoding";
import { useDirections } from "../hooks/useDirections";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../lib/fareUtils";
import { 
  VehicleType, 
  RegionType, 
  regionMap, 
  vehicleMap 
} from "../lib/codeMaps";

type Props = {
  vehicle: VehicleType;  // ←明確な型定義を使用
  region: RegionType;    // ←明確な型定義を使用
  useHighway: boolean;
  origin: string;
  embarkPort: string;
  disembarkPort: string;
  destination: string;
  onResult: (result: {
    beforeFare: number;
    afterFare: number;
    beforeKm: number;
    afterKm: number;
    beforeRoundedKm: number;
    afterRoundedKm: number;
    beforeOriginAddr: string;
    beforeDestAddr: string;
    afterOriginAddr: string;
    afterDestAddr: string;
  } | null, error?: string) => void;
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

const FerryMap = forwardRef(({ vehicle, region, useHighway, origin, embarkPort, disembarkPort, destination, onResult }: Props, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer[]>([]);
  const gmapsLoaded = useGoogleMaps();
  const geocoding = useGeocoding();
  const directions = useDirections();
  const [loading, setLoading] = useState(false);

  // 地図の初期化
  useEffect(() => {
    if (!mapRef.current || !gmapsLoaded) return;

    if (!mapInstance.current) {
      const initialRegion = REGION_COORDINATES[region];
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: initialRegion.lat, lng: initialRegion.lng },
        zoom: initialRegion.zoom,
        mapTypeControl: false,
        streetViewControl: false,
      });
    }

    // DirectionsRendererの初期化（2つの経路用）
    if (directionsRenderer.current.length === 0) {
      directionsRenderer.current = [
        new google.maps.DirectionsRenderer({
          map: mapInstance.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#0000FF",
            strokeWeight: 4,
          },
          markerOptions: {
            // 出発地のマーカーカスタマイズ
            origin: {
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // 緑色のピン
                scaledSize: new google.maps.Size(40, 40), // サイズ調整
              },
              label: {
                text: "出発",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
              }
            },
            // 目的地のマーカーカスタマイズ
            destination: {
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // 赤色のピン
                scaledSize: new google.maps.Size(40, 40), // サイズ調整
              },
              label: {
                text: "乗船",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
              }
            }
          }
        }),
        new google.maps.DirectionsRenderer({
          map: mapInstance.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#0000FF",
            strokeWeight: 4,
          },
          markerOptions: {
            // 出発地のマーカーカスタマイズ
            origin: {
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // 青色のピン
                scaledSize: new google.maps.Size(40, 40), // サイズ調整
              },
              label: {
                text: "下船",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
              }
            },
            // 目的地のマーカーカスタマイズ
            destination: {
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // 紫色のピン
                scaledSize: new google.maps.Size(40, 40), // サイズ調整
              },
              label: {
                text: "到着",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
              }
            }
          }
        })
      ];
    }
  }, [gmapsLoaded, region]);

  // 地域変更時のズーム処理
  useEffect(() => {
    if (!mapInstance.current || !region) return;
    
    const regionConfig = REGION_COORDINATES[region];
    if (regionConfig) {
      mapInstance.current.panTo({ lat: regionConfig.lat, lng: regionConfig.lng });
      setTimeout(() => {
        mapInstance.current?.setZoom(regionConfig.zoom);
      }, 300);
    }
  }, [region]);

  const fetchFare = async (roundedKm: number, region: string, vehicle: string): Promise<number> => {
    // regionとvehicleを明示的に型変換
    const regionCode = regionMap[region as RegionType];
    const vehicleCode = vehicleMap[vehicle as VehicleType];

    try {
      const { data, error } = await supabase
        .from("fare_rates")
        .select("fare_yen")
        .eq("region_code", regionCode)
        .eq("vehicle_code", vehicleCode)
        .eq("upto_km", roundedKm)
        .maybeSingle();

      if (error) {
        console.error("運賃取得エラー:", error);
        return 0;
      }

      return data?.fare_yen || 0;
    } catch (error) {
      console.error("運賃取得エラー:", error);
      return 0;
    }
  };

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const addresses = [origin, embarkPort, disembarkPort, destination];

      const results = await geocoding.multiGeocode(addresses);

      if (results.some(res => !res)) {
        throw new Error(`住所の取得に失敗しました。詳細結果: ${JSON.stringify(results)}`);
      }

      const [originLatLng, embarkLatLng, disembarkLatLng, destinationLatLng] = results;

      const [beforeRoute, afterRoute] = await Promise.all([
        directions.getRoute({ origin: originLatLng, destination: embarkLatLng, avoidHighways: !useHighway }),
        directions.getRoute({ origin: disembarkLatLng, destination: destinationLatLng, avoidHighways: !useHighway }),
      ]);

      // ★★ ここで経路を地図に描画する ★★
      if (directionsRenderer.current.length >= 2 && beforeRoute && afterRoute) {
        directionsRenderer.current[0].setDirections(beforeRoute);
        directionsRenderer.current[1].setDirections(afterRoute);
        
        // 2つの経路を含む範囲でズーム調整
        const bounds = new google.maps.LatLngBounds();
        
        // マーカー位置を境界に追加（より安定したビューポート設定のため）
        bounds.extend(originLatLng);
        bounds.extend(embarkLatLng);
        bounds.extend(disembarkLatLng);
        bounds.extend(destinationLatLng);
        
        // 経路のすべての点を追加
        if (beforeRoute.routes.length > 0) {
          const path = beforeRoute.routes[0].overview_path;
          path.forEach(point => bounds.extend(point));
        }
        
        if (afterRoute.routes.length > 0) {
          const path = afterRoute.routes[0].overview_path;
          path.forEach(point => bounds.extend(point));
        }
        
        // 地図を2つの経路全体に合わせてフィット（パディングを増加）
        setTimeout(() => {
          if (mapInstance.current) {
            mapInstance.current.fitBounds(bounds, { 
              top: 80, 
              right: 80, 
              bottom: 80, 
              left: 80 
            });
            
            // 必要に応じてズームレベルを調整（縮尺が近すぎる場合）
            const currentZoom = mapInstance.current.getZoom();
            if (currentZoom && currentZoom > 12) {
              mapInstance.current.setZoom(12);
            }
          }
        }, 300); // タイミングを少し遅らせる
      }

      const calculateDist = (route: google.maps.DirectionsResult) =>
        route.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) / 1000;

      const beforeKm = calculateDist(beforeRoute);
      const afterKm = calculateDist(afterRoute);

      const beforeRoundedKm = roundDistance(beforeKm, region);
      const afterRoundedKm = roundDistance(afterKm, region);

      const [beforeFare, afterFare] = await Promise.all([
        fetchFare(beforeRoundedKm, region, vehicle),
        fetchFare(afterRoundedKm, region, vehicle),
      ]);

      onResult({
        beforeFare,
        afterFare,
        beforeKm,
        afterKm,
        beforeRoundedKm,
        afterRoundedKm,
        beforeOriginAddr: addresses[0],
        beforeDestAddr: addresses[1],
        afterOriginAddr: addresses[2],
        afterDestAddr: addresses[3],
      });

    } catch (e: any) {
      console.error("calculateRouteエラー:", e);
      onResult(null, e.message || "不明なエラーが発生しました。");
      // ★★ エラー時は地図から経路を消す ★★
      if (directionsRenderer.current.length >= 2) {
        directionsRenderer.current.forEach(renderer => {
          renderer.setDirections({ routes: [] });
        });
      }
    }
    setLoading(false);
  };

  const fetchBeforeRoute = useCallback(async () => {
    if (!gmapsLoaded || !origin || !destination) return null;
    
    try {
      const response = await directions.getRoute({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidFerries: true,
        avoidHighways: !useHighway,
      });
      
      return response;
    } catch (error) {
      console.error("Route fetch error:", error);
      return null;
    }
  }, [gmapsLoaded, directions, origin, destination, useHighway]);

  useImperativeHandle(ref, () => ({ calculateRoute }));

  return (
    <div style={{ position: "relative", height: "400px", width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      {loading && <div style={{ position: "absolute", top: 10, left: 10, background: "#fff", padding: 10 }}>経路を取得中...</div>}
    </div>
  );
});

FerryMap.displayName = "FerryMap";

export default FerryMap;
