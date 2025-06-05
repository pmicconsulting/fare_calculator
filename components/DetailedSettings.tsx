import React, { useState } from 'react';
import FuelSurchargeSettings from './SurchargeSubMenu/FuelSurchargeSettings';
import { SurchargeSettings } from './SurchargeSubMenu/SurchargeSettings';
import { DepartureSettings } from './SurchargeSubMenu/DepartureSettings';
import { ArrivalSettings } from './SurchargeSubMenu/ArrivalSettings';

type Props = {
  value: any;
  onChange: (newValue: any) => void;
};

const DetailedSettings: React.FC<Props> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'departure' | 'arrival' | 'fee' | 'surcharge'>('departure');

  // 出発時の設定をレンダリング
  const renderDeparture = () => (
    <DepartureSettings
      waitingTimeEnabled={value.departureWaitingTimeEnabled}
      waitingTimeValue={value.departureWaitingTimeValue}
      loadingWorkEnabled={value.departureLoadingWorkEnabled}
      loadingWorkValue={value.departureLoadingWorkValue}
      loadingWorkType={value.departureLoadingWorkType}
      onWaitingTimeChange={(enabled, val) => {
        onChange({ ...value, departureWaitingTimeEnabled: enabled, departureWaitingTimeValue: val });
      }}
      onLoadingWorkChange={(enabled, val) => {
        onChange({ ...value, departureLoadingWorkEnabled: enabled, departureLoadingWorkValue: val });
      }}
    />
  );

  // 到着時の設定をレンダリング
  const renderArrival = () => (
    <ArrivalSettings
      waitingTimeEnabled={value.arrivalWaitingTimeEnabled}
      waitingTimeValue={value.arrivalWaitingTimeValue}
      unloadingWorkEnabled={value.arrivalUnloadingWorkEnabled}
      unloadingWorkValue={value.arrivalUnloadingWorkValue}
      unloadingWorkType={value.arrivalUnloadingWorkType}
      onWaitingTimeChange={(enabled, val) => {
        onChange({ ...value, arrivalWaitingTimeEnabled: enabled, arrivalWaitingTimeValue: val });
      }}
      onUnloadingWorkChange={(enabled, val) => {
        onChange({ ...value, arrivalUnloadingWorkEnabled: enabled, arrivalUnloadingWorkValue: val });
      }}
    />
  );

  // 対策2: 料金の設定をレンダリング（修正版）
  const renderFee = () => (
    <FuelSurchargeSettings
      fuelEnabled={value.fuelSurchargeEnabled}
      fuelPrice={value.fuelSurchargeValue}
      forwardingEnabled={value.forwardingFeeEnabled}
      forwardingRate={value.forwardingFeeValue}
      onFuelChange={(enabled, price) => {
        onChange({ ...value, fuelSurchargeEnabled: enabled, fuelSurchargeValue: price });
      }}
      onForwardingChange={(enabled, rate) => {
        onChange({ ...value, forwardingFeeEnabled: enabled, forwardingFeeValue: rate });
      }}
    />
  );

  // 割増の設定をレンダリング
  const renderSurcharge = () => (
    <SurchargeSettings
      waitingTimeEnabled={value.departureWaitingTimeEnabled}
      waitingTimeValue={value.departureWaitingTimeValue}
      loadingWorkEnabled={value.departureLoadingWorkEnabled}
      loadingWorkValue={value.departureLoadingWorkValue}
      loadingWorkType={value.departureLoadingWorkType}
      onWaitingTimeChange={(enabled, val) => {
        onChange({ ...value, departureWaitingTimeEnabled: enabled, departureWaitingTimeValue: val });
      }}
      onLoadingWorkChange={(enabled, val) => {
        onChange({ ...value, departureLoadingWorkEnabled: enabled, departureLoadingWorkValue: val });
      }}
    />
  );

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