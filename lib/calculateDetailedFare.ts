import { DetailedSettingsType } from '../types/DetailedSettingsType';

export const calculateDetailedFare = (baseFare: number, settings: DetailedSettingsType) => {
  const charges: any = {};
  const surcharges: any = {};

  // 料金・実費の計算
  if (settings.waitingTime?.departure?.enabled && settings.waitingTime.departure.time > 0) {
    charges.departureWaitingFee = Math.floor(settings.waitingTime.departure.time / 30) * 1670;
  }
  if (settings.waitingTime?.arrival?.enabled && settings.waitingTime.arrival.time > 0) {
    charges.arrivalWaitingFee = Math.floor(settings.waitingTime.arrival.time / 30) * 1670;
  }
  if (settings.loadingWork?.departure?.enabled && settings.loadingWork.departure.time > 0) {
    charges.loadingFee = Math.floor(settings.loadingWork.departure.time / 30) * 1670;
  }
  if (settings.loadingWork?.arrival?.enabled && settings.loadingWork.arrival.time > 0) {
    charges.unloadingFee = Math.floor(settings.loadingWork.arrival.time / 30) * 1670;
  }
  if (settings.forwardingFee?.enabled) {
    charges.forwardingFee = Math.round(baseFare * 0.1);
  }
  if (settings.fuelSurcharge?.enabled && settings.fuelSurcharge.rate > 0) {
    charges.fuelSurcharge = Math.round(baseFare * (settings.fuelSurcharge.rate / 100));
  }

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