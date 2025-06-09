"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import { useGoogleMaps } from "../lib/GoogleMapsLoader";
import { useGeocoding } from "../hooks/useGeocoding";
import { useDirections } from "../hooks/useDirections";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../lib/fareUtils";
import { regionMap, vehicleMap, RegionType, VehicleType } from "../lib/codeMaps";

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

const FerryMap = forwardRef(({ vehicle, region, useHighway, origin, embarkPort, disembarkPort, destination, onResult }: Props, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer[]>([]);
  const gmapsLoaded = useGoogleMaps();
  const geocoding = useGeocoding();
  const directions = useDirections();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gmapsLoaded || !mapRef.current) return;

    map.current = new google.maps.Map(mapRef.current, {
      center: { lat: 35.6895, lng: 139.6917 },
      zoom: 6,
    });

    directionsRenderer.current = [
      new google.maps.DirectionsRenderer({ map: map.current, suppressMarkers: false }),
      new google.maps.DirectionsRenderer({ map: map.current, suppressMarkers: false }),
    ];
  }, [gmapsLoaded]);

  const fetchFare = async (roundedKm: number, region: string, vehicle: string): Promise<number> => {
    // regionとvehicleを明示的に型変換
    const regionCode = regionMap[region as RegionType];
    const vehicleCode = vehicleMap[vehicle as VehicleType];

    console.log("Supabaseに渡す最終的な値:", {
      roundedKm,
      regionCode,
      vehicleCode,
    });

    // regionCodeとvehicleCodeが存在しない場合を追加でチェック
    if (!regionCode || !vehicleCode) {
      throw new Error(`無効な地域または車種の指定です。region:${region}, vehicle:${vehicle}`);
    }

    const { data, error } = await supabase
      .from("fare_rates")
      .select("fare_yen")
      .eq("region_code", regionCode)
      .eq("vehicle_code", vehicleCode)
      .eq("upto_km", Number(roundedKm))
      .maybeSingle();

    if (error) {
      console.error("Supabaseエラー:", error);
      throw new Error("運賃データ取得エラー");
    }

    if (!data) {
      console.warn("運賃データがありません:", roundedKm);
      throw new Error("運賃データが見つかりませんでした");
    }

    console.log("取得した運賃データ:", data.fare_yen);
    return data.fare_yen;
  };

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const addresses = [origin, embarkPort, disembarkPort, destination];
      console.log("ジオコーディングする住所:", addresses);

      const results = await geocoding.multiGeocode(addresses);
      console.log("ジオコーディング結果（results）:", results);

      if (results.some(res => !res)) {
        throw new Error(`住所の取得に失敗しました。詳細結果: ${JSON.stringify(results)}`);
      }

      const [originLatLng, embarkLatLng, disembarkLatLng, destinationLatLng] = results;

      const [beforeRoute, afterRoute] = await Promise.all([
        directions.getRoute({ origin: originLatLng, destination: embarkLatLng, avoidHighways: !useHighway }),
        directions.getRoute({ origin: disembarkLatLng, destination: destinationLatLng, avoidHighways: !useHighway }),
      ]);

      // ★★ ここで経路を地図に描画する ★★
      if (
        directionsRenderer.current &&
        directionsRenderer.current[0] &&
        directionsRenderer.current[1]
      ) {
        directionsRenderer.current[0].setDirections(beforeRoute);
        directionsRenderer.current[1].setDirections(afterRoute);
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
        beforeOriginAddr: beforeRoute.routes[0].legs[0].start_address.replace(/^日本、\s*/, ''),
        beforeDestAddr: beforeRoute.routes[0].legs[0].end_address.replace(/^日本、\s*/, ''),
        afterOriginAddr: afterRoute.routes[0].legs[0].start_address.replace(/^日本、\s*/, ''),
        afterDestAddr: afterRoute.routes[0].legs[0].end_address.replace(/^日本、\s*/, ''),
      });
    } catch (e: any) {
      console.error("calculateRouteエラー:", e);
      onResult(null, e.message);
      // ★★ エラー時は地図から経路を消す ★★
      if (directionsRenderer.current) {
        directionsRenderer.current.forEach(renderer => renderer.setDirections({ routes: [] }));
      }
    }
    setLoading(false);
  };

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
