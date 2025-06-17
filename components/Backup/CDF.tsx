import { DetailedSettingsType } from '../types/DetailedSettingsType';
import { getWaitingTimeCharge } from './getWaitingTimeCharge';
import { getLoadingWorkCharge } from './getLoadingWorkCharge';
import { calculateWorkTimeFee } from '../components/WorkTimeCalculation';

export const calculateDetailedFare = async (
  baseFare: number, 
  settings: DetailedSettingsType,
  rawKm: number = 0,
  vehicleType: 'small' | 'medium' | 'large' | 'trailer' = 'large'
) => {
  const charges: any = {};
  const surcharges: any = {};

  // 料金・実費の計算
  // 待機時間料金の計算（30分単位）
  if (settings.waitingTime?.departure?.enabled) {
    let departureWaitingFee = 0;
    const waitingMinutes = settings.waitingTime.departure.time;
    
    if (waitingMinutes > 0) {
      try {
        // A単価とB単価を取得
        const chargeA = await getWaitingTimeCharge(vehicleType, 0); // A単価
        const chargeB = await getWaitingTimeCharge(vehicleType, 9); // B単価
        
        if (waitingMinutes <= 30) {
          // 30分以下は無料
          departureWaitingFee = 0;
        } else if (waitingMinutes <= 120) {
          // 30分を超えて120分以下：最初の30分を差し引いて計算
          const chargeableMinutes = waitingMinutes - 30;
          const units = Math.ceil(chargeableMinutes / 30);
          departureWaitingFee = units * chargeA;
        } else {
          // 120分超：(120-30)÷30×A単価 + (入力値-120)÷30×B単価
          const unitsA = 3; // (120-30)÷30 = 3
          const unitsB = Math.ceil((waitingMinutes - 120) / 30);
          departureWaitingFee = (unitsA * chargeA) + (unitsB * chargeB);
        }
      } catch (error) {
        departureWaitingFee = 0;
      }
    }
    
    charges.departureWaitingFee = departureWaitingFee;
  }

  if (settings.waitingTime?.arrival?.enabled) {
    let arrivalWaitingFee = 0;
    const waitingMinutes = settings.waitingTime.arrival.time;
    
    if (waitingMinutes > 0) {
      try {
        // A単価とB単価を取得
        const chargeA = await getWaitingTimeCharge(vehicleType, 0); // A単価
        const chargeB = await getWaitingTimeCharge(vehicleType, 9); // B単価
        
        if (waitingMinutes <= 30) {
          // 30分以下は無料
          arrivalWaitingFee = 0;
        } else if (waitingMinutes <= 120) {
          // 30分を超えて120分以下：最初の30分を差し引いて計算
          const chargeableMinutes = waitingMinutes - 30;
          const units = Math.ceil(chargeableMinutes / 30);
          arrivalWaitingFee = units * chargeA;
        } else {
          // 120分超：(120-30)÷30×A単価 + (入力値-120)÷30×B単価
          const unitsA = 3; // (120-30)÷30 = 3
          const unitsB = Math.ceil((waitingMinutes - 120) / 30);
          arrivalWaitingFee = (unitsA * chargeA) + (unitsB * chargeB);
        }
      } catch (error) {
        arrivalWaitingFee = 0;
      }
    }
    
    charges.arrivalWaitingFee = arrivalWaitingFee;
  }

  // 積込料の計算（WorkTimeCalculation.tsxのロジックを使用）
  if (settings.loadingWork?.departure?.enabled && settings.loadingWork.departure.type) {  // typeが空でないことを確認
    const workType = settings.loadingWork.departure.type === 'manual' ? 'manual' : 'machine';
    
    // A単価とB単価を取得
    const rateWithin2Hours = await getLoadingWorkCharge(vehicleType, workType, 0);
    const rateOver2Hours = await getLoadingWorkCharge(vehicleType, workType, 9);
    
    // 待機時間を取得（出発時）
    const waitingMinutes = settings.waitingTime?.departure?.enabled 
      ? settings.waitingTime.departure.time 
      : 0;
    
    // WorkTimeCalculation.tsxの計算ロジックを使用
    const config = {
      enabled: true,
      minutes: settings.loadingWork.departure.time,
      freeMinutes: 0,
      unitMinutes: 30, // 30分単位に変更
      workType: workType as 'manual' | 'mechanical',
      fee: 0
    };
    
    const rates = {
      within2Hours: rateWithin2Hours,
      over2Hours: rateOver2Hours
    };
    
    const result = calculateWorkTimeFee(config, rates, waitingMinutes);
    charges.loadingFee = result.fee;
  }
  
  // 取卸料の計算（同様のロジック）
  if (settings.loadingWork?.arrival?.enabled && settings.loadingWork.arrival.type) {  // typeが空でないことを確認
    const workType = settings.loadingWork.arrival.type === 'manual' ? 'manual' : 'machine';
    
    const rateWithin2Hours = await getLoadingWorkCharge(vehicleType, workType, 0);
    const rateOver2Hours = await getLoadingWorkCharge(vehicleType, workType, 9);
    
    // 待機時間を取得（到着時）
    const waitingMinutes = settings.waitingTime?.arrival?.enabled 
      ? settings.waitingTime.arrival.time 
      : 0;
    
    const config = {
      enabled: true,
      minutes: settings.loadingWork.arrival.time,
      freeMinutes: 0,
      unitMinutes: 30, // 30分単位に変更
      workType: workType as 'manual' | 'mechanical',
      fee: 0
    };
    
    const rates = {
      within2Hours: rateWithin2Hours,
      over2Hours: rateOver2Hours
    };
    
    const result = calculateWorkTimeFee(config, rates, waitingMinutes);
    charges.unloadingFee = result.fee;
  }

  // 転送料の計算
  if (settings.forwardingFee?.enabled) {
    charges.forwardingFee = Math.round(baseFare * 0.1);
  }

  // 燃料サーチャージの計算（修正）
  if (settings.fuelSurcharge?.enabled && 
      settings.fuelSurcharge?.fuelEfficiency > 0 &&
      settings.fuelSurcharge?.fuelPrice > 0 &&
      rawKm > 0) {
    
    const fuelEfficiency = settings.fuelSurcharge.fuelEfficiency;
    const fuelPrice = settings.fuelSurcharge.fuelPrice;
    
    if (fuelPrice > 120) {
      charges.fuelSurcharge = Math.round(rawKm / fuelEfficiency * (fuelPrice - 120));
    } else {
      charges.fuelSurcharge = 0;
    }
  } else {
    charges.fuelSurcharge = 0;
  }

  // chargesが空の場合、明示的に0を設定することで無限ループを防止
  charges.departureWaitingFee = charges.departureWaitingFee || 0;
  charges.arrivalWaitingFee = charges.arrivalWaitingFee || 0;
  charges.loadingFee = charges.loadingFee || 0;
  charges.unloadingFee = charges.unloadingFee || 0;
  charges.forwardingFee = charges.forwardingFee || 0;
  charges.fuelSurcharge = charges.fuelSurcharge || 0;

  // 割増料金の計算
  if (settings.specialVehicle?.enabled && settings.specialVehicle.type) {
    const specialVehicleRates: { [key: string]: number } = {
      'refrigerated': 20,
      'container': 40,
      'cement_bulk': 20,
      'dump': 20,
      'concrete_mixer': 20,
      'truck_crane': 30,
      'tank_petroleum': 30,
      'tank_chemical': 40,
      'tank_high_pressure_gas': 50,
    };
    const rate = specialVehicleRates[settings.specialVehicle.type] || 0;
    surcharges.specialVehicle = {
      type: settings.specialVehicle.type,
      rate: rate,
      amount: Math.round(baseFare * (rate / 100))
    };
  }
  if (settings.holiday?.enabled && settings.holiday.distanceRatio > 0) {
    surcharges.holiday = Math.round(baseFare * 0.2 * (settings.holiday.distanceRatio / 100));
  }
  if (settings.deepNight?.enabled && settings.deepNight.distanceRatio > 0) {
    surcharges.deepNight = Math.round(baseFare * 0.2 * (settings.deepNight.distanceRatio / 100));
  }
  if (settings.express?.enabled && settings.express.surchargeRate > 0) {
    surcharges.express = Math.round(baseFare * (settings.express.surchargeRate / 100));
  }
  if (settings.generalRoad?.enabled && settings.generalRoad.surchargeRate > 0) {
    surcharges.generalRoad = Math.round(baseFare * (settings.generalRoad.surchargeRate / 100));
  }

  return { charges, surcharges };
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

  // 計算ロジック（修正：30分単位の計算に変更）
  if (waitingMinutes <= 120 && (waitingMinutes + roundedMinutes) <= 120) {
    // パターン1: 待機時間 <= 120分 かつ (待機時間 + 積込時間) <= 120分
    // (時間 / 30) × A単価
    fee = (roundedMinutes / 30) * rates.within2Hours;
    within2HoursFee = fee;
  } else if (waitingMinutes <= 120 && (waitingMinutes + roundedMinutes) > 120) {
    // パターン2: 待機時間 <= 120分 かつ (待機時間 + 積込時間) > 120分
    // ((120 - 待機時間) / 30) × A単価 + ((積込時間 - (120 - 待機時間)) / 30) × B単価
    const within2HoursMinutes = 120 - waitingMinutes;
    const over2HoursMinutes = roundedMinutes - within2HoursMinutes;
    
    within2HoursFee = (within2HoursMinutes / 30) * rates.within2Hours;
    over2HoursFee = (over2HoursMinutes / 30) * rates.over2Hours;
    fee = within2HoursFee + over2HoursFee;
  } else {
    // パターン3: 待機時間 > 120分
    // (時間 / 30) × B単価
    fee = (roundedMinutes / 30) * rates.over2Hours;
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