import React, { useState, useEffect } from "react";
import { DetailedSettingsType, SpecialVehicleData } from '../../types/DetailedSettingsType';

// 荷役作業タイプのデータ定義
type LoadingWorkData = {
  id: string;
  name: string;
};

const loadingWorkTypes: LoadingWorkData[] = [
  { id: "machine", name: "機械荷役" },
  { id: "manual", name: "手荷役" }
];

// Props定義
type DetailedTimeSettingsProps = {
  value: any;
  onChange: (value: any) => void;
};

const DetailedTimeSettings: React.FC<DetailedTimeSettingsProps> = ({ value, onChange }) => {
  // onChangeが関数でない場合のフォールバック
  const handleChange = (newValue: any) => {
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  // valueから初期値を取得
  const initialValue = value || {
    waitingTime: {
      departure: { enabled: false, time: "" },
      arrival: { enabled: false, time: "" }
    },
    loadingWork: {
      departure: { enabled: false, type: "", time: "" },
      arrival: { enabled: false, type: "", time: "" }
    },
  };

  // 出発時の状態管理（確定状態を削除）
  const [showDepartureWaitingTime, setShowDepartureWaitingTime] = useState(initialValue.waitingTime?.departure?.enabled || false);
  const [tempDepartureWaitingTime, setTempDepartureWaitingTime] = useState(
    initialValue.waitingTime?.departure?.time?.toString() || ""
  );

  const [showDepartureLoadingWork, setShowDepartureLoadingWork] = useState(initialValue.loadingWork?.departure?.enabled || false);
  const [selectedDepartureLoadingType, setSelectedDepartureLoadingType] = useState<string | null>(initialValue.loadingWork?.departure?.type || null);
  const [tempDepartureLoadingTime, setTempDepartureLoadingTime] = useState(
    initialValue.loadingWork?.departure?.time?.toString() || ""
  );
  const [isDepartureLoadingTypeSelected, setIsDepartureLoadingTypeSelected] = useState(!!initialValue.loadingWork?.departure?.type);

  // 到着時の状態管理（確定状態を削除）
  const [showArrivalWaitingTime, setShowArrivalWaitingTime] = useState(initialValue.waitingTime?.arrival?.enabled || false);
  const [tempArrivalWaitingTime, setTempArrivalWaitingTime] = useState(
    initialValue.waitingTime?.arrival?.time?.toString() || ""
  );

  const [showArrivalLoadingWork, setShowArrivalLoadingWork] = useState(initialValue.loadingWork?.arrival?.enabled || false);
  const [selectedArrivalLoadingType, setSelectedArrivalLoadingType] = useState<string | null>(initialValue.loadingWork?.arrival?.type || null);
  const [tempArrivalLoadingTime, setTempArrivalLoadingTime] = useState(
    initialValue.loadingWork?.arrival?.time?.toString() || ""
  );
  const [isArrivalLoadingTypeSelected, setIsArrivalLoadingTypeSelected] = useState(!!initialValue.loadingWork?.arrival?.type);

  // ユーティリティ関数（getButtonTextを削除）
  const toHalfWidth = (str: string): string => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  const isValidTime = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= 600 && value === num.toString();
  };

  // 出発時のハンドラー（確定関数を削除）
  const handleDepartureWaitingTimeToggle = () => {
    const newValue = !showDepartureWaitingTime;
    setShowDepartureWaitingTime(newValue);
    if (!newValue) {
      setTempDepartureWaitingTime("");
    }
  };

  const handleDepartureWaitingTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempDepartureWaitingTime(e.target.value);
  };

  const handleDepartureLoadingWorkToggle = () => {
    const newValue = !showDepartureLoadingWork;
    setShowDepartureLoadingWork(newValue);
    if (!newValue) {
      setTempDepartureLoadingTime("");
      setSelectedDepartureLoadingType(null);
    }
  };

  const handleDepartureLoadingTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempDepartureLoadingTime(e.target.value);
  };

  const handleDepartureLoadingTypeSelect = (type: string) => {
    if (selectedDepartureLoadingType === type && isDepartureLoadingTypeSelected) {
      setIsDepartureLoadingTypeSelected(false);
    } else {
      setSelectedDepartureLoadingType(type);
      setIsDepartureLoadingTypeSelected(true);
    }
  };

  // 到着時のハンドラー（確定関数を削除）
  const handleArrivalWaitingTimeToggle = () => {
    const newValue = !showArrivalWaitingTime;
    setShowArrivalWaitingTime(newValue);
    if (!newValue) {
      setTempArrivalWaitingTime("");
    }
  };

  const handleArrivalWaitingTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempArrivalWaitingTime(e.target.value);
  };

  const handleArrivalLoadingWorkToggle = () => {
    const newValue = !showArrivalLoadingWork;
    setShowArrivalLoadingWork(newValue);
    if (!newValue) {
      setTempArrivalLoadingTime("");
      setSelectedArrivalLoadingType(null);
    }
  };

  const handleArrivalLoadingTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempArrivalLoadingTime(e.target.value);
  };

  const handleArrivalLoadingTypeSelect = (type: string) => {
    if (selectedArrivalLoadingType === type && isArrivalLoadingTypeSelected) {
      setIsArrivalLoadingTypeSelected(false);
    } else {
      setSelectedArrivalLoadingType(type);
      setIsArrivalLoadingTypeSelected(true);
    }
  };

  // スタイル定義（既存のスタイルを維持）
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontFamily: "sans-serif",
    padding: "12px 0",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    marginTop: 24,
    borderBottom: "2px solid #b94a48",
    paddingBottom: 8,
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
    gap: 8
  };

  const timeLabelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
  };

  const selectBoxStyle: React.CSSProperties = {
    width: 100,
    height: 36,
    padding: '0 8px',
    border: '1.5px solid #b94a48',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer',
  };

  // confirmButtonStyleの定義を削除

  const accordionContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 12,
    marginBottom: 20,
    width: '300px',
  };

  const loadingItemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    backgroundColor: isSelected ? '#b94a48' : '#fff',
    color: isSelected ? '#fff' : '#333',
    border: '1px solid #b94a48',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: 14,
  });

  // useEffectで親コンポーネントに値を送信
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({
        waitingTime: {
          departure: {
            enabled: showDepartureWaitingTime,
            time: Number(tempDepartureWaitingTime) || 0,
          },
          arrival: {
            enabled: showArrivalWaitingTime,
            time: Number(tempArrivalWaitingTime) || 0,
          },
        },
        loadingWork: {
          departure: {
            enabled: showDepartureLoadingWork,
            type: selectedDepartureLoadingType,
            time: Number(tempDepartureLoadingTime) || 0,
          },
          arrival: {
            enabled: showArrivalLoadingWork,
            type: selectedArrivalLoadingType,
            time: Number(tempArrivalLoadingTime) || 0,
          },
        },
      });
    }
  }, [
    showDepartureWaitingTime, tempDepartureWaitingTime,
    showDepartureLoadingWork, selectedDepartureLoadingType, tempDepartureLoadingTime,
    showArrivalWaitingTime, tempArrivalWaitingTime,
    showArrivalLoadingWork, selectedArrivalLoadingType, tempArrivalLoadingTime,
    onChange
  ]);

  // 確定ボタンのクリックハンドラ
  const handleConfirmClick = () => {
    // 既存の状態更新処理
    if (tempDepartureWaitingTime && showDepartureWaitingTime && !isValidTime(tempDepartureWaitingTime)) {
      alert("出発地の待機時間は1~600の間の数値を入力してください。");
      return;
    }
    
    // 残りのコード
  };

  return (
    <div style={containerStyle}>
      {/* 出発時の設定事項 */}
      <div style={sectionTitleStyle}>出発時の設定事項</div>
      
      {/* 出発時：待機時間料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>待機時間料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showDepartureWaitingTime)}>
              <input
                type="radio"
                name="departureWaitingTime"
                checked={!showDepartureWaitingTime}
                onChange={handleDepartureWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showDepartureWaitingTime)}>
              <input
                type="radio"
                name="departureWaitingTime"
                checked={showDepartureWaitingTime}
                onChange={handleDepartureWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showDepartureWaitingTime && (
          <div style={inputContainerWithLabelStyle}>
            <span style={timeLabelStyle}>所要時間</span>
            <select
              value={tempDepartureWaitingTime}
              onChange={handleDepartureWaitingTimeSelectChange}
              style={selectBoxStyle}
            >
              <option value="">選択</option>
              <option value="30">30分</option>
              <option value="60">60分</option>
              <option value="90">90分</option>
              <option value="120">120分</option>
              <option value="150">150分</option>
              <option value="180">180分</option>
              <option value="210">210分</option>
              <option value="240">240分</option>
              <option value="270">270分</option>
              <option value="300">300分</option>
            </select>
          </div>
        )}
      </div>

      {/* 出発時：積込料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>積込料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showDepartureLoadingWork)}>
              <input
                type="radio"
                name="departureLoadingWork"
                checked={!showDepartureLoadingWork}
                onChange={handleDepartureLoadingWorkToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showDepartureLoadingWork)}>
              <input
                type="radio"
                name="departureLoadingWork"
                checked={showDepartureLoadingWork}
                onChange={handleDepartureLoadingWorkToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showDepartureLoadingWork && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={accordionContainerStyle}>
              {loadingWorkTypes.map((loading) => {
                if (isDepartureLoadingTypeSelected && selectedDepartureLoadingType !== loading.id) {
                  return null;
                }
                
                return (
                  <div
                    key={loading.id}
                    style={loadingItemStyle(selectedDepartureLoadingType === loading.id)}
                    onClick={() => handleDepartureLoadingTypeSelect(loading.id)}
                  >
                    {loading.name}
                  </div>
                );
              })}
            </div>
            <div style={inputContainerWithLabelStyle}>
              <span style={timeLabelStyle}>所要時間</span>
              <select
                value={tempDepartureLoadingTime}
                onChange={handleDepartureLoadingTimeSelectChange}
                style={selectBoxStyle}
              >
                <option value="">選択</option>
                <option value="30">30分</option>
                <option value="60">60分</option>
                <option value="90">90分</option>
                <option value="120">120分</option>
                <option value="150">150分</option>
                <option value="180">180分</option>
                <option value="210">210分</option>
                <option value="240">240分</option>
                <option value="270">270分</option>
                <option value="300">300分</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 到着時の設定事項 */}
      <div style={sectionTitleStyle}>到着時の設定事項</div>

      {/* 到着時：待機時間料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>待機時間料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showArrivalWaitingTime)}>
              <input
                type="radio"
                name="arrivalWaitingTime"
                checked={!showArrivalWaitingTime}
                onChange={handleArrivalWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showArrivalWaitingTime)}>
              <input
                type="radio"
                name="arrivalWaitingTime"
                checked={showArrivalWaitingTime}
                onChange={handleArrivalWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showArrivalWaitingTime && (
          <div style={inputContainerWithLabelStyle}>
            <span style={timeLabelStyle}>所要時間</span>
            <select
              value={tempArrivalWaitingTime}
              onChange={handleArrivalWaitingTimeSelectChange}
              style={selectBoxStyle}
            >
              <option value="">選択</option>
              <option value="30">30分</option>
              <option value="60">60分</option>
              <option value="90">90分</option>
              <option value="120">120分</option>
              <option value="150">150分</option>
              <option value="180">180分</option>
              <option value="210">210分</option>
              <option value="240">240分</option>
              <option value="270">270分</option>
              <option value="300">300分</option>
            </select>
          </div>
        )}
      </div>

      {/* 到着時：取卸料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>取卸料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showArrivalLoadingWork)}>
              <input
                type="radio"
                name="arrivalLoadingWork"
                checked={!showArrivalLoadingWork}
                onChange={handleArrivalLoadingWorkToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showArrivalLoadingWork)}>
              <input
                type="radio"
                name="arrivalLoadingWork"
                checked={showArrivalLoadingWork}
                onChange={handleArrivalLoadingWorkToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showArrivalLoadingWork && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={accordionContainerStyle}>
              {loadingWorkTypes.map((loading) => {
                if (isArrivalLoadingTypeSelected && selectedArrivalLoadingType !== loading.id) {
                  return null;
                }
                
                return (
                  <div
                    key={loading.id}
                    style={loadingItemStyle(selectedArrivalLoadingType === loading.id)}
                    onClick={() => handleArrivalLoadingTypeSelect(loading.id)}
                  >
                    {loading.name}
                  </div>
                );
              })}
            </div>
            <div style={inputContainerWithLabelStyle}>
              <span style={timeLabelStyle}>所要時間</span>
              <select
                value={tempArrivalLoadingTime}
                onChange={handleArrivalLoadingTimeSelectChange}
                style={selectBoxStyle}
              >
                <option value="">選択</option>
                <option value="30">30分</option>
                <option value="60">60分</option>
                <option value="90">90分</option>
                <option value="120">120分</option>
                <option value="150">150分</option>
                <option value="180">180分</option>
                <option value="210">210分</option>
                <option value="240">240分</option>
                <option value="270">270分</option>
                <option value="300">300分</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// エクスポート
export { DetailedTimeSettings };