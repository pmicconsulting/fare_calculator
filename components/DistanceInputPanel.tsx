import React from "react";
import AddressForm from "./AddressForm";
import ManualDistanceInput from "./ManualDistanceInput";
import FerryForm from "./FerryForm";

export default function DistanceInputPanel({
  vehicle,
  region,
  useHighway,
  fareOption,
  distanceMode,
  setDistanceMode,
  onFareResult,
}: any) {
  return (
    <div className="distance-panel">
      <div className="panel-group">
        <div className="panel-label">運行距離</div>
        <div className="distance-btn-row">
          <button
            className={`panel-btn ${distanceMode === "map" ? "selected" : ""}`}
            onClick={() => setDistanceMode("map")}
          >地図で計算</button>
          <button
            className={`panel-btn ${distanceMode === "address" ? "selected" : ""}`}
            onClick={() => setDistanceMode("address")}
          >住所で計算</button>
        </div>
        <div className="distance-btn-row">
          <button
            className={`panel-btn ${distanceMode === "manual" ? "selected" : ""}`}
            onClick={() => setDistanceMode("manual")}
          >運行距離を入力</button>
          <button
            className={`panel-btn ${distanceMode === "ferry" ? "selected" : ""}`}
            onClick={() => setDistanceMode("ferry")}
          >フェリー利用</button>
        </div>
      </div>
      {distanceMode === "address" && (
        <AddressForm
          vehicle={vehicle}
          region={region}
          useHighway={useHighway}
          fareOption={fareOption}
          onFareResult={onFareResult}
        />
      )}
      {distanceMode === "manual" && (
        <ManualDistanceInput
          vehicle={vehicle}
          region={region}
          useHighway={useHighway}
          fareOption={fareOption}
          onFareResult={onFareResult}
        />
      )}
      {distanceMode === "ferry" && (
        <FerryForm
          vehicle={vehicle}
          region={region}
          useHighway={useHighway}
          fareOption={fareOption}
          onFareResult={onFareResult}
        />
      )}
    </div>
  );
}