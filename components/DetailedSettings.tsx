import React, { useState, useCallback } from 'react';
// import FuelSurchargeSettings from './SurchargeSubMenu/FuelSurchargeSettings'; // この行を削除
import { SurchargeSettings } from './SurchargeSubMenu/SurchargeSettings';
import { DetailedTimeSettings } from './SurchargeSubMenu/DetailedTimeSettings';
import { DetailedSettingsType } from '../types/DetailedSettingsType';

type Props = {
  value: any;
  onChange: (newValue: any) => void;
};

const DetailedSettings: React.FC<Props> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'time' | 'surcharge'>('time'); // 'fee'を削除

  // ArrivalSettingsから受け取った値をstateに設定する例
  const [settings, setSettings] = useState<DetailedSettingsType>({
    waitingTime: {
      arrival: { enabled: false, time: 0 },
      departure: { enabled: false, type: '', time: 0 },
    },
    loadingWork: {
      arrival: { enabled: false, type: '', time: 0 },
      departure: { enabled: false, type: '', time: 0 },
    },
    // ...他の設定...
  });

  // onChangeハンドラーをメモ化
  const handleTimeSettingsChange = useCallback((timeSettings: any) => {
    console.log("DetailedSettingsで受け取ったtimeSettings:", timeSettings);
    onChange({
      ...value,
      waitingTime: timeSettings.waitingTime,
      loadingWork: timeSettings.loadingWork,
    });
  }, [value, onChange]);

  // 時間設定をレンダリング
  const renderTimeSettings = () => (
    <DetailedTimeSettings
      value={{
        waitingTime: value.waitingTime || { departure: { enabled: false, time: 0 }, arrival: { enabled: false, time: 0 } },
        loadingWork: value.loadingWork || { departure: { enabled: false, type: '', time: 0 }, arrival: { enabled: false, type: '', time: 0 } },
      }}
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
            backgroundColor: activeTab === 'time' ? '#007bff' : '#fff',
            color: activeTab === 'time' ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'time' ? 'bold' : 'normal'
          }}
        >
          待機時間料・荷役作業料
        </button>
        <button 
          onClick={() => setActiveTab('surcharge')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: activeTab === 'surcharge' ? '#007bff' : '#fff',
            color: activeTab === 'surcharge' ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'surcharge' ? 'bold' : 'normal'
          }}
        >
          割増料金・燃料サーチャージ
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