// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Google Maps JS API を最優先で読み込む */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="beforeInteractive"
        onLoad={() => {
          // Script 読み込み後に window.initMap() が定義されていれば呼び出し
          if (typeof window.initMap === 'function') {
            window.initMap()
          }
        }}
      />

      {/* アプリ本体 */}
      <Component {...pageProps} />
    </>
  )
}