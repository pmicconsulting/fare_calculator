import React from "react";

type DepartureSettingsProps = {
  waitingTimeEnabled: boolean;
  waitingTimeValue: string;
  loadingWorkEnabled: boolean;
  loadingWorkValue: string;
  onWaitingTimeChange: (enabled: boolean, value: string) => void;
  onLoadingWorkChange: (enabled: boolean, value: string) => void;
  loadingWorkType?: "machine" | "manual";  // 追加
};

// スタイルの修正
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  fontFamily: "sans-serif",
  padding: "12px 0",
};

const labelColStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "stretch",
  marginRight: 8,
};

const mainLabelStyle: React.CSSProperties = {
  writingMode: "vertical-rl",
  background: "#b94a48",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 20,
  borderRadius: 4,
  boxShadow: "2px 2px 6px #ccc",
  padding: "12px 4px",
  textAlign: "center",
  minWidth: 36,
  marginBottom: 0,
};

const itemColStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
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
  textAlign: "left",         // centerから左寄せに変更
  padding: "8px 16px",       // パディングを調整
  marginRight: 24,
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start"  // centerからflex-startに変更
};

const optionBoxStyle: React.CSSProperties = {
  border: "1.5px solid #b94a48",
  borderRadius: 4,
  background: "#fff",
  minWidth: 220,
  minHeight: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  marginRight: 24,
  padding: "0 8px",
};

const inputBoxStyle: React.CSSProperties = {
  border: "1.5px solid #b94a48",
  borderRadius: 4,
  background: "#fff",
  minWidth: 120,
  minHeight: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  padding: "0 8px",
  height: "80px",  // 入力ボックスの高さも合わせて調整
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  background: "#b94a48",
  color: "#fff",
  padding: "4px 12px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
};

const radioGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",  // 中央揃えから左寄せに変更
  justifyContent: "center",
  gap: 8, // ラジオボタン間の間隔を少し広げる
  height: "100%", // 親要素の高さいっぱいに
  padding: "8px 16px",  // 左右のパディングを追加
};

const radioContainerStyle: React.CSSProperties = {
  border: "1.5px solid #b94a48",
  borderRadius: 4,
  background: "#fff",
  width: 200,
  height: 80, // minHeightからheightに変更
  padding: "0 8px", // 左右のパディングのみ設定
  marginRight: 16,
  display: "flex",
  alignItems: "center", // 中央寄せに変更
  justifyContent: "flex-start",  // 中央揃えから左寄せに変更
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginLeft: 16,
};

const radioLabelStyle = (isSelected: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",  // 中央揃えから左寄せに変更
  color: isSelected ? "#b94a48" : "#666",
  fontWeight: isSelected ? "bold" : "normal",
  cursor: "pointer",
  transition: "all 0.2s",
  fontSize: 14,
  whiteSpace: "nowrap",
  width: "100%",  // 幅を100%に設定
});

const radioInputStyle: React.CSSProperties = {
  marginRight: 8,
  cursor: "pointer",
  accentColor: "#b94a48",
};

const inputContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const DepartureSettings: React.FC<DepartureSettingsProps> = ({
  waitingTimeEnabled,
  waitingTimeValue,
  loadingWorkEnabled,
  loadingWorkValue,
  onWaitingTimeChange,
  onLoadingWorkChange,
  loadingWorkType: initialLoadingWorkType,
}) => {
  const [showWaitingTime, setShowWaitingTime] = React.useState(false);
  const [showLoadingWork, setShowLoadingWork] = React.useState(false);
  const [tempWaitingValue, setTempWaitingValue] = React.useState(waitingTimeValue);
  const [tempLoadingValue, setTempLoadingValue] = React.useState(loadingWorkValue);
  const [loadingWorkType, setLoadingWorkType] = React.useState<"machine" | "manual">(
    initialLoadingWorkType || "machine"
  );

  const handleWaitingTimeConfirm = () => {
    onWaitingTimeChange(true, tempWaitingValue);
    setShowWaitingTime(false);
  };

  const handleLoadingWorkConfirm = () => {
    onLoadingWorkChange(true, tempLoadingValue);
    setShowLoadingWork(false);
  };

  return (
    <div style={containerStyle}>
      {/* 待機時間料 */}
      <div style={rowStyle}>
        <div style={itemLabelStyle}>待機時間料</div>
        <div style={inputContainerStyle}>
          <div style={radioContainerStyle}>
            <div style={radioGroupStyle}>
              <label style={radioLabelStyle(!waitingTimeEnabled)}>
                <input
                  type="radio"
                  name="wait"
                  checked={!waitingTimeEnabled}
                  onChange={() => {
                    onWaitingTimeChange(false, "");
                    setShowWaitingTime(false);
                  }}
                  style={radioInputStyle}
                />
                適用しない
              </label>
              <label style={radioLabelStyle(waitingTimeEnabled)}>
                <input
                  type="radio"
                  name="wait"
                  checked={waitingTimeEnabled}
                  onChange={() => {
                    onWaitingTimeChange(true, tempWaitingValue);
                    setShowWaitingTime(true);
                  }}
                  style={radioInputStyle}
                />
                適用する
              </label>
            </div>
          </div>
          {waitingTimeEnabled && (
            <>
              <div style={inputBoxStyle}>
                <input
                  type="number"
                  value={tempWaitingValue}
                  onChange={(e) => setTempWaitingValue(e.target.value)}
                  style={{
                    width: 40,
                    border: "none",
                    outline: "none",
                    textAlign: "right",
                  }}
                  placeholder="**"
                />
                <span style={{ marginLeft: 4 }}>分</span>
              </div>
              <button 
                style={buttonStyle}
                onClick={handleWaitingTimeConfirm}
              >
                確定
              </button>
            </>
          )}
        </div>
      </div>

      {/* 積込料 */}
      <div style={rowStyle}>
        <div style={itemLabelStyle}>積込料</div>
        <div style={inputContainerStyle}>
          <div style={radioContainerStyle}>
            <div style={radioGroupStyle}>
              <label style={radioLabelStyle(!loadingWorkEnabled)}>
                <input
                  type="radio"
                  name="load"
                  value="none"
                  checked={!loadingWorkEnabled}
                  onChange={() => {
                    onLoadingWorkChange(false, "");
                    setShowLoadingWork(false);
                  }}
                  style={radioInputStyle}
                />
                適用しない
              </label>
              <label style={radioLabelStyle(loadingWorkEnabled && loadingWorkType === "machine")}>
                <input
                  type="radio"
                  name="load"
                  value="machine"
                  checked={loadingWorkEnabled && loadingWorkType === "machine"}
                  onChange={() => {
                    onLoadingWorkChange(true, tempLoadingValue);
                    setLoadingWorkType("machine");
                    setShowLoadingWork(true);
                  }}
                  style={radioInputStyle}
                />
                適用する → 機械荷役
              </label>
              <label style={radioLabelStyle(loadingWorkEnabled && loadingWorkType === "manual")}>
                <input
                  type="radio"
                  name="load"
                  value="manual"
                  checked={loadingWorkEnabled && loadingWorkType === "manual"}
                  onChange={() => {
                    onLoadingWorkChange(true, tempLoadingValue);
                    setLoadingWorkType("manual");
                    setShowLoadingWork(true);
                  }}
                  style={radioInputStyle}
                />
                適用する → 手荷役
              </label>
            </div>
          </div>
          {loadingWorkEnabled && (
            <>
              <div style={inputBoxStyle}>
                <input
                  type="number"
                  value={tempLoadingValue}
                  onChange={(e) => setTempLoadingValue(e.target.value)}
                  style={{
                    width: 40,
                    border: "none",
                    outline: "none",
                    textAlign: "right",
                  }}
                  placeholder="**"
                />
                <span style={{ marginLeft: 4 }}>分</span>
              </div>
              <button 
                style={buttonStyle}
                onClick={handleLoadingWorkConfirm}
              >
                確定
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { DepartureSettings };