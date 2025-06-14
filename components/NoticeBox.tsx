import React from "react";
export default function NoticeBox() {
  return (
    <div style={{ fontSize: 12, color: "#000", marginTop: 24, maxWidth: 600 }}>
<p>● 標準的運賃は、令和６年国土交通省告示第209号（2024年3月22日）を踏まえ算出されます。</p>
        <div style={{ color: '#e53e3e', fontSize: '0.9rem', marginTop: '10px' }}>
  ● 高速道路利用は距離計算のためのもので、自動計算されないため料金は算出されません。高速道路料金は道路会社（例：
  <a 
    href="https://www.driveplaza.com/dp/SearchTop" 
    target="_blank" 
    rel="noopener noreferrer"
    style={{ 
      color: '#0066cc', 
      textDecoration: 'underline',
      cursor: 'pointer'
    }}
  >
    https://www.driveplaza.com/dp/SearchTop
  </a>
  ）にてご確認ください。
</div>
        <p>● フェリー区間がある場合（海上の経路が描画される場合）、「高速道路を利用する」を選択してください。</p>
        <p>● 計算結果をリセットしたい場合、再読込みします。PC Win → Ctrl+R または F5  Mac → Command (⌘) + R</p>
        <p>● 料金・割増は、基準運賃額にに加算されますが、高速道路利用料金は含まれません。</p>
        <p>● 算出される距離と実際の走行距離に誤差が発生する場合があります。</p>
        <p>● 地図データの状況により出発地住所が取得できない場合は、近隣エリアを起点・終点として算出します。</p>
        <p>● 計算結果は概算額の目安を示したものであり、正確な計算結果とならない場合があります。</p>
        <p>● 計算結果は、消費税及び地方消費税は含まれていません。</p>
        <p></p>
        <p>◆ 計算システムの提供：公益社団法人全日本トラック協会</p>
        <p>◆ 利用方法のお問合せ：日本ＰＭＩコンサルティング株式会社　お問合せ先：st@jta.support</p>
    </div>
  );
}