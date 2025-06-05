import React, { useState } from "react";

// 修正前のProps定義を以下に置き換え
type SpecialVehicleType = "none" | "trailer" | "refrigerated" | "wing" | "powerGate";

type SurchargeSettingsProps = {
  specialVehicleType: SpecialVehicleType;
  onSpecialVehicleChange: (type: SpecialVehicleType) => void;
  holidayEnabled: boolean;
  holidayRate: string;
  onHolidayChange: (enabled: boolean, rate: string) => void;
  deepNightEnabled: boolean;
  deepNightRate: string;
  onDeepNightChange: (enabled: boolean, rate: string) => void;
  expressEnabled: boolean;
  expressRate: string;
  onExpressChange: (enabled: boolean, rate: string) => void;
  generalRoadEnabled: boolean;
  generalRoadRate: string;
  onGeneralRoadChange: (enabled: boolean, rate: string) => void;
  forwardingFeeEnabled: boolean;
  forwardingFeeAmount: string;
  onForwardingFeeChange: (enabled: boolean, amount: string) => void;
};

// DepartureSettings → SurchargeSettingsに変更（名前のみ）
const SurchargeSettings: React.FC<SurchargeSettingsProps> = ({
  specialVehicleType,
  onSpecialVehicleChange,
  holidayEnabled,
  holidayRate,
  onHolidayChange,
  deepNightEnabled,
  deepNightRate,
  onDeepNightChange,
  expressEnabled,
  expressRate,
  onExpressChange,
  generalRoadEnabled,
  generalRoadRate,
  onGeneralRoadChange,
  forwardingFeeEnabled,
  forwardingFeeAmount,
  onForwardingFeeChange,
}) => {
  const [tempHolidayRate, setTempHolidayRate] = useState(holidayRate);
  const [tempDeepNightRate, setTempDeepNightRate] = useState(deepNightRate);
  const [tempExpressRate, setTempExpressRate] = useState(expressRate);
  const [tempGeneralRoadRate, setTempGeneralRoadRate] = useState(generalRoadRate);
  const [tempForwardingFee, setTempForwardingFee] = useState(forwardingFeeAmount);
  const [showHoliday, setShowHoliday] = useState(holidayEnabled);
  const [showDeepNight, setShowDeepNight] = useState(deepNightEnabled);
  const [showExpress, setShowExpress] = useState(expressEnabled);
  const [showGeneralRoad, setShowGeneralRoad] = useState(generalRoadEnabled);
  const [showForwardingFee, setShowForwardingFee] = useState(forwardingFeeEnabled);

  const handleHolidayToggle = () => {
    setShowHoliday((prev) => !prev);
    if (showHoliday) {
      setTempHolidayRate("");
      onHolidayChange(false, "");
    }
  };

  const handleHolidayConfirm = () => {
    onHolidayChange(true, tempHolidayRate);
  };

  const handleDeepNightToggle = () => {
    setShowDeepNight((prev) => !prev);
    if (showDeepNight) {
      setTempDeepNightRate("");
      onDeepNightChange(false, "");
    }
  };

  const handleDeepNightConfirm = () => {
    onDeepNightChange(true, tempDeepNightRate);
  };

  const handleExpressToggle = () => {
    setShowExpress((prev) => !prev);
    if (showExpress) {
      setTempExpressRate("");
      onExpressChange(false, "");
    }
  };

  const handleExpressConfirm = () => {
    onExpressChange(true, tempExpressRate);
  };

  const handleGeneralRoadToggle = () => {
    setShowGeneralRoad((prev) => !prev);
    if (showGeneralRoad) {
      setTempGeneralRoadRate("");
      onGeneralRoadChange(false, "");
    }
  };

  const handleGeneralRoadConfirm = () => {
    onGeneralRoadChange(true, tempGeneralRoadRate);
  };

  const handleForwardingFeeToggle = () => {
    setShowForwardingFee((prev) => !prev);
    if (showForwardingFee) {
      setTempForwardingFee("");
      onForwardingFeeChange(false, "");
    }
  };

  const handleForwardingFeeConfirm = () => {
    onForwardingFeeChange(true, tempForwardingFee);
  };

  // スタイル定義（すべてそのまま）
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
      {/* 特殊車両設定 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>特殊車両設定</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(specialVehicleType === "none")}>
              <input
                type="radio"
                name="specialVehicle"
                checked={specialVehicleType === "none"}
                onChange={() => onSpecialVehicleChange("none")}
                style={radioInputStyle}
              />
              なし
            </label>
            <label style={radioLabelStyle(specialVehicleType === "trailer")}>
              <input
                type="radio"
                name="specialVehicle"
                checked={specialVehicleType === "trailer"}
                onChange={() => onSpecialVehicleChange("trailer")}
                style={radioInputStyle}
              />
              トレーラー
            </label>
            <label style={radioLabelStyle(specialVehicleType === "refrigerated")}>
              <input
                type="radio"
                name="specialVehicle"
                checked={specialVehicleType === "refrigerated"}
                onChange={() => onSpecialVehicleChange("refrigerated")}
                style={radioInputStyle}
              />
              冷凍車
            </label>
            <label style={radioLabelStyle(specialVehicleType === "wing")}>
              <input
                type="radio"
                name="specialVehicle"
                checked={specialVehicleType === "wing"}
                onChange={() => onSpecialVehicleChange("wing")}
                style={radioInputStyle}
              />
              ウイング
            </label>
            <label style={radioLabelStyle(specialVehicleType === "powerGate")}>
              <input
                type="radio"
                name="specialVehicle"
                checked={specialVehicleType === "powerGate"}
                onChange={() => onSpecialVehicleChange("powerGate")}
                style={radioInputStyle}
              />
              パワーゲート
            </label>
          </div>
        </div>
      </div>

      {/* 休日料金 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>休日料金</div>
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
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempHolidayRate}
              onChange={(e) => setTempHolidayRate(e.target.value)}
              style={inputBoxStyle}
              placeholder="％"
            />
            <button onClick={handleHolidayConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>

      {/* 深夜料金 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>深夜料金</div>
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
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempDeepNightRate}
              onChange={(e) => setTempDeepNightRate(e.target.value)}
              style={inputBoxStyle}
              placeholder="％"
            />
            <button onClick={handleDeepNightConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>

      {/* 速達料金 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>速達料金</div>
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
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempExpressRate}
              onChange={(e) => setTempExpressRate(e.target.value)}
              style={inputBoxStyle}
              placeholder="％"
            />
            <button onClick={handleExpressConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>

      {/* 一般道料金 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>一般道料金</div>
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
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempGeneralRoadRate}
              onChange={(e) => setTempGeneralRoadRate(e.target.value)}
              style={inputBoxStyle}
              placeholder="％"
            />
            <button onClick={handleGeneralRoadConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>

      {/* 送り状料金 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>送り状料金</div>
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
          <div style={inputContainerStyle}>
            <input
              type="number"
              value={tempForwardingFee}
              onChange={(e) => setTempForwardingFee(e.target.value)}
              style={inputBoxStyle}
              placeholder="円"
            />
            <button onClick={handleForwardingFeeConfirm} style={buttonStyle}>
              確定
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// DepartureSettings → SurchargeSettingsに変更
export { SurchargeSettings };