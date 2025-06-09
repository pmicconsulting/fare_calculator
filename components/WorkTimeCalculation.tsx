import { supabase } from "../lib/supabaseClient";
import { VehicleType } from "../lib/codeMaps";

// 作業時間料の型定義
export interface WorkTimeFee {
  enabled: boolean;        // 適用有無
  minutes: number;         // 実際の作業時間（分）
  freeMinutes: number;     // 無料時間（0分）
  unitMinutes: number;     // 課金単位（30分単位）
  workType: 'manual' | 'mechanical'; // 手荷役 or 機械荷役
  fee: number;             // 計算された料金
  breakdown?: {            // 内訳
    workTimeText: string;         // "作業時間〇時間"
    chargeableMinutes: number;    // 課金対象時間（分）
    within2HoursFee: number;      // 2時間以内の料金
    over2HoursFee: number;        // 2時間超の料金
  };
}

// データベースから作業時間単価を取得
export const fetchWorkTimeRates = async (
  vehicleCode: number,
  workType: 'manual' | 'mechanical'
): Promise<{ within2Hours: number; over2Hours: number } | null> => {
  try {
    const idCode = workType === 'manual' ? 2 : 3; // 手荷役: 2, 機械荷役: 3
    
    const { data, error } = await supabase
      .from("charge_data")  // waiting_time_rates から charge_data に変更
      .select("charge_yen, time_code")
      .eq("id_code", idCode)
      .eq("vehicle_code", vehicleCode)
      .in("time_code", [0, 9])  // 0: 120分以内, 9: 120分超
      .order("time_code", { ascending: true });

    if (error || !data || data.length < 2) {
      console.error("作業時間単価の取得エラー:", error);
      return null;
    }

    return {
      within2Hours: data.find(d => d.time_code === 0)?.charge_yen || 0,
      over2Hours: data.find(d => d.time_code === 9)?.charge_yen || 0
    };
  } catch (error) {
    console.error("作業時間単価の取得エラー:", error);
    return null;
  }
};

// 作業料の計算ロジック（待機時間を考慮）
export const calculateWorkTimeFee = (
  config: WorkTimeFee,
  rates: { within2Hours: number; over2Hours: number },
  waitingMinutes: number = 0 // 待機時間（分）
): WorkTimeFee => {
  // 適用しない場合
  if (!config.enabled) {
    return {
      ...config,
      fee: 0,
      breakdown: undefined
    };
  }

  // 作業時間を30分単位に切り上げ
  const roundedMinutes = Math.ceil(config.minutes / 30) * 30;
  
  let fee = 0;
  let within2HoursFee = 0;
  let over2HoursFee = 0;

  // 計算ロジック
  if (waitingMinutes <= 120 && (waitingMinutes + roundedMinutes) <= 120) {
    // パターン1: 待機時間 <= 120分 かつ (待機時間 + 積込時間) <= 120分
    // 時間 × (A単価/30)
    fee = roundedMinutes * (rates.within2Hours / 30);
    within2HoursFee = fee;
  } else if (waitingMinutes <= 120 && (waitingMinutes + roundedMinutes) > 120) {
    // パターン2: 待機時間 <= 120分 かつ (待機時間 + 積込時間) > 120分
    // (120 - 待機時間) × (A単価/30) + (積込時間 - (120 - 待機時間)) × (B単価/30)
    const within2HoursMinutes = 120 - waitingMinutes;
    const over2HoursMinutes = roundedMinutes - within2HoursMinutes;
    
    within2HoursFee = within2HoursMinutes * (rates.within2Hours / 30);
    over2HoursFee = over2HoursMinutes * (rates.over2Hours / 30);
    fee = within2HoursFee + over2HoursFee;
  } else {
    // パターン3: 待機時間 > 120分
    // 時間 × (B単価/30)
    fee = roundedMinutes * (rates.over2Hours / 30);
    over2HoursFee = fee;
  }

  // 端数処理（10円単位で切り上げ）
  fee = Math.ceil(fee / 10) * 10;
  within2HoursFee = Math.ceil(within2HoursFee / 10) * 10;
  over2HoursFee = Math.ceil(over2HoursFee / 10) * 10;

  // 作業時間の表示用テキスト
  const totalHours = Math.floor(config.minutes / 60);
  const totalMinutes = config.minutes % 60;
  const workTimeText = `作業時間${totalHours}時間${totalMinutes > 0 ? totalMinutes + '分' : ''}`;

  return {
    ...config,
    fee,
    breakdown: {
      workTimeText,
      chargeableMinutes: roundedMinutes,
      within2HoursFee,
      over2HoursFee
    }
  };
};

// 使用例
export const createDefaultWorkTimeFee = (): WorkTimeFee => ({
  enabled: false,
  minutes: 0,
  freeMinutes: 0, // 無料時間なし
  unitMinutes: 30, // 30分単位に変更
  workType: 'manual',
  fee: 0
});

// 積込料・取卸料の計算用ヘルパー関数
export const calculateLoadingFee = async (
  config: WorkTimeFee,
  vehicleCode: number,
  waitingMinutes: number
): Promise<WorkTimeFee | null> => {
  const rates = await fetchWorkTimeRates(vehicleCode, config.workType);
  if (!rates) return null;
  
  return calculateWorkTimeFee(config, rates, waitingMinutes);
};

// 詳細表示用関数
export const formatWorkTimeFeeDetails = (config: WorkTimeFee): string[] => {
  if (!config.enabled || config.fee === 0) {
    return [];
  }

  const details: string[] = [];
  
  if (config.breakdown) {
    details.push(config.breakdown.workTimeText);
    details.push(`課金対象時間: ${config.breakdown.chargeableMinutes}分（30分単位切り上げ）`);
    
    if (config.breakdown.within2HoursFee > 0) {
      details.push(`2時間以内: ${config.breakdown.within2HoursFee.toLocaleString()}円`);
    }
    if (config.breakdown.over2HoursFee > 0) {
      details.push(`2時間超: ${config.breakdown.over2HoursFee.toLocaleString()}円`);
    }
  }
  
  return details;
};