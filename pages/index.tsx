import React, { useRef, useState, useEffect } from "react";
import TopPanel from "../components/TopPanel";
import MapArea from "../components/MapArea";
import FareResult from "../components/FareResult";
import AddressForm from "../components/AddressForm";
import AddressMap from "../components/AddressMap";
import ManualDistanceInput from "../components/ManualDistanceInput";
import ManualFareResult from "../components/ManualFareResult";
import FerryForm from "../components/FerryForm";
import FerryFareResult from "../components/FerryFareResult";
import FerryMap from "../components/FerryMap";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../lib/fareUtils";
import {
  VehicleType,
  RegionType,
  regionMap,
  vehicleMap,
} from "../lib/codeMaps";
// DetailedSettingsのインポートを有効化
import DetailedSettings from "../components/DetailedSettings";
import DetailedFareResult from "../components/DetailedFareResult";
import { calculateDetailedFare } from '../lib/calculateDetailedFare'; // 修正: パスを変更
import { DetailedSettingsType } from '../types/DetailedSettingsType';
import DetailedManualFareResult from "../components/DetailedManualFareResult"; // 追加

type SpecialVehicleType = "none" | "trailer" | "refrigerated" | "wing" | "powerGate";

export type DistanceType = "map" | "address" | "manual" | "ferry";
export type TollType = "apply" | "not_apply";

