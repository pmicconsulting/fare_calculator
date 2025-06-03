// 型定義
export type VehicleType = "small" | "medium" | "large" | "trailer";
export type RegionType =
  | "北海道" | "東北" | "関東" | "北陸信越" | "中部"
  | "近畿"   | "中国" | "四国" | "九州"     | "沖縄";

// 地域名 → region_code
export const regionMap: Record<RegionType, number> = {
  北海道: 1, 東北: 2, 関東: 3, 北陸信越: 4, 中部: 5,
  近畿: 6, 中国: 7, 四国: 8, 九州: 9, 沖縄: 10,
};

// 車種 → vehicle_code
export const vehicleMap: Record<VehicleType, number> = {
  small: 1, medium: 2, large: 3, trailer: 4,
};