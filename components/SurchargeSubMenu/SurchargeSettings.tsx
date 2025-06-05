import React, { useState } from "react";

// 特殊車両タイプの定義
type SpecialVehicleData = {
  id: string;
  name: string;
  rate: number;
};

const specialVehicleTypes: SpecialVehicleData[] = [
  { id: "refrigerated", name: "冷蔵車・冷凍車", rate: 20 },
  { id: "container", name: "海上コンテナ輸送車", rate: 40 },
  { id: "cement", name: "セメントバルク車", rate: 20 },
  { id: "dump", name: "ダンプ車", rate: 20 },
  { id: "mixer", name: "コンクリートミキサー車", rate: 20 },
  { id: "crane", name: "トラック搭載型クレーン車", rate: 30 },
  { id: "tankOil", name: "タンク車 石油製品輸送車", rate: 30 },
  { id: "tankChemical", name: "タンク車 化成品輸送車", rate: 40 },
  { id: "tankGas", name: "タンク輸送 高圧ガス輸送車", rate: 50 },
];

// SurchargeSettingsProps の定義
type SurchargeSettingsProps = {
  // 空のProps定義（将来の拡張用）
};

const SurchargeSettings: React.FC<SurchargeSettingsProps> = () => {
  // 特殊車両割増用の状態
  const [showSpecialVehicle, setShowSpecialVehicle] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [selectedVehicleRate, setSelectedVehicleRate] = useState<number>(0);
  const [isVehicleListExpanded, setIsVehicleListExpanded] = useState(false);

  // 休日割増用の状態
  const [showHoliday, setShowHoliday] = useState(false);
  const [tempHolidayDistanceRatio, setTempHolidayDistanceRatio] = useState("");
  const [isHolidayConfirmed, setIsHolidayConfirmed] = useState(false);
  
  // 深夜割増用の状態
  const [showDeepNight, setShowDeepNight] = useState(false);
  const [tempDeepNightDistanceRatio, setTempDeepNightDistanceRatio] = useState("");
  const [isDeepNightConfirmed, setIsDeepNightConfirmed] = useState(false);
  
  // 他の割増用の状態
  const [showExpress, setShowExpress] = useState(false);
  const [tempExpressRate, setTempExpressRate] = useState("20"); // "" → "20" に変更
  const [isExpressConfirmed, setIsExpressConfirmed] = useState(false);
  
  const [showGeneralRoad, setShowGeneralRoad] = useState(false);
  const [tempGeneralRoadRate, setTempGeneralRoadRate] = useState("20"); // "" → "20" に変更
  const [isGeneralRoadConfirmed, setIsGeneralRoadConfirmed] = useState(false);
  
  const [showForwardingFee, setShowForwardingFee] = useState(false);

  // ユーティリティ関数
  // 全角→半角変換関数
  const toHalfWidth = (str: string): string => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  // 入力値の検証関数（1〜100の整数）
  const isValidDistanceRatio = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= 100 && value === num.toString();
  };

  // ボタンのテキストを決定する関数
  const getButtonText = (isConfirmed: boolean, isDisabled: boolean): string => {
    if (isDisabled) return '無効';
    if (isConfirmed) return '確定済';
    return '確定';
  };

  // 特殊車両割増のハンドラー
  const handleSpecialVehicleToggle = () => {
    const newValue = !showSpecialVehicle;
    setShowSpecialVehicle(newValue);
    if (!newValue) {
      setSelectedVehicleType(null);
      setSelectedVehicleRate(0);
      setIsVehicleListExpanded(false);
    } else {
      setIsVehicleListExpanded(true);
    }
  };

  const handleVehicleTypeSelect = (vehicleId: string) => {
    if (selectedVehicleType === vehicleId) {
      // 選択済みをクリックしたら展開
      setIsVehicleListExpanded(true);
    } else {
      // 新規選択 - 即座にアクティブ化
      setSelectedVehicleType(vehicleId);
      const vehicle = specialVehicleTypes.find(v => v.id === vehicleId);
      if (vehicle) {
        setSelectedVehicleRate(vehicle.rate);
        console.log("特殊車両選択:", vehicleId, vehicle.rate);
      }
      setIsVehicleListExpanded(false);
    }
  };

  // 休日割増のハンドラー
  const handleHolidayToggle = () => {
    const newValue = !showHoliday;
    setShowHoliday(newValue);
    if (!newValue) {
      setTempHolidayDistanceRatio("");
      setIsHolidayConfirmed(false);
    }
  };

  const handleHolidayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // 全角→半角変換
    const halfWidthValue = toHalfWidth(rawValue);
    // 数字以外を除去
    const numericValue = halfWidthValue.replace(/[^0-9]/g, '');
    setTempHolidayDistanceRatio(numericValue);
  };

  const handleHolidayConfirm = () => {
    if (isHolidayConfirmed) {
      // 確定済みの場合：編集モードに戻る
      setIsHolidayConfirmed(false);
    } else {
      // 未確定の場合：確定処理
      if (isValidDistanceRatio(tempHolidayDistanceRatio)) {
        setIsHolidayConfirmed(true);
        console.log("休日割増確定 - 走行距離比率:", tempHolidayDistanceRatio + "%");
      }
    }
  };

  // 深夜割増のハンドラー
  const handleDeepNightToggle = () => {
    const newValue = !showDeepNight;
    setShowDeepNight(newValue);
    if (!newValue) {
      setTempDeepNightDistanceRatio("");
      setIsDeepNightConfirmed(false);
    }
  };

  const handleDeepNightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // 全角→半角変換
    const halfWidthValue = toHalfWidth(rawValue);
    // 数字以外を除去
    const numericValue = halfWidthValue.replace(/[^0-9]/g, '');
    setTempDeepNightDistanceRatio(numericValue);
  };

  const handleDeepNightConfirm = () => {
    if (isDeepNightConfirmed) {
      // 確定済みの場合：編集モードに戻る
      setIsDeepNightConfirmed(false);
    } else {
      // 未確定の場合：確定処理
      if (isValidDistanceRatio(tempDeepNightDistanceRatio)) {
        setIsDeepNightConfirmed(true);
        console.log("深夜割増確定 - 走行距離比率:", tempDeepNightDistanceRatio + "%");
      }
    }
  };

  // 他の割増のハンドラー
  const handleExpressToggle = () => {
    const newValue = !showExpress;
    setShowExpress(newValue);
    if (!newValue) {
      setTempExpressRate("20"); // "" → "20" に変更
      setIsExpressConfirmed(false);
    }
  };

  const handleExpressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const halfWidthValue = toHalfWidth(rawValue);
    const numericValue = halfWidthValue.replace(/[^0-9]/g, '');
    setTempExpressRate(numericValue);
  };

  const handleExpressConfirm = () => {
    if (isExpressConfirmed) {
      setIsExpressConfirmed(false);
    } else {
      if (isValidDistanceRatio(tempExpressRate)) {
        setIsExpressConfirmed(true);
        console.log("速達割増確定 - 割増率:", tempExpressRate + "%");
      }
    }
  };

  const handleGeneralRoadToggle = () => {
    const newValue = !showGeneralRoad;
    setShowGeneralRoad(newValue);
    if (!newValue) {
      setTempGeneralRoadRate("20"); // "" → "20" に変更
      setIsGeneralRoadConfirmed(false);
    }
  };

  const handleGeneralRoadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const halfWidthValue = toHalfWidth(rawValue);
    const numericValue = halfWidthValue.replace(/[^0-9]/g, '');
    setTempGeneralRoadRate(numericValue);
  };

  const handleGeneralRoadConfirm = () => {
    if (isGeneralRoadConfirmed) {
      setIsGeneralRoadConfirmed(false);
    } else {
      if (isValidDistanceRatio(tempGeneralRoadRate)) {
        setIsGeneralRoadConfirmed(true);
        console.log("一般道利用割増確定 - 割増率:", tempGeneralRoadRate + "%");
      }
    }
  };

  const handleForwardingFeeToggle = () => {
    const newValue = !showForwardingFee;
    setShowForwardingFee(newValue);
  };

  // スタイル定義
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
    padding: "4px 16px",
    marginRight: 24,
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const radioContainerStyle: React.CSSProperties = {
    border: "1.5px solid #b94a48",
    borderRadius: 4,
    background: "#fff",
    width: 200,
    height: 48,
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

  const inputContainerWithLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const distanceRatioLabelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
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

  const percentUnitStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
    fontWeight: 'normal',
  };

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

  // 特殊車両用の追加スタイル
  const accordionContainerStyle: React.CSSProperties = {
    maxHeight: isVehicleListExpanded ? '470px' : selectedVehicleType ? '60px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    marginLeft: 16,
    width: '400px',
  };

  const vehicleItemStyle = (isSelected: boolean, vehicleId: string): React.CSSProperties => ({
    padding: '12px 16px',
    backgroundColor: isSelected ? '#b94a48' : '#fff',
    color: isSelected ? '#fff' : '#333',
    border: '1px solid #b94a48',
    borderRadius: 4,
    cursor: 'pointer',
    marginBottom: 4,
    transition: 'all 0.2s ease',
    fontSize: 14,
    display: isSelected || isVehicleListExpanded ? 'flex' : 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const rateTagStyle = (isSelected: boolean): React.CSSProperties => ({
    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(185, 74, 72, 0.1)',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  });

  const surchargeRateLabelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
  };

  const fixedRateDisplayStyle: React.CSSProperties = {
    backgroundColor: '#b94a48',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    display: 'inline-block',
  };

  return (
    <div style={containerStyle}>
      {/* 特殊車両割増 */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={itemLabelStyle}>特殊車両割増</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showSpecialVehicle)}>
              <input
                type="radio"
                name="specialVehicle"
                checked={!showSpecialVehicle}
                onChange={handleSpecialVehicleToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showSpecialVehicle)}>
              <input
                type="radio"
                name="specialVehicle"
                checked={showSpecialVehicle}
                onChange={handleSpecialVehicleToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showSpecialVehicle && (
          <div style={accordionContainerStyle}>
            {specialVehicleTypes.map((vehicle) => (
              <div
                key={vehicle.id}
                style={vehicleItemStyle(selectedVehicleType === vehicle.id, vehicle.id)}
                onClick={() => handleVehicleTypeSelect(vehicle.id)}
              >
                <span>{vehicle.name}</span>
                <span style={rateTagStyle(selectedVehicleType === vehicle.id)}>
                  {vehicle.rate}%割増
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 休日割増 - 完全修正版 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>休日割増</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showHoliday)}>
              <input
                type="radio"
                name="holiday"
                checked={!showHoliday}
                onChange={handleHolidayToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showHoliday)}>
              <input
                type="radio"
                name="holiday"
                checked={showHoliday}
                onChange={handleHolidayToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showHoliday && (
          <div style={inputContainerWithLabelStyle}>
            <span style={distanceRatioLabelStyle}>走行距離比率</span>
            <input
              type="text"
              value={tempHolidayDistanceRatio}
              onChange={handleHolidayInputChange}
              style={inputBoxStyle(isHolidayConfirmed)}
              disabled={isHolidayConfirmed}
              maxLength={3}
            />
            <span style={percentUnitStyle}>％</span>
            <button 
              onClick={handleHolidayConfirm} 
              style={confirmButtonStyle(isHolidayConfirmed, !isValidDistanceRatio(tempHolidayDistanceRatio))}
              disabled={!isValidDistanceRatio(tempHolidayDistanceRatio) && !isHolidayConfirmed}
              onMouseEnter={(e) => {
                if (!(!isValidDistanceRatio(tempHolidayDistanceRatio) && !isHolidayConfirmed)) {
                  e.currentTarget.style.backgroundColor = isHolidayConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!isValidDistanceRatio(tempHolidayDistanceRatio) && !isHolidayConfirmed)) {
                  e.currentTarget.style.backgroundColor = isHolidayConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isHolidayConfirmed, !isValidDistanceRatio(tempHolidayDistanceRatio) && !isHolidayConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 深夜割増 - 完全修正版 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>深夜割増</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showDeepNight)}>
              <input
                type="radio"
                name="deepNight"
                checked={!showDeepNight}
                onChange={handleDeepNightToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showDeepNight)}>
              <input
                type="radio"
                name="deepNight"
                checked={showDeepNight}
                onChange={handleDeepNightToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showDeepNight && (
          <div style={inputContainerWithLabelStyle}>
            <span style={distanceRatioLabelStyle}>走行距離比率</span>
            <input
              type="text"
              value={tempDeepNightDistanceRatio}
              onChange={handleDeepNightInputChange}
              style={inputBoxStyle(isDeepNightConfirmed)}
              disabled={isDeepNightConfirmed}
              maxLength={3}
            />
            <span style={percentUnitStyle}>％</span>
            <button 
              onClick={handleDeepNightConfirm} 
              style={confirmButtonStyle(isDeepNightConfirmed, !isValidDistanceRatio(tempDeepNightDistanceRatio))}
              disabled={!isValidDistanceRatio(tempDeepNightDistanceRatio) && !isDeepNightConfirmed}
              onMouseEnter={(e) => {
                if (!(!isValidDistanceRatio(tempDeepNightDistanceRatio) && !isDeepNightConfirmed)) {
                  e.currentTarget.style.backgroundColor = isDeepNightConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!isValidDistanceRatio(tempDeepNightDistanceRatio) && !isDeepNightConfirmed)) {
                  e.currentTarget.style.backgroundColor = isDeepNightConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isDeepNightConfirmed, !isValidDistanceRatio(tempDeepNightDistanceRatio) && !isDeepNightConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 速達割増 - 修正版 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>速達割増</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showExpress)}>
              <input
                type="radio"
                name="express"
                checked={!showExpress}
                onChange={handleExpressToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showExpress)}>
              <input
                type="radio"
                name="express"
                checked={showExpress}
                onChange={handleExpressToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showExpress && (
          <div style={inputContainerWithLabelStyle}>
            <span style={surchargeRateLabelStyle}>割 　増 　率 </span>
            <input
              type="text"
              value={tempExpressRate}
              onChange={handleExpressInputChange}
              style={inputBoxStyle(isExpressConfirmed)}
              disabled={isExpressConfirmed}
              maxLength={3}
            />
            <span style={percentUnitStyle}>％</span>
            <button 
              onClick={handleExpressConfirm} 
              style={confirmButtonStyle(isExpressConfirmed, !isValidDistanceRatio(tempExpressRate))}
              disabled={!isValidDistanceRatio(tempExpressRate) && !isExpressConfirmed}
              onMouseEnter={(e) => {
                if (!(!isValidDistanceRatio(tempExpressRate) && !isExpressConfirmed)) {
                  e.currentTarget.style.backgroundColor = isExpressConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!isValidDistanceRatio(tempExpressRate) && !isExpressConfirmed)) {
                  e.currentTarget.style.backgroundColor = isExpressConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isExpressConfirmed, !isValidDistanceRatio(tempExpressRate) && !isExpressConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 一般道利用割増 - 修正版 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>一般道利用割増</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showGeneralRoad)}>
              <input
                type="radio"
                name="generalRoad"
                checked={!showGeneralRoad}
                onChange={handleGeneralRoadToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showGeneralRoad)}>
              <input
                type="radio"
                name="generalRoad"
                checked={showGeneralRoad}
                onChange={handleGeneralRoadToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showGeneralRoad && (
          <div style={inputContainerWithLabelStyle}>
            <span style={surchargeRateLabelStyle}>割 　増 　率 </span>
            <input
              type="text"
              value={tempGeneralRoadRate}
              onChange={handleGeneralRoadInputChange}
              style={inputBoxStyle(isGeneralRoadConfirmed)}
              disabled={isGeneralRoadConfirmed}
              maxLength={3}
            />
            <span style={percentUnitStyle}>％</span>
            <button 
              onClick={handleGeneralRoadConfirm} 
              style={confirmButtonStyle(isGeneralRoadConfirmed, !isValidDistanceRatio(tempGeneralRoadRate))}
              disabled={!isValidDistanceRatio(tempGeneralRoadRate) && !isGeneralRoadConfirmed}
              onMouseEnter={(e) => {
                if (!(!isValidDistanceRatio(tempGeneralRoadRate) && !isGeneralRoadConfirmed)) {
                  e.currentTarget.style.backgroundColor = isGeneralRoadConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!isValidDistanceRatio(tempGeneralRoadRate) && !isGeneralRoadConfirmed)) {
                  e.currentTarget.style.backgroundColor = isGeneralRoadConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isGeneralRoadConfirmed, !isValidDistanceRatio(tempGeneralRoadRate) && !isGeneralRoadConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 利用運送手数料 - 修正版 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>利用運送手数料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showForwardingFee)}>
              <input
                type="radio"
                name="forwardingFee"
                checked={!showForwardingFee}
                onChange={handleForwardingFeeToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showForwardingFee)}>
              <input
                type="radio"
                name="forwardingFee"
                checked={showForwardingFee}
                onChange={handleForwardingFeeToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showForwardingFee && (
          <div style={fixedRateDisplayStyle}>
            割  増  率  10％
          </div>
        )}
      </div>
    </div>
  );
};

// エクスポート
export { SurchargeSettings };