
// 地域ごとの地図表示範囲
export const boundsMap: Record<string, google.maps.LatLngBoundsLiteral> = {
  北海道:   { north: 45.0, south: 42.0, west: 139.0, east: 146.0 },
  東北:     { north: 41.2, south: 37.5, west: 139.5, east: 142.5 },
  関東:     { north: 37.0, south: 35.0, west: 138.5, east: 140.5 },
  北陸信越: { north: 37.0, south: 35.5, west: 136.0, east: 139.0 },
  中部:     { north: 37.5, south: 34.5, west: 136.5, east: 138.5 },
  近畿:     { north: 36.0, south: 33.5, west: 134.5, east: 136.5 },
  中国:     { north: 35.5, south: 32.5, west: 132.0, east: 135.5 },
  四国:     { north: 34.5, south: 32.0, west: 132.0, east: 134.5 },
  九州:     { north: 33.5, south: 31.0, west: 129.5, east: 132.0 },
  沖縄:     { north: 27.0, south: 24.0, west: 126.0, east: 128.5 },
};