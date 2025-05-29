// src/utils/mapUtils.ts
import type { DirectionsRoute } from "google.maps";

/**
 * 地域ごとの表示領域（Google Maps の LatLngBoundsLiteral）
 */
export const boundsMap: Record<string, google.maps.LatLngBoundsLiteral> = {
  北海道:   { north: 45.6, south: 41.2, west: 139.0, east: 146.0 },
  東北:     { north: 41.2, south: 37.5, west: 139.5, east: 142.5 },
  関東:     { north: 37.0, south: 35.0, west: 138.5, east: 140.5 },
  北陸信越: { north: 37.0, south: 35.5, west: 136.0, east: 139.0 },
  中部:     { north: 37.5, south: 34.5, west: 136.5, east: 138.5 },
  近畿:     { north: 36.0, south: 33.5, west: 134.5, east: 136.5 },
  中国:     { north: 35.0, south: 32.5, west: 132.0, east: 134.0 },
  四国:     { north: 34.5, south: 32.0, west: 132.0, east: 134.0 },
  九州:     { north: 33.0, south: 30.5, west: 129.5, east: 131.5 },
  沖縄:     { north: 26.8, south: 24.0, west: 122.9, east: 131.3 },
};

/**
 * フェリーを含むルートを除外し、
 * 最短（距離が最小）のルートのみを返す。
 *
 * @param routes Google Maps DirectionsService が返す複数ルート
 * @returns フェリー区間を含まない最短ルート、存在しなければ undefined
 */
export function filterFerryRoutes(
  routes: DirectionsRoute[]
): DirectionsRoute | undefined {
  // 「フェリー」という文言が step.instructions に含まれるルートは除外
  const landRoutes = routes.filter(route =>
    !route.legs.some(leg =>
      leg.steps.some(step =>
        (step.instructions || "").includes("フェリー")
      )
    )
  );

  if (landRoutes.length === 0) return undefined;

  // 各ルートの総距離（メートル）を算出し、最小のものを返す
  let best = landRoutes[0];
  let minDistance = best.legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0);

  for (const route of landRoutes.slice(1)) {
    const dist = route.legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0);
    if (dist < minDistance) {
      minDistance = dist;
      best = route;
    }
  }

  return best;
}
