import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useGeocoding } from "../hooks/useGeocoding";
import { useDirections } from "../hooks/useDirections";
import { supabase } from "../lib/supabaseClient";
import { roundDistance } from "../lib/fareUtils";

type Props = {
  vehicle: string;
  region: string;
  useHighway: boolean;
  from: string;
  setFrom: (v: string) => void;
  tos: string[];
  setTos: (v: string[]) => void;
  to: string;
  setTo: (v: string) => void;
  distanceType: string;
  onFareResult: (
    result: {
      fare: number | null;
      originAddr: string;
      destinationAddr: string;
      rawKm: number;
      roundedKm: number;
    } | null,
    errorMsg?: string
  ) => void;
};

const regionMap: Record<string, number> = {
  北海道: 1, 東北: 2, 関東: 3, 北陸信越: 4, 中部: 5,
  近畿: 6, 中国: 7, 四国: 8, 九州: 9, 沖縄: 10,
};
const vehicleMap: Record<string, number> = {
  small: 1, medium: 2, large: 3, trailer: 4,
};

const AddressForm = forwardRef((props: Props, ref) => {
  const {
    vehicle, region, useHighway,
    from, setFrom, tos, setTos, to, setTo,
    distanceType, onFareResult
  } = props;
  const [loading, setLoading] = useState(false);

  const geocoding = useGeocoding();
  const directionsService = useDirections();

  const addVia = () => {
    if (tos.length < 5) setTos([...tos, ""]);
  };
  const removeVia = (idx: number) => {
    if (tos.length > 1) setTos(tos.filter((_, i) => i !== idx));
  };
  const updateVia = (idx: number, val: string) => {
    setTos(tos.map((v, i) => (i === idx ? val : v)));
  };

  const handleCalc = async () => {
    setLoading(true);
    try {
      const addresses = [from, ...tos.filter(t => t.trim() !== ""), to];
      const geocodes = await geocoding.multiGeocode(addresses);
      if (geocodes.some(g => !g)) throw new Error("住所等を再度ご確認ください");
      const origin = geocodes[0];
      const destination = geocodes[geocodes.length - 1];
      const waypoints = geocodes.slice(1, -1).map((g: any) => ({ location: g, stopover: true }));
      const directions = await directionsService.getRoute({
        origin,
        destination,
        waypoints,
        avoidHighways: !useHighway,
        avoidFerries: true,
      });
      if (!directions.routes.length) throw new Error("経路が見つかりませんでした");
      const distM = directions.routes[0].legs.reduce((sum: number, l: any) => sum + l.distance.value, 0);
      const distKm = distM / 1000;
      const rounded = roundDistance(distKm, region);

      const regionCode = regionMap[region];
      const vehicleCode = vehicleMap[vehicle];
      if (!regionCode || !vehicleCode) {
        onFareResult(null, "地域または車種の指定が不正です");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("fare_rates")
        .select("fare_yen")
        .eq("region_code", regionCode)
        .eq("vehicle_code", vehicleCode)
        .eq("upto_km", rounded)
        .maybeSingle();

      if (error || !data) {
        onFareResult(null, "運賃データが見つかりません");
        setLoading(false);
        return;
      }

      onFareResult({
        fare: data.fare_yen,
        originAddr: directions.routes[0].legs[0].start_address.replace(/^日本、,?\s*/, ""),
        destinationAddr: directions.routes[0].legs.slice(-1)[0].end_address.replace(/^日本、,?\s*/, ""),
        rawKm: distKm,
        roundedKm: rounded,
      });
    } catch (e: any) {
      onFareResult(null, e.message || "計算失敗");
    }
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({
    calc: handleCalc
  }));

  if (distanceType !== "address") return null;

  return (
    <div className="address-form">
      <div className="address-row">
        <span
          className="address-label"
          style={{
            minWidth: 70,
            background: "#7B1FA2", // 変更：パープルに変更
            color: "#fff",
            borderRadius: 6,
            textAlign: "center",
            padding: "10px 0",
            fontWeight: "bold",
            fontSize: 15,
            height: 35, // 変更：高さを25pxに調整
          }}
        >
          出発地
        </span>
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="「住所」又は「市町村＋事業所名」を入力"
          style={{
            marginLeft: 20,
            width: 350, // FerryFormと同じ幅
            height: 35, // 変更：高さを25pxに調整
            fontSize: 15,
            borderRadius: 6,
            border: "2px solid #bbb",
            padding: "0 12px",
          }}
          disabled={loading}
        />
      </div>
      {tos.map((v, i) => (
        <div className="address-row" key={i}>
          <span
            className="address-label"
            style={{
              minWidth: 70,
              background: "#7B1FA2",
              color: "#fff",
              borderRadius: 6,
              textAlign: "center",
              padding: "10px 0",
              fontWeight: "bold",
              fontSize: 15,
              height: 35, // 追加：高さを35pxに統一
            }}
          >
            経由地
          </span>
          <input
            value={v}
            onChange={(e) => updateVia(i, e.target.value)}
            placeholder="「住所」又は「市町村＋事業所名」を入力"
            style={{
              marginLeft: 20,
              width: 350, // FerryFormと同じ幅
              height: 35, // FerryFormと同じ高さ
              fontSize: 15,
              borderRadius: 6,
              border: "2px solid #bbb",
              padding: "0 12px",
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => removeVia(i)}
            disabled={tos.length === 1 || loading}
            style={{
    marginLeft: 1,
    padding: 0,
    width: 30,        // 幅を固定
    height: 30,       // 高さを固定
    fontSize: 15,
    borderRadius: "50%",  // 円形にする
    border: "2px solid #dc3545",  // 赤色の枠
    background: "#dc3545",        // 赤色の背景
    color: "#fff",                // 白色の文字
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
            }}
          >
            －
          </button>
          {i === tos.length - 1 && tos.length < 5 && (
            <button
              type="button"
              onClick={addVia}
              disabled={loading}
              style={{
    marginLeft: 1,
    padding: 0,
    width: 30,        // 幅を固定
    height: 30,       // 高さを固定
    fontSize: 15,
    borderRadius: "50%",  // 円形にする
    border: "2px solid #007bff",  // 青色に変更
    background: "#007bff",        // 青色に変更
    color: "#fff",                // 白色の文字
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
              }}
            >
              ＋
            </button>
          )}
        </div>
      ))}
      <div className="address-row">
        <span
          className="address-label"
          style={{
            minWidth: 70,
            background: "#8B5CF6",
            color: "#fff",
            borderRadius: 6,
            textAlign: "center",
            padding: "10px 0",
            fontWeight: "bold",
            fontSize: 15,
            height: 35, // 追加：高さを35pxに統一
          }}
        >
          到着地
        </span>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="「住所」又は「市町村＋事業所名」を入力"
          style={{
            marginLeft: 20,
            width: 350, // FerryFormと同じ幅
            height: 35, // FerryFormと同じ高さ
            fontSize: 15,
            borderRadius: 6,
            border: "2px solid #bbb",
            padding: "0 12px",
          }}
          disabled={loading}
        />
      </div>
    </div>
  );
});

AddressForm.displayName = "AddressForm";

export default AddressForm;