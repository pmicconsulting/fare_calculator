import React, { useState } from "react";

// DepartureSettingsProps → FuelSurchargeSettingsPropsに変更
type FuelSurchargeSettingsProps = {
  // Props名を燃料サーチャージ用に変更
  fuelEnabled: boolean;
  fuelPrice: string;
  forwardingEnabled: boolean;
  forwardingRate: string;
  onFuelChange: (enabled: boolean, price: string) => void;
  onForwardingChange: (enabled: boolean, rate: string) => void;
};

// DepartureSettings → FuelSurchargeSettingsに変更
const FuelSurchargeSettings: React.FC<FuelSurchargeSettingsProps> = ({
  fuelEnabled,
  fuelPrice,
  forwardingEnabled,
  forwardingRate,
  onFuelChange,
  onForwardingChange,
}) => {
  // 状態変数名を燃料サーチャージ用に変更
  const [tempFuelPrice, setTempFuelPrice] = useState(fuelPrice);
  const [tempForwardingRate, setTempForwardingRate] = useState(forwardingRate);
  const [showFuel, setShowFuel] = useState(fuelEnabled);
  const [showForwarding, setShowForwarding] = useState(forwardingEnabled);
  const [selectedForwardingType, setSelectedForwardingType] = useState<"percentage" | "fixed">("percentage");

  const handleFuelRadio = (enabled: boolean) => {
    setShowFuel(enabled);
    if (!enabled) {
      setTempFuelPrice("");
      onFuelChange(false, "");
    }
  };

  const handleFuelConfirm = () => {
    onFuelChange(true, tempFuelPrice);
  };

  const handleForwardingRadio = (type: "none" | "percentage" | "fixed") => {
    if (type === "none") {
      setShowForwarding(false);
      setTempForwardingRate("");
      onForwardingChange(false, "");
    } else {
      setShowForwarding(true);
      setSelectedForwardingType(type);
    }
  };

  const handleForwardingConfirm = () => {
    onForwardingChange(true, tempForwardingRate);
  };

  // スタイル定義はそのまま維持
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontFamily: "sans-serif",
    padding: "12px 0",
  };

  const itemLabelStyle: React.CSSProperties = {
    background: "#f8d7da",
    color: "#b94a48",
    border: "1.5px solid #b94a48",
    borderRadius: 4,
    fontWeight: "bold",
    fontSize: 18,
    minWidth: 140,
    textAlign: "center",
    padding: "8px 16px",
    marginRight: 24,
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const radioContainerStyle: React.CSSProperties = {
    border: "1.5px solid #b94a48",
    borderRadius: 4,
    background: "#fff",
    width: 200,
    height: 80,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    marginRight: 16,
  };

  const radioGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  };

  const radioLabelStyle = (checked: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: 14,
    color: checked ? '#b94a48' : '#666',
    fontWeight: checked ? 'bold' : 'normal',
    whiteSpace: 'nowrap',
  });

  const radioInputStyle: React.CSSProperties = {
    marginRight: 6,
    cursor: 'pointer',
    accentColor: '#b94a48',
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const inputBoxStyle: React.CSSProperties = {
    width: 80,
    height: 36,
    padding: '0 8px',
    border: '1.5px solid #b94a48',
    borderRadius: 4,
    fontSize: 14,
    textAlign: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    height: 36,
    padding: '0 16px',
    backgroundColor: '#b94a48',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  return (
    <div style={containerStyle}>
      {/* 対策3: 待機時間料 → 燃料サーチャージに変更 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>燃料サーチャージ</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showFuel)}>
              <input
                type="radio"
                name="fuel"
                checked={!showFuel}
                onChange={() => handleFuelRadio(false)}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showFuel)}>
              <input
                type="radio"
                name="fuel"
                checked={showFuel}
                onChange={() => handleFuelRadio(true)}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showFuel && (
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempFuelPrice}
              onChange={(e) => setTempFuelPrice(e.target.value)}
              style={inputBoxStyle}
              placeholder="円/L"
            />
            <button onClick={handleFuelConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>

      {/* 対策3: 積込料 → 利用運送手数料に変更 */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={itemLabelStyle}>利用運送手数料</div>
        <div
          style={{
            ...radioContainerStyle,
            height: 120,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ ...radioGroupStyle, flexDirection: "column", gap: 8 }}>
            <label style={radioLabelStyle(!showForwarding)}>
              <input
                type="radio"
                name="forwarding"
                checked={!showForwarding}
                onChange={() => handleForwardingRadio("none")}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showForwarding && selectedForwardingType === "percentage")}>
              <input
                type="radio"
                name="forwarding"
                checked={showForwarding && selectedForwardingType === "percentage"}
                onChange={() => handleForwardingRadio("percentage")}
                style={radioInputStyle}
              />
              適用する → 運賃の%
            </label>
            <label style={radioLabelStyle(showForwarding && selectedForwardingType === "fixed")}>
              <input
                type="radio"
                name="forwarding"
                checked={showForwarding && selectedForwardingType === "fixed"}
                onChange={() => handleForwardingRadio("fixed")}
                style={radioInputStyle}
              />
              適用する → 固定額
            </label>
          </div>
        </div>
        {showForwarding && (
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempForwardingRate}
              onChange={(e) => setTempForwardingRate(e.target.value)}
              style={inputBoxStyle}
              placeholder={selectedForwardingType === "percentage" ? "%" : "円"}
            />
            <button onClick={handleForwardingConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 名前付きエクスポートからデフォルトエクスポートに変更
export default FuelSurchargeSettings;