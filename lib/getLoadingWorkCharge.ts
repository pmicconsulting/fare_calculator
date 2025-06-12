import { supabase } from './supabaseClient';

export const getLoadingWorkCharge = async (
  vehicleType: 'small' | 'medium' | 'large' | 'trailer',
  workType: 'manual' | 'machine',
  timeCode: 0 | 9  // 0: 120分以内, 9: 120分超
): Promise<number> => {
  const vehicleCodeMap = {
    small: 1,
    medium: 2,
    large: 3,
    trailer: 4,
  };

  const idCodeMap = {
    manual: 2,    // 手荷役
    machine: 3,   // 機械荷役
  };

  const vehicle_code = vehicleCodeMap[vehicleType];
  const id_code = idCodeMap[workType];

  try {
    const { data, error } = await supabase
      .from('charge_data')
      .select('charge_yen')
      .eq('id_code', id_code)
      .eq('vehicle_code', vehicle_code)
      .eq('time_code', timeCode)
      .single();

    if (error || !data) {
      return 0;
    }

    return data.charge_yen;
  } catch (error) {
    return 0;
  }
};