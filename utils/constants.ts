// src/utils/constants.ts
export const regionMap: Record<string, number> = {
  北海道: 1, 東北: 2, 関東: 3, 北陸信越: 4,
  中部: 5, 近畿: 6, 中国: 7, 四国: 8, 九州: 9, 沖縄: 10,
};

export const vehicleMap: Record<"small"|"medium"|"large"|"trailer", number> = {
  small: 1, medium: 2, large: 3, trailer: 4,
};