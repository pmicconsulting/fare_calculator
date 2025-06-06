// 特殊車両の種類
export type SpecialVehicleType = 
  | 'none'                    // 適用しない
  | 'refrigerated'            // 冷蔵車・冷凍車
  | 'container'               // 海上コンテナ輸送車
  | 'cement_bulk'             // セメントバルク車
  | 'dump'                    // ダンプ車
  | 'concrete_mixer'          // コンクリートミキサー車
  | 'truck_crane'             // トラック搭載型クレーン車
  | 'tank_petroleum'          // タンク車 石油製品輸送車
  | 'tank_chemical'           // タンク車 化成品輸送車
  | 'tank_high_pressure_gas'; // タンク輸送 高圧ガス輸送車

// 特殊車両の設定
export interface SpecialVehicleConfig {
  type: SpecialVehicleType;
  name: string;
  rate: number; // 割増率（%）
}

// 特殊車両の定義
export const SPECIAL_VEHICLE_OPTIONS: SpecialVehicleConfig[] = [
  { type: 'none', name: '適用しない', rate: 0 },
  { type: 'refrigerated', name: '冷蔵車・冷凍車', rate: 20 },
  { type: 'container', name: '海上コンテナ輸送車', rate: 40 },
  { type: 'cement_bulk', name: 'セメントバルク車', rate: 20 },
  { type: 'dump', name: 'ダンプ車', rate: 20 },
  { type: 'concrete_mixer', name: 'コンクリートミキサー車', rate: 20 },
  { type: 'truck_crane', name: 'トラック搭載型クレーン車', rate: 30 },
  { type: 'tank_petroleum', name: 'タンク車 石油製品輸送車', rate: 30 },
  { type: 'tank_chemical', name: 'タンク車 化成品輸送車', rate: 40 },
  { type: 'tank_high_pressure_gas', name: 'タンク輸送 高圧ガス輸送車', rate: 50 },
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
export function calculateSurcharge(
  baseAmount: number,
  settings: {
    specialVehicle: { enabled: boolean; type: string };
    holiday: { enabled: boolean; distanceRatio: number };
    deepNight: { enabled: boolean; distanceRatio: number };
    express: { enabled: boolean; surchargeRate: number };
    generalRoad: { enabled: boolean; surchargeRate: number };
    waitingTime: { departure: { enabled: boolean; time: number }; arrival: { enabled: boolean; time: number } };
    loadingWork: { departure: { enabled: boolean; type: string; time: number }; arrival: { enabled: boolean; type: string; time: number } };
    forwardingFee: { enabled: boolean };
    fuelSurcharge: { enabled: boolean; rate: number };
  }
): SurchargeResult {
  const surcharges: SurchargeResult['surcharges'] = {};
  const charges: SurchargeResult['charges'] = {};
  let totalSurcharge = 0;
  let totalCharges = 0;

  // 特殊車両割増
  if (settings.specialVehicle.enabled) {
    const vehicleInfo = getSpecialVehicleInfo(settings.specialVehicle.type);
    if (vehicleInfo.rate > 0) {
      const amount = Math.round(baseAmount * vehicleInfo.rate / 100);
      surcharges.specialVehicle = {
        type: vehicleInfo.type,
        name: vehicleInfo.name,
        rate: vehicleInfo.rate,
        amount,
      };
      totalSurcharge += amount;
    }
  }

  // 休日割増
  if (settings.holiday.enabled) {
    const amount = Math.round(baseAmount * settings.holiday.distanceRatio);
    surcharges.holiday = {
      rate: settings.holiday.distanceRatio,
      amount,
    };
    totalSurcharge += amount;
  }

  // 深夜・早朝割増
  if (settings.deepNight.enabled) {
    const amount = Math.round(baseAmount * settings.deepNight.distanceRatio);
    surcharges.deepNight = {
      rate: settings.deepNight.distanceRatio,
      amount,
    };
    totalSurcharge += amount;
  }

  // 速達割増
  if (settings.express.enabled) {
    const amount = Math.round(baseAmount * settings.express.surchargeRate);
    surcharges.express = {
      rate: settings.express.surchargeRate,
      amount,
    };
    totalSurcharge += amount;
  }

  // 一般道利用割増
  if (settings.generalRoad.enabled) {
    const amount = Math.round(baseAmount * settings.generalRoad.surchargeRate);
    surcharges.generalRoad = {
      rate: settings.generalRoad.surchargeRate,
      amount,
    };
    totalSurcharge += amount;
  }

  // 待機時間割増
  if (settings.waitingTime.departure.enabled) {
    const amount = Math.round(settings.waitingTime.departure.time * 100);
    surcharges.waitingTimeDeparture = {
      time: settings.waitingTime.departure.time,
      amount,
    };
    totalSurcharge += amount;
  }
  if (settings.waitingTime.arrival.enabled) {
    const amount = Math.round(settings.waitingTime.arrival.time * 100);
    surcharges.waitingTimeArrival = {
      time: settings.waitingTime.arrival.time,
      amount,
    };
    totalSurcharge += amount;
  }

  // 荷役作業割増
  if (settings.loadingWork.departure.enabled) {
    const amount = Math.round(settings.loadingWork.departure.time * 100);
    surcharges.loadingWorkDeparture = {
      type: settings.loadingWork.departure.type,
      time: settings.loadingWork.departure.time,
      amount,
    };
    totalSurcharge += amount;
  }
  if (settings.loadingWork.arrival.enabled) {
    const amount = Math.round(settings.loadingWork.arrival.time * 100);
    surcharges.loadingWorkArrival = {
      type: settings.loadingWork.arrival.type,
      time: settings.loadingWork.arrival.time,
      amount,
    };
    totalSurcharge += amount;
  }

  // 利用運送手数料（基準運賃額の10%に変更）
  if (settings.forwardingFee.enabled) {
    charges.forwardingFee = Math.round(baseAmount * 0.1);
    totalCharges += charges.forwardingFee;
  }

  // 燃料サーチャージ
  if (settings.fuelSurcharge.enabled) {
    charges.fuelSurcharge = Math.round(baseAmount * settings.fuelSurcharge.rate);
    totalCharges += charges.fuelSurcharge;
  }

  return {
    surcharges,
    charges,
    totalSurcharge,
    totalCharges,
    totalAmount: baseAmount + totalSurcharge + totalCharges,
  };
}

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
console.log(result.breakdown);
*/