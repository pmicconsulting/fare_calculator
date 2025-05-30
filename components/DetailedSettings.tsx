import React from "react";

export type DetailedSettingsState = {
  waitingTimeMin: number;
  fuelSurcharge: number;
  workCharge: boolean;
};

type Props = {
  value: DetailedSettingsState;
  onChange: (v: DetailedSettingsState) => void;
};

export function DetailedSettings({ value, onChange }: Props) {
  return (
    <fieldset style={{ marginTop: 16, border: "1px solid #aaa", borderRadius: 6, padding: 12 }}>
      <legend>追加料金設定</legend>
      <div style={{ marginBottom: 8 }}>
        <label>
          待機時間（分）:{" "}
          <input
            type="number"
            min={0}
            value={value.waitingTimeMin}
            onChange={e => onChange({ ...value, waitingTimeMin: Number(e.target.value) })}
            style={{ width: 60 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>
          燃料サーチャージ（円）:{" "}
          <input
            type="number"
            min={0}
            value={value.fuelSurcharge}
            onChange={e => onChange({ ...value, fuelSurcharge: Number(e.target.value) })}
            style={{ width: 80 }}
          />
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={value.workCharge}
            onChange={e => onChange({ ...value, workCharge: e.target.checked })}
          />
          作業料金（2,000円）を加算する
        </label>
      </div>
    </fieldset>
  );
}