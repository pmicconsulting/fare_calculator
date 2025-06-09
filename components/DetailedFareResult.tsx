import React from "react";
import { vehicleLabel } from "../utils/constants";
import { FareCalculationResult } from '../types/DetailedSettingsType';

type VehicleType = "small" | "medium" | "large" | "trailer";

type Props = {
  fare: number | null;
  rawKm: number | null;
  roundedKm: number | null;
  originAddr: string;
  destinationAddr: string;
  useHighway: boolean;
  vehicle: VehicleType;
  region: string;
  charges: {
    loadingFee?: number;
    departureWaitingFee?: number;
    arrivalWaitingFee?: number;
    unloadingFee?: number;
    forwardingFee?: number;
    fuelSurcharge?: number;
  };
  surcharges: {
    specialVehicle?: { type: string; rate: number };
    holiday?: number;
    deepNight?: number;
    express?: number;
    generalRoad?: number;
  };
  // 前提条件のための追加情報
  chargeDetails?: {
    departureWaitingMinutes?: number;
    loadingMinutes?: number;
    arrivalWaitingMinutes?: number;
    unloadingMinutes?: number;
    forwardingRate?: number;
    fuelConsumption?: number;
    fuelPrice?: number;
    holidayDistanceRatio?: number;
    deepNightDistanceRatio?: number;
    expressRate?: number;
    generalRoadRate?: number;
    specialVehicleType?: string;
  };
};

