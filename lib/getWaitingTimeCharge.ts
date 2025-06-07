import { supabase } from './supabaseClient';

// 車種名からvehicle_codeへの変換
const vehicleTypeToCode = (vehicleType: 'small' | 'medium' | 'large' | 'trailer'): number => {
  switch (vehicleType) {
    case 'small': return 1;
    case 'medium': return 2;
    case 'large': return 3;
    case 'trailer': return 4;
    default: return 3; // デフォルトは大型
  }
};

export const getWaitingTimeCharge = async (
  vehicleType: 'small' | 'medium' | 'large' | 'trailer',
  timeCode: number
): Promise<number> => {
  try {
    const vehicle_code = vehicleTypeToCode(vehicleType);
    
    // ↓↓↓ デバッグログ追加 ↓↓↓
    console.log('getWaitingTimeCharge - 入力値:', {
      vehicleType,
      vehicle_code,
      timeCode,
      id_code: 1
    });
    // ↑↑↑ デバッグログ追加ここまで ↑↑↑
    
    const { data, error } = await supabase
      .from('charge_data')
      .select('charge_yen')
      .eq('id_code', 1) // 1: 待機時間料
      .eq('vehicle_code', vehicle_code)
      .eq('time_code', timeCode)
      .single();

    if (error) {
      console.warn(`待機時間料金の取得エラー (${vehicleType}, ${timeCode}):`, error.message);
      return 0;
    }

    // ↓↓↓ デバッグログ追加 ↓↓↓
    console.log('getWaitingTimeCharge - 取得結果:', {
      data,
      charge_yen: data?.charge_yen,
      返却値: Number(data?.charge_yen) || 0
    });
    // ↑↑↑ デバッグログ追加ここまで ↑↑↑

    return Number(data?.charge_yen) || 0;
  } catch (error) {
    console.warn('待機時間料金の取得エラー:', error);
    return 0;
  }
};