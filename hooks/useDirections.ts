import { useCallback, useRef } from "react";

type RouteOptions = {
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints?: google.maps.DirectionsWaypoint[],
  avoidHighways?: boolean,
  avoidFerries?: boolean,
};

export function useDirections() {
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  const getRoute = useCallback(async (request: google.maps.DirectionsRequest): Promise<google.maps.DirectionsResult> => {
    return new Promise((resolve, reject) => {
      if (!directionsService.current) {
        directionsService.current = new google.maps.DirectionsService();
      }
      directionsService.current.route(
        {
          origin: request.origin,
          destination: request.destination,
          waypoints: request.waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: request.avoidHighways,
          avoidFerries: request.avoidFerries,
        },
        (result, status) => {
          if (status === "OK" && result) {
            resolve(result);
          } else {
            reject(new Error("経路取得に失敗しました。"));
          }
        }
      );
    });
  }, []);
  return { getRoute };
}