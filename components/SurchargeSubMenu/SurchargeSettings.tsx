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
    fuelSurcharge: { enabled: false, fuelPrice: 0, fuelEfficiency: 0 },
    specialVehicle: { enabled: false, type: "" },
    holiday: { enabled: false, distanceRatio: 0 },
    deepNight: { enabled: false, distanceRatio: 0 },
    express: { enabled: false, surchargeRate: 0 },
    generalRoad: { enabled: false, surchargeRate: 0 },
    forwardingFee: { enabled: false }
  };

  // 燃料サーチャージ用の状態を追加
  const [showFuelSurcharge, setShowFuelSurcharge] = useState(
    initialValue.fuelSurcharge?.enabled || false
  );
  const [tempFuelPrice, setTempFuelPrice] = useState(
    initialValue.fuelSurcharge?.fuelPrice?.toString() || ""
  );
  const [tempFuelEfficiency, setTempFuelEfficiency] = useState(
    initialValue.fuelSurcharge?.fuelEfficiency?.toString() || ""
  );

  // 特殊車両割増用の状態（初期値をvalueから取得）
  const [showSpecialVehicle, setShowSpecialVehicle] = useState(initialValue.specialVehicle?.enabled || false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(initialValue.specialVehicle?.type || null);
  const [selectedVehicleRate, setSelectedVehicleRate] = useState<number>(0);
  const [isVehicleListExpanded, setIsVehicleListExpanded] = useState(false);

  // 休日割増用の状態（確定状態を削除）
  const [showHoliday, setShowHoliday] = useState(initialValue.holiday?.enabled || false);
  const [tempHolidayDistanceRatio, setTempHolidayDistanceRatio] = useState(
    initialValue.holiday?.distanceRatio?.toString() || ""
  );
  
  // 深夜割増用の状態（確定状態を削除）
  const [showDeepNight, setShowDeepNight] = useState(initialValue.deepNight?.enabled || false);
  const [tempDeepNightDistanceRatio, setTempDeepNightDistanceRatio] = useState(
    initialValue.deepNight?.distanceRatio?.toString() || ""
  );
  
  // 他の割増用の状態（確定状態を削除）
  const [showExpress, setShowExpress] = useState(initialValue.express?.enabled || false);
  const [tempExpressRate, setTempExpressRate] = useState(
    initialValue.express?.surchargeRate?.toString() || "20"
  );
  
  const [showGeneralRoad, setShowGeneralRoad] = useState(initialValue.generalRoad?.enabled || false);
  const [tempGeneralRoadRate, setTempGeneralRoadRate] = useState(
    initialValue.generalRoad?.surchargeRate?.toString() || "20"
  );
  
  const [showForwardingFee, setShowForwardingFee] = useState(initialValue.forwardingFee?.enabled || false);

  // ユーティリティ関数（getButtonTextを削除）
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

  // 燃料サーチャージのハンドラー
  const handleFuelSurchargeToggle = () => {
    const newValue = !showFuelSurcharge;
    setShowFuelSurcharge(newValue);
    if (!newValue) {
      setTempFuelPrice("");
      setTempFuelEfficiency("");
      onChange({
        ...value,
        fuelSurcharge: { enabled: false, fuelPrice: 0, fuelEfficiency: 0 },
      });
    } else {
      onChange({
        ...value,
        fuelSurcharge: { 
          enabled: true, 
          fuelPrice: parseInt(tempFuelPrice) || 0,
          fuelEfficiency: parseFloat(tempFuelEfficiency) || 0
        },
      });
    }
  };

  const handleFuelPriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrice = e.target.value;
    setTempFuelPrice(newPrice);
    if (showFuelSurcharge && newPrice) {
      onChange({
        ...value,
        fuelSurcharge: { 
          enabled: true, 
          fuelPrice: parseInt(newPrice),
          fuelEfficiency: parseFloat(tempFuelEfficiency) || 0
        },
      });
    }
  };

  const handleFuelEfficiencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEfficiency = e.target.value;
    setTempFuelEfficiency(newEfficiency);
    if (showFuelSurcharge && newEfficiency) {
      onChange({
        ...value,
        fuelSurcharge: { 
          enabled: true, 
          fuelPrice: parseInt(tempFuelPrice) || 0,
          fuelEfficiency: parseFloat(newEfficiency)
        },
      });
    }
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
      onChange({
        ...value,
        holiday: { enabled: false, distanceRatio: 0 },
      });
    } else {
      onChange({
        ...value,
        holiday: { enabled: true, distanceRatio: parseInt(tempHolidayDistanceRatio) || 0 },
      });
    }
  };

  const handleHolidaySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setTempHolidayDistanceRatio(newValue);
    if (showHoliday && newValue) {
      onChange({
        ...value,
        holiday: { enabled: true, distanceRatio: parseInt(newValue, 10) },
      });
    }
  };

  // 深夜割増のハンドラー
  const handleDeepNightToggle = () => {
    const newValue = !showDeepNight;
    setShowDeepNight(newValue);
    if (!newValue) {
      setTempDeepNightDistanceRatio("");
      onChange({
        ...value,
        deepNight: { enabled: false, distanceRatio: 0 },
      });
    } else {
      onChange({
        ...value,
        deepNight: { enabled: true, distanceRatio: parseInt(tempDeepNightDistanceRatio) || 0 },
      });
    }
  };

  const handleDeepNightSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setTempDeepNightDistanceRatio(newValue);
    if (showDeepNight && newValue) {
      onChange({
        ...value,
        deepNight: { enabled: true, distanceRatio: parseInt(newValue, 10) },
      });
    }
  };

  // 速達割増のハンドラー
  const handleExpressToggle = () => {
    const newValue = !showExpress;
    setShowExpress(newValue);
    if (!newValue) {
      setTempExpressRate("");
      onChange({
        ...value,
        express: { enabled: false, surchargeRate: 0 },
      });
    } else {
      onChange({
        ...value,
        express: { enabled: true, surchargeRate: parseInt(tempExpressRate) || 0 },
      });
    }
  };

  const handleExpressSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setTempExpressRate(newValue);
    if (showExpress && newValue) {
      onChange({
        ...value,
        express: { enabled: true, surchargeRate: parseInt(newValue, 10) },
      });
    }
  };

  // 一般道利用割増のハンドラー
  const handleGeneralRoadToggle = () => {
    const newValue = !showGeneralRoad;
    setShowGeneralRoad(newValue);
    if (!newValue) {
      setTempGeneralRoadRate("");
      onChange({
        ...value,
        generalRoad: { enabled: false, surchargeRate: 0 },
      });
    } else {
      onChange({
        ...value,
        generalRoad: { enabled: true, surchargeRate: parseInt(tempGeneralRoadRate) || 0 },
      });
    }
  };

  const handleGeneralRoadSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setTempGeneralRoadRate(newValue);
    if (showGeneralRoad && newValue) {
      onChange({
        ...value,
        generalRoad: { enabled: true, surchargeRate: parseInt(newValue, 10) },
      });
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

  // スタイル定義を他のスタイル定義と同じ場所に移動
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
    fontSize: 14,
    minWidth: 90,
    textAlign: "center",
    padding: "1px 4px",
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

  // 燃料サーチャージ用のスタイル定義を追加
  const fuelInputContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginLeft: 16,
  };

  const fuelInputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const fuelLabelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#333',
    minWidth: 100,
    fontWeight: 'normal',
  };

  const fuelSelectStyle: React.CSSProperties = {
    width: 100,
    height: 36,
    padding: '0 8px',
    border: '1.5px solid #b94a48',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: '#fff',
    cursor: 'pointer',
  };

  const fuelUnitStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8
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

  // selectBoxStyleを関数ではなく、直接オブジェクトとして定義
  const selectBoxStyle: React.CSSProperties = {
    width: 80,
    height: 36,
    padding: '0 8px',
    border: '1.5px solid #b94a48',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer',
  };

  const percentUnitStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
    fontWeight: 'normal',
  };

  // confirmButtonStyleとその他の不要なスタイルを削除

  // 特殊車両用の追加スタイル
  const accordionContainerStyle: React.CSSProperties = {
    maxHeight: isVehicleListExpanded ? '400px' : selectedVehicleType ? '40px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    marginLeft: 16,
    width: '250px',
  };

  const vehicleItemStyle = (isSelected: boolean, vehicleId: string): React.CSSProperties => ({
    padding: '3px 5px',
    backgroundColor: isSelected ? '#b94a48' : '#fff',
    color: isSelected ? '#fff' : '#333',
    border: '1px solid #b94a48',
    borderRadius: 4,
    cursor: 'pointer',
    marginBottom: 4,
    transition: 'all 0.2s ease',
    fontSize: 12,
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
      {/* 燃料サーチャージ - 最上段に配置 */}
      <div style={{ position: 'relative', marginBottom: showFuelSurcharge ? 100 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={itemLabelStyle}>燃料サーチャージ</div>
          <button
            onClick={handleFuelSurchargeToggle}
            style={{
              padding: '8px 16px',
              backgroundColor: showFuelSurcharge ? '#b94a48' : '#fff',
              color: showFuelSurcharge ? '#fff' : '#333',
              border: '2px solid #b94a48',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {showFuelSurcharge ? '適用する' : '適用しない'}
          </button>
        </div>
        {showFuelSurcharge && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '5px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 4
          }}>
            <div style={fuelInputRowStyle}>
              <span style={fuelLabelStyle}>燃　費</span>
              <select
                value={tempFuelEfficiency}
                onChange={handleFuelEfficiencyChange}
                style={fuelSelectStyle}
              >
                <option value="">選択</option>
                <option value="1.0">1.0</option>
                <option value="1.5">1.5</option>
                <option value="2.0">2.0</option>
                <option value="2.5">2.5</option>
                <option value="3.0">3.0</option>
                <option value="3.5">3.5</option>
                <option value="4.0">4.0</option>
                <option value="4.5">4.5</option>
                <option value="5.0">5.0</option>
                <option value="5.5">5.5</option>
                <option value="6.0">6.0</option>
                <option value="6.5">6.5</option>
                <option value="7.0">7.0</option>
                <option value="7.5">7.5</option>
                <option value="8.0">8.0</option>
                <option value="8.5">8.5</option>
                <option value="9.0">9.0</option>
                <option value="9.5">9.5</option>
                <option value="10.0">10.0</option>
                <option value="10.5">10.5</option>
                <option value="11.0">11.0</option>
                <option value="11.5">11.5</option>
                <option value="12.0">12.0</option>
                <option value="12.5">12.5</option>
                <option value="13.0">13.0</option>
                <option value="13.5">13.5</option>
                <option value="14.0">14.0</option>
                <option value="14.5">14.5</option>
                <option value="15.0">15.0</option>
              </select>
              <span style={fuelUnitStyle}>km/L</span>
            </div>
            <div style={fuelInputRowStyle}>
              <span style={fuelLabelStyle}>燃料調達価格</span>
              <select
                value={tempFuelPrice}
                onChange={handleFuelPriceChange}
                style={fuelSelectStyle}
              >
                <option value="">選択</option>
                <option value="125">125円</option>
                <option value="130">130円</option>
                <option value="135">135円</option>
                <option value="140">140円</option>
                <option value="145">145円</option>
                <option value="145">145円</option>
                <option value="150">150円</option>
                <option value="155">155円</option>
                <option value="160">160円</option>
                <option value="165">165円</option>
                <option value="170">170円</option>
                <option value="175">175円</option>
                <option value="180">180円</option>
                <option value="185">185円</option>
                <option value="190">190円</option>
                <option value="185">195円</option>
                <option value="190">200円</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 特殊車両割増 */}
      <div style={{ position: 'relative', marginBottom: showSpecialVehicle ? 300 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={itemLabelStyle}>特殊車両割増</div>
          <button
            onClick={handleSpecialVehicleToggle}
            style={{
              padding: '8px 16px',
              backgroundColor: showSpecialVehicle ? '#b94a48' : '#fff',
              color: showSpecialVehicle ? '#fff' : '#333',
              border: '2px solid #b94a48',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {showSpecialVehicle ? '適用する' : '適用しない'}
          </button>
        </div>
        {showSpecialVehicle && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '5px',
            width: '270px',
            maxHeight: isVehicleListExpanded ? '400px' : selectedVehicleType ? '40px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out',
            marginTop: 4
          }}>
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

      {/* 休日割増 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>休日割増</div>
        <button
          onClick={() => setShowHoliday(!showHoliday)}
          style={{
            padding: '8px 16px',
            backgroundColor: showHoliday ? '#b94a48' : '#fff',
            color: showHoliday ? '#fff' : '#333',
            border: '2px solid #b94a48',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            marginRight: '16px',
          }}
        >
          {showHoliday ? '適用する' : '適用しない'}
        </button>
      </div>

      {/* 休日割増の走行距離比率選択 - 下段に配置 */}
      {showHoliday && (
        <div style={{
          marginLeft: 5,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={fuelLabelStyle}>走行距離比率</span>
          <select
            value={tempHolidayDistanceRatio}
            onChange={handleHolidaySelectChange}
            style={selectBoxStyle}
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
        </div>
      )}

      {/* 深夜割増 - ラジオボタンをボタンに変更 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>深夜割増</div>
        <button
          onClick={() => setShowDeepNight(!showDeepNight)}
          style={{
            padding: '8px 16px',
            backgroundColor: showDeepNight ? '#b94a48' : '#fff',
            color: showDeepNight ? '#fff' : '#333',
            border: '2px solid #b94a48',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            marginRight: '16px',
          }}
        >
          {showDeepNight ? '適用する' : '適用しない'}
        </button>
      </div>

      {/* 深夜割増の走行距離比率選択 - 下段に配置 */}
      {showDeepNight && (
        <div style={{
          marginLeft: 5,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={fuelLabelStyle}>走行距離比率</span>
          <select
            value={tempDeepNightDistanceRatio}
            onChange={handleDeepNightSelectChange}
            style={selectBoxStyle}
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
        </div>
      )}

      {/* 速達割増 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>速達割増</div>
        <button
          onClick={() => setShowExpress(!showExpress)}
          style={{
            padding: '8px 16px',
            backgroundColor: showExpress ? '#b94a48' : '#fff',
            color: showExpress ? '#fff' : '#333',
            border: '2px solid #b94a48',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            marginRight: '16px',
          }}
        >
          {showExpress ? '適用する' : '適用しない'}
        </button>
      </div>

      {/* 速達割増の割増率選択 - 下段に配置 */}
      {showExpress && (
        <div style={{
          marginLeft: 5,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={fuelLabelStyle}>割増率</span>
          <select
            value={tempExpressRate}
            onChange={handleExpressSelectChange}
            style={selectBoxStyle}
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
        </div>
      )}

      {/* 一般道利用割増 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>一般道利用割増</div>
        <button
          onClick={() => setShowGeneralRoad(!showGeneralRoad)}
          style={{
            padding: '8px 16px',
            backgroundColor: showGeneralRoad ? '#b94a48' : '#fff',
            color: showGeneralRoad ? '#fff' : '#333',
            border: '2px solid #b94a48',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            marginRight: '16px',
          }}
        >
          {showGeneralRoad ? '適用する' : '適用しない'}
        </button>
      </div>

      {/* 一般道利用割増の割増率選択 - 下段に配置 */}
      {showGeneralRoad && (
        <div style={{
          marginLeft: 5,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={fuelLabelStyle}>割増率</span>
          <select
            value={tempGeneralRoadRate}
            onChange={handleGeneralRoadSelectChange}
            style={selectBoxStyle}
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
        </div>
      )}

      {/* 利用運送手数料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>利用運送手数料</div>
        <button
          onClick={() => setShowForwardingFee(!showForwardingFee)}
          style={{
            padding: '8px 16px',
            backgroundColor: showForwardingFee ? '#b94a48' : '#fff',
            color: showForwardingFee ? '#fff' : '#333',
            border: '2px solid #b94a48',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            marginRight: '16px',
          }}
        >
          {showForwardingFee ? '適用する' : '適用しない'}
        </button>
      </div>

      {/* 利用運送手数料の表示 - 下段に配置 */}
      {showForwardingFee && (
        <div style={{
          marginLeft: 5,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={fixedRateDisplayStyle}>基準運賃額の10%</span>
        </div>
      )}
    </div>
  );
};

// エクスポート
export { SurchargeSettings };