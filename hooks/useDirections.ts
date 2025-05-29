// src/hooks/useDirections.ts
import { useCallback } from "react";
import type {
  DirectionsResult,
  DirectionsRoute,
  MapMouseEvent,
} from "google.maps";
import { filterFerryRoutes } from "../utils/mapUtils";

export interface RouteOptions {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  waypoints?: google.maps.DirectionsWaypoint[];
}

/**
 * Google Maps の DirectionsService.route を呼び出し、
 * フェリー区間を自動で除外し、最短の陸路ルートを抽出して返すカスタムフック。
 */
export function useDirections() {
  const getRoute = useCallback(
    (opts: RouteOptions): Promise<DirectionsResult> => {
      const service = new window.google.maps.DirectionsService();

      return new Promise((resolve, reject) => {
        service.route(
          {
            origin: opts.origin,
            destination: opts.destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
            avoidHighways: opts.avoidHighways ?? false,
            avoidFerries: opts.avoidFerries ?? false,
            waypoints: opts.waypoints,
          },
          (result: DirectionsResult | null, status) => {
            if (status !== "OK" || !result) {
              reject(new Error(`Directions request failed: ${status}`));
              return;
            }
            // フェリー区間を除いた最適ルートを選別
            const bestRoute: DirectionsRoute | undefined = filterFerryRoutes(
              result.routes
            );
            if (!bestRoute) {
              reject(new Error("No land-only route available"));
              return;
            }
            // DirectionsResult の形に再構築して返却
            resolve({
              ...result,
              routes: [bestRoute],
            });
          }
        );
      });
    },
    []
  );

  return { getRoute };
}