export default function Home() {
  const mapRef = useRef<{ drawRoute: () => void }>(null);
  const addressFormRef = useRef<{ calc: () => void }>(null);
  const addressMapRef = useRef<{ calculateRoute: () => void }>(null);
  const ferryFormRef = useRef<{ calc: () => void }>(null);
  const ferryMapRef = useRef<{ calculateRoute: () => void }>(null);

  // UI state
  const [vehicle, setVehicle] = useState<VehicleType>("large");
  const [region, setRegion] = useState<RegionType>("関東");
  const [distanceType, setDistanceType] = useState<DistanceType>("map");
  const [useHighway, setUseHighway] = useState<boolean>(true);
  const [toll, setToll] = useState<TollType>("not_apply");

  // 経路・距離・住所
  const [pins, setPins] = useState<any[]>([]);
  const [km, setKm] = useState<number>(0);
  const [route, setRoute] = useState<google.maps.DirectionsRoute | null>(null);
  const [originAddr, setOriginAddr] = useState("");
  const [destinationAddr, setDestinationAddr] = useState("");
  const [roundedKm, setRoundedKm] = useState<number | null>(null);

  // 運賃
  const [fare, setFare] = useState<number | null>(null);

  // 住所で距離用
  const [from, setFrom] = useState("");
  const [tos, setTos] = useState<string[]>([""]);
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 詳細設定の状態管理
  const [detailedSettingsEnabled, setDetailedSettingsEnabled] = useState<boolean>(false);
  // 詳細設定の初期値（forwardingFeeを確実に含める）
  const [detailedSettings, setDetailedSettings] = useState({
    specialVehicle: { enabled: false, type: "" },
    holiday: { enabled: false, distanceRatio: 0 },
    deepNight: { enabled: false, distanceRatio: 0 },
    express: { enabled: false, surchargeRate: 20 },
    generalRoad: { enabled: false, surchargeRate: 20 },
    waitingTime: {
      departure: { enabled: false, time: 0 },
      arrival: { enabled: false, time: 0 },
    },
    loadingWork: {
      departure: { enabled: false, type: "", time: 0 },
      arrival: { enabled: false, type: "", time: 0 },
    },
    forwardingFee: { enabled: false }, // 確実に追加
    fuelSurcharge: { enabled: false, rate: 0 },
  });

  // distanceType切替時に結果stateをリセット
  useEffect(() => {
    setFare(null);
    setOriginAddr("");
    setDestinationAddr("");
    setKm(0);
    setRoundedKm(null);
    setError(null);
  }, [distanceType]);

  // MapAreaから経路・距離を受け取る
  const handleRouteDraw = async (pins: any[], km: number, route: google.maps.DirectionsRoute | null) => {
    setPins(pins);
    setKm(km);
    setRoute(route);

    if (!route || !route.legs.length) {
      setFare(0);
      setOriginAddr("");
      setDestinationAddr("");
      setRoundedKm(null);
      return;
    }

    setOriginAddr(route.legs[0].start_address.replace(/^日本、,?\s*/,""));
    setDestinationAddr(route.legs[0].end_address.replace(/^日本、,?\s*/,""));

    // 距離丸め
    const rounded = roundDistance(km, region);
    setRoundedKm(rounded);

    // supabaseで運賃取得
    const { data, error } = await supabase
      .from("fare_rates")
      .select("fare_yen")
      .eq("region_code", regionMap[region])
      .eq("vehicle_code", vehicleMap[vehicle])
      .eq("upto_km", Math.round(rounded))
      .maybeSingle();

    if (error || !data) {
      setFare(0);
      return;
    }
    setFare(data.fare_yen);
  };

  // 計算ボタン押下時の処理
  const handleCalcFare = async () => {
    setError(null);
    setFare(null);
    setFerryError(null);
    setFerryResult(null);

    switch (distanceType) {
      case "map":
        mapRef.current?.drawRoute();
        break;
      case "address":
        addressFormRef.current?.calc();
        break;
      case "ferry":
        ferryMapRef.current?.calculateRoute();
        break;
      case "manual":
        // manualの場合の処理をここに追加（必要に応じて）
        break;
      default:
        setError("無効な距離タイプが選択されています。");
    }
  };

  // 住所で距離計算の結果を受け取る
  const handleAddressFareResult = (result: {
    fare: number | null;
    originAddr: string;
    destinationAddr: string;
    rawKm: number;
    roundedKm: number;
  } | null, errorMsg?: string) => {
    console.log("handleAddressFareResult called", result, errorMsg);
    if (!result) {
      setFare(0);
      setOriginAddr("");
      setDestinationAddr("");
      setKm(0);
      setRoundedKm(null);
      setError(errorMsg || "計算失敗");
      return;
    }
    setFare(result.fare);
    setOriginAddr(result.originAddr);
    setDestinationAddr(result.destinationAddr);
    setKm(result.rawKm);
    setRoundedKm(result.roundedKm);
    setError(errorMsg || null);
  };

  // Ferry関連の状態管理
  const [ferryAddresses, setFerryAddresses] = useState({
    origin: "",
    embarkPort: "",
    disembarkPort: "",
    destination: "",
  });

  const [ferryResult, setFerryResult] = useState<{
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
  } | null>(null);

  const [ferryError, setFerryError] = useState<string | null>(null);

  const handleFerryFareResult = (result: typeof ferryResult, err?: string) => {
    if (err || !result) {
      setFerryResult(null);
      setFerryError(err || "運賃計算に失敗しました。再度入力を確認してください。");
      return;
    }
    setFerryResult(result);
    setFerryError(null);
  };

  // Manual入力の状態管理
  const [manualFareResult, setManualFareResult] = useState<{
    fare: number;
    rawKm: number;
    roundedKm: number;
    originAddr: string;
    destinationAddr: string;
  } | null>(null);

  const handleManualFareResult = (result: {
    fare: number;
    rawKm: number;
    roundedKm: number;
    originAddr: string;
    destinationAddr: string;
  } | null) => {
    setManualFareResult(result);
  };

  // Address入力の状態管理
  const [result, setResult] = useState<{
    fare: number | null;
    originAddr: string;
    destinationAddr: string;
    rawKm: number;
    roundedKm: number;
    originLatLng?: { lat: number; lng: number };
    destinationLatLng?: { lat: number; lng: number };
    waypointsLatLng?: { lat: number; lng: number }[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  const handleFareResult = async (res: any, err: any) => {
    console.log("handleFareResult called", res, err);
    setErrorMsg(err);
    if (!res) {
      setResult(null);
      return;
    }

    // 住所→緯度経度変換
    const geocode = async (address: string) => {
      console.log("geocode called with address:", address);
      return new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (!window.google) {
          console.error("Google Maps APIがwindowに存在しません。");
          return resolve(null);
        }
        if (!address || address.trim() === "") {
          console.error("ジオコーディング失敗: 空の住所が指定されました");
          return resolve(null);
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          console.log("geocode status:", status, "address:", address, "results:", results);
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            console.log("ジオコーディング成功:", address, loc.lat(), loc.lng());
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            console.error("ジオコーディング失敗:", address, status, results);
            resolve(null);
          }
        });
      });
    };

    const originLatLng = await geocode(res.originAddr);
    console.log("originLatLng:", originLatLng);
    const destinationLatLng = await geocode(res.destinationAddr);
    console.log("destinationLatLng:", destinationLatLng);
    const waypointsLatLng = await Promise.all(
      tos.filter(t => t.trim()).map(addr => geocode(addr))
    );

    if (!originLatLng || !destinationLatLng) {
      setErrorMsg("出発地または到着地の住所から座標を取得できませんでした。住所を確認してください。");
      setResult(null);
      return;
    }

    setResult({
      ...res,
      originLatLng,
      destinationLatLng,
      waypointsLatLng: waypointsLatLng.filter(Boolean) as { lat: number; lng: number }[],
    });
  };

  useEffect(() => {
    if (
      distanceType === "address" &&
      result?.originLatLng &&
      result?.destinationLatLng
    ) {
      addressMapRef.current?.calculateRoute();
    }
  }, [distanceType, result]);

  // 詳細設定が有効かどうかの判定ロジック
  const isDetailedSettingsActive = () => {
    if (!detailedSettingsEnabled) return false;
    
    return (
      detailedSettings.specialVehicle?.enabled ||
      detailedSettings.holiday?.enabled ||
      detailedSettings.deepNight?.enabled ||
      detailedSettings.express?.enabled ||
      detailedSettings.generalRoad?.enabled ||
      detailedSettings.waitingTime?.departure?.enabled ||
      detailedSettings.waitingTime?.arrival?.enabled ||
      detailedSettings.loadingWork?.departure?.enabled ||
      detailedSettings.loadingWork?.arrival?.enabled ||
      detailedSettings.forwardingFee?.enabled || // 追加
      detailedSettings.fuelSurcharge?.enabled
    );
  };

  // 結果表示の分岐処理
  const renderFareResult = () => {
    if (distanceType === "map" && (fare !== null || error !== null)) {
      // 詳細設定が有効で、実際に何らかの割増が設定されている場合
      if (detailedSettingsEnabled && isDetailedSettingsActive()) {
        const { charges, surcharges } = calculateDetailedFare(fare || 0, detailedSettings);
        
        return (
          <DetailedFareResult
            fare={fare}
            rawKm={km}
            roundedKm={roundedKm}
            originAddr={originAddr}
            destinationAddr={destinationAddr}
            useHighway={useHighway}
            vehicle={vehicle}
            region={region}
            charges={charges}
            surcharges={surcharges}
          />
        );
      } else {
        // 通常の運賃結果表示
        return (
          <FareResult
            fare={fare}
            originAddr={originAddr}
            destinationAddr={destinationAddr}
            rawKm={km}
            roundedKm={roundedKm}
            useHighway={useHighway}
            vehicle={vehicle}
            region={region}
            error={error}
          />
        );
      }
    }
    
    if (distanceType === "address" && result) {
      const shouldShowDetailed = detailedSettingsEnabled && isDetailedSettingsActive();
      
      if (shouldShowDetailed) {
        const { charges, surcharges } = calculateDetailedFare(result.fare || 0, detailedSettings);
        
        return (
          <DetailedFareResult
            fare={result.fare}
            rawKm={result.rawKm}
            roundedKm={result.roundedKm}
            originAddr={result.originAddr}
            destinationAddr={result.destinationAddr}
            useHighway={useHighway}
            vehicle={vehicle}
            region={region}
            charges={charges}
            surcharges={surcharges}
          />
        );
      } else {
        return (
          <FareResult
            fare={result.fare}
            rawKm={result.rawKm}
            roundedKm={result.roundedKm}
            originAddr={result.originAddr}
            destinationAddr={result.destinationAddr}
            useHighway={useHighway}
            vehicle={vehicle}
            region={region}
          />
        );
      }
    }

    if (distanceType === "manual" && manualFareResult) {
      const shouldShowDetailed = detailedSettingsEnabled && isDetailedSettingsActive();
      
      if (shouldShowDetailed) {
        const { charges, surcharges } = calculateDetailedFare(manualFareResult.fare || 0, detailedSettings);
        
        return (
          <DetailedManualFareResult
            fare={manualFareResult.fare}
            rawKm={manualFareResult.rawKm}
            roundedKm={manualFareResult.roundedKm}
            originAddr={manualFareResult.originAddr}
            destinationAddr={manualFareResult.destinationAddr}
            useHighway={useHighway}
            vehicle={vehicle}
            region={region}
            charges={charges}
            surcharges={surcharges}
          />
        );
      } else {
        return (
          <ManualFareResult
            fare={manualFareResult.fare}
            rawKm={manualFareResult.rawKm}
            roundedKm={manualFareResult.roundedKm}
            originAddr={manualFareResult.originAddr}
            destinationAddr={manualFareResult.destinationAddr}
            useHighway={useHighway}
            vehicle={vehicle}
            region={region}
          />
        );
      }
    }

    if (distanceType === "ferry" && ferryResult) {
      return (
        <FerryFareResult
          totalFare={ferryResult.beforeFare + ferryResult.afterFare}
          before={{
            fare: ferryResult.beforeFare,
            originAddr: ferryResult.beforeOriginAddr,
            destinationAddr: ferryResult.beforeDestAddr,
            rawKm: ferryResult.beforeKm,
            roundedKm: ferryResult.beforeRoundedKm,
          }}
          after={{
            fare: ferryResult.afterFare,
            originAddr: ferryResult.afterOriginAddr,
            destinationAddr: ferryResult.afterDestAddr,
            rawKm: ferryResult.afterKm,
            roundedKm: ferryResult.afterRoundedKm,
          }}
          useHighway={useHighway}
          vehicle={vehicle}
          region={region}
        />
      );
    }

    return null;
  };

  // スタイル定義を追加
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
  };

  const leftPanelStyle: React.CSSProperties = {
    width: '400px',
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    borderRight: '2px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const rightPanelStyle: React.CSSProperties = {
    flex: 1,
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '20px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    position: 'relative',
  };

  return (
    <div style={containerStyle}>
      <div style={leftPanelStyle}>
        <TopPanel
          vehicle={vehicle}
          setVehicle={setVehicle}
          region={region}
          setRegion={setRegion}
          distanceType={distanceType}
          setDistanceType={setDistanceType}
          useHighway={useHighway}
          setUseHighway={setUseHighway}
          toll={toll}
          setToll={setToll}
          onCalcFare={handleCalcFare}
          from={from}
          setFrom={setFrom}
          tos={tos}
          setTos={setTos}
          to={to}
          setTo={setTo}
          detailedSettingsEnabled={detailedSettingsEnabled}
          setDetailedSettingsEnabled={setDetailedSettingsEnabled}
          detailedSettings={detailedSettings}
          setDetailedSettings={setDetailedSettings}
        />
      </div>
      
      <div style={rightPanelStyle}>
        {/* 既存の右パネルの内容をそのまま */}
        {distanceType === "manual" && (
          <>
            <ManualDistanceInput
              vehicle={vehicle}
              region={region}
              useHighway={useHighway}
              fareOption={toll}
              onFareResult={handleManualFareResult}
            />
            {renderFareResult()}
            {detailedSettingsEnabled && (
              <DetailedSettings
                value={detailedSettings}
                onChange={setDetailedSettings}
              />
            )}
          </>
        )}
        
        {distanceType === "map" && (
          <>
            <MapArea
              ref={mapRef}
              useHighway={useHighway}
              region={region}
              onRouteDraw={handleRouteDraw}
            />
            {renderFareResult()}
            {detailedSettingsEnabled && (
              <DetailedSettings
                value={detailedSettings}
                onChange={setDetailedSettings}
              />
            )}
          </>
        )}
        
        {distanceType === "address" && (
          <>
            <AddressForm
              ref={addressFormRef}
              vehicle={vehicle}
              region={region}
              useHighway={useHighway}
              from={from}
              setFrom={setFrom}
              tos={tos}
              setTos={setTos}
              to={to}
              setTo={setTo}
              distanceType={distanceType}
              onFareResult={handleFareResult}
            />
            <div style={{ height: "0.5cm" }} />
            <AddressMap
              ref={addressMapRef}
              originAddr={result?.originAddr}
              destinationAddr={result?.destinationAddr}
              waypointAddrs={tos.filter(t => t.trim())}
              useHighway={useHighway}
              region={region}
              onRouteResult={(routeResult, routeError) => {
                console.log("AddressMap onRouteResult:", routeResult, routeError);
              }}
            />
            {renderFareResult()}
            {detailedSettingsEnabled && (
              <DetailedSettings
                value={detailedSettings}
                onChange={setDetailedSettings}
              />
            )}
          </>
        )}
        
        {distanceType === "ferry" && (
          <>
            <FerryForm
              origin={ferryAddresses.origin}
              setOrigin={(value) => setFerryAddresses(prev => ({ ...prev, origin: value }))}
              embarkPort={ferryAddresses.embarkPort}
              setEmbarkPort={(value) => setFerryAddresses(prev => ({ ...prev, embarkPort: value }))}
              disembarkPort={ferryAddresses.disembarkPort}
              setDisembarkPort={(value) => setFerryAddresses(prev => ({ ...prev, disembarkPort: value }))}
              destination={ferryAddresses.destination}
              setDestination={(value) => setFerryAddresses(prev => ({ ...prev, destination: value }))}
              onFareResult={(addresses) => {
                setFerryAddresses(addresses);
              }}
            />

            <FerryMap
              ref={ferryMapRef}
              origin={ferryAddresses.origin}
              embarkPort={ferryAddresses.embarkPort}
              disembarkPort={ferryAddresses.disembarkPort}
              destination={ferryAddresses.destination}
              vehicle={vehicle}
              region={region}
              useHighway={useHighway}
              onResult={handleFerryFareResult}
            />

            {ferryError && <div style={{ color: "red" }}>{ferryError}</div>}

            {ferryResult && (
              <FerryFareResult
                totalFare={ferryResult.beforeFare + ferryResult.afterFare}
                before={{
                  fare: ferryResult.beforeFare,
                  originAddr: ferryResult.beforeOriginAddr,
                  destinationAddr: ferryResult.beforeDestAddr,
                  rawKm: ferryResult.beforeKm,
                  roundedKm: ferryResult.beforeRoundedKm,
                }}
                after={{
                  fare: ferryResult.afterFare,
                  originAddr: ferryResult.afterOriginAddr,
                  destinationAddr: ferryResult.afterDestAddr,
                  rawKm: ferryResult.afterKm,
                  roundedKm: ferryResult.afterRoundedKm,
                }}
                useHighway={useHighway}
                vehicle={vehicle}
                region={region}
              />
            )}
            {detailedSettingsEnabled && (
              <DetailedSettings
                value={detailedSettings}
                onChange={setDetailedSettings}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}