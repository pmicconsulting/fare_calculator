import React, { useState } from "react";
// import { specialVehicleTypes } from '../SurchargeCalculation'; // この行を削除
import { DetailedSettingsType, SpecialVehicleData } from '../../types/DetailedSettingsType';

// specialVehicleTypesをこのファイル内で定義
const specialVehicleTypes: SpecialVehicleData[] = [
 { id: "refrigerated", name: "冷蔵車・冷凍車", rate: 20 },
  { id: "container", name: "海上コンテナ輸送車", rate: 40 },
  { id: "cement_bulk", name: "セメントバルク車", rate: 20 },
  { id: "dump", name: "ダンプ車", rate: 20 },
  { id: "concrete_mixer", name: "コンクリートミキサー車", rate: 20 },
  { id: "truck_crane", name: "トラック搭載型クレーン車", rate: 30 },
  { id: "tank_petroleum", name: "タンク車 石油製品輸送車", rate: 30 },
  { id: "tank_chemical", name: "タンク車 化成品輸送車", rate: 40 },
  { id: "tank_high_pressure_gas", name: "タンク輸送 高圧ガス輸送車", rate: 50 },
];

// SurchargeSettingsProps の定義（valueとonChangeを追加）
type SurchargeSettingsProps = {
  value: any;
  onChange: (value: any) => void;
};

