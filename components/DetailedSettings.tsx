// src/components/DetailedSettings.tsx
"use client";

import React, { useState, useEffect, ChangeEvent } from "react";

export interface DetailedSettingsState {
  // 出発時 待機時間料（積込・附帯作業含む）
  waitingApply: boolean;
  waitingHours: number;
  waitingMinutes: number;

  // 到着時 待機時間料
  arrivalWaitingApply: boolean;
  arrivalWaitingHours: number;
  arrivalWaitingMinutes: number;

  // 燃料サーチャージ
  fuelSurchargeApply: boolean;
  fuelSurchargeAmount: number;

  // 利用運送手数料
  transportFeeApply: boolean;
  transportFeeAmount: number;

  // 特殊車両割増
  specialVehicleApply: boolean;
  specialVehicleType: "tank" | "oil" | "";
  specialVehicleRate: number;

  // 休日割増
  holidayApply: boolean;
  holidayRate: number;

  // 深夜・早朝割増
  lateNightApply: boolean;
  lateNightRate: number;

  // 逓減割増
  taperingApply: boolean;
  taperingRate: number;

  // 長期契約割引
  longTermContractApply: boolean;
  longTermContractRate: number;

  // 往復割引
  roundTripApply: boolean;
  roundTripRate: number;
}

interface DetailedSettingsProps {
  value: DetailedSettingsState;
  onChange: (next: DetailedSettingsState) => void;
}

export const DetailedSettings: React.FC<DetailedSettingsProps> = ({
  value,
  onChange,
}) => {
  const [localState, setLocalState] = useState<DetailedSettingsState>(value);

  useEffect(() => {
    onChange(localState);
  }, [localState, onChange]);

  const handleCheckbox = (
    field: keyof DetailedSettingsState,
    checked: boolean
  ) => {
    setLocalState((prev) => ({ ...prev, [field]: checked }));
  };

  const handleNumber = (
    field: keyof DetailedSettingsState,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setLocalState((prev) => ({
      ...prev,
      [field]: parseInt(e.target.value, 10) || 0,
    }));
  };

  const handleSelect = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    setLocalState((prev) => ({
      ...prev,
      specialVehicleType: e.target.value as DetailedSettingsState["specialVehicleType"],
    }));
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 4 }}>
      {/* 出発時 待機時間料 */}
      <h4>出発時 待機時間料</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.waitingApply}
          onChange={(e) => handleCheckbox("waitingApply", e.target.checked)}
        />{" "}
        適用する
      </label>
      {localState.waitingApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.waitingHours}
            onChange={(e) => handleNumber("waitingHours", e)}
            style={{ width: 60 }}
          />{" "}
          時間
          <input
            type="number"
            min={0}
            max={59}
            value={localState.waitingMinutes}
            onChange={(e) => handleNumber("waitingMinutes", e)}
            style={{ width: 60, marginLeft: 8 }}
          />{" "}
          分
        </div>
      )}

      {/* 到着時 待機時間料 */}
      <h4 style={{ marginTop: 16 }}>到着時 待機時間料</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.arrivalWaitingApply}
          onChange={(e) =>
            handleCheckbox("arrivalWaitingApply", e.target.checked)
          }
        />{" "}
        適用する
      </label>
      {localState.arrivalWaitingApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.arrivalWaitingHours}
            onChange={(e) => handleNumber("arrivalWaitingHours", e)}
            style={{ width: 60 }}
          />{" "}
          時間
          <input
            type="number"
            min={0}
            max={59}
            value={localState.arrivalWaitingMinutes}
            onChange={(e) => handleNumber("arrivalWaitingMinutes", e)}
            style={{ width: 60, marginLeft: 8 }}
          />{" "}
          分
        </div>
      )}

      {/* 燃料サーチャージ */}
      <h4 style={{ marginTop: 16 }}>燃料サーチャージ</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.fuelSurchargeApply}
          onChange={(e) =>
            handleCheckbox("fuelSurchargeApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.fuelSurchargeApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.fuelSurchargeAmount}
            onChange={(e) => handleNumber("fuelSurchargeAmount", e)}
            style={{ width: 100 }}
          />{" "}
          円
        </div>
      )}

      {/* 利用運送手数料 */}
      <h4 style={{ marginTop: 16 }}>利用運送手数料</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.transportFeeApply}
          onChange={(e) =>
            handleCheckbox("transportFeeApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.transportFeeApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.transportFeeAmount}
            onChange={(e) => handleNumber("transportFeeAmount", e)}
            style={{ width: 100 }}
          />{" "}
          円
        </div>
      )}

      {/* 特殊車両割増 */}
      <h4 style={{ marginTop: 16 }}>特殊車両割増</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.specialVehicleApply}
          onChange={(e) =>
            handleCheckbox("specialVehicleApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.specialVehicleApply && (
        <div style={{ marginLeft: 16 }}>
          <select
            value={localState.specialVehicleType}
            onChange={handleSelect}
            style={{ marginRight: 8 }}
          >
            <option value="">選択</option>
            <option value="tank">タンク車</option>
            <option value="oil">石油製品輸送車</option>
          </select>
          <input
            type="number"
            min={0}
            value={localState.specialVehicleRate}
            onChange={(e) => handleNumber("specialVehicleRate", e)}
            style={{ width: 60 }}
          />{" "}
          ％
        </div>
      )}

      {/* 休日割増 */}
      <h4 style={{ marginTop: 16 }}>休日割増</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.holidayApply}
          onChange={(e) =>
            handleCheckbox("holidayApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.holidayApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.holidayRate}
            onChange={(e) => handleNumber("holidayRate", e)}
            style={{ width: 60 }}
          />{" "}
          ％
        </div>
      )}

      {/* 深夜・早朝割増 */}
      <h4 style={{ marginTop: 16 }}>深夜・早朝割増</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.lateNightApply}
          onChange={(e) =>
            handleCheckbox("lateNightApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.lateNightApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.lateNightRate}
            onChange={(e) => handleNumber("lateNightRate", e)}
            style={{ width: 60 }}
          />{" "}
          ％
        </div>
      )}

      {/* 逓減割増 */}
      <h4 style={{ marginTop: 16 }}>逓減割増</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.taperingApply}
          onChange={(e) =>
            handleCheckbox("taperingApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.taperingApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.taperingRate}
            onChange={(e) => handleNumber("taperingRate", e)}
            style={{ width: 60 }}
          />{" "}
          ％
        </div>
      )}

      {/* 長期契約割引 */}
      <h4 style={{ marginTop: 16 }}>長期契約割引</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.longTermContractApply}
          onChange={(e) =>
            handleCheckbox("longTermContractApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.longTermContractApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.longTermContractRate}
            onChange={(e) => handleNumber("longTermContractRate", e)}
            style={{ width: 60 }}
          />{" "}
          ％
        </div>
      )}

      {/* 往復割引 */}
      <h4 style={{ marginTop: 16 }}>往復割引</h4>
      <label>
        <input
          type="checkbox"
          checked={localState.roundTripApply}
          onChange={(e) =>
            handleCheckbox("roundTripApply", e.target.checked)
          }
        />{" "}
        設定する
      </label>
      {localState.roundTripApply && (
        <div style={{ marginLeft: 16 }}>
          <input
            type="number"
            min={0}
            value={localState.roundTripRate}
            onChange={(e) => handleNumber("roundTripRate", e)}
            style={{ width: 60 }}
          />{" "}
          ％
        </div>
      )}
    </div>
  );
};
