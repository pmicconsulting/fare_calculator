// src/services/directionsService.ts

import type {
  DirectionsResult,
  DirectionsRoute,
  TravelMode,
} from "google.maps";
import { filterFerryRoutes } from "../utils/mapUtils";

export interface RouteOptions {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  travelMode?: TravelMode;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  waypoints?: google.maps.DirectionsWaypoint[];
}

/**
 * Google Maps DirectionsService を呼び出し、
 * ・フェリー区間を自動で除外
 * ・最短の陸路ルートを選択
 * ・共通エラー処理を適用
 * を行って結果を返す。
 *
 * @param opts ルート検索オプション
 * @returns フェリー区間を除外した最適ルートのみ含む DirectionsResult
 * @throws エラー時には Error を throw
 */
export async function fetchDirections(
  opts: RouteOptions
): Promise<DirectionsResult> {
  const service = new window.google.maps.DirectionsService();

  return new Promise<DirectionsResult>((resolve, reject) => {
    service.route(
      {
        origin: opts.origin,
        destination: opts.destination,
        travelMode: opts.travelMode ?? window.google.maps.TravelMode.DRIVING,
        avoidHighways: opts.avoidHighways ?? false,
        avoidFerries: opts.avoidFerries ?? false,
        waypoints: opts.waypoints,
      },
      (result: DirectionsResult | null, status) => {
        if (status !== "OK" || !result) {
          reject(new Error(`DirectionsService error: ${status}`));
          return;
        }

        // フェリー区間を除外して最短ルートのみを抽出
        const best: DirectionsRoute | undefined = filterFerryRoutes(
          result.routes
        );
        if (!best) {
          reject(new Error("No land-only route available"));
          return;
        }

        // DirectionsResult の形で返却
        resolve({
          ...result,
          routes: [best],
        });
      }
    );
  });
}
