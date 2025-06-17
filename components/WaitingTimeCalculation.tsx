import { supabase } from "../lib/supabaseClient";
import { VehicleType } from "../lib/codeMaps";

// 待機時間料の型定義
export interface WaitingTimeFee {
  enabled: boolean;        // 適用有無
  minutes: number;         // 実際の待機時間（分）
  freeMinutes: number;     // 無料時間（30分）
  unitMinutes: number;     // 課金単位（10分単位）
  fee: number;             // 計算された料金
  breakdown?: {            // 内訳
    freeMinutesText: string;      // "30分無料"
    waitingTimeText: string;      // "待機時間〇時間"
    chargeableMinutes: number;    // 課金対象時間（分）
    within2HoursFee: number;      // 2時間以内の料金
    over2HoursFee: number;        // 2時間超の料金
  };
}

// データベースから待機時間単価を取得
export const fetchWaitingTimeRates = async (
  vehicleCode: number
): Promise<{ within2Hours: number; over2Hours: number } | null> => {
  try {
    const { data, error } = await supabase
      .from("waiting_time_rates")
      .select("charge_yen")
      .eq("id_code", 1) // 待機時間料
      .eq("vehicle_code", vehicleCode)
      .order("time_code", { ascending: true }); // 0: 2時間以内, 1: 2時間超

    if (error || !data || data.length < 2) {
      return null;
    }

    return {
      within2Hours: data[0].charge_yen, // time_code = 0
      over2Hours: data[1].charge_yen   // time_code = 1
    };
  } catch (error) {
    return null;
  }
};

// 待機時間料の計算ロジック
export const calculateWaitingTimeFee = (
  config: WaitingTimeFee,
  rates: { within2Hours: number; over2Hours: number }
): WaitingTimeFee => {
  // 適用しない場合
  if (!config.enabled) {
    return {
      ...config,
      fee: 0,
      breakdown: undefined
    };
  }

  // 無料時間以内の場合
  if (config.minutes <= config.freeMinutes) {
    return {
      ...config,
      fee: 0,
      breakdown: {
        freeMinutesText: "30分無料",
        waitingTimeText: `待機時間${Math.floor(config.minutes / 60)}時間${config.minutes % 60}分`,
        chargeableMinutes: 0,
        within2HoursFee: 0,
        over2HoursFee: 0
      }
    };
  }

  // 課金対象時間（実際の待機時間 - 無料時間）
  const chargeableMinutes = config.minutes - config.freeMinutes;
  
  let fee = 0;
  let within2HoursFee = 0;
  let over2HoursFee = 0;

  if (chargeableMinutes <= 120) {
    // パターン1: 待機時間 <= 120分
    // 時間 × (A単価/30)
    fee = chargeableMinutes * (rates.within2Hours / 30);
    within2HoursFee = fee;
  } else {
    // パターン2: 待機時間 > 120分
    // ((A単価) × 2 × 2) + (時間-120) × (B単価/30)
    within2HoursFee = rates.within2Hours * 2 * 2; // 2時間分の料金
    over2HoursFee = (chargeableMinutes - 120) * (rates.over2Hours / 30);
    fee = within2HoursFee + over2HoursFee;
  }

  // 端数処理（10円単位で切り上げ）
  fee = Math.ceil(fee / 10) * 10;

  // 待機時間の表示用テキスト
  const totalHours = Math.floor(config.minutes / 60);
  const totalMinutes = config.minutes % 60;
  const waitingTimeText = `待機時間${totalHours}時間${totalMinutes > 0 ? totalMinutes + '分' : ''}`;

  return {
    ...config,
    fee,
    breakdown: {
      freeMinutesText: "30分無料",
      waitingTimeText,
      chargeableMinutes,
      within2HoursFee: Math.ceil(within2HoursFee / 10) * 10,
      over2HoursFee: Math.ceil(over2HoursFee / 10) * 10
    }
  };
};

// 使用例
export const createDefaultWaitingTimeFee = (): WaitingTimeFee => ({
  enabled: false,
  minutes: 0,
  freeMinutes: 30,
  unitMinutes: 10,
  fee: 0
});