export default function DetailedFareResult({
  fare,
  rawKm,
  roundedKm,
  originAddr,
  destinationAddr,
  useHighway,
  vehicle,
  region,
  charges,
  surcharges,
  chargeDetails = {},
}: Props) {
  if (fare == null) return null;

  // 車種の日本語変換
  const vehicleDisplayName = {
    small: "小型車",
    medium: "中型車",
    large: "大型車",
    trailer: "トレーラー"
  }[vehicle];

  // 合計料金計算（修正: 利用運送手数料と燃料サーチャージを除外）
  const totalCharges = (charges.departureWaitingFee || 0) + 
                      (charges.loadingFee || 0) + 
                      (charges.arrivalWaitingFee || 0) + 
                      (charges.unloadingFee || 0);
  
  // 割増料金の合計を正しく計算（利用運送手数料と燃料サーチャージを追加）
  let totalSurcharges = 0;
  if (charges.fuelSurcharge !== undefined) totalSurcharges += charges.fuelSurcharge;
  if (surcharges.specialVehicle) {
    totalSurcharges += Math.round((fare || 0) * surcharges.specialVehicle.rate / 100);
  }
  if (surcharges.holiday) totalSurcharges += surcharges.holiday;
  if (surcharges.deepNight) totalSurcharges += surcharges.deepNight;
  if (surcharges.express) totalSurcharges += surcharges.express;
  if (surcharges.generalRoad) totalSurcharges += surcharges.generalRoad;
  if (charges.forwardingFee !== undefined) totalSurcharges += charges.forwardingFee;

  const totalFare = fare + totalCharges + totalSurcharges;

  return (
    <div style={{
      border: "1px solid #000", borderRadius: 12, padding: 16,
      marginTop: 24, maxWidth: 800, fontSize: 14
    }}>
      <h2 style={{ margin: 0, fontSize: 24 }}>
        計算結果
        <span style={{ marginLeft: "10mm", fontWeight: "bold", fontSize: 28 }}>
          ¥{totalFare.toLocaleString()}
        </span>
        <small style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
          （消費税を含みません）
        </small>
      </h2>
      <dl style={{ margin: "12px 0", lineHeight: 1.5, overflow: "hidden" }}>
        {/* 運賃情報 */}
        <dt style={{ float: "left", clear: "left", width: 150, fontWeight: "bold" }}>基準運賃額</dt>
        <dd style={{ marginLeft: 180, fontWeight: "bold" }}>
          ¥{fare.toLocaleString()}
          <span style={{ marginLeft: 16, fontSize: 12, color: "#666", fontWeight: "normal" }}>
            （{vehicleDisplayName}/{region}運輸局/高速道路利用{useHighway ? "する" : "しない"}）
          </span>
        </dd>
        <dt style={{ float: "left", clear: "left", width: 150 }}>出発地：住所</dt>
        <dd style={{ marginLeft: 180 }}>{originAddr}</dd>
        <dt style={{ float: "left", clear: "left", width: 150 }}>到着地：住所</dt>
        <dd style={{ marginLeft: 180 }}>{destinationAddr}</dd>
        {rawKm != null && (
          <>
            <dt style={{ float: "left", clear: "left", width: 150 }}>経路上の距離</dt>
            <dd style={{ marginLeft: 180 }}>{rawKm.toFixed(1)}km</dd>
          </>
        )}
        {roundedKm != null && (
          <>
            <dt style={{ float: "left", clear: "left", width: 150 }}>運賃計算距離</dt>
            <dd style={{ marginLeft: 180 }}>{roundedKm}km</dd>
          </>
        )}
      </dl>

      {/* 料金・実費の部（0円の項目は非表示） */}
      {totalCharges > 0 && (
        <div style={{ margin: "16px 0", lineHeight: 1.5, overflow: "hidden" }}>
          <h3 style={{ margin: "16px 0", fontSize: 20 }}>料金・実費</h3>
          <dl style={{ margin: "12px 0", lineHeight: 1.5, overflow: "hidden" }}>
            {charges.departureWaitingFee !== undefined && charges.departureWaitingFee > 0 && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>待機時間料（出発）</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{charges.departureWaitingFee.toLocaleString()}
                  {chargeDetails.departureWaitingMinutes && (
                    <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                      （所要時間{chargeDetails.departureWaitingMinutes}分）
                    </span>
                  )}
                </dd>
              </>
            )}
            {charges.loadingFee !== undefined && charges.loadingFee > 0 && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>積込料（出発）</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{charges.loadingFee.toLocaleString()}
                  {chargeDetails.loadingMinutes && (
                    <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                      （所要時間{chargeDetails.loadingMinutes}分）
                    </span>
                  )}
                </dd>
              </>
            )}
            {charges.arrivalWaitingFee !== undefined && charges.arrivalWaitingFee > 0 && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>待機時間料（到着）</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{charges.arrivalWaitingFee.toLocaleString()}
                  {chargeDetails.arrivalWaitingMinutes && (
                    <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                      （所要時間{chargeDetails.arrivalWaitingMinutes}分）
                    </span>
                  )}
                </dd>
              </>
            )}
            {charges.unloadingFee !== undefined && charges.unloadingFee > 0 && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>取卸料（到着）</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{charges.unloadingFee.toLocaleString()}
                  {chargeDetails.unloadingMinutes && (
                    <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                      （所要時間{chargeDetails.unloadingMinutes}分）
                    </span>
                  )}
                </dd>
              </>
            )}
            <dt style={{ float: "left", clear: "left", width: 150, fontWeight: "bold" }}>料金・実費小計</dt>
            <dd style={{ marginLeft: 180, fontWeight: "bold" }}>¥{totalCharges.toLocaleString()}</dd>
          </dl>
        </div>
      )}

      {/* 割増詳細 */}
      {totalSurcharges > 0 && (
        <>
          <h3 style={{ margin: "16px 0", fontSize: 20 }}>割増料金</h3>
          <dl style={{ margin: "12px 0", lineHeight: 1.5, overflow: "hidden" }}>
            {charges.fuelSurcharge !== undefined && charges.fuelSurcharge >= 0 && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>燃料サーチャージ</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{charges.fuelSurcharge.toLocaleString()}
                  {chargeDetails.fuelConsumption && chargeDetails.fuelPrice && (
                    <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                      （燃費{chargeDetails.fuelConsumption}km/ℓ　燃料調達価格{chargeDetails.fuelPrice}円）
                    </span>
                  )}
                </dd>
              </>
            )}
            {surcharges.specialVehicle && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>特殊車両割増</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{Math.round(fare * surcharges.specialVehicle.rate / 100).toLocaleString()}
                  {chargeDetails?.specialVehicleType && (
                    <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                      （{(() => {
                        const vehicleTypeMap: { [key: string]: string } = {
                          "refrigerated": "冷蔵車・冷凍車",
                          "container": "海上コンテナ輸送車",
                          "cement_bulk": "セメントバルク車",
                          "dump": "ダンプ車",
                          "concrete_mixer": "コンクリートミキサー車",
                          "truck_crane": "トラック搭載型クレーン車",
                          "tank_petroleum": "タンク車 石油製品輸送車",
                          "tank_chemical": "タンク車 化成品輸送車",
                          "tank_high_pressure_gas": "タンク輸送 高圧ガス輸送車"
                        };
                        return vehicleTypeMap[chargeDetails.specialVehicleType] || chargeDetails.specialVehicleType;
                      })()} {surcharges.specialVehicle.rate}％）
                    </span>
                  )}
                </dd>
              </>
            )}
            {surcharges.holiday && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>休日割増</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{surcharges.holiday.toLocaleString()}
                  <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                    （割増率20％{chargeDetails?.holidayDistanceRatio ? ` 走行距離比率${chargeDetails.holidayDistanceRatio}％` : ''}）
                  </span>
                </dd>
              </>
            )}
            {surcharges.deepNight && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>深夜・早朝割増</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{surcharges.deepNight.toLocaleString()}
                  <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                    （割増率20％{chargeDetails?.deepNightDistanceRatio ? ` 走行距離比率${chargeDetails.deepNightDistanceRatio}％` : ''}）
                  </span>
                </dd>
              </>
            )}
            {surcharges.express && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>速達割</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{surcharges.express.toLocaleString()}
                  <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                    （割増率{chargeDetails?.expressRate || 20}％）
                  </span>
                </dd>
              </>
            )}
            {surcharges.generalRoad && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>一般道利用割増</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{surcharges.generalRoad.toLocaleString()}
                  <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                    （割増率{chargeDetails?.generalRoadRate || 20}％）
                  </span>
                </dd>
              </>
            )}
            {charges.forwardingFee !== undefined && charges.forwardingFee > 0 && (
              <>
                <dt style={{ float: "left", clear: "left", width: 150 }}>利用運送手数料</dt>
                <dd style={{ marginLeft: 180 }}>
                  ¥{charges.forwardingFee.toLocaleString()}
                  {chargeDetails.forwardingRate && (
                    <span style={{ marginLeft: 16, fontSize: 12, color: "#666" }}>
                      （割増率{chargeDetails.forwardingRate}％）
                    </span>
                  )}
                </dd>
              </>
            )}
            <dt style={{ float: "left", clear: "left", width: 150, fontWeight: "bold" }}>割増料金小計</dt>
            <dd style={{ marginLeft: 180, fontWeight: "bold" }}>¥{totalSurcharges.toLocaleString()}</dd>
          </dl>
        </>
      )}
    </div>
  );
}