import React, { useState } from "react";

// DepartureSettingsProps → FuelSurchargeSettingsPropsに変更
type FuelSurchargeSettingsProps = {
  // Props名を燃料サーチャージ用に変更
  fuelEnabled: boolean;
  fuelPrice: string;
  onFuelChange: (enabled: boolean, price: string) => void;
};

// DepartureSettings → FuelSurchargeSettingsに変更
const FuelSurchargeSettings: React.FC<FuelSurchargeSettingsProps> = ({
  fuelEnabled,
  fuelPrice,
  onFuelChange,
}) => {
  // 状態変数名を燃料サーチャージ用に変更
  const [tempFuelPrice, setTempFuelPrice] = useState(fuelPrice);
  const [tempFuelConsumption, setTempFuelConsumption] = useState("");
  const [showFuel, setShowFuel] = useState(fuelEnabled);
  const [isFuelPriceConfirmed, setIsFuelPriceConfirmed] = useState(false);
  const [isFuelConsumptionConfirmed, setIsFuelConsumptionConfirmed] = useState(false);

  // 全角→半角変換関数
  const toHalfWidth = (str: string): string => {
    return str.replace(/[０-９．]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  // 燃料調達価格の検証（50〜200、小数点第1位）
  const isValidFuelPrice = (value: string): boolean => {
    if (!value) return false;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    
    // 範囲チェック
    if (num < 50 || num > 200) return false;
    
    // 小数点チェック（第1位まで）
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 1) return false;
    
    return true;
  };

  // 燃費の検証（1〜20、小数点第2位）
  const isValidFuelConsumption = (value: string): boolean => {
    if (!value) return false;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    
    // 範囲チェック
    if (num < 1 || num > 20) return false;
    
    // 小数点チェック（第2位まで）
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 2) return false;
    
    return true;
  };

  // ボタンのテキストを決定する関数
  const getButtonText = (isConfirmed: boolean, isDisabled: boolean): string => {
    if (isDisabled) return '無効';
    if (isConfirmed) return '確定済';
    return '確定';
  };

  const handleFuelRadio = (enabled: boolean) => {
    setShowFuel(enabled);
    if (!enabled) {
      setTempFuelPrice("");
      setTempFuelConsumption("");
      setIsFuelPriceConfirmed(false);
      setIsFuelConsumptionConfirmed(false);
      onFuelChange(false, "");
    }
  };

  const handleFuelPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const halfWidthValue = toHalfWidth(rawValue);
    
    // 数字と小数点以外を除去
    const cleaned = halfWidthValue.replace(/[^0-9.]/g, '');
    
    // 複数の小数点を防ぐ
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    
    // 小数点以下の桁数制限（第1位まで）
    if (parts.length === 2 && parts[1].length > 1) {
      return;
    }
    
    setTempFuelPrice(cleaned);
  };

  const handleFuelConsumptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const halfWidthValue = toHalfWidth(rawValue);
    
    // 数字と小数点以外を除去
    const cleaned = halfWidthValue.replace(/[^0-9.]/g, '');
    
    // 複数の小数点を防ぐ
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    
    // 小数点以下の桁数制限（第2位まで）
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    setTempFuelConsumption(cleaned);
  };

  const handleFuelPriceConfirm = () => {
    if (isFuelPriceConfirmed) {
      setIsFuelPriceConfirmed(false);
    } else {
      if (isValidFuelPrice(tempFuelPrice)) {
        setIsFuelPriceConfirmed(true);
        onFuelChange(true, tempFuelPrice);
        console.log("燃料調達価格確定:", tempFuelPrice + "円/ℓ");
      }
    }
  };

  const handleFuelConsumptionConfirm = () => {
    if (isFuelConsumptionConfirmed) {
      setIsFuelConsumptionConfirmed(false);
    } else {
      if (isValidFuelConsumption(tempFuelConsumption)) {
        setIsFuelConsumptionConfirmed(true);
        console.log("燃費確定:", tempFuelConsumption + "km/ℓ");
      }
    }
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

  const inputBoxStyle = (isConfirmed: boolean): React.CSSProperties => ({
    width: 80,
    height: 36,
    padding: '0 8px',
    border: '1.5px solid #b94a48',
    borderRadius: 4,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: isConfirmed ? '#f8f9fa' : '#fff',
    color: isConfirmed ? '#6c757d' : '#000',
  });

  const confirmButtonStyle = (isConfirmed: boolean, isDisabled: boolean): React.CSSProperties => ({
    height: 36,
    padding: '0 16px',
    backgroundColor: isDisabled ? '#ccc' : (isConfirmed ? '#28a745' : '#b94a48'),
    color: isDisabled ? '#666' : '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    minWidth: 80,
    opacity: isDisabled ? 0.6 : 1,
    pointerEvents: isDisabled ? 'none' : 'auto',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
    minWidth: 100,
  };

  const unitStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  return (
    <div style={containerStyle}>
      {/* 燃料サーチャージ */}
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
          <div style={inputGroupStyle}>
            <div style={inputContainerStyle}>
              <span style={labelStyle}>燃料調達価格</span>
              <input
                type="text"
                value={tempFuelPrice}
                onChange={handleFuelPriceInputChange}
                style={inputBoxStyle(isFuelPriceConfirmed)}
                disabled={isFuelPriceConfirmed}
                maxLength={5}
              />
              <span style={unitStyle}>円/ℓ</span>
              <button 
                onClick={handleFuelPriceConfirm} 
                style={confirmButtonStyle(isFuelPriceConfirmed, !isValidFuelPrice(tempFuelPrice))}
                disabled={!isValidFuelPrice(tempFuelPrice) && !isFuelPriceConfirmed}
                onMouseEnter={(e) => {
                  if (!(!isValidFuelPrice(tempFuelPrice) && !isFuelPriceConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelPriceConfirmed ? '#218838' : '#a03937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!isValidFuelPrice(tempFuelPrice) && !isFuelPriceConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelPriceConfirmed ? '#28a745' : '#b94a48';
                  }
                }}
              >
                {getButtonText(isFuelPriceConfirmed, !isValidFuelPrice(tempFuelPrice) && !isFuelPriceConfirmed)}
              </button>
            </div>
            <div style={inputContainerStyle}>
              <span style={labelStyle}>燃　　　費</span>
              <input
                type="text"
                value={tempFuelConsumption}
                onChange={handleFuelConsumptionInputChange}
                style={inputBoxStyle(isFuelConsumptionConfirmed)}
                disabled={isFuelConsumptionConfirmed}
                maxLength={5}
              />
              <span style={unitStyle}>km/ℓ</span>
              <button 
                onClick={handleFuelConsumptionConfirm} 
                style={confirmButtonStyle(isFuelConsumptionConfirmed, !isValidFuelConsumption(tempFuelConsumption))}
                disabled={!isValidFuelConsumption(tempFuelConsumption) && !isFuelConsumptionConfirmed}
                onMouseEnter={(e) => {
                  if (!(!isValidFuelConsumption(tempFuelConsumption) && !isFuelConsumptionConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelConsumptionConfirmed ? '#218838' : '#a03937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!isValidFuelConsumption(tempFuelConsumption) && !isFuelConsumptionConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelConsumptionConfirmed ? '#28a745' : '#b94a48';
                  }
                }}
              >
                {getButtonText(isFuelConsumptionConfirmed, !isValidFuelConsumption(tempFuelConsumption) && !isFuelConsumptionConfirmed)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 名前付きエクスポートからデフォルトエクスポートに変更
export default FuelSurchargeSettings;