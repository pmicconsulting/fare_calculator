export type DetailedSettingsType = {
  specialVehicle: { enabled: boolean; type: string };
  holiday: { enabled: boolean; distanceRatio: number };
  deepNight: { enabled: boolean; distanceRatio: number };
  express: { enabled: boolean; surchargeRate: number };
  generalRoad: { enabled: boolean; surchargeRate: number };
  forwardingFee: { enabled: boolean };
  waitingTime: {
    departure: { 
      enabled: boolean; 
      time: number;
      type: 'A' | 'B'; // 追加: A単価/B単価の選択
      confirmed?: boolean; // 追加：確定状態
    };
    arrival: { 
      enabled: boolean; 
      time: number;
      type: 'A' | 'B'; // 追加: A単価/B単価の選択
      confirmed?: boolean; // 追加：確定状態
    };
  };
  loadingWork: {
    departure: { 
      enabled: boolean; 
      type: string; 
      time: number;
      confirmed?: boolean; // 追加：確定状態
    };
    arrival: { 
      enabled: boolean; 
      type: string; 
      time: number;
      confirmed?: boolean; // 追加：確定状態
    };
  };
  fuelSurcharge: { 
    enabled: boolean; 
    fuelEfficiency: number;  // 修正: rate → fuelEfficiency（燃費 km/L）
    fuelPrice: number;       // 追加: 燃料調達価格（円/L）
  };
};

// SpecialVehicleData の型定義を追加
export type SpecialVehicleData = {
  id: string;
  name: string;
  rate: number;
};

// FareCalculationResult の型定義を追加（必要に応じて）
export type FareCalculationResult = {
  charges: any;
  surcharges: any;
};