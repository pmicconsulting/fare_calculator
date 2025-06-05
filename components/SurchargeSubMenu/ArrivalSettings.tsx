import React, { useState } from "react";

// 荷役タイプのデータ定義
type LoadingWorkData = {
  id: string;
  name: string;
};

const loadingWorkTypes: LoadingWorkData[] = [
  { id: "machine", name: "機械荷役" },
  { id: "manual", name: "手荷役" }
];

type ArrivalSettingsProps = {
  waitingTimeEnabled: boolean;
  waitingTimeValue: string;
  loadingWorkEnabled: boolean;
  loadingWorkValue: string;
  onWaitingTimeChange: (enabled: boolean, value: string) => void;
  onLoadingWorkChange: (enabled: boolean, value: string) => void;
  loadingWorkType?: "machine" | "manual";
};

// スタイルの修正
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  fontFamily: "sans-serif",
  padding: "12px 0",
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
  textAlign: "left",
  padding: "8px 16px",
  marginRight: 24,
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start"
};

const radioGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: 8,
  height: "100%",
  padding: "8px 16px",
};

const radioContainerStyle: React.CSSProperties = {
  border: "1.5px solid #b94a48",
  borderRadius: 4,
  background: "#fff",
  width: 200,
  height: 80,
  padding: "0 8px",
  marginRight: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

const radioLabelStyle = (isSelected: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  color: isSelected ? "#b94a48" : "#666",
  fontWeight: isSelected ? "bold" : "normal",
  cursor: "pointer",
  transition: "all 0.2s",
  fontSize: 14,
  whiteSpace: "nowrap",
  width: "100%",
});

