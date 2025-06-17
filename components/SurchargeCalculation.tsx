import { DetailedSettingsType, SpecialVehicleData, FareCalculationResult } from '../types/DetailedSettingsType';

// 特殊車両の種類
export const specialVehicleTypes: SpecialVehicleData[] = [
  { id: "refrigerated", name: "冷蔵車・冷凍車", rate: 20 },
  { id: "container", name: "海上コンテナ輸送車", rate: 40 },
  { id: "cement_bulk", name: "セメントバルク車", rate: 20 },
  { id: "dump", name: "ダンプ車", rate: 20 },
  { id: "concrete_mixer", name: "コンクリートミキサー車", rate: 20 },
  { id: "truck_crane", name: "トラック搭載型クレーン車", rate: 30 },
  { id: "tank_petroleum", name: "タンク車 石油製品輸送車", rate: 30 },
  { id: "tank_chemical", name: "タンク車 化成品輸送車", rate: 40 },
  { id: "tank_high_pressure_gas", name: "タンク輸送 高圧ガス輸送車", rate: 50 },
];

// サーチャージ設定の型定義
export interface SurchargeSettings {
  // 固定額料金
  fuelSurcharge: {
    enabled: boolean;
    amount: number; // 円
  };
  forwardingFee: {
    enabled: boolean;
    amount: number; // 円
  };
  
  // 割増料金
  specialVehicle: {
    vehicleType: SpecialVehicleType;
  };
  holiday: {
    enabled: boolean;
    rate: number; // % (デフォルト: 20%)
  };
  deepNight: {
    enabled: boolean;
    rate: number; // % (デフォルト: 30%)
  };
  express: {
    enabled: boolean;
    rate: number; // % (デフォルト: 20%)
  };
  generalRoad: {
    enabled: boolean;
    rate: number; // % (デフォルト: 20%)
  };
}

// 計算結果の型定義
export interface SurchargeCalculationResult {
  // 入力値
  baseAmount: number;          // 割増対象額（基本運賃＋作業料）
  
  // 固定額料金
  fuelSurcharge: number;       // 燃料サーチャージ
  forwardingFee: number;       // 利用運送手数料
  
  // 割増料金
  specialVehicle: {
    amount: number;
    vehicleType: string;
    rate: number;
  };
  holiday: number;             // 休日割増
  deepNight: number;           // 深夜・早朝割増
  express: number;             // 速達割増
  generalRoad: number;         // 一般道利用割増
  
  // 集計
  totalSurcharge: number;      // 割増合計
  totalFixed: number;          // 固定額合計
  grandTotal: number;          // 総合計
  
  // 詳細
  breakdown: string[];         // 内訳文字列の配列
}

// 特殊車両情報を取得
export function getSpecialVehicleInfo(vehicleType: SpecialVehicleType): SpecialVehicleConfig {
  const vehicle = SPECIAL_VEHICLE_OPTIONS.find(v => v.type === vehicleType);
  return vehicle || { type: 'none', name: '適用しない', rate: 0 };
}

