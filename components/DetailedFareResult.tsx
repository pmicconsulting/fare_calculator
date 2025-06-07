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
}: Props) {
  if (fare == null) return null;

  // 合計料金計算
  const totalCharges = Object.values(charges).reduce((sum, charge) => sum + (charge || 0), 0);
  const totalSurcharges = Object.values(surcharges).reduce((sum, surcharge) => sum + (surcharge || 0), 0);
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
        <dt style={{ float: "left", clear: "left", width: 120 }}>出発地：住所</dt>
        <dd style={{ marginLeft: 120 }}>{originAddr}</dd>
        <dt style={{ float: "left", clear: "left", width: 120 }}>到着地：住所</dt>
        <dd style={{ marginLeft: 120 }}>{destinationAddr}</dd>
        <dt style={{ float: "left", clear: "left", width: 120 }}>経路上の距離</dt>
        <dd style={{ marginLeft: 120 }}>{rawKm != null ? rawKm.toFixed(1) : ""}km</dd>
        <dt style={{ float: "left", clear: "left", width: 120 }}>運賃計算距離</dt>
        <dd style={{ marginLeft: 120 }}>{roundedKm}km</dd>
        <dt style={{ float: "left", clear: "left", width: 120 }}>高速道路利用</dt>
        <dd style={{ marginLeft: 120 }}>{useHighway ? "利用する" : "利用しない"}</dd>
        <dt style={{ float: "left", clear: "left", width: 120 }}>車種</dt>
        <dd style={{ marginLeft: 120 }}>{vehicleLabel[vehicle]}</dd>
        <dt style={{ float: "left", clear: "left", width: 120 }}>届出：運輸局</dt>
        <dd style={{ marginLeft: 120 }}>{region}運輸局</dd>
      </dl>

      {/* 料金・実費の部 */}
      <div style={{ margin: "16px 0", lineHeight: 1.5, overflow: "hidden" }}>
        <h3 style={{ margin: "16px 0", fontSize: 20 }}>料金・実費</h3>
        <dl style={{ margin: "12px 0", lineHeight: 1.5, overflow: "hidden" }}>
          {charges.departureWaitingFee !== undefined && charges.departureWaitingFee > 0 && (
            <>
              <dt style={{ float: "left", clear: "left", width: 120 }}>待機時間料金（出発地）</dt>
              <dd style={{ marginLeft: 120 }}>¥{charges.departureWaitingFee.toLocaleString()}</dd>
            </>
          )}
          {charges.loadingFee !== undefined && charges.loadingFee > 0 && (
            <>
              <dt style={{ float: "left", clear: "left", width: 120 }}>荷役作業料金（出発地）</dt>
              <dd style={{ marginLeft: 120 }}>¥{charges.loadingFee.toLocaleString()}</dd>
            </>
          )}
          {charges.arrivalWaitingFee !== undefined && charges.arrivalWaitingFee > 0 && (
            <>
              <dt style={{ float: "left", clear: "left", width: 120 }}>待機時間料金（到着地）</dt>
              <dd style={{ marginLeft: 120 }}>¥{charges.arrivalWaitingFee.toLocaleString()}</dd>
            </>
          )}
          {charges.unloadingFee !== undefined && charges.unloadingFee > 0 && (
            <>
              <dt style={{ float: "left", clear: "left", width: 120 }}>荷役作業料金（到着地）</dt>
              <dd style={{ marginLeft: 120 }}>¥{charges.unloadingFee.toLocaleString()}</dd>
            </>
          )}
          {charges.forwardingFee !== undefined && charges.forwardingFee > 0 && (
            <>
              <dt style={{ float: "left", clear: "left", width: 120 }}>回送料金</dt>
              <dd style={{ marginLeft: 120 }}>¥{charges.forwardingFee.toLocaleString()}</dd>
            </>
          )}
          {charges.fuelSurcharge !== undefined && charges.fuelSurcharge >= 0 && (
            <>
              <dt style={{ float: "left", clear: "left", width: 120 }}>燃料サーチャージ</dt>
              <dd style={{ marginLeft: 120 }}>¥{charges.fuelSurcharge.toLocaleString()}</dd>
            </>
          )}
          <dt style={{ float: "left", clear: "left", width: 120, fontWeight: "bold" }}>料金・実費小計</dt>
          <dd style={{ marginLeft: 120, fontWeight: "bold" }}>¥{totalCharges.toLocaleString()}</dd>
        </dl>
      </div>

      {/* 割増詳細 */}
      <h3 style={{ margin: "16px 0", fontSize: 20 }}>割増料金</h3>
      <dl style={{ margin: "12px 0", lineHeight: 1.5, overflow: "hidden" }}>
        {surcharges.specialVehicle && (
          <>
            <dt style={{ float: "left", clear: "left", width: 120 }}>特殊車両割増</dt>
            <dd style={{ marginLeft: 120 }}>
              ¥{surcharges.specialVehicle.amount.toLocaleString()} ({surcharges.specialVehicle.rate}%)
            </dd>
          </>
        )}
        {surcharges.holiday && (
          <>
            <dt style={{ float: "left", clear: "left", width: 120 }}>休日割増</dt>
            <dd style={{ marginLeft: 120 }}>¥{surcharges.holiday.toLocaleString()}</dd>
          </>
        )}
        {surcharges.deepNight && (
          <>
            <dt style={{ float: "left", clear: "left", width: 120 }}>深夜・早朝割増</dt>
            <dd style={{ marginLeft: 120 }}>¥{surcharges.deepNight.toLocaleString()}</dd>
          </>
        )}
        {surcharges.express && (
          <>
            <dt style={{ float: "left", clear: "left", width: 120 }}>速達割</dt>
            <dd style={{ marginLeft: 120 }}>¥{surcharges.express.toLocaleString()}</dd>
          </>
        )}
        {surcharges.generalRoad && (
          <>
            <dt style={{ float: "left", clear: "left", width: 120 }}>一般道利用割増</dt>
            <dd style={{ marginLeft: 120 }}>¥{surcharges.generalRoad.toLocaleString()}</dd>
          </>
        )}
      </dl>
    </div>
  );
}