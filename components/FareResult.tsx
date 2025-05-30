import React from "react";
import { vehicleLabel } from "../utils/constants";

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
};

export default function FareResult({
  fare,
  rawKm,
  roundedKm,
  originAddr,
  destinationAddr,
  useHighway,
  vehicle,
  region
}: Props) {
  if (fare == null) return null;
  return (
    <div style={{
      border: "1px solid #000", borderRadius: 12, padding: 16,
      marginTop: 24, maxWidth: 600, fontSize: 14
    }}>
      <h2 style={{ margin: 0, fontSize: 24 }}>
        基準運賃額
        <span style={{ marginLeft: "10mm", fontWeight: "bold", fontSize: 28 }}>
          {fare != null ? `¥${fare.toLocaleString()}` : ""}
        </span>
        <small style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
          （高速道路料金及び消費税を含みません）
        </small>
      </h2>
      <dl style={{ margin: "12px 0", lineHeight: 1.5, overflow: "hidden" }}>
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
        <dd style={{ marginLeft: 120 }}>
          {vehicleLabel[vehicle]}
        </dd>
        <dt style={{ float: "left", clear: "left", width: 120 }}>届出：運輸局</dt>
        <dd style={{ marginLeft: 120 }}>{region}運輸局</dd>
      </dl>
    </div>
  );
}