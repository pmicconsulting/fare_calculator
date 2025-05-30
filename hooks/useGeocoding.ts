export function useGeocoding() {
  async function geocode(address: string): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      const service = new window.google.maps.Geocoder();
      service.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
  }
  async function multiGeocode(addresses: string[]): Promise<(google.maps.LatLngLiteral | null)[]> {
    const results = [];
    for (const a of addresses) {
      results.push(await geocode(a));
    }
    return results;
  }
  return { geocode, multiGeocode };
}