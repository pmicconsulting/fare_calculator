import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../utils/fareUtils";
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

  // 全角→半角変換関数
  const toHalfWidth = (str: string): string => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  // 入力値の検証関数（1〜2000の整数）
  const isValidDistance = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= 2000 && value === num.toString();
  };

  const handleClick = async () => {
    if (!isValidDistance(value)) {
      onFareResult(null, "1〜2000の整数を入力してください");
      return;
    }
    const num = Number(value);
    const rounded = roundDistance(num, region);

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
    const rawValue = e.target.value;
    // 全角→半角変換
    const halfWidthValue = toHalfWidth(rawValue);
    // 小数点を含む場合は整数部分のみ取得、数字以外を除去
    const numericValue = halfWidthValue.split('.')[0].replace(/[^0-9]/g, '');
    setValue(numericValue);
  };

  const getButtonColor = () => {
    if (value.trim() === "") {
      return "#ccc"; // グレー（入力が空の場合）
    }
    if (value === lastConfirmedValue) {
      return "#28a745"; // 緑色（確定された値と一致する場合）
    }
    if (isValidDistance(value)) {
      return "#ff0000"; // 赤色（有効な値が入力された場合）
    }
    return "#ccc"; // グレー（無効な値の場合）
  };

  const getButtonText = () => {
    if (value.trim() === "") {
      return "無効"; // 空欄時
    }
    if (!isValidDistance(value)) {
      return "無効"; // 範囲外の値
    }
    if (value === lastConfirmedValue) {
      return "確定済"; // 緑色ボタンの文字
    }
    return "確定"; // 赤色ボタンの文字
  };

  const isButtonDisabled = () => {
    return value.trim() === "" || !isValidDistance(value);
  };

  return (
    <div className="manual-distance-input" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span className="manual-label" style={{
        minWidth: 100,
        background: "#7B1FA2", // 変更：パープルに変更
        color: "#fff", // 白色文字
        borderRadius: 8, // 角丸を強調
        textAlign: "center",
        padding: "16px 0", // ラベルの内側余白
        fontWeight: "bold",
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 25, // 変更：高さを25pxに調整
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
        maxLength={4}
        style={{
          width: 100, // 入力枠の幅
          height: 32, // 変更：高さを25pxに調整
          fontSize: 15,
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
        disabled={isButtonDisabled()}
        style={{
          padding: "8px 16px", // ボタンの内側余白
          fontSize: 15,
          borderRadius: 8, // ボタンの角丸
          border: "2px solid #999", // ボタンの枠線
          background: getButtonColor(), // ボタンの色を動的に変更
          color: isButtonDisabled() ? "#666" : "#fff", // ボタンの文字色
          cursor: isButtonDisabled() ? "not-allowed" : "pointer",
          height: 32, // ボタンの高さ
          minWidth: 80, // ボタンの最小幅
          opacity: isButtonDisabled() ? 0.6 : 1,
          transition: "all 0.3s ease",
        }}
      >
        {getButtonText()} {/* ボタンの文字を動的に変更 */}
      </button>
    </div>
  );
}