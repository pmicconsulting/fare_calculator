// pages/index.tsx
import dynamic from 'next/dynamic';
const GoogleMap = dynamic(() => import('../components/GoogleMap'), { ssr: false });

export default function Home() {
  return (
    <>
      <h1>標準的運賃の計算（令和6年告示）</h1>
      <GoogleMap />
    </>
  );
}
