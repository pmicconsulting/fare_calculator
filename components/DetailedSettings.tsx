// components/DetailedSettings.tsx
import React from "react";

export interface DetailedSettingsProps {
  // 親コンポーネントへ渡すコールバック
  onChange: (settings: DetailedSettingsState) => void;
}

export type DetailedSettingsState = {
  waitingTimeMin: number;
  fuelSurcharge: number;
  workCharge: boolean;
  // …必要に応じて他の設定項目を追加
};

export const DetailedSettings: React.FC<DetailedSettingsProps> = ({ onChange }) => {
  const [waitingTimeMin, setWaitingTimeMin] = React.useState(0);
  const [fuelSurcharge, setFuelSurcharge] = React.useState(0);
  const [workCharge, setWorkCharge] = React.useState(false);

  React.useEffect(() => {
    onChange({ waitingTimeMin, fuelSurcharge, workCharge });
  }, [waitingTimeMin, fuelSurcharge, workCharge, onChange]);

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginTop:24 }}>
      <h3>詳細な条件設定</h3>
      <label>
        待機時間（分）：
        <input
          type="number"
          value={waitingTimeMin}
          onChange={e => setWaitingTimeMin(+e.target.value)}
        />
      </label>
      <br/>
      <label>
        燃料サーチャージ（円）：
        <input
          type="number"
          value={fuelSurcharge}
          onChange={e => setFuelSurcharge(+e.target.value)}
        />
      </label>
      <br/>
      <label>
        作業料金を含む
        <input
          type="checkbox"
          checked={workCharge}
          onChange={e => setWorkCharge(e.target.checked)}
        />
      </label>
      {/* 他の項目も同様に追加 */}
    </div>
  );
};
