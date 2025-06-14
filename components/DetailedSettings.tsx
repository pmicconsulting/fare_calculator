import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { SurchargeSettings } from './SurchargeSubMenu/SurchargeSettings';
import { DetailedTimeSettings } from './SurchargeSubMenu/DetailedTimeSettings';
import { DetailedSettingsType } from '../types/DetailedSettingsType';

type Props = {
  value: DetailedSettingsType;
  onChange: (newValue: DetailedSettingsType) => void;
};

const DetailedSettings: React.FC<Props> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'time' | 'surcharge'>('time');
  const onChangeRef = useRef(onChange);

  // onChangeの最新値をrefに保存
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // onChangeハンドラーをメモ化（依存配列を完全に空にし、refのみ使用）
  const handleTimeSettingsChange = useCallback((timeSettings: any) => {
    // 現在の値と新しい値を比較して変更がある場合のみ更新
    const hasWaitingTimeChanged = JSON.stringify(value.waitingTime) !== JSON.stringify(timeSettings.waitingTime);
    const hasLoadingWorkChanged = JSON.stringify(value.loadingWork) !== JSON.stringify(timeSettings.loadingWork);
    
    if (hasWaitingTimeChanged || hasLoadingWorkChanged) {
      onChangeRef.current((prevValue: DetailedSettingsType) => ({
        ...prevValue,
        waitingTime: timeSettings.waitingTime,
        loadingWork: timeSettings.loadingWork,
      }));
    }
  }, []);

  // 時間設定の値をメモ化
  const timeSettingsValue = useMemo(() => ({
    waitingTime: value.waitingTime || { departure: { enabled: false, time: 0 }, arrival: { enabled: false, time: 0 } },
    loadingWork: value.loadingWork || { departure: { enabled: false, type: '', time: 0 }, arrival: { enabled: false, type: '', time: 0 } },
  }), [value.waitingTime, value.loadingWork]);

  // 時間設定をレンダリング
  const renderTimeSettings = () => (
    <DetailedTimeSettings
      value={timeSettingsValue}
      onChange={handleTimeSettingsChange}
    />
  );

  // 割増の設定をレンダリング
  const renderSurcharge = () => (
    <SurchargeSettings value={value} onChange={onChange} />
  );

  // デフォルト値を確実に設定
  const getDefaultSettings = () => ({
    specialVehicle: { enabled: false, type: "" },
    holiday: { enabled: false, distanceRatio: 0 },
    deepNight: { enabled: false, distanceRatio: 0 },
    express: { enabled: false, surchargeRate: 20 }, // デフォルト値を追加
    generalRoad: { enabled: false, surchargeRate: 20 }, // デフォルト値追加
    waitingTime: {
      departure: { enabled: false, time: 0 },
      arrival: { enabled: false, time: 0 },
    },
    loadingWork: {
      departure: { enabled: false, type: "", time: 0 },
      arrival: { enabled: false, type: "", time: 0 },
    },
    forwardingFee: { enabled: false }, // ← 追加
    fuelSurcharge: { enabled: false, rate: 0 },
  });

  // DetailedSettingsコンポーネント内でsafeValueを定義
  const safeValue = { ...getDefaultSettings(), ...value };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      marginTop: '20px',
      backgroundColor: '#fff'
    }}>
      <div style={{ 
        marginBottom: '20px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px'
      }}>
        <button 
          onClick={() => setActiveTab('time')}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: activeTab === 'time' ? '#b94a48' : '#f8f9fa',
            color: activeTab === 'time' ? '#fff' : '#000',
            border: '2px solid #b94a48',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'time' ? 'bold' : 'normal'
          }}
        >
          待機時間料、積込・取卸料
        </button>
        <button 
          onClick={() => setActiveTab('surcharge')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: activeTab === 'surcharge' ? '#b94a48' : '#fff',
            color: activeTab === 'surcharge' ? '#fff' : '#000',
            border: '2px solid #b94a48',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'surcharge' ? 'bold' : 'normal'
          }}
        >
          燃料サーチャージ、割増料金
        </button>
      </div>
      
      <div style={{ minHeight: '200px' }}>
        {activeTab === 'time' && renderTimeSettings()}
        {activeTab === 'surcharge' && renderSurcharge()}
      </div>
    </div>
  );
};

export default DetailedSettings;