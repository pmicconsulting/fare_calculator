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
    
    const { data, error } = await supabase
      .from('charge_data')
      .select('charge_yen')
      .eq('id_code', 1) // 1: 待機時間料
      .eq('vehicle_code', vehicle_code)
      .eq('time_code', timeCode)
      .single();

    if (error) {
      return 0;
    }

    return Number(data?.charge_yen) || 0;
  } catch (error) {
    return 0;
  }
};