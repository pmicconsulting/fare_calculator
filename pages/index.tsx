import React, { useState } from "react";
import TopPanel from "../components/TopPanel";
import MapArea from "../components/MapArea";
import FareResult from "../components/FareResult";

export type VehicleType = "small" | "medium" | "large" | "trailer";
export type RegionType =
  | "北海道"
  | "東北"
  | "関東"
  | "北陸信越"
  | "中部"
  | "近畿"
  | "中国"
  | "四国"
  | "九州"
  | "沖縄";
export type DistanceType = "map" | "address" | "manual" | "ferry";
export type TollType = "apply" | "not_apply";

export default function Home() {
  // 初期値は要件準拠
  const [vehicle, setVehicle] = useState<VehicleType>("large");
  const [region, setRegion] = useState<RegionType>("関東");
  const [distanceType, setDistanceType] = useState<DistanceType>("map");
  const [useHighway, setUseHighway] = useState<boolean>(true);
  const [toll, setToll] = useState<TollType>("not_apply");

  // 距離・住所等の条件
  const [originAddr, setOriginAddr] = useState("");
  const [destinationAddr, setDestinationAddr] = useState("");
  const [rawKm, setRawKm] = useState<number | null>(null);
  const [roundedKm, setRoundedKm] = useState<number | null>(null);

  // 運賃計算結果
  const [fare, setFare] = useState<number | null>(null);

  // 運賃計算処理（ダミー処理、実際はAPI等へ接続）
  const handleCalcFare = () => {
    // ダミー計算: 距離×100+車種補正
    let distance = roundedKm ?? rawKm ?? 0;
    let factor = vehicle === "small" ? 1 : vehicle === "medium" ? 1.1 : vehicle === "large" ? 1.2 : 1.3;
    setFare(Math.round(distance * 100 * factor));
  };

  // MapAreaコールバックで距離・住所を設定
  const handleMapResult = (result: {
    originAddr: string;
    destinationAddr: string;
    rawKm: number | null;
    roundedKm: number | null;
  }) => {
    setOriginAddr(result.originAddr);
    setDestinationAddr(result.destinationAddr);
    setRawKm(result.rawKm);
    setRoundedKm(result.roundedKm);
  };

  return (
    <div className="main-container">
      <div className="left-panel">
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
        />
      </div>
      <div className="right-panel">
        <MapArea
          distanceType={distanceType}
          originAddr={originAddr}
          destinationAddr={destinationAddr}
          setOriginAddr={setOriginAddr}
          setDestinationAddr={setDestinationAddr}
          setRawKm={setRawKm}
          setRoundedKm={setRoundedKm}
          onMapResult={handleMapResult}
        />
        {/* 中央の運賃計算ボタンは削除済み */}
        <FareResult
          fare={fare}
          originAddr={originAddr}
          destinationAddr={destinationAddr}
          rawKm={rawKm}
          roundedKm={roundedKm}
          useHighway={useHighway}
          vehicle={vehicle}
          region={region}
        />
      </div>
    </div>
  );
}