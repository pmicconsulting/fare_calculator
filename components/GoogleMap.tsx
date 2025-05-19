/// <reference types="google.maps" />

"use client";

import React, { useRef, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../lib/fareUtils";

declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

// 地域名→region_code マッピング
const regionMap: Record<string, number> = {
  北海道: 1, 東北: 2, 関東: 3, 北陸信越: 4, 中部: 5,
  近畿: 6, 中国: 7, 四国: 8, 九州: 9, 沖縄: 10,
};
// 車種キー→vehicle_code マッピング
const vehicleMap: Record<"small" | "medium" | "large" | "trailer", number> = {
  small: 1, medium: 2, large: 3, trailer: 4,
};

export default function GoogleMap() {
  const [vehicle, setVehicle] = useState<"small" | "medium" | "large" | "trailer">("small");
  const [region, setRegion] = useState<string>("北海道");
  const [useHighway, setUseHighway] = useState<boolean>(false);
  const [rawKm, setRawKm] = useState<number | null>(null);
  const [roundedKm, setRoundedKm] = useState<number | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [originAddr, setOriginAddr] = useState<string>("");
  const [destinationAddr, setDestinationAddr] = useState<string>("");

  const originRef = useRef<google.maps.LatLngLiteral | null>(null);
  const destinationRef = useRef<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // 地図初期化（日本全域を表示）
  useEffect(() => {
    window.initMap = () => {
      if (!mapRef.current || !window.google) return;
      const map = new window.google.maps.Map(mapRef.current, {
        mapTypeId: "roadmap",
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });
      // 日本全域が見えるようにフィット
      const bounds = new window.google.maps.LatLngBounds(
        { lat: 20.0, lng: 122.0 },
        { lat: 45.5, lng: 154.0 }
      );
      map.fitBounds(bounds);

      const renderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#0000FF" },
      });
      directionsRendererRef.current = renderer;

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        if (!originRef.current) {
          originRef.current = pos;
          clearMarkers();
          addMarker(pos, "blue-dot");
        } else if (!destinationRef.current) {
          destinationRef.current = pos;
          addMarker(pos, "green-dot");
        } else {
          originRef.current = pos;
          destinationRef.current = null;
          setRawKm(null);
          setRoundedKm(null);
          setFare(null);
          // 空ルートでリセット
          directionsRendererRef.current!.setDirections(
            { routes: [] } as unknown as google.maps.DirectionsResult
          );
          clearMarkers();
          addMarker(pos, "blue-dot");
        }
      });
    };
    if (window.google && typeof window.initMap === "function") {
      window.initMap();
    }
  }, []);

  // マーカー追加
  const addMarker = (
    pos: google.maps.LatLngLiteral,
    colorKey: "blue-dot" | "green-dot"
  ) => {
    const iconUrl = `http://maps.google.com/mapfiles/ms/icons/${colorKey}.png`;
    const marker = new window.google.maps.Marker({
      position: pos,
      map: directionsRendererRef.current!.getMap()!,
      icon: iconUrl,
    });
    markersRef.current.push(marker);
  };

  // マーカー消去
  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  // 運賃計算＋ルート表示
  const handleCalcFare = () => {
    const origin = originRef.current;
    const destination = destinationRef.current;
    if (!origin || !destination) {
      alert("出発地と到着地をクリックで指定してください");
      return;
    }

    new window.google.maps.DirectionsService().route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: !useHighway,
        avoidFerries: true,
        provideRouteAlternatives: true,
      },
      async (result, status) => {
        if (status !== "OK" || !result) {
          alert("ルート取得エラー：" + status);
          return;
        }

        // 取得した最初のルートの leg を使って住所を取り出し
        const firstLeg = result.routes[0].legs[0];
        const startRaw = firstLeg.start_address;
        const endRaw   = firstLeg.end_address;

        // 「北海道⇔それ以外」の組み合わせなら計算不可
        const isStartHokkaido = startRaw.includes("北海道");
        const isEndHokkaido   = endRaw.includes("北海道");
        if (isStartHokkaido !== isEndHokkaido) {
          alert("フェリー利用区間は計算できません");
          return;
        }

        // 複数ルートからフェリー区間を含まないものを選択
const landOnly = result.routes.find(route =>
  !route.legs.some(leg =>
    leg.steps.some(step =>
      (step.instructions || '').includes('フェリー')
    )
  )
);

        if (!landOnly) {
          alert("フェリー利用区間は計算できません");
          return;
        }

        // 陸路のみのルートを描画
        directionsRendererRef.current!.setDirections({
          ...result,
          routes: [landOnly]
        });
       const leg = landOnly.legs[0];
       // distance プロパティが undefined の可能性を排除
       if (!leg.distance) {
       alert('距離情報が取得できませんでした');
       return;
       }
        // ガード通過後に一度だけ距離を算出
        const km = leg.distance.value / 1000;
        setRawKm(km);
        setOriginAddr(leg.start_address.replace(/^日本、,?\s*/, ""));
        setDestinationAddr(leg.end_address.replace(/^日本、,?\s*/, ""));

        // 距離丸め、運賃照会
        const rkm = roundDistance(km, region);
        setRoundedKm(rkm);

        const regionCode  = regionMap[region];
        const vehicleCode = vehicleMap[vehicle];
        const { data, error } = await supabase
          .from("fare_rates")
          .select("fare_yen")
          .eq("region_code",  regionCode)
          .eq("vehicle_code", vehicleCode)
          .eq("upto_km",      rkm)
          .maybeSingle();

        if (error || !data) {
          alert("運賃データが見つかりません");
          return;
        }
        setFare(data.fare_yen);
      }
    );
  };

  return (
    <div>
      {/* 車種・地域・高速道路利用 */}
      <div style={{ marginBottom: 12 }}>
        <fieldset>
          <legend>車種</legend>
          {(["small","medium","large","trailer"] as const).map(v => (
            <label key={v} style={{ marginRight: 8 }}>
              <input
                type="radio"
                name="vehicle"
                value={v}
                checked={vehicle === v}
                onChange={() => setVehicle(v)}
              />
              {{
                small:   "小型車(2t)",
                medium:  "中型車(4t)",
                large:   "大型車(10t)",
                trailer: "トレーラ(20t)"
              }[v]}
            </label>
          ))}
        </fieldset>
        <fieldset style={{ marginTop: 8 }}>
          <legend>利用運輸局</legend>
          {([
            "北海道","東北","関東","北陸信越",
            "中部","近畿","中国","四国","九州","沖縄"
          ] as string[]).map(r => (
            <label key={r} style={{ marginRight: 8 }}>
              <input
                type="radio"
                name="region"
                value={r}
                checked={region === r}
                onChange={() => setRegion(r)}
              />
              {r}
            </label>
          ))}
        </fieldset>
        <div style={{ marginTop: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={useHighway}
              onChange={e => setUseHighway(e.target.checked)}
            />
            高速道路を利用する
          </label>
        </div>
      </div>

      {/* 地図 */}
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />

      {/* 計算ボタン */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <button onClick={handleCalcFare} style={{ padding: "8px 12px" }}>
          標準的運賃を計算する
        </button>
      </div>

      {/* 結果表示 */}
      {fare != null && (
        <div style={{
          border: "1px solid #000",
          borderRadius: 12,
          padding: 16,
          marginTop: 24,
          maxWidth: 600,
          fontSize: 14
        }}>
          <h2 style={{ margin: 0, fontSize: 24 }}>
            基準運賃額
            <span style={{ marginLeft: "10mm", fontWeight: "bold", fontSize: 28 }}>
              ¥{fare.toLocaleString()}
            </span>
            <small style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
              （高速道路料金及び消費税を含みません）
            </small>
          </h2>
          <dl style={{ margin: "12px 0", lineHeight: 1.5, overflow: "hidden" }}>
            <dt style={{ float: "left", clear: "left", width: 120 }}>出発地</dt>
            <dd style={{ marginLeft: 120 }}>{originAddr}</dd>
            <dt style={{ float: "left", clear: "left", width: 120 }}>到着地</dt>
            <dd style={{ marginLeft: 120 }}>{destinationAddr}</dd>
            <dt style={{ float: "left", clear: "left", width: 120 }}>経路上の距離</dt>
            <dd style={{ marginLeft: 120 }}>{rawKm!.toFixed(1)}km</dd>
            <dt style={{ float: "left", clear: "left", width: 120 }}>運賃計算距離</dt>
            <dd style={{ marginLeft: 120 }}>{roundedKm}km</dd>
            <dt style={{ float: "left", clear: "left", width: 120 }}>高速道路利用</dt>
            <dd style={{ marginLeft: 120 }}>{useHighway ? "利用する" : "利用しない"}</dd>
            <dt style={{ float: "left", clear: "left", width: 120 }}>車種</dt>
            <dd style={{ marginLeft: 120 }}>
              {{
                small:   "小型車(2t)",
                medium:  "中型車(4t)",
                large:   "大型車(10t)",
                trailer: "トレーラ(20t)"
              }[vehicle]}
            </dd>
            <dt style={{ float: "left", clear: "left", width: 120 }}>管轄運輸局</dt>
            <dd style={{ marginLeft: 120 }}>{region}運輸局</dd>
          </dl>
        </div>
      )}

      {/* 注意書き */}
      <div style={{
        marginTop: 24,
        padding: "0 16px",
        fontSize: 12,
        lineHeight: 1.6,
        color: "#555",
        maxWidth: 600
      }}>
        <p>●標準的運賃は、令和６年国土交通省告示第209号（2024/03/22）を踏まえ算出されます。</p>
        <p>●四国－九州ルートの一部では、フェリーによる海上距離を含めて算出される場合がありますので、高速道路を利用するにチェックを入れてください。</p>
        <p>●算出される距離と実際の走行距離に誤差が発生する場合があります。</p>
        <p>●地図データの状況により出発地の住所が取得できない場合は、近隣エリアを起点、終点として算出します。</p>
        <p>●割増、割引、燃料サーチャージ、高速道路利用料金などの詳細計算につきましては、７～８月頃の公開を予定しています。</p>
        <p style={{ marginTop: 12 }}>計算システム公開日　2025年5月19日</p>
      </div>
    </div>
  );
}
