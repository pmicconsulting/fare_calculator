import React, { useState } from "react";

// SurchargeSettingsProps の定義（valueとonChangeを追加）
type SurchargeSettingsProps = {
  value: any;
  onChange: (value: any) => void;
};

const FuelSurchargeSettings: React.FC<SurchargeSettingsProps> = ({ value, onChange }) => {
  // onChangeが関数でない場合のフォールバック
  const handleChange = (newValue: any) => {
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  // valueから初期値を取得するように修正
  const initialValue = value || {
    fuelSurcharge: { enabled: false, price: "", consumption: "" }
  };

  // 状態変数名を燃料サーチャージ用に変更
  const [tempFuelPrice, setTempFuelPrice] = useState(
    initialValue.fuelSurcharge?.price?.toString() || ""
  );
  const [tempFuelConsumption, setTempFuelConsumption] = useState(
    initialValue.fuelSurcharge?.consumption?.toString() || ""
  );
  const [showFuel, setShowFuel] = useState(initialValue.fuelSurcharge?.enabled || false);
  const [isFuelPriceConfirmed, setIsFuelPriceConfirmed] = useState(
    !!initialValue.fuelSurcharge?.price
  );
  const [isFuelConsumptionConfirmed, setIsFuelConsumptionConfirmed] = useState(
    !!initialValue.fuelSurcharge?.consumption
  );

  // 全角→半角変換関数
  const toHalfWidth = (str: string): string => {
    return str.replace(/[０-９．]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  // 燃料調達価格の検証（130〜200、5円刻み）
  const isValidFuelPrice = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value, 10);
    if (isNaN(num)) return false;
    
    // 範囲チェック
    if (num < 130 || num > 200) return false;
    
    // 5円刻みチェック
    if (num % 5 !== 0) return false;
    
    return true;
  };

  // 燃費の検証（1〜12）
  const isValidFuelConsumption = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value, 10);
    if (isNaN(num)) return false;
    
    // 範囲チェック
    if (num < 1 || num > 12) return false;
    
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
      handleChange({
        ...value,
        fuelSurcharge: { enabled: false, price: "", consumption: "" }
      });
    } else {
      handleChange({
        ...value,
        fuelSurcharge: { 
          enabled: true, 
          price: tempFuelPrice || "", 
          consumption: tempFuelConsumption || "" 
        }
      });
    }
  };

  const handleFuelPriceInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempFuelPrice(e.target.value);
  };

  const handleFuelConsumptionInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempFuelConsumption(e.target.value);
  };

  const handleFuelPriceConfirm = () => {
    if (isFuelPriceConfirmed) {
      setIsFuelPriceConfirmed(false);
    } else {
      if (isValidFuelPrice(tempFuelPrice)) {
        setIsFuelPriceConfirmed(true);
        handleChange({
          ...value,
          fuelSurcharge: { 
            ...value.fuelSurcharge,
            enabled: true,
            price: tempFuelPrice
          }
        });
      }
    }
  };

  const handleFuelConsumptionConfirm = () => {
    if (isFuelConsumptionConfirmed) {
      setIsFuelConsumptionConfirmed(false);
    } else {
      if (isValidFuelConsumption(tempFuelConsumption)) {
        setIsFuelConsumptionConfirmed(true);
        handleChange({
          ...value,
          fuelSurcharge: { 
            ...value.fuelSurcharge,
            enabled: true,
            consumption: tempFuelConsumption
          }
        });
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

  // スタイルの高さを統一（80px → 40px、80 → 48）
  const itemLabelStyle: React.CSSProperties = {
    background: "#f8d7da",
    color: "#b94a48",
    border: "1.5px solid #b94a48",
    borderRadius: 4,
    fontWeight: "bold",
    fontSize: 18,
    minWidth: 140,
    textAlign: "center",
    padding: "4px 16px",  // 8px → 4px
    marginRight: 24,
    height: "40px",  // 80px → 40px
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const radioContainerStyle: React.CSSProperties = {
    border: "1.5px solid #b94a48",
    borderRadius: 4,
    background: "#fff",
    width: 200,
    height: 48,  // 80 → 48
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

  const selectBoxStyle = (isConfirmed: boolean): React.CSSProperties => ({
    width: 100,
    height: 36,
    padding: '0 8px',
    border: '1.5px solid #b94a48',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: isConfirmed ? '#f8f9fa' : '#fff',
    color: isConfirmed ? '#6c757d' : '#000',
    cursor: isConfirmed ? 'not-allowed' : 'pointer',
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
              <select
                value={tempFuelPrice}
                onChange={handleFuelPriceInputChange}
                style={selectBoxStyle(isFuelPriceConfirmed)}
                disabled={isFuelPriceConfirmed}
              >
                <option value="">選択</option>
                {[130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200].map(price => (
                  <option key={price} value={price}>{price}</option>
                ))}
              </select>
              <span style={unitStyle}>円/ℓ</span>
              <button 
                onClick={handleFuelPriceConfirm} 
                style={confirmButtonStyle(isFuelPriceConfirmed, !tempFuelPrice)}
                disabled={!tempFuelPrice && !isFuelPriceConfirmed}
                onMouseEnter={(e) => {
                  if (!(!tempFuelPrice && !isFuelPriceConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelPriceConfirmed ? '#218838' : '#a03937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!tempFuelPrice && !isFuelPriceConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelPriceConfirmed ? '#28a745' : '#b94a48';
                  }
                }}
              >
                {getButtonText(isFuelPriceConfirmed, !tempFuelPrice && !isFuelPriceConfirmed)}
              </button>
            </div>
            <div style={inputContainerStyle}>
              <span style={labelStyle}>燃　　　費</span>
              <select
                value={tempFuelConsumption}
                onChange={handleFuelConsumptionInputChange}
                style={selectBoxStyle(isFuelConsumptionConfirmed)}
                disabled={isFuelConsumptionConfirmed}
              >
                <option value="">選択</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(consumption => (
                  <option key={consumption} value={consumption}>{consumption}</option>
                ))}
              </select>
              <span style={unitStyle}>km/ℓ</span>
              <button 
                onClick={handleFuelConsumptionConfirm} 
                style={confirmButtonStyle(isFuelConsumptionConfirmed, !tempFuelConsumption)}
                disabled={!tempFuelConsumption && !isFuelConsumptionConfirmed}
                onMouseEnter={(e) => {
                  if (!(!tempFuelConsumption && !isFuelConsumptionConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelConsumptionConfirmed ? '#218838' : '#a03937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!tempFuelConsumption && !isFuelConsumptionConfirmed)) {
                    e.currentTarget.style.backgroundColor = isFuelConsumptionConfirmed ? '#28a745' : '#b94a48';
                  }
                }}
              >
                {getButtonText(isFuelConsumptionConfirmed, !tempFuelConsumption && !isFuelConsumptionConfirmed)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 名前付きエクスポートに変更
export { FuelSurchargeSettings };