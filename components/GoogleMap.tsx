/// <reference types="google.maps" />

"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../lib/fareUtils";
import { DetailedSettings, DetailedSettingsState } from "../components/DetailedSettings";

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

// regionごとの表示領域(bounds)
const boundsMap: Record<string, google.maps.LatLngBoundsLiteral> = {
  北海道:   { north: 45.6, south: 41.2, west: 139.0, east: 146.0 },
  東北:     { north: 41.2, south: 37.5, west: 139.5, east: 142.5 },
  関東:     { north: 37.0, south: 35.0, west: 138.5, east: 140.5 },
  北陸信越: { north: 37.0, south: 35.5, west: 136.0, east: 139.0 },
  中部:     { north: 37.5, south: 34.5, west: 136.5, east: 138.5 },
  近畿:     { north: 36.0, south: 33.5, west: 134.5, east: 136.5 },
  中国:     { north: 35.0, south: 32.5, west: 132.0, east: 134.0 },
  四国:     { north: 34.5, south: 32.0, west: 132.0, east: 134.0 },
  九州:     { north: 33.0, south: 30.5, west: 129.5, east: 131.5 },
  沖縄:     { north: 26.8, south: 24.0, west: 122.9, east: 131.3 },
};

// 追加料金計算用定数
const UNIT_WAITING_CHARGE = 500;  // 待機1分あたり
const WORK_CHARGE_FLAT    = 2000; // 作業料金一律

