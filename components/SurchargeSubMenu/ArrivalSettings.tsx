import React, { useState } from 'react';

type ArrivalSettingsProps = {
  waitingTimeEnabled: boolean;
  waitingTimeValue: string;
  unloadingWorkEnabled: boolean;
  unloadingWorkValue: string;
  onWaitingTimeChange: (enabled: boolean, value: string) => void;
  onUnloadingWorkChange: (enabled: boolean, value: string) => void;
  unloadingWorkType?: "machine" | "manual";
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  fontFamily: "sans-serif",
  padding: "12px 0",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: 4,
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
  marginRight: 16,
  display: "flex",
  alignItems: "center",
};

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

  return (
    <div style={containerStyle}>
      {/* 待機時間料 */}
      <div style={rowStyle}>
        <div style={itemLabelStyle}>待機時間料</div>
        <div style={radioContainerStyle}>
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
          <div>
            <input
              type="number"
              value={tempWaitingValue}
              onChange={(e) => setTempWaitingValue(e.target.value)}
            />
            <button onClick={() => onWaitingTimeChange(true, tempWaitingValue)}>確定</button>
          </div>
        )}
      </div>

      {/* 取卸料 */}
      <div style={rowStyle}>
        <div style={itemLabelStyle}>取卸料</div>
        <div style={radioContainerStyle}>
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
              checked={unloadingWorkEnabled}
              onChange={() => onUnloadingWorkChange(true, tempUnloadingValue)}
            />
            適用する
          </label>
        </div>
        {unloadingWorkEnabled && (
          <div>
            <input
              type="number"
              value={tempUnloadingValue}
              onChange={(e) => setTempUnloadingValue(e.target.value)}
            />
            <button onClick={() => onUnloadingWorkChange(true, tempUnloadingValue)}>確定</button>
          </div>
        )}
      </div>
    </div>
  );
};

export { ArrivalSettings };

{selectedMenu === "arrival" && (
  <ArrivalSettings
    waitingTimeEnabled={value.arrivalWaitingTimeEnabled}
    waitingTimeValue={value.arrivalWaitingTimeValue}
    unloadingWorkEnabled={value.arrivalUnloadingWorkEnabled}
    unloadingWorkValue={value.arrivalUnloadingWorkValue}
    onWaitingTimeChange={(enabled, value) => {
      onChange({
        ...value,
        arrivalWaitingTimeEnabled: enabled,
        arrivalWaitingTimeValue: value,
      });
    }}
    onUnloadingWorkChange={(enabled, value) => {
      onChange({
        ...value,
        arrivalUnloadingWorkEnabled: enabled,
        arrivalUnloadingWorkValue: value,
      });
    }}
  />
)}