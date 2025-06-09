export type SpecialVehicleData = {
  id: string;
  name: string;
  rate: number;
};

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
      type?: 'A' | 'B' | '';  // typeプロパティを追加
      time: number;
    };
    arrival: { 
      enabled: boolean; 
      type?: 'A' | 'B' | '';  // typeプロパティを追加
      time: number; 
    };
  };
  loadingWork: {
    departure: { 
      enabled: boolean; 
      type: 'manual' | 'machine' | '';  // 手荷役 or 機械荷役
      time: number; 
    };
    arrival: { 
      enabled: boolean; 
      type: 'manual' | 'machine' | ''; 
      time: number; 
    };
  };
  fuelSurcharge: { 
    enabled: boolean; 
    rate?: number;
    fuelEfficiency?: number;  // 追加
    fuelPrice?: number;        // 追加
  };
};

export type FareCalculationResult = {
  charges: {
    forwardingFee?: number;
    waitingTimeDeparture?: number;
    waitingTimeArrival?: number;
    loadingWorkDeparture?: number;
    loadingWorkArrival?: number;
    fuelSurcharge?: number;
  };
  surcharges: {
    specialVehicle?: { type: string; rate: number; amount: number };
    holiday?: number;
    deepNight?: number;
    express?: number;
    generalRoad?: number;
  };
};