// pages/index.tsx
import dynamic from 'next/dynamic';

const GoogleMap = dynamic(() => import('../components/GoogleMap'), { ssr: false });

export default function Home() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
      <h1>標準的運賃の計算〔令和6年告示〕</h1>
      <GoogleMap />
    </div>
  );
}