export default function GoogleMap() {
  // 詳細設定の state
  const [detailed, setDetailed] = useState<DetailedSettingsState>({
    waitingTimeMin: 0,
    fuelSurcharge: 0,
    workCharge: false,
  });

  // 詳細設定パネルの開閉
  const [showDetail, setShowDetail] = useState(false);

  // 既存 state…
  const [vehicle, setVehicle] = useState<"small"|"medium"|"large"|"trailer">("small");
  const [region, setRegion] = useState<string>("北海道");
  const [useHighway, setUseHighway] = useState<boolean>(false);
  const [rawKm, setRawKm] = useState<number|null>(null);
  const [roundedKm, setRoundedKm] = useState<number|null>(null);
  const [fare, setFare] = useState<number|null>(null);
  const [originAddr, setOriginAddr] = useState<string>("");
  const [destinationAddr, setDestinationAddr] = useState<string>("");

  // メニュー表示用 state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }|null>(null);
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral|null>(null);

  const originRef = useRef<google.maps.LatLngLiteral|null>(null);
  const destinationRef = useRef<google.maps.LatLngLiteral|null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker|null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map|null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer|null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // 地図初期化
  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37, lng: 138 },
      zoom: 6,
      mapTypeId: "roadmap",
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    const renderer = new window.google.maps.DirectionsRenderer({
      map,
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

  // 地域変更で Bounds fit
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = boundsMap[region];
    if (!bounds) return;
    map.fitBounds(bounds, { top:16, right:16, bottom:16, left:16 });
  }, [region]);

  // マーカー追加
  const addMarker = (pos: google.maps.LatLngLiteral, color: "blue"|"red") => {
    const marker = new window.google.maps.Marker({
      position: pos,
      map: directionsRendererRef.current!.getMap()!,
      icon: {
        url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
        scaledSize: new window.google.maps.Size(32,32),
        anchor: new window.google.maps.Point(16,32),
      },
    });
    markersRef.current.push(marker);
  };

  // マーカー消去
  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    // destinationMarkerRef は消さない
  };

  // 運賃計算＋ルート表示
  const handleCalcFare = () => {
    // 追加料金計算
    const extra =
      detailed.waitingTimeMin * UNIT_WAITING_CHARGE +
      detailed.fuelSurcharge +
      (detailed.workCharge ? WORK_CHARGE_FLAT : 0);

    const origin = originRef.current, dest = destinationRef.current;
    if (!origin || !dest) {
      alert("出発地と目的地をクリックで指定してください");
      return;
    }

    new window.google.maps.DirectionsService().route({
      origin,
      destination: dest,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: !useHighway,
      avoidFerries: true,
    }, async (result, status) => {
      if (status !== "OK" || !result) {
        alert("ルート取得エラー：" + status);
        return;
      }
      const leg = result.routes[0].legs[0];
      const sh = leg.start_address.includes("北海道");
      const eh = leg.end_address.includes("北海道");
      if (sh !== eh) {
        alert("北海道⇔本州フェリー区間は計算できません");
        return;
      }
      const landOnly = result.routes.find(r =>
        !r.legs.some(l =>
          l.steps.some(s => (s.instructions||"").includes("フェリー"))
        )
      );
      if (!landOnly) {
        alert("「高速道路を利用する」にチェックして再計算してください");
        return;
      }

      directionsRendererRef.current!.setDirections({
        ...result,
        routes: [landOnly],
      });

      const km = landOnly.legs[0].distance!.value / 1000;
      setRawKm(km);
      setOriginAddr(leg.start_address.replace(/^日本、,?\s*/,""));
      setDestinationAddr(leg.end_address.replace(/^日本、,?\s*/,""));
      setRoundedKm(roundDistance(km, region));

      const { data, error } = await supabase
        .from("fare_rates")
        .select("fare_yen")
        .eq("region_code", regionMap[region])
        .eq("vehicle_code", vehicleMap[vehicle])
        .eq("upto_km", Math.round(roundDistance(km, region)))
        .maybeSingle();

      if (error || !data) {
        alert("運賃計算できません");
        return;
      }
      // 基準運賃＋追加料金
      setFare(data.fare_yen + extra);
    });
  };

  return (
    <div>
      <button onClick={() => setShowDetail(v => !v)}>
        詳細設定 {showDetail ? "を隠す" : "を表示"}
      </button>
      {showDetail && (
        <DetailedSettings
          value={detailed}
          onChange={setDetailed}
        />
      )}

      <div style={{ marginBottom:12 }}>
        <fieldset>
          <legend>車種</legend>
          {(["small","medium","large","trailer"] as const).map(v=>(
            <label key={v} style={{ marginRight:8 }}>
              <input
                type="radio"
                name="vehicle"
                value={v}
                checked={vehicle===v}
                onChange={()=>setVehicle(v)}
              />
              {{
                small:"小型車(2t)",
                medium:"中型車(4t)",
                large:"大型車(10t)",
                trailer:"トレーラ(20t)",
              }[v]}
            </label>
          ))}
        </fieldset>

        <fieldset style={{ marginTop:8 }}>
          <legend>届出の利用運輸局</legend>
          {(["北海道","東北","関東","北陸信越","中部","近畿","中国","四国","九州","沖縄"] as string[]).map(r=>(
            <label key={r} style={{ marginRight:8 }}>
              <input
                type="radio"
                name="region"
                value={r}
                checked={region===r}
                onChange={()=>setRegion(r)}
              /> {r}
            </label>
          ))}
        </fieldset>

        <label style={{ marginTop:8, display:"block" }}>
          <input
            type="checkbox"
            checked={useHighway}
            onChange={e=>setUseHighway(e.target.checked)}
          /> 高速道路を利用する
        </label>
      </div>

      <div ref={mapRef} style={{ width:"100%", height:"400px", position:"relative" }} />

      {menuOpen && menuPos && clickedLatLng && (
        <div style={{
          position:"absolute",
          top:menuPos.y, left:menuPos.x,
          background:"#fff", boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
          borderRadius:4, zIndex:1000, display:"flex", flexDirection:"column"
        }}>
          <button
            style={{ color:"blue" }}
            onClick={()=>{
              originRef.current = clickedLatLng;
              clearMarkers();
              addMarker(clickedLatLng, "blue");
              setMenuOpen(false);
            }}
          >出発地に設定</button>
          <button
            style={{ color:"red" }}
            onClick={()=>{
              if(!originRef.current){
                alert("先に出発地を設定してください");
                return;
              }
              if(destinationMarkerRef.current){
                destinationMarkerRef.current.setMap(null);
              }
              destinationRef.current = clickedLatLng;
              const m = new window.google.maps.Marker({
                position: clickedLatLng,
                map: directionsRendererRef.current!.getMap()!,
                icon:{
                  url:"http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize:new window.google.maps.Size(32,32),
                  anchor:new window.google.maps.Point(16,32),
                }
              });
              destinationMarkerRef.current = m;
              setMenuOpen(false);
            }}
          >目的地に設定</button>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"center", marginTop:12 }}>
        <button onClick={handleCalcFare} style={{ padding:"8px 12px" }}>
          標準的運賃（概算）を計算する
        </button>
      </div>

      {fare!=null && (
        <div style={{
          border:"1px solid #000", borderRadius:12, padding:16,
          marginTop:24, maxWidth:600, fontSize:14
        }}>
          <h2 style={{ margin:0, fontSize:24 }}>
            基準運賃額
            <span style={{ marginLeft:"10mm", fontWeight:"bold", fontSize:28 }}>
              ¥{fare.toLocaleString()}
            </span>
            <small style={{ marginLeft:8, fontSize:12, color:"#555" }}>
              （高速道路料金及び消費税を含みません）
            </small>
          </h2>
          <dl style={{ margin:"12px 0", lineHeight:1.5, overflow:"hidden" }}>
            <dt style={{ float:"left", clear:"left", width:120 }}>出発地：住所</dt>
            <dd style={{ marginLeft:120 }}>{originAddr}</dd>
            <dt style={{ float:"left", clear:"left", width:120 }}>到着地：住所</dt>
            <dd style={{ marginLeft:120 }}>{destinationAddr}</dd>
            <dt style={{ float:"left", clear:"left", width:120 }}>経路上の距離</dt>
            <dd style={{ marginLeft:120 }}>{rawKm!.toFixed(1)}km</dd>
            <dt style={{ float:"left", clear:"left", width:120 }}>運賃計算距離</dt>
            <dd style={{ marginLeft:120 }}>{roundedKm}km</dd>
            <dt style={{ float:"left", clear:"left", width:120 }}>高速道路利用</dt>
            <dd style={{ marginLeft:120 }}>{useHighway?"利用する":"利用しない"}</dd>
            <dt style={{ float:"left", clear:"left", width:120 }}>車種</dt>
            <dd style={{ marginLeft:120 }}>
              {{ small:"小型車(2t)", medium:"中型車(4t)", large:"大型車(10t)", trailer:"トレーラ(20t)" }[vehicle]}
            </dd>
            <dt style={{ float:"left", clear:"left", width:120 }}>届出：運輸局</dt>
            <dd style={{ marginLeft:120 }}>{region}運輸局</dd>
          </dl>
        </div>
      )}

      <div style={{ marginTop:24, padding:"0 16px", fontSize:12, lineHeight:1.6, color:"#555", maxWidth:600 }}>
        <p>●標準的運賃は、令和６年国土交通省告示第209号（2024/03/22）を踏まえ算出されます。</p>
        <p>●青色ピンは出発地、赤色ピンは目的地です。</p>
        <p>●追加料金（待機・燃料・作業）は詳細設定から加算されます。</p>
      </div>
    </div>
  );
}