const SurchargeSettings: React.FC<SurchargeSettingsProps> = ({ value, onChange }) => {
  // valueから初期値を取得するように修正
  const initialValue = value || {
    specialVehicle: { enabled: false, type: "" },
    holiday: { enabled: false, distanceRatio: 0 },
    deepNight: { enabled: false, distanceRatio: 0 },
    express: { enabled: false, surchargeRate: 0 },
    generalRoad: { enabled: false, surchargeRate: 0 },
    forwardingFee: { enabled: false }
  };

  // 特殊車両割増用の状態（初期値をvalueから取得）
  const [showSpecialVehicle, setShowSpecialVehicle] = useState(initialValue.specialVehicle?.enabled || false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(initialValue.specialVehicle?.type || null);
  const [selectedVehicleRate, setSelectedVehicleRate] = useState<number>(0);
  const [isVehicleListExpanded, setIsVehicleListExpanded] = useState(false);

  // 休日割増用の状態（初期値をvalueから取得）
  const [showHoliday, setShowHoliday] = useState(initialValue.holiday?.enabled || false);
  const [tempHolidayDistanceRatio, setTempHolidayDistanceRatio] = useState(
    initialValue.holiday?.distanceRatio?.toString() || ""
  );
  const [isHolidayConfirmed, setIsHolidayConfirmed] = useState(
    initialValue.holiday?.distanceRatio > 0
  );
  
  // 深夜割増用の状態（初期値をvalueから取得）
  const [showDeepNight, setShowDeepNight] = useState(initialValue.deepNight?.enabled || false);
  const [tempDeepNightDistanceRatio, setTempDeepNightDistanceRatio] = useState(
    initialValue.deepNight?.distanceRatio?.toString() || ""
  );
  const [isDeepNightConfirmed, setIsDeepNightConfirmed] = useState(
    initialValue.deepNight?.distanceRatio > 0
  );
  
  // 他の割増用の状態（初期値をvalueから取得）
  const [showExpress, setShowExpress] = useState(initialValue.express?.enabled || false);
  const [tempExpressRate, setTempExpressRate] = useState(
    initialValue.express?.surchargeRate?.toString() || "20"
  );
  const [isExpressConfirmed, setIsExpressConfirmed] = useState(
    initialValue.express?.surchargeRate > 0
  );
  
  const [showGeneralRoad, setShowGeneralRoad] = useState(initialValue.generalRoad?.enabled || false);
  const [tempGeneralRoadRate, setTempGeneralRoadRate] = useState(
    initialValue.generalRoad?.surchargeRate?.toString() || "20"
  );
  const [isGeneralRoadConfirmed, setIsGeneralRoadConfirmed] = useState(
    initialValue.generalRoad?.surchargeRate > 0
  );
  
  const [showForwardingFee, setShowForwardingFee] = useState(initialValue.forwardingFee?.enabled || false);

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
      onChange({
        ...value,
        specialVehicle: { enabled: false, type: "" },
      });
    } else {
      setIsVehicleListExpanded(true);
      onChange({
        ...value,
        specialVehicle: { enabled: true, type: selectedVehicleType || "" },
      });
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
        onChange({
          ...value,
          specialVehicle: { enabled: true, type: vehicleId },
        });
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
      onChange({
        ...value,
        holiday: { enabled: false, distanceRatio: 0 },
      });
    } else {
      onChange({
        ...value,
        holiday: { enabled: true, distanceRatio: 0 },
      });
    }
  };

  const handleHolidaySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempHolidayDistanceRatio(e.target.value);
  };

  const handleHolidayConfirm = () => {
    if (isHolidayConfirmed) {
      // 確定済みの場合：編集モードに戻る
      setIsHolidayConfirmed(false);
    } else {
      // 未確定の場合：確定処理
      if (tempHolidayDistanceRatio) {
        setIsHolidayConfirmed(true);
        console.log("休日割増確定 - 走行距離比率:", tempHolidayDistanceRatio + "%");
        onChange({
          ...value,
          holiday: { enabled: true, distanceRatio: parseInt(tempHolidayDistanceRatio, 10) },
        });
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
      onChange({
        ...value,
        deepNight: { enabled: false, distanceRatio: 0 },
      });
    } else {
      onChange({
        ...value,
        deepNight: { enabled: true, distanceRatio: 0 },
      });
    }
  };

  const handleDeepNightSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempDeepNightDistanceRatio(e.target.value);
  };

  const handleDeepNightConfirm = () => {
    if (isDeepNightConfirmed) {
      // 確定済みの場合：編集モードに戻る
      setIsDeepNightConfirmed(false);
    } else {
      // 未確定の場合：確定処理
      if (tempDeepNightDistanceRatio) {
        setIsDeepNightConfirmed(true);
        console.log("深夜割増確定 - 走行距離比率:", tempDeepNightDistanceRatio + "%");
        onChange({
          ...value,
          deepNight: { enabled: true, distanceRatio: parseInt(tempDeepNightDistanceRatio, 10) },
        });
      }
    }
  };

  // 速達割増のハンドラー
  const handleExpressToggle = () => {
    const newValue = !showExpress;
    setShowExpress(newValue);
    if (!newValue) {
      setTempExpressRate("");
      setIsExpressConfirmed(false);
      onChange({
        ...value,
        express: { enabled: false, surchargeRate: 0 },
      });
    } else {
      onChange({
        ...value,
        express: { enabled: true, surchargeRate: 0 },
      });
    }
  };

  const handleExpressSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempExpressRate(e.target.value);
  };

  const handleExpressConfirm = () => {
    if (isExpressConfirmed) {
      setIsExpressConfirmed(false);
    } else {
      if (tempExpressRate) {
        setIsExpressConfirmed(true);
        console.log("速達割増確定 - 割増率:", tempExpressRate + "%");
        onChange({
          ...value,
          express: { enabled: true, surchargeRate: parseInt(tempExpressRate, 10) },
        });
      }
    }
  };

  // 一般道利用割増のハンドラー
  const handleGeneralRoadToggle = () => {
    const newValue = !showGeneralRoad;
    setShowGeneralRoad(newValue);
    if (!newValue) {
      setTempGeneralRoadRate("");
      setIsGeneralRoadConfirmed(false);
      onChange({
        ...value,
        generalRoad: { enabled: false, surchargeRate: 0 },
      });
    } else {
      onChange({
        ...value,
        generalRoad: { enabled: true, surchargeRate: 0 },
      });
    }
  };

  const handleGeneralRoadSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempGeneralRoadRate(e.target.value);
  };

  const handleGeneralRoadConfirm = () => {
    if (isGeneralRoadConfirmed) {
      setIsGeneralRoadConfirmed(false);
    } else {
      if (tempGeneralRoadRate) {
        setIsGeneralRoadConfirmed(true);
        console.log("一般道利用割増確定 - 割増率:", tempGeneralRoadRate + "%");
        onChange({
          ...value,
          generalRoad: { enabled: true, surchargeRate: parseInt(tempGeneralRoadRate, 10) },
        });
      }
    }
  };

  // 利用運送手数料のハンドラー
  const handleForwardingFeeToggle = () => {
    const newValue = !showForwardingFee;
    setShowForwardingFee(newValue);
    if (!newValue) {
      onChange({
        ...value,
        forwardingFee: { enabled: false },
      });
    } else {
      onChange({
        ...value,
        forwardingFee: { enabled: true },
      });
    }
  };

  // スタイル定義（以前のファイルと完全に同じ）
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

  const selectBoxStyle = (isConfirmed: boolean): React.CSSProperties => ({
    width: 80,
    height: 36,
    padding: '0 8px',
    border: '1.5px solid #b94a48',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: isConfirmed ? '#f8f9fa' : '#fff',
    color: isConfirmed ? '#6c757d' : '#000',
    cursor: isConfirmed ? 'not-allowed' : 'pointer',
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

      {/* 休日割増 - プルダウン版 */}
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
            <select
              value={tempHolidayDistanceRatio}
              onChange={handleHolidaySelectChange}
              style={selectBoxStyle(isHolidayConfirmed)}
              disabled={isHolidayConfirmed}
            >
              <option value="">選択</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
            </select>
            <button 
              onClick={handleHolidayConfirm} 
              style={confirmButtonStyle(isHolidayConfirmed, !tempHolidayDistanceRatio)}
              disabled={!tempHolidayDistanceRatio && !isHolidayConfirmed}
              onMouseEnter={(e) => {
                if (!(!tempHolidayDistanceRatio && !isHolidayConfirmed)) {
                  e.currentTarget.style.backgroundColor = isHolidayConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!tempHolidayDistanceRatio && !isHolidayConfirmed)) {
                  e.currentTarget.style.backgroundColor = isHolidayConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isHolidayConfirmed, !tempHolidayDistanceRatio && !isHolidayConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 深夜割増 - プルダウン版 */}
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
            <select
              value={tempDeepNightDistanceRatio}
              onChange={handleDeepNightSelectChange}
              style={selectBoxStyle(isDeepNightConfirmed)}
              disabled={isDeepNightConfirmed}
            >
              <option value="">選択</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
            </select>
            <button 
              onClick={handleDeepNightConfirm} 
              style={confirmButtonStyle(isDeepNightConfirmed, !tempDeepNightDistanceRatio)}
              disabled={!tempDeepNightDistanceRatio && !isDeepNightConfirmed}
              onMouseEnter={(e) => {
                if (!(!tempDeepNightDistanceRatio && !isDeepNightConfirmed)) {
                  e.currentTarget.style.backgroundColor = isDeepNightConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!tempDeepNightDistanceRatio && !isDeepNightConfirmed)) {
                  e.currentTarget.style.backgroundColor = isDeepNightConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isDeepNightConfirmed, !tempDeepNightDistanceRatio && !isDeepNightConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 速達割増 - プルダウン版 */}
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
            <select
              value={tempExpressRate}
              onChange={handleExpressSelectChange}
              style={selectBoxStyle(isExpressConfirmed)}
              disabled={isExpressConfirmed}
            >
              <option value="">選択</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
            </select>
            <button 
              onClick={handleExpressConfirm} 
              style={confirmButtonStyle(isExpressConfirmed, !tempExpressRate)}
              disabled={!tempExpressRate && !isExpressConfirmed}
              onMouseEnter={(e) => {
                if (!(!tempExpressRate && !isExpressConfirmed)) {
                  e.currentTarget.style.backgroundColor = isExpressConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!tempExpressRate && !isExpressConfirmed)) {
                  e.currentTarget.style.backgroundColor = isExpressConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isExpressConfirmed, !tempExpressRate && !isExpressConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 一般道利用割増 - プルダウン版 */}
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
            <select
              value={tempGeneralRoadRate}
              onChange={handleGeneralRoadSelectChange}
              style={selectBoxStyle(isGeneralRoadConfirmed)}
              disabled={isGeneralRoadConfirmed}
            >
              <option value="">選択</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
            </select>
            <button 
              onClick={handleGeneralRoadConfirm} 
              style={confirmButtonStyle(isGeneralRoadConfirmed, !tempGeneralRoadRate)}
              disabled={!tempGeneralRoadRate && !isGeneralRoadConfirmed}
              onMouseEnter={(e) => {
                if (!(!tempGeneralRoadRate && !isGeneralRoadConfirmed)) {
                  e.currentTarget.style.backgroundColor = isGeneralRoadConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!tempGeneralRoadRate && !isGeneralRoadConfirmed)) {
                  e.currentTarget.style.backgroundColor = isGeneralRoadConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isGeneralRoadConfirmed, !tempGeneralRoadRate && !isGeneralRoadConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 利用運送手数料 - 入力枠を削除 */}
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
          <span style={fixedRateDisplayStyle}>基準運賃額の10%</span>
        )}
      </div>
    </div>
  );
};

// エクスポート
export { SurchargeSettings };