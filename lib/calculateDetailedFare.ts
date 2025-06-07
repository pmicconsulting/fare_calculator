import { DetailedSettingsType } from '../types/DetailedSettingsType';
import { getWaitingTimeCharge } from './getWaitingTimeCharge';

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
    const timeCode = settings.waitingTime.departure.type === 'B' ? 9 : 0;
    let chargePerHalfHour = 0;
    try {
      chargePerHalfHour = await getWaitingTimeCharge(vehicleType, timeCode);
    } catch (error) {
      chargePerHalfHour = 0;
      console.error("待機時間料金の取得エラー（departure）:", error);
    }
    const halfHourUnits = Math.floor(settings.waitingTime.departure.time / 30);
    charges.departureWaitingFee = halfHourUnits > 0 ? halfHourUnits * chargePerHalfHour : 0;
  }

  if (settings.waitingTime?.arrival?.enabled) {
    const timeCode = settings.waitingTime.arrival.type === 'B' ? 9 : 0;
    let chargePerHalfHour = 0;
    try {
      chargePerHalfHour = await getWaitingTimeCharge(vehicleType, timeCode);
    } catch (error) {
      chargePerHalfHour = 0;
      console.error("待機時間料金の取得エラー（arrival）:", error);
    }
    const halfHourUnits = Math.floor(settings.waitingTime.arrival.time / 30);
    charges.arrivalWaitingFee = halfHourUnits * chargePerHalfHour;
  }

  // 積込料の計算（30分単位）
  if (settings.loadingWork?.departure?.enabled) {
    charges.loadingFee = Math.floor(settings.loadingWork.departure.time / 30) * 1670;
  }
  if (settings.loadingWork?.arrival?.enabled) {
    charges.unloadingFee = Math.floor(settings.loadingWork.arrival.time / 30) * 1670;
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
      'trailer': 20,
      'refrigerated': 20,
      'wing': 10,
      'powerGate': 10,
    };
    const rate = specialVehicleRates[settings.specialVehicle.type] || 0;
    surcharges.specialVehicle = {
      type: settings.specialVehicle.type,
      rate: rate,
      amount: Math.round(baseFare * (rate / 100))
    };
  }
  if (settings.holiday?.enabled && settings.holiday.distanceRatio > 0) {
    surcharges.holiday = Math.round(baseFare * (settings.holiday.distanceRatio / 100));
  }
  if (settings.deepNight?.enabled && settings.deepNight.distanceRatio > 0) {
    surcharges.deepNight = Math.round(baseFare * (settings.deepNight.distanceRatio / 100));
  }
  if (settings.express?.enabled && settings.express.surchargeRate > 0) {
    surcharges.express = Math.round(baseFare * (settings.express.surchargeRate / 100));
  }
  if (settings.generalRoad?.enabled && settings.generalRoad.surchargeRate > 0) {
    surcharges.generalRoad = Math.round(baseFare * (settings.generalRoad.surchargeRate / 100));
  }

  return { charges, surcharges };
};