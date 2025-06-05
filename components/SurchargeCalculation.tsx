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
  settings: SurchargeSettings
): SurchargeCalculationResult {
  // 固定額料金の計算
  const fuelSurcharge = settings.fuelSurcharge.enabled ? settings.fuelSurcharge.amount : 0;
  const forwardingFee = settings.forwardingFee.enabled ? settings.forwardingFee.amount : 0;
  const totalFixed = fuelSurcharge + forwardingFee;

  // 特殊車両割増の計算
  const specialVehicleInfo = getSpecialVehicleInfo(settings.specialVehicle.vehicleType);
  const specialVehicleAmount = specialVehicleInfo.rate > 0 
    ? Math.round(baseAmount * specialVehicleInfo.rate / 100)
    : 0;

  // その他の割増計算
  const holiday = settings.holiday.enabled 
    ? Math.round(baseAmount * settings.holiday.rate / 100) 
    : 0;
  const deepNight = settings.deepNight.enabled 
    ? Math.round(baseAmount * settings.deepNight.rate / 100) 
    : 0;
  const express = settings.express.enabled 
    ? Math.round(baseAmount * settings.express.rate / 100) 
    : 0;
  const generalRoad = settings.generalRoad.enabled 
    ? Math.round(baseAmount * settings.generalRoad.rate / 100) 
    : 0;

  // 割増合計
  const totalSurcharge = specialVehicleAmount + holiday + deepNight + express + generalRoad;

  // 総合計
  const grandTotal = baseAmount + totalSurcharge + totalFixed;

  // 内訳の作成
  const breakdown: string[] = [];
  breakdown.push(`割増対象額: ${baseAmount.toLocaleString()}円`);
  
  // 割増の内訳
  if (totalSurcharge > 0) {
    breakdown.push('【割増】');
    if (specialVehicleInfo.rate > 0) {
      breakdown.push(`　${specialVehicleInfo.name}: ${specialVehicleAmount.toLocaleString()}円 (${specialVehicleInfo.rate}%)`);
    }
    if (settings.holiday.enabled) {
      breakdown.push(`　休日割増: ${holiday.toLocaleString()}円 (${settings.holiday.rate}%)`);
    }
    if (settings.deepNight.enabled) {
      breakdown.push(`　深夜・早朝割増: ${deepNight.toLocaleString()}円 (${settings.deepNight.rate}%)`);
    }
    if (settings.express.enabled) {
      breakdown.push(`　速達割増: ${express.toLocaleString()}円 (${settings.express.rate}%)`);
    }
    if (settings.generalRoad.enabled) {
      breakdown.push(`　一般道利用割増: ${generalRoad.toLocaleString()}円 (${settings.generalRoad.rate}%)`);
    }
    breakdown.push(`　割増合計: ${totalSurcharge.toLocaleString()}円`);
  }
  
  // 固定額の内訳
  if (totalFixed > 0) {
    breakdown.push('【固定額料金】');
    if (settings.fuelSurcharge.enabled) {
      breakdown.push(`　燃料サーチャージ: ${fuelSurcharge.toLocaleString()}円`);
    }
    if (settings.forwardingFee.enabled) {
      breakdown.push(`　利用運送手数料: ${forwardingFee.toLocaleString()}円`);
    }
    breakdown.push(`　固定額合計: ${totalFixed.toLocaleString()}円`);
  }
  
  breakdown.push(`【総合計: ${grandTotal.toLocaleString()}円】`);

  return {
    baseAmount,
    fuelSurcharge,
    forwardingFee,
    specialVehicle: {
      amount: specialVehicleAmount,
      vehicleType: specialVehicleInfo.name,
      rate: specialVehicleInfo.rate
    },
    holiday,
    deepNight,
    express,
    generalRoad,
    totalSurcharge,
    totalFixed,
    grandTotal,
    breakdown
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