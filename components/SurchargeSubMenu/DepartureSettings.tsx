import React, { useState, useEffect } from "react";
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
type DepartureSettingsProps = {
  // 個別のprops（新しいインターフェース）
  waitingTimeEnabled?: boolean;
  waitingTimeValue?: string;
  waitingTimeConfirmed?: boolean;
  loadingWorkEnabled?: boolean;
  loadingWorkValue?: string;
  loadingWorkConfirmed?: boolean;
  loadingWorkType?: string;
  onWaitingTimeChange?: (enabled: boolean, value: string) => void;
  onWaitingTimeConfirm?: (confirmed: boolean) => void;
  onLoadingWorkChange?: (enabled: boolean, value: string) => void;
  onLoadingWorkConfirm?: (confirmed: boolean) => void;
  // 統合されたprops（古いインターフェース）
  value?: any;
  onChange?: (value: any) => void;
};

const DepartureSettings: React.FC<DepartureSettingsProps> = (props) => {
  // 両方のインターフェースに対応
  const isLegacyMode = props.value !== undefined && props.onChange !== undefined;
  
  // propsから必要な値を取得（両方のインターフェースに対応）
  const {
    waitingTimeEnabled = isLegacyMode ? props.value?.waitingTime?.departure?.enabled : false,
    waitingTimeValue = isLegacyMode ? (props.value?.waitingTime?.departure?.time || 0).toString() : "",
    waitingTimeConfirmed = isLegacyMode ? props.value?.waitingTime?.departure?.confirmed : false,
    loadingWorkEnabled = isLegacyMode ? props.value?.loadingWork?.departure?.enabled : false,
    loadingWorkValue = isLegacyMode ? (props.value?.loadingWork?.departure?.time || 0).toString() : "",
    loadingWorkConfirmed = isLegacyMode ? props.value?.loadingWork?.departure?.confirmed : false,
    loadingWorkType = isLegacyMode ? props.value?.loadingWork?.departure?.type : undefined,
    onWaitingTimeChange = isLegacyMode ? 
      (enabled: boolean, value: string) => {
        if (props.onChange) {
          // ↓↓↓ 修正: 値が実際に変更された場合のみ更新 ↓↓↓
          const currentEnabled = props.value?.waitingTime?.departure?.enabled || false;
          const currentTime = props.value?.waitingTime?.departure?.time || 0;
          const newTime = parseInt(value) || 0;
          
          if (currentEnabled !== enabled || currentTime !== newTime) {
            props.onChange({
              ...props.value,
              waitingTime: {
                ...props.value?.waitingTime,
                departure: {
                  ...props.value?.waitingTime?.departure,
                  enabled,
                  time: newTime
                }
              }
            });
          }
          // ↑↑↑ 修正ここまで ↑↑↑
        }
      } : props.onWaitingTimeChange,
    onWaitingTimeConfirm = isLegacyMode ?
      (confirmed: boolean) => {
        if (props.onChange) {
          // ↓↓↓ 修正: 値が実際に変更された場合のみ更新 ↓↓↓
          const currentConfirmed = props.value?.waitingTime?.departure?.confirmed || false;
          
          if (currentConfirmed !== confirmed) {
            props.onChange({
              ...props.value,
              waitingTime: {
                ...props.value?.waitingTime,
                departure: {
                  ...props.value?.waitingTime?.departure,
                  confirmed
                }
              }
            });
          }
          // ↑↑↑ 修正ここまで ↑↑↑
        }
      } : props.onWaitingTimeConfirm,
    onLoadingWorkChange = isLegacyMode ?
      (enabled: boolean, value: string) => {
        if (props.onChange) {
          // ↓↓↓ 修正: 値が実際に変更された場合のみ更新 ↓↓↓
          const currentEnabled = props.value?.loadingWork?.departure?.enabled || false;
          const currentTime = props.value?.loadingWork?.departure?.time || 0;
          const newTime = parseInt(value) || 0;
          
          if (currentEnabled !== enabled || currentTime !== newTime) {
            props.onChange({
              ...props.value,
              loadingWork: {
                ...props.value?.loadingWork,
                departure: {
                  ...props.value?.loadingWork?.departure,
                  enabled,
                  time: newTime
                }
              }
            });
          }
          // ↑↑↑ 修正ここまで ↑↑↑
        }
      } : props.onLoadingWorkChange,
    onLoadingWorkConfirm = isLegacyMode ?
      (confirmed: boolean) => {
        if (props.onChange) {
          // ↓↓↓ 修正: 値が実際に変更された場合のみ更新 ↓↓↓
          const currentConfirmed = props.value?.loadingWork?.departure?.confirmed || false;
          
          if (currentConfirmed !== confirmed) {
            props.onChange({
              ...props.value,
              loadingWork: {
                ...props.value?.loadingWork,
                departure: {
                  ...props.value?.loadingWork?.departure,
                  confirmed
                }
              }
            });
          }
          // ↑↑↑ 修正ここまで ↑↑↑
        }
      } : props.onLoadingWorkConfirm,
  } = props;

  // ↓↓↓ デバッグ情報を修正 ↓↓↓
  // console.log("DepartureSettings mounted with props:", {
  //   isLegacyMode,
  //   waitingTimeEnabled,
  //   waitingTimeValue,
  //   waitingTimeConfirmed,
  //   loadingWorkEnabled,
  //   loadingWorkValue,
  //   loadingWorkConfirmed,
  //   loadingWorkType,
  //   // 関数の存在確認を追加
  //   onWaitingTimeChange_type: typeof onWaitingTimeChange,
  //   onWaitingTimeConfirm_type: typeof onWaitingTimeConfirm,
  //   onLoadingWorkChange_type: typeof onLoadingWorkChange,
  //   onLoadingWorkConfirm_type: typeof onLoadingWorkConfirm,
  //   // 関数が定義されているか確認
  //   onWaitingTimeChange_exists: onWaitingTimeChange !== undefined,
  //   onWaitingTimeConfirm_exists: onWaitingTimeConfirm !== undefined,
  //   onLoadingWorkChange_exists: onLoadingWorkChange !== undefined,
  //   onLoadingWorkConfirm_exists: onLoadingWorkConfirm !== undefined,
  // });
  // ↑↑↑ 修正ここまで ↑↑↑

  // valueから初期値を取得するように修正
  const initialValue = {
    waitingTime: { enabled: waitingTimeEnabled, time: waitingTimeValue },
    loadingWork: { enabled: loadingWorkEnabled, type: loadingWorkType || "", time: loadingWorkValue },
  };

  // ↓↓↓ 修正箇所ここから ↓↓↓
  // 待機時間料用の状態（初期値をvalueから取得）
  const [showWaitingTime, setShowWaitingTime] = useState(false);
  const [tempWaitingTime, setTempWaitingTime] = useState("");
  const [isWaitingTimeConfirmed, setIsWaitingTimeConfirmed] = useState(false);
  
  // 取卸料用の状態（初期値をvalueから取得）
  const [showLoadingWork, setShowLoadingWork] = useState(false);
  const [selectedLoadingType, setSelectedLoadingType] = useState<string | null>(null);
  const [tempLoadingTime, setTempLoadingTime] = useState("");
  const [isLoadingTimeConfirmed, setIsLoadingTimeConfirmed] = useState(false);
  // 選択モードの状態を追加
  const [isLoadingTypeSelected, setIsLoadingTypeSelected] = useState(false);

  // propsの変更を監視して状態を同期
  useEffect(() => {
    setShowWaitingTime(waitingTimeEnabled);
    setTempWaitingTime(waitingTimeValue || "");
    setIsWaitingTimeConfirmed(waitingTimeConfirmed);
  }, [waitingTimeEnabled, waitingTimeValue, waitingTimeConfirmed]);

  useEffect(() => {
    setShowLoadingWork(loadingWorkEnabled);
    setSelectedLoadingType(loadingWorkType || null);
    setTempLoadingTime(loadingWorkValue || "");
    setIsLoadingTimeConfirmed(loadingWorkConfirmed);
    setIsLoadingTypeSelected(!!loadingWorkType);
  }, [loadingWorkEnabled, loadingWorkValue, loadingWorkConfirmed, loadingWorkType]);
  // ↑↑↑ 修正箇所ここまで ↑↑↑

  // ↓↓↓ 削除: 重複したinitialValueの宣言を削除 ↓↓↓
  // // valueから初期値を取得するように修正
  // const initialValue = {
  //   waitingTime: { enabled: waitingTimeEnabled, time: waitingTimeValue },
  //   loadingWork: { enabled: loadingWorkEnabled, type: loadingWorkType || "", time: loadingWorkValue },
  // };
  // ↑↑↑ 削除ここまで ↑↑↑

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
    try {
      const newValue = !showWaitingTime;
      setShowWaitingTime(newValue);
      if (!newValue) {
        setTempWaitingTime("");
        setIsWaitingTimeConfirmed(false);
        if (onWaitingTimeChange && typeof onWaitingTimeChange === 'function') {
          onWaitingTimeChange(false, "");
        }
      } else {
        if (onWaitingTimeChange && typeof onWaitingTimeChange === 'function') {
          onWaitingTimeChange(true, tempWaitingTime || "");
        }
      }
    } catch (error) {
      console.error('Error in handleWaitingTimeToggle:', error);
    }
  };

  const handleWaitingTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempWaitingTime(e.target.value);
  };

  const handleWaitingTimeConfirm = () => {
    if (isWaitingTimeConfirmed) {
      setIsWaitingTimeConfirmed(false);
      // ↓↓↓ 修正: 関数存在チェックを追加 ↓↓↓
      if (typeof onWaitingTimeConfirm === 'function') {
        onWaitingTimeConfirm(false);
      }
      // ↑↑↑ 修正ここまで ↑↑↑
    } else {
      if (tempWaitingTime) {
        setIsWaitingTimeConfirmed(true);
        console.log("待機時間料確定:", tempWaitingTime + "分");
        // ↓↓↓ 修正: 関数存在チェックを追加 ↓↓↓
        if (typeof onWaitingTimeChange === 'function') {
          onWaitingTimeChange(true, tempWaitingTime);
        }
        if (typeof onWaitingTimeConfirm === 'function') {
          onWaitingTimeConfirm(true);
        }
        // ↑↑↑ 修正ここまで ↑↑↑

        // ↓↓↓ 追加するコード ↓↓↓
        console.log("Departure waiting time confirmed:", tempWaitingTime);
        console.log("Value being sent:", {
          waitingTime: { enabled: true, time: parseInt(tempWaitingTime, 10) }
        });
        // ↑↑↑ 追加ここまで ↑↑↑
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
      // ↓↓↓ 修正: 関数存在チェックを追加 ↓↓↓
      if (typeof onLoadingWorkChange === 'function') {
        onLoadingWorkChange(false, "");
      }
      // ↑↑↑ 修正ここまで ↑↑↑
    } else {
      // ↓↓↓ 修正: 関数存在チェックを追加 ↓↓↓
      if (typeof onLoadingWorkChange === 'function') {
        onLoadingWorkChange(true, tempLoadingTime || "");
      }
      // ↑↑↑ 修正ここまで ↑↑↑
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
      // ↓↓↓ 修正: 関数存在チェックを追加 ↓↓↓
      if (typeof onLoadingWorkConfirm === 'function') {
        onLoadingWorkConfirm(false);
      }
      // ↑↑↑ 修正ここまで ↑↑↑
    } else {
      // 未確定の場合：確定処理
      if (tempLoadingTime && selectedLoadingType) {
        setIsLoadingTimeConfirmed(true);
        console.log("取卸料確定:", selectedLoadingType, tempLoadingTime + "分");
        // ↓↓↓ 修正: 関数存在チェックを追加 ↓↓↓
        if (typeof onLoadingWorkChange === 'function') {
          onLoadingWorkChange(true, tempLoadingTime);
        }
        if (typeof onLoadingWorkConfirm === 'function') {
          onLoadingWorkConfirm(true);
        }
        // ↑↑↑ 修正ここまで ↑↑↑
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

      {/* 積込料 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={itemLabelStyle}>積込料</div>
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
export { DepartureSettings };