// サーチャージ計算メイン関数
export const calculateDetailedFare = (
  baseFare: number, 
  settings: DetailedSettingsType
): FareCalculationResult => {
  const charges: any = {};
  const surcharges: any = {};

  // 利用運送手数料の計算（基準運賃額の10%）
  if (settings.forwardingFee?.enabled) {
    charges.forwardingFee = Math.round(baseFare * 0.1);
  }

  // 特殊車両割増の計算
  if (settings.specialVehicle?.enabled && settings.specialVehicle?.type) {
    const vehicle = specialVehicleTypes.find(v => v.id === settings.specialVehicle.type);
    if (vehicle) {
      surcharges.specialVehicle = {
        type: vehicle.name,
        rate: vehicle.rate,
        amount: Math.round(baseFare * vehicle.rate / 100),
      };
    }
  }

  // 休日割増の計算（基準運賃 × 走行距離比率 × 0.3）
  if (settings.holiday?.enabled && settings.holiday?.distanceRatio > 0) {
    const ratio = settings.holiday.distanceRatio / 100;
    surcharges.holiday = Math.round(baseFare * ratio * 0.3);
  }

  // 深夜・早朝割増の計算（基準運賃 × 走行距離比率 × 0.3）
  if (settings.deepNight?.enabled && settings.deepNight?.distanceRatio > 0) {
    const ratio = settings.deepNight.distanceRatio / 100;
    surcharges.deepNight = Math.round(baseFare * ratio * 0.3);
  }

  // 速達割増の計算
  if (settings.express?.enabled && settings.express?.surchargeRate > 0) {
    surcharges.express = Math.round(baseFare * settings.express.surchargeRate / 100);
  }

  // 一般道利用割増の計算
  if (settings.generalRoad?.enabled && settings.generalRoad?.surchargeRate > 0) {
    surcharges.generalRoad = Math.round(baseFare * settings.generalRoad.surchargeRate / 100);
  }

  // 待機時間料金の計算
  if (settings.waitingTime?.departure?.enabled && settings.waitingTime.departure.time > 0) {
    charges.waitingTimeDeparture = Math.round(settings.waitingTime.departure.time * 500);
  }
  if (settings.waitingTime?.arrival?.enabled && settings.waitingTime.arrival.time > 0) {
    charges.waitingTimeArrival = Math.round(settings.waitingTime.arrival.time * 500);
  }

  // 荷役作業料金の計算
  if (settings.loadingWork?.departure?.enabled && settings.loadingWork.departure.time > 0) {
    charges.loadingWorkDeparture = Math.round(settings.loadingWork.departure.time * 500);
  }
  if (settings.loadingWork?.arrival?.enabled && settings.loadingWork.arrival.time > 0) {
    charges.loadingWorkArrival = Math.round(settings.loadingWork.arrival.time * 500);
  }

  // 燃料割増の計算
  if (settings.fuelSurcharge?.enabled && settings.fuelSurcharge?.rate > 0) {
    charges.fuelSurcharge = Math.round(baseFare * settings.fuelSurcharge.rate / 100);
  }

  return { charges, surcharges };
};

// デフォルト設定を作成
export function createDefaultSurchargeSettings(): SurchargeSettings {
  return {
    fuelSurcharge: { enabled: false, amount: 0 },
    forwardingFee: { enabled: false, amount: 0 },
    specialVehicle: { vehicleType: 'none' },
    holiday: { enabled: false, rate: 20 },
    deepNight: { enabled: false, rate: 30 },
    express: { enabled: false, rate: 20 },
    generalRoad: { enabled: false, rate: 20 }
  };
}

// 設定の検証
export function validateSurchargeSettings(settings: SurchargeSettings): string[] {
  const errors: string[] = [];
  
  // 固定額の検証
  if (settings.fuelSurcharge.enabled && settings.fuelSurcharge.amount < 0) {
    errors.push('燃料サーチャージは0円以上で入力してください');
  }
  if (settings.forwardingFee.enabled && settings.forwardingFee.amount < 0) {
    errors.push('利用運送手数料は0円以上で入力してください');
  }
  
  // 割増率の検証
  if (settings.holiday.enabled && (settings.holiday.rate < 0 || settings.holiday.rate > 100)) {
    errors.push('休日割増は0%〜100%の範囲で入力してください');
  }
  if (settings.deepNight.enabled && (settings.deepNight.rate < 0 || settings.deepNight.rate > 100)) {
    errors.push('深夜・早朝割増は0%〜100%の範囲で入力してください');
  }
  if (settings.express.enabled && (settings.express.rate < 0 || settings.express.rate > 100)) {
    errors.push('速達割増は0%〜100%の範囲で入力してください');
  }
  if (settings.generalRoad.enabled && (settings.generalRoad.rate < 0 || settings.generalRoad.rate > 100)) {
    errors.push('一般道利用割増は0%〜100%の範囲で入力してください');
  }
  
  return errors;
}

// 使用例
/*
const settings = createDefaultSurchargeSettings();
settings.fuelSurcharge = { enabled: true, amount: 500 };
settings.specialVehicle = { vehicleType: 'refrigerated' };
settings.holiday = { enabled: true, rate: 20 };

const result = calculateSurcharge(10000, settings);
*/