const radioInputStyle: React.CSSProperties = {
  marginRight: 8,
  cursor: "pointer",
  accentColor: "#b94a48",
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

const inputContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const ArrivalSettings: React.FC<ArrivalSettingsProps> = ({
  waitingTimeEnabled,
  waitingTimeValue,
  loadingWorkEnabled,
  loadingWorkValue,
  onWaitingTimeChange,
  onLoadingWorkChange,
  loadingWorkType: initialLoadingWorkType,
}) => {
  // 待機時間料の状態
  const [showWaitingTime, setShowWaitingTime] = useState(waitingTimeEnabled);
  const [tempWaitingTime, setTempWaitingTime] = useState("");
  const [isWaitingTimeConfirmed, setIsWaitingTimeConfirmed] = useState(false);

  // 取卸料の状態
  const [showLoadingWork, setShowLoadingWork] = useState(loadingWorkEnabled);
  const [selectedLoadingType, setSelectedLoadingType] = useState<string | null>(null);
  const [isLoadingListExpanded, setIsLoadingListExpanded] = useState(false);
  const [tempLoadingTime, setTempLoadingTime] = useState("");
  const [isLoadingTimeConfirmed, setIsLoadingTimeConfirmed] = useState(false);

  // 全角→半角変換関数
  const toHalfWidth = (str: string): string => {
    return str.replace(/[０-９．]/g, (s) => {
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
      onWaitingTimeChange(false, "");
    } else {
      onWaitingTimeChange(true, tempWaitingTime);
    }
  };

  const handleWaitingTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const halfWidthValue = toHalfWidth(rawValue);
    // 数字以外を除去（小数点も除去）
    const numericValue = halfWidthValue.replace(/[^0-9]/g, '');
    
    // 600を超える場合は入力を制限
    if (numericValue && parseInt(numericValue, 10) > 600) {
      setTempWaitingTime('600');
    } else {
      setTempWaitingTime(numericValue);
    }
  };

  const handleWaitingTimeConfirm = () => {
    if (isWaitingTimeConfirmed) {
      setIsWaitingTimeConfirmed(false);
    } else {
      if (isValidTime(tempWaitingTime)) {
        setIsWaitingTimeConfirmed(true);
        onWaitingTimeChange(true, tempWaitingTime);
        console.log("待機時間料確定:", tempWaitingTime + "分");
      }
    }
  };

  // 取卸料のハンドラー
  const handleLoadingWorkToggle = () => {
    const newValue = !showLoadingWork;
    setShowLoadingWork(newValue);
    if (!newValue) {
      setSelectedLoadingType(null);
      setIsLoadingListExpanded(false);
      setTempLoadingTime("");
      setIsLoadingTimeConfirmed(false);
      if (onLoadingWorkChange) { // ← 追加: 存在チェック
        onLoadingWorkChange(false, "");
      }
    } else {
      setIsLoadingListExpanded(true); // 「適用する」で自動展開
      if (onLoadingWorkChange) { // ← 追加: 存在チェック
        onLoadingWorkChange(true, tempLoadingTime);
      }
    }
  };

  const handleLoadingTypeSelect = (loadingId: string) => {
    if (selectedLoadingType === loadingId) {
      // 選択済みをクリックしたら展開
      setIsLoadingListExpanded(true);
    } else {
      // 新規選択
      setSelectedLoadingType(loadingId);
      console.log("取卸料タイプ選択:", loadingId);
      setIsLoadingListExpanded(false);
    }
  };

  const handleLoadingTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const halfWidthValue = toHalfWidth(rawValue);
    // 数字以外を除去（小数点も除去）
    const numericValue = halfWidthValue.replace(/[^0-9]/g, '');
    
    // 600を超える場合は入力を制限
    if (numericValue && parseInt(numericValue, 10) > 600) {
      setTempLoadingTime('600');
    } else {
      setTempLoadingTime(numericValue);
    }
  };

  const handleLoadingTimeConfirm = () => {
    if (isLoadingTimeConfirmed) {
      setIsLoadingTimeConfirmed(false);
    } else {
      if (isValidTime(tempLoadingTime) && selectedLoadingType) {
        setIsLoadingTimeConfirmed(true);
        if (onLoadingWorkChange) {
          onLoadingWorkChange(true, tempLoadingTime);
        }
        console.log("取卸料確定:", selectedLoadingType, tempLoadingTime + "分");
      }
    }
  };

  // 追加のスタイル定義
  const timeLabelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: 'normal',
  };

  const timeInputBoxStyle = (isConfirmed: boolean): React.CSSProperties => ({
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

  const unitStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  };

  const accordionContainerStyle: React.CSSProperties = {
    maxHeight: isLoadingListExpanded ? '50px' : selectedLoadingType ? '50px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
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
    display: isSelected || isLoadingListExpanded ? 'block' : 'none',
    whiteSpace: 'nowrap',
  });

  const timeInputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  return (
    <div style={containerStyle}>
      {/* 待機時間料 */}
      <div style={rowStyle}>
        <div style={itemLabelStyle}>待機時間料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showWaitingTime)}>
              <input
                type="radio"
                name="wait"
                checked={!showWaitingTime}
                onChange={handleWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showWaitingTime)}>
              <input
                type="radio"
                name="wait"
                checked={showWaitingTime}
                onChange={handleWaitingTimeToggle}
                style={radioInputStyle}
              />
              適用する
            </label>
          </div>
        </div>
        {showWaitingTime && (
          <div style={timeInputContainerStyle}>
            <span style={timeLabelStyle}>所要時間</span>
            <input
              type="text"
              value={tempWaitingTime}
              onChange={handleWaitingTimeInputChange}
              style={timeInputBoxStyle(isWaitingTimeConfirmed)}
              disabled={isWaitingTimeConfirmed}
              maxLength={3}
            />
            <span style={unitStyle}>分</span>
            <button 
              onClick={handleWaitingTimeConfirm} 
              style={confirmButtonStyle(isWaitingTimeConfirmed, !isValidTime(tempWaitingTime))}
              disabled={!isValidTime(tempWaitingTime) && !isWaitingTimeConfirmed}
              onMouseEnter={(e) => {
                if (!(!isValidTime(tempWaitingTime) && !isWaitingTimeConfirmed)) {
                  e.currentTarget.style.backgroundColor = isWaitingTimeConfirmed ? '#218838' : '#a03937';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!isValidTime(tempWaitingTime) && !isWaitingTimeConfirmed)) {
                  e.currentTarget.style.backgroundColor = isWaitingTimeConfirmed ? '#28a745' : '#b94a48';
                }
              }}
            >
              {getButtonText(isWaitingTimeConfirmed, !isValidTime(tempWaitingTime) && !isWaitingTimeConfirmed)}
            </button>
          </div>
        )}
      </div>

      {/* 取卸料 */}
      <div style={rowStyle}>
        <div style={itemLabelStyle}>取卸料</div>
        <div style={radioContainerStyle}>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle(!showLoadingWork)}>
              <input
                type="radio"
                name="load"
                checked={!showLoadingWork}
                onChange={handleLoadingWorkToggle}
                style={radioInputStyle}
              />
              適用しない
            </label>
            <label style={radioLabelStyle(showLoadingWork)}>
              <input
                type="radio"
                name="load"
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
              {loadingWorkTypes.map((loading) => (
                <div
                  key={loading.id}
                  style={loadingItemStyle(selectedLoadingType === loading.id)}
                  onClick={() => handleLoadingTypeSelect(loading.id)}
                >
                  {loading.name}
                </div>
              ))}
            </div>
            <div style={timeInputContainerStyle}>
              <span style={timeLabelStyle}>所要時間</span>
              <input
                type="text"
                value={tempLoadingTime}
                onChange={handleLoadingTimeInputChange}
                style={timeInputBoxStyle(isLoadingTimeConfirmed)}
                disabled={isLoadingTimeConfirmed}
                maxLength={3}
              />
              <span style={unitStyle}>分</span>
              <button 
                onClick={handleLoadingTimeConfirm} 
                style={confirmButtonStyle(isLoadingTimeConfirmed, !isValidTime(tempLoadingTime) || !selectedLoadingType)}
                disabled={(!isValidTime(tempLoadingTime) || !selectedLoadingType) && !isLoadingTimeConfirmed}
                onMouseEnter={(e) => {
                  if (!((!isValidTime(tempLoadingTime) || !selectedLoadingType) && !isLoadingTimeConfirmed)) {
                    e.currentTarget.style.backgroundColor = isLoadingTimeConfirmed ? '#218838' : '#a03937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!((!isValidTime(tempLoadingTime) || !selectedLoadingType) && !isLoadingTimeConfirmed)) {
                    e.currentTarget.style.backgroundColor = isLoadingTimeConfirmed ? '#28a745' : '#b94a48';
                  }
                }}
              >
                {getButtonText(isLoadingTimeConfirmed, (!isValidTime(tempLoadingTime) || !selectedLoadingType) && !isLoadingTimeConfirmed)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ArrivalSettings };