import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../utils/fareUtils";          // ← 丸め処理を統一
import { regionMap, vehicleMap, RegionType, VehicleType } from "../lib/codeMaps";

export default function ManualDistanceInput({
  vehicle,
  region,
  onFareResult
}: {
  vehicle: VehicleType;
  region: RegionType;
  onFareResult: (
    res: {
      fare: number;
      originAddr: string;
      destinationAddr: string;
      rawKm: number;
      roundedKm: number;
    } | null,
    err?: string
  ) => void;
}) {
  const [value, setValue] = useState("");

  const handleClick = async () => {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      onFareResult(null, "数値を正しく入力してください");
      return;
    }
    const num      = Number(value);
    const rounded  = roundDistance(num, region); // ← 地域別で端数処理

    // コード化
    const regionCode  = regionMap[region];
    const vehicleCode = vehicleMap[vehicle];

    // Supabase へクエリ（他画面と完全同一条件）
    const { data, error } = await supabase
      .from("fare_rates")
      .select("fare_yen")
      .eq("region_code", regionCode)
      .eq("vehicle_code", vehicleCode)
      .eq("upto_km", rounded)
      .maybeSingle();

    if (error || !data) {
      console.error("運賃データ取得失敗", error);
      onFareResult(null, "運賃データが見つかりません");
      return;
    }

    onFareResult({
      fare: data.fare_yen,
      originAddr: "",
      destinationAddr: "",
      rawKm: num,
      roundedKm: rounded,
    });
  };

  return (
    <div className="manual-distance-input">
      <span className="manual-label">運行距離</span>
      <input
        value={value}
        onChange={e => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="km"
        type="text"
      />
      <span>km</span>
      <button className="confirm-btn" onClick={handleClick}>確定</button>
    </div>
  );
}