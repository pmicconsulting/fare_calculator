import React, { useState } from 'react';
import FuelSurchargeSettings from './SurchargeSubMenu/FuelSurchargeSettings';
import { SurchargeSettings } from './SurchargeSubMenu/SurchargeSettings';
import { DepartureSettings } from './SurchargeSubMenu/DepartureSettings';
import { ArrivalSettings } from './SurchargeSubMenu/ArrivalSettings';
import { DetailedSettingsType } from '../types/DetailedSettingsType';

type Props = {
  value: any;
  onChange: (newValue: any) => void;
};

const DetailedSettings: React.FC<Props> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'departure' | 'arrival' | 'fee' | 'surcharge'>('departure');

  // 出発時の設定をレンダリング
  const renderDeparture = () => (
    <DepartureSettings
      waitingTimeEnabled={value.waitingTime?.departure?.enabled || false}
      waitingTimeValue={(value.waitingTime?.departure?.time || 0).toString()}
      waitingTimeConfirmed={value.waitingTime?.departure?.confirmed || false}
      loadingWorkEnabled={value.loadingWork?.departure?.enabled || false}
      loadingWorkValue={(value.loadingWork?.departure?.time || 0).toString()}
      loadingWorkConfirmed={value.loadingWork?.departure?.confirmed || false}
      loadingWorkType={value.loadingWork?.departure?.type}
      onWaitingTimeChange={(enabled, val) => {
        onChange({
          ...value,
          waitingTime: {
            ...value.waitingTime,
            departure: {
              ...value.waitingTime?.departure,
              enabled,
              time: parseInt(val) || 0,
              confirmed: enabled ? (value.waitingTime?.departure?.confirmed || false) : false
            }
          }
        });
      }}
      onWaitingTimeConfirm={(confirmed) => {
        onChange({
          ...value,
          waitingTime: {
            ...value.waitingTime,
            departure: {
              ...value.waitingTime?.departure,
              confirmed
            }
          }
        });
      }}
      onLoadingWorkChange={(enabled, val) => {
        onChange({
          ...value,
          loadingWork: {
            ...value.loadingWork,
            departure: {
              ...value.loadingWork?.departure,
              enabled,
              time: parseInt(val) || 0,
              confirmed: enabled ? (value.loadingWork?.departure?.confirmed || false) : false
            }
          }
        });
      }}
      onLoadingWorkConfirm={(confirmed) => {
        onChange({
          ...value,
          loadingWork: {
            ...value.loadingWork,
            departure: {
              ...value.loadingWork?.departure,
              confirmed
            }
          }
        });
      }}
    />
  );

  // 到着時の設定をレンダリング
  const renderArrival = () => (
    <ArrivalSettings
      waitingTimeEnabled={value.waitingTime?.arrival?.enabled || false}
      waitingTimeValue={(value.waitingTime?.arrival?.time || 0).toString()}
      waitingTimeConfirmed={value.waitingTime?.arrival?.confirmed || false}
      unloadingWorkEnabled={value.loadingWork?.arrival?.enabled || false}
      unloadingWorkValue={(value.loadingWork?.arrival?.time || 0).toString()}
      loadingWorkConfirmed={value.loadingWork?.arrival?.confirmed || false}
      unloadingWorkType={value.loadingWork?.arrival?.type}
      onWaitingTimeChange={(enabled, val) => {
        onChange({
          ...value,
          waitingTime: {
            ...value.waitingTime,
            arrival: {
              ...value.waitingTime?.arrival,
              enabled,
              time: parseInt(val) || 0,
              confirmed: enabled ? (value.waitingTime?.arrival?.confirmed || false) : false
            }
          }
        });
      }}
      onWaitingTimeConfirm={(confirmed) => {
        onChange({
          ...value,
          waitingTime: {
            ...value.waitingTime,
            arrival: {
              ...value.waitingTime?.arrival,
              confirmed
            }
          }
        });
      }}
      onUnloadingWorkChange={(enabled, val) => {
        onChange({
          ...value,
          loadingWork: {
            ...value.loadingWork,
            arrival: {
              ...value.loadingWork?.arrival,
              enabled,
              time: parseInt(val) || 0,
              confirmed: enabled ? (value.loadingWork?.arrival?.confirmed || false) : false
            }
          }
        });
      }}
      onLoadingWorkConfirm={(confirmed) => {
        onChange({
          ...value,
          loadingWork: {
            ...value.loadingWork,
            arrival: {
              ...value.loadingWork?.arrival,
              confirmed
            }
          }
        });
      }}
    />
  );

  // 料金・実費の設定をレンダリング
  const renderFee = () => (
    <div>
      {/* 待機時間料金 */}
      {/* ...existing code... */}
      
      {/* 燃料サーチャージ */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>燃料サーチャージ</h4>
        <label>
          <input
            type="checkbox"
            checked={value.fuelSurcharge?.enabled || false}
            onChange={(e) => {
              onChange({
                ...value,
                fuelSurcharge: {
                  ...value.fuelSurcharge,
                  enabled: e.target.checked,
                  fuelEfficiency: value.fuelSurcharge?.fuelEfficiency || 5.0,
                  fuelPrice: value.fuelSurcharge?.fuelPrice || 120
                }
              });
            }}
          />
          適用する
        </label>
        {value.fuelSurcharge?.enabled && (
          <div style={{ marginTop: '10px', marginLeft: '20px' }}>
            <div style={{ marginBottom: '5px' }}>
              <label>
                燃費（km/L）：
                <input
                  type="number"
                  value={value.fuelSurcharge?.fuelEfficiency || 5.0}
                  onChange={(e) => {
                    onChange({
                      ...value,
                      fuelSurcharge: {
                        ...value.fuelSurcharge,
                        fuelEfficiency: parseFloat(e.target.value) || 5.0
                      }
                    });
                  }}
                  step="0.1"
                  min="0.1"
                  style={{ width: '80px', marginLeft: '5px' }}
                />
              </label>
            </div>
            <div>
              <label>
                燃料調達価格（円/L）：
                <input
                  type="number"
                  value={value.fuelSurcharge?.fuelPrice || 120}
                  onChange={(e) => {
                    onChange({
                      ...value,
                      fuelSurcharge: {
                        ...value.fuelSurcharge,
                        fuelPrice: parseFloat(e.target.value) || 120
                      }
                    });
                  }}
                  step="1"
                  min="0"
                  style={{ width: '80px', marginLeft: '5px' }}
                />
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* ...existing code... */}
    </div>
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
          onClick={() => setActiveTab('departure')}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: activeTab === 'departure' ? '#007bff' : '#fff',
            color: activeTab === 'departure' ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'departure' ? 'bold' : 'normal'
          }}
        >
          出発時
        </button>
        <button 
          onClick={() => setActiveTab('arrival')}
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: activeTab === 'arrival' ? '#007bff' : '#fff',
            color: activeTab === 'arrival' ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'arrival' ? 'bold' : 'normal'
          }}
        >
          到着時
        </button>
        <button 
          onClick={() => setActiveTab('fee')}
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: activeTab === 'fee' ? '#007bff' : '#fff',
            color: activeTab === 'fee' ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'fee' ? 'bold' : 'normal'
          }}
        >
          料金
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
          割増
        </button>
      </div>
      
      <div style={{ minHeight: '200px' }}>
        {activeTab === 'departure' && renderDeparture()}
        {activeTab === 'arrival' && renderArrival()}
        {activeTab === 'fee' && renderFee()}
        {activeTab === 'surcharge' && renderSurcharge()}
      </div>
    </div>
  );
};

export default DetailedSettings;