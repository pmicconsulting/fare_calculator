import React, { useState } from "react";

// DepartureSettingsProps → ArrivalSettingsPropsに変更
type ArrivalSettingsProps = {
  waitingTimeEnabled: boolean;
  waitingTimeValue: string;
  // loadingWork → unloadingWorkに変更
  unloadingWorkEnabled: boolean;
  unloadingWorkValue: string;
  unloadingWorkType?: "machine" | "manual";
  onWaitingTimeChange: (enabled: boolean, value: string) => void;
  // onLoadingWorkChange → onUnloadingWorkChangeに変更
  onUnloadingWorkChange: (enabled: boolean, value: string) => void;
};

// DepartureSettings → ArrivalSettingsに変更
const ArrivalSettings: React.FC<ArrivalSettingsProps> = ({
  waitingTimeEnabled,
  waitingTimeValue,
  // loadingWork → unloadingWorkに変更
  unloadingWorkEnabled,
  unloadingWorkValue,
  unloadingWorkType = "machine",
  onWaitingTimeChange,
  // onLoadingWorkChange → onUnloadingWorkChangeに変更
  onUnloadingWorkChange,
}) => {
  const [tempWaitingValue, setTempWaitingValue] = useState(waitingTimeValue);
  // tempLoadingValue → tempUnloadingValueに変更
  const [tempUnloadingValue, setTempUnloadingValue] = useState(unloadingWorkValue);
  const [showWaitingTime, setShowWaitingTime] = useState(waitingTimeEnabled);
  // showLoadingWork → showUnloadingWorkに変更
  const [showUnloadingWork, setShowUnloadingWork] = useState(unloadingWorkEnabled);
  // loadingWorkType → unloadingWorkTypeに変更
  const [selectedUnloadingType, setSelectedUnloadingType] = useState(unloadingWorkType);

  const handleWaitingTimeRadio = (enabled: boolean) => {
    setShowWaitingTime(enabled);
    if (!enabled) {
      setTempWaitingValue("");
      onWaitingTimeChange(false, "");
    }
  };

  const handleWaitingTimeConfirm = () => {
    onWaitingTimeChange(true, tempWaitingValue);
  };

  // handleLoadingWorkRadio → handleUnloadingWorkRadioに変更
  const handleUnloadingWorkRadio = (type: "none" | "machine" | "manual") => {
    if (type === "none") {
      // setShowLoadingWork → setShowUnloadingWorkに変更
      setShowUnloadingWork(false);
      // setTempLoadingValue → setTempUnloadingValueに変更
      setTempUnloadingValue("");
      // onLoadingWorkChange → onUnloadingWorkChangeに変更
      onUnloadingWorkChange(false, "");
    } else {
      // setShowLoadingWork → setShowUnloadingWorkに変更
      setShowUnloadingWork(true);
      // setSelectedLoadingType → setSelectedUnloadingTypeに変更
      setSelectedUnloadingType(type);
    }
  };

  // handleLoadingWorkConfirm → handleUnloadingWorkConfirmに変更
  const handleUnloadingWorkConfirm = () => {
    // onLoadingWorkChange → onUnloadingWorkChangeに変更
    onUnloadingWorkChange(true, tempUnloadingValue);
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

  return (
    <div style={containerStyle}>
      {/* 待機時間料 - 変更なし */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>待機時間料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showWaitingTime)}>
              <input
                type="radio"
                name="waitingTime"
                checked={!showWaitingTime}
                onChange={() => handleWaitingTimeRadio(false)}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showWaitingTime)}>
              <input
                type="radio"
                name="waitingTime"
                checked={showWaitingTime}
                onChange={() => handleWaitingTimeRadio(true)}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showWaitingTime && (
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempWaitingValue}
              onChange={(e) => setTempWaitingValue(e.target.value)}
              style={inputBoxStyle}
              placeholder="分"
            />
            <button onClick={handleWaitingTimeConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>

      {/* 積込料 → 取卸料に変更 */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* "積込料" → "取卸料"に変更 */}
        <div style={itemLabelStyle}>取卸料</div>
        <div
          style={{
            ...radioContainerStyle,
            height: 120,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ ...radioGroupStyle, flexDirection: "column", gap: 8 }}>
            {/* showLoadingWork → showUnloadingWorkに変更 */}
            <label style={radioLabelStyle(!showUnloadingWork)}>
              <input
                type="radio"
                // name="load" → name="unload"に変更
                name="unload"
                // showLoadingWork → showUnloadingWorkに変更
                checked={!showUnloadingWork}
                // handleLoadingWorkRadio → handleUnloadingWorkRadioに変更
                onChange={() => handleUnloadingWorkRadio("none")}
                style={radioInputStyle}
              />
              適用しない
            </label>
            {/* showLoadingWork → showUnloadingWork、selectedLoadingType → selectedUnloadingTypeに変更 */}
            <label style={radioLabelStyle(showUnloadingWork && selectedUnloadingType === "machine")}>
              <input
                type="radio"
                // name="load" → name="unload"に変更
                name="unload"
                checked={showUnloadingWork && selectedUnloadingType === "machine"}
                // handleLoadingWorkRadio → handleUnloadingWorkRadioに変更
                onChange={() => handleUnloadingWorkRadio("machine")}
                style={radioInputStyle}
              />
              適用する → 機械荷役
            </label>
            <label style={radioLabelStyle(showUnloadingWork && selectedUnloadingType === "manual")}>
              <input
                type="radio"
                // name="load" → name="unload"に変更
                name="unload"
                checked={showUnloadingWork && selectedUnloadingType === "manual"}
                // handleLoadingWorkRadio → handleUnloadingWorkRadioに変更
                onChange={() => handleUnloadingWorkRadio("manual")}
                style={radioInputStyle}
              />
              適用する → 手荷役
            </label>
          </div>
        </div>
        {/* showLoadingWork → showUnloadingWorkに変更 */}
        {showUnloadingWork && (
          <div style={inputContainerStyle}>
            <input
              type="number"
              // tempLoadingValue → tempUnloadingValueに変更
              value={tempUnloadingValue}
              // setTempLoadingValue → setTempUnloadingValueに変更
              onChange={(e) => setTempUnloadingValue(e.target.value)}
              style={inputBoxStyle}
              placeholder="分"
            />
            {/* handleLoadingWorkConfirm → handleUnloadingWorkConfirmに変更 */}
            <button onClick={handleUnloadingWorkConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// DepartureSettings → ArrivalSettingsに変更
export { ArrivalSettings };