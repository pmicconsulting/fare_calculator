import React, { useState } from "react";
import { DetailedSettingsType, SpecialVehicleData } from '../../types/DetailedSettingsType';

// 取卸タイプのデータ定義
type LoadingWorkData = {
  id: string;
  name: string;
};

const loadingWorkTypes: LoadingWorkData[] = [
  { id: "machine", name: "機械荷役" },
  { id: "manual", name: "手荷役" }
];

// SurchargeSettingsProps の定義（valueとonChangeを追加）
type SurchargeSettingsProps = {
  value: any;
  onChange: (value: any) => void;
};

const ArrivalSettings: React.FC<SurchargeSettingsProps> = ({ value, onChange }) => {
  // onChangeが関数でない場合のフォールバック
  const handleChange = (newValue: any) => {
    if (typeof onChange === 'function') {
      onChange(newValue);
    } else {
      console.warn('onChange is not a function');
    }
  };

  // valueから初期値を取得するように修正
  const initialValue = value || {
    waitingTime: { enabled: false, time: "" },
    loadingWork: { enabled: false, type: "", time: "" },
  };

  // 待機時間料用の状態（初期値をvalueから取得）
  const [showWaitingTime, setShowWaitingTime] = useState(initialValue.waitingTime?.enabled || false);
  const [tempWaitingTime, setTempWaitingTime] = useState(
    initialValue.waitingTime?.time?.toString() || ""
  );
  const [isWaitingTimeConfirmed, setIsWaitingTimeConfirmed] = useState(
    initialValue.waitingTime?.time > 0
  );
  
  // 取卸料用の状態（初期値をvalueから取得）
  const [showLoadingWork, setShowLoadingWork] = useState(initialValue.loadingWork?.enabled || false);
  const [selectedLoadingType, setSelectedLoadingType] = useState<string | null>(initialValue.loadingWork?.type || null);
  const [tempLoadingTime, setTempLoadingTime] = useState(
    initialValue.loadingWork?.time?.toString() || ""
  );
  const [isLoadingTimeConfirmed, setIsLoadingTimeConfirmed] = useState(
    initialValue.loadingWork?.time > 0
  );
  // 選択モードの状態を追加
  const [isLoadingTypeSelected, setIsLoadingTypeSelected] = useState(!!initialValue.loadingWork?.type);

  // ユーティリティ関数
  // 全角→半角変換関数
  const toHalfWidth = (str: string): string => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  // 入力値の検証関数（1〜600の整数）
  const isValidTime = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= 600 && value === num.toString();
  };

  // ボタンのテキストを決定する関数
  const getButtonText = (isConfirmed: boolean, isDisabled: boolean): string => {
    if (isDisabled) return '無効';
    if (isConfirmed) return '確定済';
    return '確定';
  };

  // 待機時間料のハンドラー
  const handleWaitingTimeToggle = () => {
    const newValue = !showWaitingTime;
    setShowWaitingTime(newValue);
    if (!newValue) {
      setTempWaitingTime("");
      setIsWaitingTimeConfirmed(false);
      handleChange({
        ...value,
        waitingTime: { enabled: false, time: "" },
      });
    } else {
      handleChange({
        ...value,
        waitingTime: { enabled: true, time: tempWaitingTime || "" },
      });
    }
  };

  const handleWaitingTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempWaitingTime(e.target.value);
  };

  const handleWaitingTimeConfirm = () => {
    if (isWaitingTimeConfirmed) {
      // 確定済みの場合：編集モードに戻る
      setIsWaitingTimeConfirmed(false);
    } else {
      // 未確定の場合：確定処理
      if (tempWaitingTime) {
        setIsWaitingTimeConfirmed(true);
        console.log("待機時間料確定:", tempWaitingTime + "分");
        handleChange({
          ...value,
          waitingTime: { enabled: true, time: tempWaitingTime },
        });
      }
    }
  };

  // 取卸料のハンドラー
  const handleLoadingWorkToggle = () => {
    const newValue = !showLoadingWork;
    setShowLoadingWork(newValue);
    if (!newValue) {
      setTempLoadingTime("");
      setSelectedLoadingType(null);
      setIsLoadingTimeConfirmed(false);
      handleChange({
        ...value,
        loadingWork: { enabled: false, type: "", time: "" },
      });
    } else {
      handleChange({
        ...value,
        loadingWork: { enabled: true, type: selectedLoadingType || "", time: tempLoadingTime || "" },
      });
    }
  };

  const handleLoadingTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // 全角→半角変換
    const halfWidthValue = toHalfWidth(rawValue);
    // 数字以外を除去
    const numericValue = halfWidthValue.replace(/[^0-9]/g, '');
    setTempLoadingTime(numericValue);
  };

  // 取卸料の時間選択ハンドラーを追加
  const handleLoadingTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempLoadingTime(e.target.value);
  };

  const handleLoadingTimeConfirm = () => {
    if (isLoadingTimeConfirmed) {
      // 確定済みの場合：編集モードに戻る
      setIsLoadingTimeConfirmed(false);
    } else {
      // 未確定の場合：確定処理
      if (tempLoadingTime && selectedLoadingType) {
        setIsLoadingTimeConfirmed(true);
        console.log("取卸料確定:", selectedLoadingType, tempLoadingTime + "分");
        handleChange({
          ...value,
          loadingWork: { enabled: true, type: selectedLoadingType, time: tempLoadingTime },
        });
      }
    }
  };

  // 取卸タイプ選択ハンドラー
  const handleLoadingTypeSelect = (type: string) => {
    if (selectedLoadingType === type && isLoadingTypeSelected) {
      // 同じタイプを再度クリックした場合、選択を解除
      setIsLoadingTypeSelected(false);
    } else {
      // 新しいタイプを選択
      setSelectedLoadingType(type);
      setIsLoadingTypeSelected(true);
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

  const unitStyle: React.CSSProperties = {
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

  return (
    <div style={containerStyle}>
      {/* 待機時間料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>待機時間料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showWaitingTime)}>
              <input
                type="radio"
                name="waitingTime"
                checked={!showWaitingTime}
                onChange={handleWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showWaitingTime)}>
              <input
                type="radio"
                name="waitingTime"
                checked={showWaitingTime}
                onChange={handleWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showWaitingTime && (
          <div style={inputContainerWithLabelStyle}>
            <span style={timeLabelStyle}>所要時間</span>
            <select
              value={tempWaitingTime}
              onChange={handleWaitingTimeSelectChange}
              style={selectBoxStyle(isWaitingTimeConfirmed)}
              disabled={isWaitingTimeConfirmed}
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
            <button 
              onClick={handleWaitingTimeConfirm} 
              style={confirmButtonStyle(isWaitingTimeConfirmed, !tempWaitingTime)}
              disabled={!tempWaitingTime && !isWaitingTimeConfirmed}
              onMouseEnter={(e) => {
                if (!(!tempWaitingTime && !isWaitingTimeConfirmed)) {
                  e.currentTarget.style.backgroundColor = isWaitingTimeConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!tempWaitingTime && !isWaitingTimeConfirmed)) {
                  e.currentTarget.style.backgroundColor = isWaitingTimeConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isWaitingTimeConfirmed, !tempWaitingTime && !isWaitingTimeConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 取卸料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>取卸料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showLoadingWork)}>
              <input
                type="radio"
                name="loadingWork"
                checked={!showLoadingWork}
                onChange={handleLoadingWorkToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showLoadingWork)}>
              <input
                type="radio"
                name="loadingWork"
                checked={showLoadingWork}
                onChange={handleLoadingWorkToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showLoadingWork && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={accordionContainerStyle}>
              {loadingWorkTypes.map((loading) => {
                // 選択モードで、選択されていないアイテムは非表示
                if (isLoadingTypeSelected && selectedLoadingType !== loading.id) {
                  return null;
                }
                
                return (
                  <div
                    key={loading.id}
                    style={loadingItemStyle(selectedLoadingType === loading.id)}
                    onClick={() => handleLoadingTypeSelect(loading.id)}
                  >
                    {loading.name}
                  </div>
                );
              })}
            </div>
            <div style={inputContainerWithLabelStyle}>
              <span style={timeLabelStyle}>所要時間</span>
              <select
                value={tempLoadingTime}
                onChange={handleLoadingTimeSelectChange}
                style={selectBoxStyle(isLoadingTimeConfirmed)}
                disabled={isLoadingTimeConfirmed}
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
              <button 
                onClick={handleLoadingTimeConfirm} 
                style={confirmButtonStyle(isLoadingTimeConfirmed, !tempLoadingTime || !selectedLoadingType)}
                disabled={((!tempLoadingTime || !selectedLoadingType) && !isLoadingTimeConfirmed)}
                onMouseEnter={(e) => {
                  if (!((!tempLoadingTime || !selectedLoadingType) && !isLoadingTimeConfirmed)) {
                    e.currentTarget.style.backgroundColor = isLoadingTimeConfirmed ? '#218838' : '#a03937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!((!tempLoadingTime || !selectedLoadingType) && !isLoadingTimeConfirmed)) {
                    e.currentTarget.style.backgroundColor = isLoadingTimeConfirmed ? '#28a745' : '#b94a48';
                  }
                }}
              >
                {getButtonText(isLoadingTimeConfirmed, (!tempLoadingTime || !selectedLoadingType) && !isLoadingTimeConfirmed)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// エクスポート
export { ArrivalSettings };