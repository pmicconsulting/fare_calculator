import React from "react";
import AddressForm from "./AddressForm";
import { VehicleType, RegionType, DistanceType, TollType } from "../pages/index";
import { DetailedSettings, DetailedSettingsState } from "./DetailedSettings"; // 追加

type Props = {
  vehicle: VehicleType;
  setVehicle: (v: VehicleType) => void;
  region: RegionType;
  setRegion: (r: RegionType) => void;
  distanceType: DistanceType;
  setDistanceType: (d: DistanceType) => void;
  useHighway: boolean;
  setUseHighway: (b: boolean) => void;
  toll: TollType;
  setToll: (t: TollType) => void;
  onCalcFare: () => void;
  from: string;
  setFrom: (v: string) => void;
  tos: string[];
  setTos: (v: string[]) => void;
  to: string;
  setTo: (v: string) => void;
  detailedSettingsEnabled: boolean; // 追加
  setDetailedSettingsEnabled: (enabled: boolean) => void; // 追加
  detailedSettings: DetailedSettingsState; // 追加
  setDetailedSettings: (v: DetailedSettingsState) => void; // 追加
};

const VEHICLE_LABELS: { value: VehicleType; label: string }[] = [
  { value: "small", label: "小型車(2tクラス)" },
  { value: "medium", label: "中型車(4tクラス)" },
  { value: "large", label: "大型車(10tクラス)" },
  { value: "trailer", label: "トレーラー(20tクラス)" },
];
const REGIONS: RegionType[] = [
  "北海道", "東北", "関東", "北陸信越", "中部",
  "近畿", "中国", "四国", "九州", "沖縄"
];

const DISTANCE_TYPE_LABELS: { value: DistanceType; label: string }[] = [
  { value: "map", label: "地図で計算" },
  { value: "address", label: "住所で計算" },
  { value: "manual", label: "運行距離を入力" },
  { value: "ferry", label: "フェリー利用" },
];

export default function TopPanel(props: Props) {
  const {
    vehicle, setVehicle,
    region, setRegion,
    distanceType, setDistanceType,
    useHighway, setUseHighway,
    toll, setToll,
    onCalcFare,
    from, setFrom, tos, setTos, to, setTo,
    detailedSettingsEnabled, setDetailedSettingsEnabled, detailedSettings, setDetailedSettings,
  } = props;

  return (
    <div className="panel-group">
      {/* 最上段 運賃計算ボタン */}
      <button className="calc-main-btn" onClick={onCalcFare}>
        標準的運賃の計算
      </button>
      {/* 車種 2列4ボタン */}
      <div className="panel-section">
        <div className="panel-label">車種</div>
        <div className="vehicle-btns grid-2col">
          {VEHICLE_LABELS.map((v) => (
            <button
              key={v.value}
              className={`panel-btn${vehicle === v.value ? " selected" : ""}`}
              onClick={() => setVehicle(v.value)}
              type="button"
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      {/* 運輸局 2列10個 */}
      <div className="panel-section">
        <div className="panel-label">運輸局</div>
        <div className="region-grid">
          {REGIONS.map((r) => (
            <button
              key={r}
              className={`panel-btn region-btn${region === r ? " selected" : ""}`}
              onClick={() => setRegion(r)}
              type="button"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {/* 運行距離 2列4ボタン */}
      <div className="panel-section">
        <div className="panel-label">運行距離</div>
        <div className="distance-type-btns grid-2col">
          {DISTANCE_TYPE_LABELS.map((d) => (
            <button
              key={d.value}
              className={`panel-btn distance-type-btn${distanceType === d.value ? " selected" : ""}`}
              onClick={() => setDistanceType(d.value)}
              type="button"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      {/* 高速道路 2列2ボタン */}
      <div className="panel-section">
        <div className="panel-label">高速道路</div>
        <div className="highway-btns grid-2col">
          <button
            className={`panel-btn${useHighway ? " selected" : ""}`}
            onClick={() => setUseHighway(true)}
            type="button"
          >
            利用する
          </button>
          <button
            className={`panel-btn${!useHighway ? " selected" : ""}`}
            onClick={() => setUseHighway(false)}
            type="button"
          >
            利用しない
          </button>
        </div>
      </div>
      {/* 料金・実費 2列2ボタン */}
      <div className="panel-section">
        <div className="panel-label">料金・実費</div>
        <div className="toll-btns grid-2col">
          <button
            className={`panel-btn${toll === "apply" ? " selected" : ""}`}
            onClick={() => {
              setToll("apply");
              setDetailedSettingsEnabled(true); // 詳細設定画面を表示
            }}
            type="button"
          >
            適用する
          </button>
          <button
            className={`panel-btn${toll === "not_apply" ? " selected" : ""}`}
            onClick={() => {
              setToll("not_apply");
              setDetailedSettingsEnabled(false); // 詳細設定画面を非表示
            }}
            type="button"
          >
            適用しない
          </button>
        </div>
      </div>
      {/* 住所で距離フォーム */}
    </div>
  );
}