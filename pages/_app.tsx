// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Script from 'next/script';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Maps API を最優先で読み込む */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`}
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}
