// 地域ごとの距離切り上げ
export function roundDistance(distanceKm: number, region: string): number {
  if (region === '沖縄') {
    if (distanceKm <= 5)   return 5;
    if (distanceKm <= 10)  return 10;
    if (distanceKm <= 200) return Math.ceil(distanceKm / 10) * 10;
    if (distanceKm <= 500) return Math.ceil(distanceKm / 20) * 20;
    return Math.ceil(distanceKm / 50) * 50;
  } else {
    if (distanceKm <= 200) return Math.ceil(distanceKm / 10) * 10;
    if (distanceKm <= 500) return Math.ceil(distanceKm / 20) * 20;
    return Math.ceil(distanceKm / 50) * 50;
  }
}