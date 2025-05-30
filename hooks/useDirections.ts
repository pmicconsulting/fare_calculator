import { useCallback } from "react";

type RouteOptions = {
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints?: google.maps.DirectionsWaypoint[],
  avoidHighways?: boolean,
  avoidFerries?: boolean,
};

export function useDirections() {
  const getRoute = useCallback(async (opts: RouteOptions) => {
    return new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin: opts.origin,
          destination: opts.destination,
          waypoints: opts.waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: opts.avoidHighways,
          avoidFerries: opts.avoidFerries,
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