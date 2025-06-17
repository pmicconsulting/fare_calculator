import React, { useRef, useState, useEffect, useCallback } from "react";
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
import NoticeBox from "../components/NoticeBox";

export type DistanceType = "map" | "address" | "manual" | "ferry";
export type TollType = "apply" | "not_apply";

export default function Home() {
  const mapRef = useRef<{ drawRoute: () => void }>(null);
  const addressFormRef = useRef<{ calc: () => void }>(null);
  const addressMapRef = useRef<{ calculateRoute: () => void }>(null);
  const ferryMapRef = useRef<{ calculateRoute: () => void }>(null);

  // UI state
  const [vehicle, setVehicle] = useState<VehicleType>("large");
  const [region, setRegion] = useState<RegionType>("関東");
  const [distanceType, setDistanceType] = useState<DistanceType>("map");
  const [useHighway, setUseHighway] = useState<boolean>(true);
  const [toll, setToll] = useState<TollType>("not_apply");

  // 経路・距離・住所
  const [km, setKm] = useState<number>(0);
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
  // 計算結果の状態を追加
  const [calculatedCharges, setCalculatedCharges] = useState<Record<string, number>>({});
  const [calculatedSurcharges, setCalculatedSurcharges] = useState<Record<string, number>>({});

  // 詳細設定の初期値（forwardingFeeを確実に含める）
  const [detailedSettings, setDetailedSettings] = useState({
    specialVehicle: { enabled: false, type: "" },
    holiday: { enabled: false, distanceRatio: 0 },
    deepNight: { enabled: false, distanceRatio: 0 },
    express: { enabled: false, surchargeRate: 20 },
    generalRoad: { enabled: false, surchargeRate: 20 },
    waitingTime: {
      departure: { enabled: false, time: "", type: 'A' as 'A' | 'B' }, // 修正: 0 → ""
      arrival: { enabled: false, time: "", type: 'A' as 'A' | 'B' }, // 修正: 0 → ""
    },
    loadingWork: {
      departure: { enabled: false, type: "", time: "" }, // 修正: 0 → ""
      arrival: { enabled: false, type: "", time: "" }, // 修正: 0 → ""
    },
    forwardingFee: { enabled: false }, // 確実に追加
    fuelSurcharge: { enabled: false, fuelEfficiency: 5.0, fuelPrice: 120 }, // 修正: rate → fuelEfficiency, fuelPrice
  });

  // distanceType切替時に結果stateをリセット
  useEffect(() => {
    setFare(null);
    setOriginAddr("");
    setDestinationAddr("");
    setKm(0);
    setRoundedKm(null);
    setError(null);
    
    // フェリーに切り替えた場合は詳細設定を無効化
    if (distanceType === "ferry") {
      setDetailedSettingsEnabled(false);
      setToll("not_apply");
    }
  }, [distanceType]);

  // MapAreaから経路・距離を受け取る
  const handleRouteDraw = async (_pins: google.maps.LatLngLiteral[], km: number, _route: google.maps.DirectionsRoute | null) => {
    setKm(km);

    if (!_route || !_route.legs.length) {
      setFare(0);
      setOriginAddr("");
      setDestinationAddr("");
      setRoundedKm(null);
      return;
    }

    setOriginAddr(_route.legs[0].start_address.replace(/^日本、,?\s*/,""));
    setDestinationAddr(_route.legs[0].end_address.replace(/^日本、,?\s*/,""));

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

  const handleFareResult = async (res: {
    fare: number | null;
    originAddr: string;
    destinationAddr: string;
    rawKm: number;
    roundedKm: number;
  } | null, err: string | undefined) => {
    if (!res) {
      setResult(null);
      return;
    }

    // 住所→緯度経度変換
    const geocode = async (address: string) => {
      return new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (!window.google) {
          return resolve(null);
        }
        if (!address || address.trim() === "") {
          return resolve(null);
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve(null);
          }
        });
      });
    };

    const originLatLng = await geocode(res.originAddr);
    const destinationLatLng = await geocode(res.destinationAddr);
    const waypointsLatLng = await Promise.all(
      tos.filter(t => t.trim()).map(addr => geocode(addr))
    );

    if (!originLatLng || !destinationLatLng) {
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
  const isDetailedSettingsActive = useCallback(() => {
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
  }, [detailedSettings, detailedSettingsEnabled]);

  // デバウンスタイマーの参照を保持
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 詳細料金計算用のuseEffect
  useEffect(() => {
    // 既存のタイマーをクリア
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 新しいタイマーを設定（500ms後に実行）
    debounceTimerRef.current = setTimeout(async () => {
      // 詳細設定が無効または何も設定されていない場合は計算しない
      if (!detailedSettingsEnabled || !isDetailedSettingsActive()) {
        setCalculatedCharges({});
        setCalculatedSurcharges({});
        return;
      }

      // 基本運賃を取得
      let baseFare = 0;
      let rawKm = 0;
      
      if (distanceType === "map" && fare !== null) {
        baseFare = fare;
        rawKm = km;
      } else if (distanceType === "address" && result?.fare !== null && result?.fare !== undefined) {
        baseFare = result.fare;
        rawKm = result.rawKm;
      } else if (distanceType === "manual" && manualFareResult && manualFareResult.fare !== null) {
        baseFare = manualFareResult.fare;
        rawKm = manualFareResult.rawKm;
      }
      
      if (!baseFare || baseFare === 0) return;
      
      try {
        const { charges, surcharges } = await calculateDetailedFare(
          baseFare,
          detailedSettings,
          rawKm,
          vehicle
        );
        
        setCalculatedCharges(charges);
        setCalculatedSurcharges(surcharges);
      } catch (error) {

      }
    }, 500);

    // クリーンアップ関数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fare, vehicle, km, detailedSettings, detailedSettingsEnabled, distanceType, result, manualFareResult, isDetailedSettingsActive]);

  // detailedSettingsのメモ化されたonChangeハンドラー
  const handleDetailedSettingsChange = useCallback((newSettings: typeof detailedSettings) => {
    setDetailedSettings(newSettings);
  }, []);

  // 結果表示の分岐処理（calculateDetailedFareの呼び出しを削除）
  const renderFareResult = () => {
    if (distanceType === "map" && (fare !== null || error !== null)) {
      if (detailedSettingsEnabled && isDetailedSettingsActive()) {
        // calculateDetailedFareの呼び出しを削除
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
            charges={calculatedCharges}
            surcharges={calculatedSurcharges}
            chargeDetails={{
              departureWaitingMinutes: detailedSettings?.waitingTime?.departure?.time ? parseInt(detailedSettings.waitingTime.departure.time) : undefined,
              loadingMinutes: detailedSettings?.loadingWork?.departure?.time ? parseInt(detailedSettings.loadingWork.departure.time) : undefined,
              arrivalWaitingMinutes: detailedSettings?.waitingTime?.arrival?.time ? parseInt(detailedSettings.waitingTime.arrival.time) : undefined,
              unloadingMinutes: detailedSettings?.loadingWork?.arrival?.time ? parseInt(detailedSettings.loadingWork.arrival.time) : undefined,
              forwardingRate: 10,
              fuelConsumption: detailedSettings?.fuelSurcharge?.fuelEfficiency,
              fuelPrice: detailedSettings?.fuelSurcharge?.fuelPrice,
              holidayDistanceRatio: detailedSettings?.holiday?.distanceRatio,
              deepNightDistanceRatio: detailedSettings?.deepNight?.distanceRatio,
              expressRate: detailedSettings?.express?.surchargeRate || 20,
              generalRoadRate: detailedSettings?.generalRoad?.surchargeRate || 20,
              specialVehicleType: detailedSettings?.specialVehicle?.type
            }}
          />
        );
      } else {
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
        // calculateDetailedFareの呼び出しを削除
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
            charges={calculatedCharges}
            surcharges={calculatedSurcharges}
            chargeDetails={{
              departureWaitingMinutes: detailedSettings?.waitingTime?.departure?.time ? parseInt(detailedSettings.waitingTime.departure.time) : undefined,
              loadingMinutes: detailedSettings?.loadingWork?.departure?.time ? parseInt(detailedSettings.loadingWork.departure.time) : undefined,
              arrivalWaitingMinutes: detailedSettings?.waitingTime?.arrival?.time ? parseInt(detailedSettings.waitingTime.arrival.time) : undefined,
              unloadingMinutes: detailedSettings?.loadingWork?.arrival?.time ? parseInt(detailedSettings.loadingWork.arrival.time) : undefined,
              forwardingRate: 10,
              fuelConsumption: detailedSettings?.fuelSurcharge?.fuelEfficiency,
              fuelPrice: detailedSettings?.fuelSurcharge?.fuelPrice,
              holidayDistanceRatio: detailedSettings?.holiday?.distanceRatio,
              deepNightDistanceRatio: detailedSettings?.deepNight?.distanceRatio,
              expressRate: detailedSettings?.express?.surchargeRate || 20,
              generalRoadRate: detailedSettings?.generalRoad?.surchargeRate || 20,
              specialVehicleType: detailedSettings?.specialVehicle?.type
            }}
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
        // calculateDetailedFareの呼び出しを削除
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
            charges={calculatedCharges}
            surcharges={calculatedSurcharges}
            chargeDetails={{
              departureWaitingMinutes: detailedSettings?.waitingTime?.departure?.time ? parseInt(detailedSettings.waitingTime.departure.time) : undefined,
              loadingMinutes: detailedSettings?.loadingWork?.departure?.time ? parseInt(detailedSettings.loadingWork.departure.time) : undefined,
              arrivalWaitingMinutes: detailedSettings?.waitingTime?.arrival?.time ? parseInt(detailedSettings.waitingTime.arrival.time) : undefined,
              unloadingMinutes: detailedSettings?.loadingWork?.arrival?.time ? parseInt(detailedSettings.loadingWork.arrival.time) : undefined,
              forwardingRate: 10,
              fuelConsumption: detailedSettings?.fuelSurcharge?.fuelEfficiency,
              fuelPrice: detailedSettings?.fuelSurcharge?.fuelPrice,
              holidayDistanceRatio: detailedSettings?.holiday?.distanceRatio,
              deepNightDistanceRatio: detailedSettings?.deepNight?.distanceRatio,
              expressRate: detailedSettings?.express?.surchargeRate || 20,
              generalRoadRate: detailedSettings?.generalRoad?.surchargeRate || 20,
              specialVehicleType: detailedSettings?.specialVehicle?.type
            }}
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

  // ハンバーガーメニューの状態を追加
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // モバイルメニューの制御
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 599) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMobileMenuOpen && 
          !target.closest('.left-panel') && 
          !target.closest('.hamburger-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <button 
        className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="メニュー"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* オーバーレイ */}
      <div 
        className={`overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div style={containerStyle}>
        <div 
          style={leftPanelStyle} 
          className={`left-panel ${isMobileMenuOpen ? 'active' : ''}`}
        >
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
        
        <div style={rightPanelStyle} className="right-panel">
          {/* 各種入力フォームと結果表示 */}
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
                  // 必要に応じて処理を追加
                }}
              />
              {renderFareResult()}
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
            </>
          )}

          {/* 詳細設定（フェリー以外の場合のみ、かつ料金・実費が「適用する」の場合のみ表示） */}
          {distanceType !== "ferry" && detailedSettingsEnabled && (
            <div style={{ marginTop: 20, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <DetailedSettings 
                value={detailedSettings} 
                onChange={handleDetailedSettingsChange}
              />
            </div>
          )}

          {/* NoticeBoxを最下段に追加 */}
          <NoticeBox />
        </div>
      </div>
    </>
  );
}