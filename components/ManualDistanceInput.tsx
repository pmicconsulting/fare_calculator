import React, { useState } from "react";
import { roundDistance } from "../utils/roundDistance";
import { useFareDatabase } from "../hooks/useFareDatabase";

export default function ManualDistanceInput({ vehicle, region, useHighway, fareOption, onFareResult }: any) {
  const [value, setValue] = useState("");
  const [fixed, setFixed] = useState<string | null>(null);

  const handleClick = async () => {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      onFareResult(null, "数値を正しく入力してください");
      return;
    }
    const num = Number(value);
    const rounded = roundDistance(num);
    const fareData = await useFareDatabase().getFare({
      vehicle, region, useHighway, distance: rounded, fareOption,
    });
    setFixed(value);
    onFareResult({
      fare: fareData.fare,
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