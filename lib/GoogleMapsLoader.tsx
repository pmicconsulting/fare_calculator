import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }
    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Maps APIが読み込まれました。");
      setLoaded(true);
    };
    script.onerror = () => {
      console.error("Google Maps APIの読み込みに失敗しました。");
    };
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById(scriptId);
      if (s) document.head.removeChild(s);
    };
  }, []);

  return loaded;
}