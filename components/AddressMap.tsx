import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useGoogleMaps } from "../lib/GoogleMapsLoader";
import { roundDistance } from "../lib/fareUtils";
import type { RegionType } from "../pages/index"; // RegionType をインポート

type Props = {
  originAddr: string;
  destinationAddr: string;
  waypointAddrs?: string[];
  useHighway: boolean;
  region: RegionType; // region を props に追加
  onRouteResult?: (result: {
    originAddr: string;
    destinationAddr: string;
    rawKm: number;
    roundedKm: number;
  } | null, errorMsg?: string) => void;
};

const AddressMap = forwardRef<({ calculateRoute: () => void }), Props>(
  ({ originAddr, destinationAddr, waypointAddrs, useHighway, region, onRouteResult }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const gmapsLoaded = useGoogleMaps();

    const map = useRef<google.maps.Map | null>(null);
    const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
    const directionsService = useRef<google.maps.DirectionsService | null>(null); // DirectionsService も ref で保持
    const geocoder = useRef<google.maps.Geocoder | null>(null); // Geocoder も ref で保持
    const isMounted = useRef(true);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
        if (directionsRenderer.current) {
          directionsRenderer.current.setMap(null);
        }
      };
    }, []);

    useEffect(() => {
      if (!gmapsLoaded || !mapRef.current) return;

      if (!map.current) {
        map.current = new google.maps.Map(mapRef.current, {
          center: { lat: 35.6895, lng: 139.6917 },
          zoom: 7,
          mapTypeControl: false,
          streetViewControl: false,
        });
      }

      if (!directionsRenderer.current) {
        directionsRenderer.current = new google.maps.DirectionsRenderer();
        directionsRenderer.current.setMap(map.current);
      }

      if (!geocoder.current) { // Geocoder の初期化
        geocoder.current = new google.maps.Geocoder();
      }
      if (!directionsService.current) { // DirectionsService の初期化
        directionsService.current = new google.maps.DirectionsService();
      }
      // この useEffect から fetchAndDrawRoute の自動呼び出しを削除
    }, [gmapsLoaded]);

    const geocodeAddress = (address: string): Promise<google.maps.LatLngLiteral> => {
      return new Promise((resolve, reject) => {
        if (!geocoder.current) {
          reject(new Error("Geocoder not initialized"));
          return;
        }
        geocoder.current.geocode({ address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve(results[0].geometry.location.toJSON());
          } else {
            reject(new Error(`「${address}」のジオコーディングに失敗しました: ${status}`));
          }
        });
      });
    };

    const fetchAndDrawRoute = async () => {
      if (!gmapsLoaded || !map.current || !directionsRenderer.current || !directionsService.current || !geocoder.current) {
        const msg = "地図サービスが初期化されていません。";
        setError(msg);
        onRouteResult?.(null, msg);
        setIsLoading(false);
        return;
      }
      if (!originAddr || !destinationAddr) {
        directionsRenderer.current?.setDirections({ routes: [] });
        setError(null); // エラーは onRouteResult で通知するのでここではクリア
        setIsLoading(false);
        onRouteResult?.(null, "出発地と目的地を入力してください。");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const originLoc = await geocodeAddress(originAddr);
        const destinationLoc = await geocodeAddress(destinationAddr);
        const validWaypointAddrs = (waypointAddrs ?? []).filter(addr => addr.trim() !== "");
        const waypointLocs = await Promise.all(validWaypointAddrs.map(addr => geocodeAddress(addr)));

        const request: google.maps.DirectionsRequest = {
          origin: originLoc,
          destination: destinationLoc,
          waypoints: waypointLocs.map(loc => ({ location: loc, stopover: true })),
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: !useHighway,
          avoidFerries: true,
        };

        if (!directionsService.current) { // null チェックを追加
          throw new Error("DirectionsService not initialized");
        }
        directionsService.current.route(request, (result, status) => {
          if (!isMounted.current) return;
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.current?.setDirections(result);
            setError(null);

            const distM = result.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
            const distKm = distM / 1000;
            const roundedKm = roundDistance(distKm, region); // props.region を使用

            onRouteResult?.({
              originAddr: result.routes[0].legs[0].start_address.replace(/^日本、,?\s*/, ""),
              destinationAddr: result.routes[0].legs[result.routes[0].legs.length - 1].end_address.replace(/^日本、,?\s*/, ""),
              rawKm: distKm,
              roundedKm: roundedKm,
            });
          } else {
            setError(`経路の取得に失敗しました: ${status}`);
            directionsRenderer.current?.setDirections({ routes: [] });
            onRouteResult?.(null, `経路の取得に失敗しました: ${status}`);
          }
          setIsLoading(false);
        });
      } catch (e: any) {
        if (!isMounted.current) return;
        setError(e.message || "住所の解析または経路の描画中にエラーが発生しました。");
        directionsRenderer.current?.setDirections({ routes: [] });
        setIsLoading(false);
        if (onRouteResult) {
          onRouteResult(null, e.message || "住所の解析または経路の描画中にエラーが発生しました。");
        }
      }
    };

    // fetchAndDrawRoute(); // 自動実行を削除

    // 親コンポーネントから呼び出せるようにメソッドを公開
    useImperativeHandle(ref, () => ({
      calculateRoute: () => {
        fetchAndDrawRoute();
      }
    }));

    return (
      <div>
        {isLoading && <div style={{ padding: '10px', textAlign: 'center' }}>経路を検索中...</div>}
        {error && <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>エラー: {error}</div>}
        <div
          ref={mapRef}
          style={{ width: "100%", height: 320, border: "1px solid #bbb", marginBottom: 12, background: '#e0e0e0' }}
        >
          {!gmapsLoaded && <div style={{ padding: '10px', textAlign: 'center' }}>地図を読み込み中...</div>}
        </div>
      </div>
    );
  }
);

AddressMap.displayName = "AddressMap"; // displayName を設定

export default AddressMap;