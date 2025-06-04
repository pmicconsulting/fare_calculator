import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../utils/fareUtils"; // ← 丸め処理を統一
import { regionMap, vehicleMap, RegionType, VehicleType } from "../lib/codeMaps";

export default function ManualDistanceInput({
  vehicle,
  region,
  onFareResult,
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
  const [lastConfirmedValue, setLastConfirmedValue] = useState(""); // 確定された値

  const handleClick = async () => {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      onFareResult(null, "数値を正しく入力してください");
      return;
    }
    const num = Number(value);
    const rounded = roundDistance(num, region); // ← 地域別で端数処理

    // コード化
    const regionCode = regionMap[region];
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

    setLastConfirmedValue(value); // 確定された値を保存
    onFareResult({
      fare: data.fare_yen,
      originAddr: "",
      destinationAddr: "",
      rawKm: num,
      roundedKm: rounded,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9.]/g, ""); // 数字以外を除去
    setValue(newValue);
  };

  const getButtonColor = () => {
    if (value.trim() === "") {
      return "#28a745"; // 緑色（入力が空の場合）
    }
    if (value === lastConfirmedValue) {
      return "#28a745"; // 緑色（確定された値と一致する場合）
    }
    return "#ff0000"; // 赤色（異なる値が入力された場合）
  };

  const getButtonText = () => {
    if (value.trim() === "" || value === lastConfirmedValue) {
      return "確定済"; // 緑色ボタンの文字
    }
    return "確定"; // 赤色ボタンの文字
  };

  return (
    <div className="manual-distance-input" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span className="manual-label" style={{
        minWidth: 140,
        background: "#28a745", // 緑色背景
        color: "#fff", // 白色文字
        borderRadius: 8, // 角丸を強調
        textAlign: "center",
        padding: "16px 0", // ラベルの内側余白
        fontWeight: "bold",
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 56, // ラベルの高さ
        boxSizing: "border-box",
      }}>
        運行距離
      </span>
      <input
        className="manual-input"
        value={value}
        onChange={handleChange}
        placeholder="運行距離"
        type="text"
        style={{
          width: 200, // 入力枠の幅
          height: 56, // 入力枠の高さ
          fontSize: 25,
          borderRadius: 10, // 入力枠の角丸
          border: "3px solid #999", // 入力枠の太さと色
          padding: "0 16px", // 内側余白
          boxSizing: "border-box",
          transition: "border-color 0.2s", // 枠線の色変更のアニメーション
        }}
      />
      <span style={{ fontSize: 15 }}>km</span>
      <button
        className="manual-btn"
        onClick={handleClick}
        style={{
          padding: "8px 16px", // ボタンの内側余白
          fontSize: 15,
          borderRadius: 8, // ボタンの角丸
          border: "2px solid #999", // ボタンの枠線
          background: getButtonColor(), // ボタンの色を動的に変更
          color: "#fff", // ボタンの文字色
          cursor: "pointer",
          height: 40, // ボタンの高さ
          minWidth: 80, // ボタンの最小幅
        }}
      >
        {getButtonText()} {/* ボタンの文字を動的に変更 */}
      </button>
    </div>
  );
}