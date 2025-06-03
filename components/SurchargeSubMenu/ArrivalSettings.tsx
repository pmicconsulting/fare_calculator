import React, { useState } from 'react';

interface ArrivalSettingsProps {
  waitingTimeEnabled: boolean;
  waitingTimeValue: string;
  unloadingWorkEnabled: boolean;
  unloadingWorkValue: string;
  onWaitingTimeChange: (enabled: boolean, value: string) => void;
  onUnloadingWorkChange: (enabled: boolean, value: string) => void;
  unloadingWorkType?: "machine" | "manual";
}

const ArrivalSettings: React.FC<ArrivalSettingsProps> = ({
  waitingTimeEnabled,
  waitingTimeValue,
  unloadingWorkEnabled,
  unloadingWorkValue,
  onWaitingTimeChange,
  onUnloadingWorkChange,
  unloadingWorkType,
}) => {
  const [tempWaitingValue, setTempWaitingValue] = useState(waitingTimeValue);
  const [tempUnloadingValue, setTempUnloadingValue] = useState(unloadingWorkValue);
  const [unloadingType, setUnloadingType] = useState(unloadingWorkType || "machine");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* 待機時間料 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ ...itemLabelStyle }}>待機時間料</div>
        <div style={{ ...radioContainerStyle }}>
          <label>
            <input
              type="radio"
              checked={!waitingTimeEnabled}
              onChange={() => onWaitingTimeChange(false, "")}
            />
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={waitingTimeEnabled}
              onChange={() => onWaitingTimeChange(true, tempWaitingValue)}
            />
            適用する
          </label>
        </div>
        {waitingTimeEnabled && (
          <>
            <input
              type="number"
              value={tempWaitingValue}
              onChange={(e) => setTempWaitingValue(e.target.value)}
              style={{ width: '60px' }}
              placeholder="分"
            />
            <button onClick={() => onWaitingTimeChange(true, tempWaitingValue)}>確定</button>
          </>
        )}
      </div>

      {/* 取卸料 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ ...itemLabelStyle }}>取卸料</div>
        <div style={{ ...radioContainerStyle }}>
          <label>
            <input
              type="radio"
              checked={!unloadingWorkEnabled}
              onChange={() => onUnloadingWorkChange(false, "")}
            />
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={unloadingWorkEnabled && unloadingType === "machine"}
              onChange={() => {
                setUnloadingType("machine");
                onUnloadingWorkChange(true, tempUnloadingValue);
              }}
            />
            適用する → 機械荷役
          </label>
          <label>
            <input
              type="radio"
              checked={unloadingWorkEnabled && unloadingType === "manual"}
              onChange={() => {
                setUnloadingType("manual");
                onUnloadingWorkChange(true, tempUnloadingValue);
              }}
            />
            適用する → 手荷役
          </label>
        </div>
        {unloadingWorkEnabled && (
          <>
            <input
              type="number"
              value={tempUnloadingValue}
              onChange={(e) => setTempUnloadingValue(e.target.value)}
              style={{ width: '60px' }}
              placeholder="分"
            />
            <button onClick={() => onUnloadingWorkChange(true, tempUnloadingValue)}>確定</button>
          </>
        )}
      </div>

    </div>
  );
};

const itemLabelStyle: React.CSSProperties = {
  background: "#f8d7da",
  color: "#b94a48",
  border: "1.5px solid #b94a48",
  borderRadius: 4,
  fontWeight: "bold",
  fontSize: 18,
  minWidth: 140,
  padding: "8px 16px",
  marginRight: 24,
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const radioContainerStyle: React.CSSProperties = {
  border: "1.5px solid #b94a48",
  borderRadius: 4,
  background: "#fff",
  width: 200,
  height: 80,
  padding: "0 8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
};

export { ArrivalSettings };
