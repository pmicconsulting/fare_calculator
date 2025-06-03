import React from "react";
import { vehicleLabel } from "../utils/constants";
import { RegionType, VehicleType } from "../lib/codeMaps";

// 区間の運賃詳細
export type RouteSection = {
  fare: number;
  originAddr: string;
  destinationAddr: string;
  rawKm: number;
  roundedKm: number;
};

// コンポーネント Props
export type Props = {
  totalFare: number | null;
  before: RouteSection | null;
  after: RouteSection | null;
  useHighway: boolean;
  vehicle: VehicleType;
  region: RegionType;
  errorMsg?: string | null;
};

export default function FerryFareResult({
  totalFare,
  before,
  after,
  useHighway,
  vehicle,
  region,
  errorMsg,
}: Props) {
  // エラー時の表示
  if (errorMsg) {
    return (
      <div style={{ color: "red", padding: 16, border: "1px solid red", borderRadius: 8 }}>
        エラー: {errorMsg}
      </div>
    );
  }

  // 完全な情報が揃っていない場合は非表示
  if (!totalFare || !before || !after) return null;

  return (
    <div style={{ border: "1px solid #000", borderRadius: 12, padding: 16, marginTop: 24, maxWidth: 650, fontSize: 14 }}>
      <h2 style={{ margin: 0, fontSize: 24 }}>
        基準運賃額
        <span style={{ marginLeft: "10mm", fontWeight: "bold", fontSize: 28 }}>
          ¥{totalFare.toLocaleString()}
        </span>
        <small style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
          （高速道路料金及び消費税を含みません）
        </small>
      </h2>

      <Section title="乗船前の運行" section={before} />
      <Section title="下船後の運行" section={after} />

      <h3 style={{ fontSize: 16, margin: "16px 0 4px 0" }}>◆計算の条件</h3>
      <dl style={dlStyle}>
        <dt style={dtStyle}>車種</dt>
        <dd style={ddStyle}>{vehicleLabel[vehicle]}</dd>

        <dt style={dtStyle}>届出：運輸局</dt>
        <dd style={ddStyle}>{region}運輸局</dd>

        <dt style={dtStyle}>高速道路利用</dt>
        <dd style={ddStyle}>{useHighway ? "利用する" : "利用しない"}</dd>
      </dl>
    </div>
  );
}

type SectionProps = {
  title: string;
  section: RouteSection;
};

function Section({ title, section }: SectionProps) {
  return (
    <>
      <h3 style={{ fontSize: 16, margin: "16px 0 4px 0" }}>◆{title}</h3>
      <dl style={dlStyle}>
        <dt style={dtStyle}>基準運賃額</dt>
        <dd style={ddStyle}>¥{section.fare.toLocaleString()}.-</dd>

        <dt style={dtStyle}>出発地の住所</dt>
        <dd style={ddStyle}>{section.originAddr}</dd>

        <dt style={dtStyle}>到着地の住所</dt>
        <dd style={ddStyle}>{section.destinationAddr}</dd>

        <dt style={dtStyle}>経路上の距離</dt>
        <dd style={ddStyle}>{section.rawKm.toFixed(1)}km</dd>

        <dt style={dtStyle}>運賃計算距離</dt>
        <dd style={ddStyle}>{section.roundedKm.toLocaleString()}km</dd>
      </dl>
    </>
  );
}

const dlStyle: React.CSSProperties = {
  margin: "4px 0 8px 0",
  lineHeight: 1.5,
  overflow: "hidden",
};

const dtStyle: React.CSSProperties = {
  float: "left",
  clear: "left",
  width: 120,
};

const ddStyle: React.CSSProperties = { marginLeft: 120 };
