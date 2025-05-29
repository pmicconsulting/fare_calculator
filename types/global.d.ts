// src/types/global.d.ts

export {};

declare global {
  interface Window {
    map: google.maps.Map;
    renderer: google.maps.DirectionsRenderer;
  }
}