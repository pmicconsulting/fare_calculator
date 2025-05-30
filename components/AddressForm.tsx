import React, { useState } from "react";
import DynamicMap from "./DynamicMap";
import { useGeocoding } from "../hooks/useGeocoding";
import { useDirections } from "../hooks/useDirections";
import { useFareDatabase } from "../hooks/useFareDatabase";
import { roundDistance } from "../utils/roundDistance";

export default function AddressForm({ vehicle, region, useHighway, fareOption, onFareResult }: any) {
  const [from, setFrom] = useState("");
  const [tos, setTos] = useState<string[]>([""]);
  const [to, setTo] = useState("");
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addVia = () => tos.length < 5 && setTos([...tos, ""]);
  const removeVia = (idx: number) => tos.length > 1 && setTos(tos.filter((_, i) => i !== idx));
  const updateVia = (idx: number, val: string) => setTos(tos.map((v, i) => i === idx ? val : v));

  const handleCalc = async () => {
    setLoading(true);
    try {
      const addresses = [from, ...tos, to];
      const geocodes = await useGeocoding().multiGeocode(addresses);
      if (geocodes.some(g => !g)) throw new Error("ジオコーディング失敗");
      const origin = geocodes[0];
      const destination = geocodes[geocodes.length - 1];
      const waypoints = geocodes.slice(1, -1).map((g: any) => ({ location: g, stopover: true }));
      const directions = await useDirections().getRoute({
        origin, destination, waypoints, avoidHighways: !useHighway, avoidFerries: true,
      });
      const distM = directions.routes[0].legs.reduce((sum: number, l: any) => sum + l.distance.value, 0);
      const distKm = distM / 1000;
      const rounded = roundDistance(distKm);
      const fareData = await useFareDatabase().getFare({
        vehicle, region, useHighway, distance: rounded, fareOption,
      });
      setMapData({ geocodes, directions });
      onFareResult({
        fare: fareData.fare,
        originAddr: directions.routes[0].legs[0].start_address,
        destinationAddr: directions.routes[0].legs.slice(-1)[0].end_address,
        rawKm: distKm,
        roundedKm: rounded,
      });
    } catch (e: any) {
      onFareResult(null, e.message || "計算失敗");
    }
    setLoading(false);
  };

  return (
    <div className="address-form">
      <div className="address-row">
        <span className="address-label">出発地</span>
        <input value={from} onChange={e => setFrom(e.target.value)} placeholder='「住所」又は「市町村＋事業所名」を入力' />
      </div>
      {tos.map((v, i) => (
        <div className="address-row" key={i}>
          <span className="address-label">経由地</span>
          <input value={v} onChange={e => updateVia(i, e.target.value)} placeholder='「住所」又は「市町村＋事業所名」を入力' />
          <button onClick={() => removeVia(i)} disabled={tos.length === 1}>－</button>
          {i === tos.length - 1 && tos.length < 5 && <button onClick={addVia}>＋</button>}
        </div>
      ))}
      <div className="address-row">
        <span className="address-label">到着地</span>
        <input value={to} onChange={e => setTo(e.target.value)} placeholder='「住所」又は「市町村＋事業所名」を入力' />
      </div>
      <button className="calc-btn" onClick={handleCalc} disabled={loading}>標準的運賃の計算</button>
      {mapData && <DynamicMap directions={mapData.directions} geocodes={mapData.geocodes} />}
    </div>
  );
}