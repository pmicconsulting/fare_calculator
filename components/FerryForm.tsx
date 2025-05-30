import React, { useState } from "react";
import DynamicMap from "./DynamicMap";
import { useGeocoding } from "../hooks/useGeocoding";
import { useDirections } from "../hooks/useDirections";
import { useFareDatabase } from "../hooks/useFareDatabase";
import { roundDistance } from "../utils/roundDistance";

export default function FerryForm({ vehicle, region, useHighway, fareOption, onFareResult }: any) {
  const [from, setFrom] = useState("");
  const [port1, setPort1] = useState(""); // 乗船港
  const [port2, setPort2] = useState(""); // 下船港
  const [to, setTo] = useState("");
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalc = async () => {
    setLoading(true);
    try {
      const addresses = [from, port1, port2, to];
      const geocodes = await useGeocoding().multiGeocode(addresses);
      if (geocodes.some(g => !g)) throw new Error("ジオコーディング失敗");
      const dir1 = await useDirections().getRoute({
        origin: geocodes[0], destination: geocodes[1], waypoints: undefined, avoidHighways: !useHighway, avoidFerries: true,
      });
      const dir2 = await useDirections().getRoute({
        origin: geocodes[2], destination: geocodes[3], waypoints: undefined, avoidHighways: !useHighway, avoidFerries: true,
      });
      const dist1 = dir1.routes[0].legs.reduce((sum: number, l: any) => sum + l.distance.value, 0) / 1000;
      const dist2 = dir2.routes[0].legs.reduce((sum: number, l: any) => sum + l.distance.value, 0) / 1000;
      const rounded1 = roundDistance(dist1);
      const rounded2 = roundDistance(dist2);
      const fare1 = await useFareDatabase().getFare({
        vehicle, region, useHighway, distance: rounded1, fareOption,
      });
      const fare2 = await useFareDatabase().getFare({
        vehicle, region, useHighway, distance: rounded2, fareOption,
      });
      setMapData({ dir1, dir2, geocodes });
      onFareResult({
        totalFare: fare1.fare + fare2.fare,
        section1: {
          fare: fare1.fare,
          from, port: port1,
          to: port2,
          rawKm: dist1,
          roundedKm: rounded1,
        },
        section2: {
          fare: fare2.fare,
          from: port2, port: port2,
          to,
          rawKm: dist2,
          roundedKm: rounded2,
        }
      });
    } catch (e: any) {
      onFareResult(null, e.message || "計算失敗");
    }
    setLoading(false);
  };

  return (
    <div className="ferry-form">
      <div className="address-row">
        <span className="address-label">出発地</span>
        <input value={from} onChange={e => setFrom(e.target.value)} placeholder='「住所」又は「市町村＋事業所名」を入力' />
      </div>
      <div className="address-row">
        <span className="address-label">乗船する港名</span>
        <input value={port1} onChange={e => setPort1(e.target.value)} placeholder='港名（例：志布志港）を入力' />
      </div>
      <div className="address-row">
        <span className="address-label">下船する港名</span>
        <input value={port2} onChange={e => setPort2(e.target.value)} placeholder='港名（例：大阪南港）を入力' />
      </div>
      <div className="address-row">
        <span className="address-label">到着地</span>
        <input value={to} onChange={e => setTo(e.target.value)} placeholder='「住所」又は「市町村＋事業所名」を入力' />
      </div>
      <button className="calc-btn" onClick={handleCalc} disabled={loading}>標準的運賃の計算</button>
      {mapData && <DynamicMap directions={null} geocodes={mapData.geocodes} dir1={mapData.dir1} dir2={mapData.dir2} ferry />}
    </div>
  );
}