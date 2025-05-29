"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { boundsMap } from "../utils/mapUtils";
import { useDirections, RouteOptions } from "../hooks/useDirections";
import { MenuOverlay } from "./MenuOverlay";
import { DetailedSettings, DetailedSettingsState } from "./DetailedSettings";
import { MapContainer } from "./MapContainer";
import { roundDistance } from "../lib/fareUtils";
import { supabase } from "../lib/supabaseClient";
import { regionMap, vehicleMap } from "../utils/constants";

const orange = "#ffa500";
const buttonWide = {
  height: 50,
  flex: 1,
  fontSize: "1.06em",
  fontWeight: "bold",
  borderRadius: 8,
  minWidth: 0,
  border: "2.5px solid #aaa",
  margin: 0,
  outline: "none",
  transition: "background 0.2s, color 0.2s, border 0.2s"
};

const vehicleList = [
  { value: "small", label: "小型車(2tクラス)" },
  { value: "medium", label: "中型車(4tクラス)" },
  { value: "large", label: "大型車(10tクラス)" },
  { value: "trailer", label: "トレーラ(20tクラス)" },
];
const regionList = [
  "北海道", "東北", "関東", "北陸信越", "中部", "近畿", "中国", "四国", "九州", "沖縄"
];

export default function GoogleMap() {
  // デフォルト設定
  const [vehicle, setVehicle] = useState<"small" | "medium" | "large" | "trailer">("large");
  const [region, setRegion] = useState<string>("関東");
  const [useHighway, setUseHighway] = useState(true);
  const [showDetails, setShowDetails] = useState(false); // 適用しない
  const [distanceMode, setDistanceMode] = useState<"map"|"address"|"manual">("map");
  const [addressTab, setAddressTab] = useState<"normal"|"ferry">("normal");

  // 地図関連
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [clickedLatLng, setClickedLatLng] = useState<google.maps.LatLngLiteral | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);

  // 住所モード入力
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([""]);
  const [ferryPorts, setFerryPorts] = useState<{from:string,to:string}>({from:"",to:""});

  // 手入力距離
  const [manualDistance, setManualDistance] = useState("");
  const [manualConfirmed, setManualConfirmed] = useState(false);

  // 詳細設定
  const [detailed, setDetailed] = useState<DetailedSettingsState>({
    waitingApply: false, waitingHours: 0, waitingMinutes: 0,
    arrivalWaitingApply: false, arrivalWaitingHours: 0, arrivalWaitingMinutes: 0,
    fuelSurchargeApply: false, fuelSurchargeAmount: 0,
    transportFeeApply: false, transportFeeAmount: 0,
    specialVehicleApply: false, specialVehicleType: "", specialVehicleRate: 0,
    holidayApply: false, holidayRate: 0,
    lateNightApply: false, lateNightRate: 0,
    taperingApply: false, taperingRate: 0,
    longTermContractApply: false, longTermContractRate: 0,
    roundTripApply: false, roundTripRate: 0,
  });

  // 仮：距離値
  const [mapKm, setMapKm] = useState<number | null>(null);
  const [fare, setFare] = useState<number | null>(null);

  // 地域切替で地図リセット
  useEffect(() => {
    const map = window.map;
    if (map) {
      map.fitBounds(boundsMap[region], { top: 16, right: 16, bottom: 16, left: 16 });
    }
  }, [region]);

  // 地図クリックでメニュー
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const relX = e.domEvent.clientX - rect.left;
    const relY = e.domEvent.clientY - rect.top;
    setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setMenuPos({ x: relX, y: relY - 40 });
    setMenuOpen(true);
  }, []);

  // メニュー選択
  const handleMenuSelect = (sel: string) => {
    setMenuOpen(false);
    if (sel === "origin" && clickedLatLng) {
      originMarkerRef.current?.setMap(null);
      originMarkerRef.current = new window.google.maps.Marker({
        position: clickedLatLng,
        map: window.map!,
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
        map: window.map!,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      });
    }
  };

  // 仮: 距離計算
  const bothSet = !!originMarkerRef.current && !!destinationMarkerRef.current;
  const handleCalcMapDistance = async () => {
    setMapKm(bothSet ? 120 : null);
  };

  // 仮: 運賃計算
  const handleCalcFare = async () => {
    let dist = null;
    if (distanceMode === "map" && mapKm != null) dist = mapKm;
    if (distanceMode === "manual" && manualConfirmed) dist = Number(manualDistance);
    // TODO: addressモードは住所→距離APIを使う
    if (!dist) {
      alert("距離が未設定です");
      return;
    }
    const rkm = roundDistance(dist, region);
    setFare(rkm * 100 + (showDetails ? 3000 : 0));
  };

  // 経由地追加
  const handleAddWaypoint = () => {
    setWaypoints([...waypoints, ""]);
  };
  const handleWaypointChange = (idx:number, v:string) => {
    setWaypoints(waypoints.map((w,i)=>i===idx?v:w));
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 8px" }}>
      {/* 上部は省略: 車種・地域・高速・割増等ボタン */}

      {/* --- 距離方式選択 --- */}
      <div style={{display: "flex", justifyContent: "center", gap: 8, margin: "24px 0 12px"}}>
        {[
          {mode: "map", label: "地図から運行距離を計算"},
          {mode: "address", label: "住所から運行距離を計算"},
          {mode: "manual", label: "運行距離を把握している"}
        ].map(opt => (
          <button
            key={opt.mode}
            onClick={() => setDistanceMode(opt.mode as any)}
            style={{
              minWidth: 180, height: 38,
              border: "2.5px solid #1a78f7",
              background: distanceMode === opt.mode ? "#1a78f7" : "#fff",
              color: distanceMode === opt.mode ? "#fff" : "#1a78f7",
              fontWeight: "bold", fontSize: 15,
              borderRadius: 6, margin: "0 6px"
            }}
          >{opt.label}</button>
        ))}
      </div>

      {/* --- 距離方式ごとのフォーム --- */}
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", margin: "16px 0 0"}}>
        {/* --- 地図から計算 --- */}
        {distanceMode === "map" && (
          <div ref={mapContainerRef} style={{width: "98%", margin:"0 auto"}}>
            <MapContainer onClick={handleMapClick} />
            {menuOpen && (
              <MenuOverlay
                mode="main"
                x={menuPos.x}
                y={menuPos.y}
                onSelect={handleMenuSelect}
              />
            )}
            <div style={{ marginTop: 8 }}>
              <span>地図で選択した距離: </span>
              <b>{mapKm != null ? `${mapKm} km` : "未設定"}</b>
              <button style={{ marginLeft: 18, padding: "2px 18px" }} onClick={handleCalcMapDistance}>
                距離を計算する
              </button>
            </div>
          </div>
        )}

        {/* --- 住所で計算 --- */}
        {distanceMode === "address" && (
          <div style={{width: 460, border: "1.5px dotted #38f", borderRadius: 10, padding: 24, margin: "0 auto"}}>
            <div style={{display: "flex", justifyContent: "center", gap: 4, marginBottom: 8}}>
              <button onClick={()=>setAddressTab("normal")}
                style={{background: addressTab==="normal"?"#1a78f7":"#fff", color: addressTab==="normal"?"#fff":"#1a78f7", border: "2px solid #1a78f7", fontWeight: "bold", borderRadius: 4, width: 150}}>
                フェリー区間がない
              </button>
              <button onClick={()=>setAddressTab("ferry")}
                style={{background: addressTab==="ferry"?"#1a78f7":"#fff", color: addressTab==="ferry"?"#fff":"#1a78f7", border: "2px solid #1a78f7", fontWeight: "bold", borderRadius: 4, width: 150}}>
                フェリー区間がある
              </button>
            </div>
            {/* 通常 or フェリーの入力フォーム */}
            {addressTab==="normal" ? (
              <>
                <div style={{display: "flex", alignItems: "center", marginBottom: 12}}>
                  <span style={{width: 80, background: "#1a78f7", color: "#fff", borderRadius: 4, textAlign: "center", padding: "6px 0", fontWeight: "bold", fontSize: 16}}>出発地</span>
                  <input value={origin} onChange={e=>setOrigin(e.target.value)} style={{marginLeft: 12, width: 280, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}} placeholder="住所を入力します" />
                </div>
                {waypoints.map((w, idx) => (
                  <div key={idx} style={{display: "flex", alignItems: "center", marginBottom: 12}}>
                    <span style={{width: 80, background: "#1a78f7", color: "#fff", borderRadius: 4, textAlign: "center", padding: "6px 0", fontWeight: "bold", fontSize: 16}}>経由地</span>
                    <input value={w} onChange={e=>handleWaypointChange(idx, e.target.value)} style={{marginLeft: 12, width: 280, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}} placeholder="住所を入力します" />
                    {idx===waypoints.length-1 && waypoints.length<10 && (
                      <button onClick={handleAddWaypoint} style={{marginLeft:8, background:"#20b920", color:"#fff", borderRadius: "50%", border: "none", width:32, height:32, fontSize:22, fontWeight:"bold"}}>＋</button>
                    )}
                  </div>
                ))}
                <div style={{display: "flex", alignItems: "center", marginBottom: 10}}>
                  <span style={{width: 80, background: "#1a78f7", color: "#fff", borderRadius: 4, textAlign: "center", padding: "6px 0", fontWeight: "bold", fontSize: 16}}>目的地</span>
                  <input value={destination} onChange={e=>setDestination(e.target.value)} style={{marginLeft: 12, width: 280, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}} placeholder="住所を入力します" />
                </div>
              </>
            ) : (
              <>
                <div style={{display: "flex", alignItems: "center", marginBottom: 12}}>
                  <span style={{width: 80, background: "#1a78f7", color: "#fff", borderRadius: 4, textAlign: "center", padding: "6px 0", fontWeight: "bold", fontSize: 16}}>出発地</span>
                  <input value={origin} onChange={e=>setOrigin(e.target.value)} style={{marginLeft: 12, width: 280, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}} placeholder="住所、市町村、事業所" />
                </div>
                <div style={{display: "flex", alignItems: "center", marginBottom: 12}}>
                  <span style={{width: 80, background: "#1a78f7", color: "#fff", borderRadius: 4, textAlign: "center", padding: "6px 0", fontWeight: "bold", fontSize: 16}}>乗船する港名</span>
                  <input value={ferryPorts.from} onChange={e=>setFerryPorts(v=>({...v,from:e.target.value}))} style={{marginLeft: 12, width: 280, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}} placeholder="港名 例:苫小牧港" />
                </div>
                <div style={{display: "flex", alignItems: "center", marginBottom: 12}}>
                  <span style={{width: 80, background: "#1a78f7", color: "#fff", borderRadius: 4, textAlign: "center", padding: "6px 0", fontWeight: "bold", fontSize: 16}}>下船する港名</span>
                  <input value={ferryPorts.to} onChange={e=>setFerryPorts(v=>({...v,to:e.target.value}))} style={{marginLeft: 12, width: 280, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}} placeholder="港名 例:八戸港" />
                </div>
                <div style={{display: "flex", alignItems: "center", marginBottom: 10}}>
                  <span style={{width: 80, background: "#1a78f7", color: "#fff", borderRadius: 4, textAlign: "center", padding: "6px 0", fontWeight: "bold", fontSize: 16}}>到着地</span>
                  <input value={destination} onChange={e=>setDestination(e.target.value)} style={{marginLeft: 12, width: 280, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}} placeholder="住所、市町村、事業所" />
                </div>
              </>
            )}
          </div>
        )}

        {/* --- 運行距離を把握 --- */}
        {distanceMode === "manual" && (
          <div style={{display: "flex", alignItems: "center", margin: "24px 0", justifyContent: "center"}}>
            <span style={{
              width: 90, background: "#1a78f7", color: "#fff", borderRadius: 4,
              textAlign: "center", fontWeight: "bold", fontSize: 15, height: 38, lineHeight: "38px"
            }}>運行距離</span>
            <input
              type="number"
              value={manualDistance}
              onChange={e => { setManualDistance(e.target.value); setManualConfirmed(false); }}
              placeholder="数字を入力"
              style={{marginLeft: 10, width: 180, height: 38, fontSize: 17, borderRadius: 4, border: "2px solid #ccc"}}
            />
            <span style={{marginLeft: 8, fontWeight: "bold"}}>km</span>
            <button style={{
              marginLeft: 10, height: 38, fontWeight: "bold", fontSize: 15,
              background: "#e7f0f5", border: "2px solid #bbb", borderRadius: 5, color: "#333"
            }}
            onClick={() => setManualConfirmed(true)}
            >距離を確定</button>
          </div>
        )}
      </div>

      {/* --- 詳細条件・割増割引 --- */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setShowDetails(v=>!v)}
          style={{
            border: "2.5px solid #ff9800", fontWeight: "bold", fontSize: 17, borderRadius: 8,
            background: showDetails ? orange : "#fff",
            color: showDetails ? "#fff" : "#ff9800",
            width: 320, height: 44, marginBottom: 10,
          }}
        >
          料金、実費、割増等を適用{showDetails ? "する" : "しない"}
        </button>
        {showDetails && (
          <DetailedSettings value={detailed} onChange={setDetailed} />
        )}
      </div>

      {/* --- 計算ボタン --- */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          onClick={handleCalcFare}
          disabled={!((distanceMode==="map" && mapKm!=null) || (distanceMode==="manual" && manualConfirmed))}
          style={{
            background: ((distanceMode==="map" && mapKm!=null) || (distanceMode==="manual" && manualConfirmed)) ? "#1761d5" : "#fff",
            color: ((distanceMode==="map" && mapKm!=null) || (distanceMode==="manual" && manualConfirmed)) ? "#fff" : "#1761d5",
            border: "3.5px solid #1761d5",
            borderRadius: 10, height: 60, minWidth: 320, fontWeight: "bold", fontSize: 22, marginTop: 6,
            cursor: "pointer"
          }}
        >標準的運賃（概算）を計算する</button>
      </div>

      {/* --- 結果 --- */}
      {fare != null && (
        <div style={{ border: "1px solid #000", borderRadius: 12, padding: 16, marginTop: 24, maxWidth: 600, fontSize: 14 }}>
          <h2 style={{ margin: 0, fontSize: 24 }}>
            基準運賃額
            <span style={{ marginLeft: "10mm", fontWeight: "bold", fontSize: 28 }}>
              ¥{fare.toLocaleString()}
            </span>
            <small style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
              （高速道路料金及び消費税を含みません）
            </small>
          </h2>
        </div>
      )}
    </div>
  );
}

            </small>
          </h2>
        </div>
      )}

      {/* 注意書き */}
      <div
        style={{
          marginTop: 24,
          padding: "0 16px",
          fontSize: 12,
          lineHeight: 1.6,
          color: "#555",
          maxWidth: 600,
        }}
      >
        <p>●標準的運賃は、令和６年国土交通省告示第209号（2024/03/22）を踏まえ算出されます。</p>
        <p>●青色ピンは出発地、赤色ピンは到着地、黄色ピンは経由地です。</p>
        <p>●算出される距離と実際の走行距離に誤差が発生する場合があります。</p>
        <p>●地図データの状況により出発地住所が取得できない場合は、近隣エリアを起点・終点として算出します。</p>
        <p>●割増、割引、燃料サーチャージ、高速道路利用料金などの詳細計算につきましては、７月頃の公開を予定しています。</p>
        <p>●フェリー区間が想定される場合、「高速道路を利用する」を選択してください。</p>
        <p>◆計算システムの提供：公益社団法人全日本トラック協会</p>
        <p>◆お問合せ先：日本ＰＭＩコンサルティング株式会社　メールアドレス：a@jta-r.jp</p>
        <p style={{ marginTop: 12 }}>計算システム改訂版公開　2025年5月22日</p>
      </div>
    </div>
  );
}