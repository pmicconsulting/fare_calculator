// components/GoogleMap.tsx
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { roundDistance } from '../lib/fareUtils';

declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

// 地域名→region_code マッピング
const regionMap: Record<string, number> = {
  北海道: 1, 東北: 2, 関東: 3, 北陸信越: 4, 中部: 5,
  近畿: 6, 中国: 7, 四国: 8, 九州: 9, 沖縄: 10,
};
// 車種キー→vehicle_code マッピング
const vehicleMap: Record<'small'|'medium'|'large'|'trailer', number> = {
  small:   1,
  medium:  2,
  large:   3,
  trailer: 4,
};

export default function GoogleMap() {
  const [vehicle, setVehicle] = useState<'small'|'medium'|'large'|'trailer'>('small');
  const [region, setRegion] = useState<string>('北海道');
  const [useHighway, setUseHighway] = useState<boolean>(false);
  const [rawKm, setRawKm] = useState<number | null>(null);
  const [roundedKm, setRoundedKm] = useState<number | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [originAddr, setOriginAddr] = useState<string>('');
  const [destinationAddr, setDestinationAddr] = useState<string>('');

  // 車種ラベルマップ
  const vehicleLabelMap: Record<typeof vehicle, string> = {
    small:   '小型車(2t)',
    medium:  '中型車(4t)',
    large:   '大型車(10t)',
    trailer: 'トレーラ(20t)',
  };

  const originRef = useRef<google.maps.LatLngLiteral | null>(null);
  const destinationRef = useRef<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // 地図＋DirectionsRenderer 初期化（全国表示：fitBounds）
  useEffect(() => {
    window.initMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        mapTypeId: 'roadmap',
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

     // 北海道を覆う南西／北東座標を指定
     const bounds = new window.google.maps.LatLngBounds(
       { lat: 45, lng:  139.7 },   // 北海道の南西端付近
       { lat: 42.5, lng: 145.5 }    // 北海道の北東端付近
     );
      map.fitBounds(bounds);

      const renderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#0000FF' },
      });
      directionsRendererRef.current = renderer;

      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        if (!originRef.current) {
          originRef.current = pos;
          clearMarkers();
          addMarker(pos, 'blue-dot');
        } else if (!destinationRef.current) {
          destinationRef.current = pos;
          addMarker(pos, 'green-dot');
        } else {
          originRef.current = pos;
          destinationRef.current = null;
          setRawKm(null);
          setRoundedKm(null);
          setFare(null);
          directionsRendererRef.current!.setDirections({ routes: [] } as any);
          clearMarkers();
          addMarker(pos, 'blue-dot');
        }
      });
    };

    if (window.google && typeof window.initMap === 'function') {
      window.initMap();
    }
  }, []);

  /** マーカー追加 */
  const addMarker = (pos: google.maps.LatLngLiteral, colorKey: 'blue-dot' | 'green-dot') => {
    const url = `http://maps.google.com/mapfiles/ms/icons/${colorKey}.png`;
    const marker = new window.google.maps.Marker({
      position: pos,
      map: directionsRendererRef.current!.getMap()!,
      icon: url,
    });
    markersRef.current.push(marker);
  };

  /** マーカー一括消去 */
  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  /** 運賃計算＋ルート表示 */
  const handleCalcFare = () => {
    const origin = originRef.current;
    const destination = destinationRef.current;
    if (!origin || !destination) {
      alert('出発地と到着地をクリックで指定してください');
      return;
    }

    const service = new window.google.maps.DirectionsService();
    +    service.route(
      {
        origin,
        destination,
        travelMode: 'DRIVING',
        avoidHighways: !useHighway,
        avoidFerries:    true,              // ★フェリーを避ける
        provideRouteAlternatives: true,      // ★代替ルートも取得
      },
      async (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current!.setDirections(result);
          // フェリー区間を含まないルートを選択
          const noFerry = result.routes.find(r =>
            !r.legs.some(leg =>
              leg.steps.some(step => step.travel_mode === 'FERRY')
            )
          );
          const chosen = noFerry || result.routes[0];
          directionsRendererRef.current!.setDirections({
            ...result,
            routes: [chosen]
          });
          const leg = result.routes[0].legs[0];
          const km = leg.distance.value / 1000;
          setRawKm(km);
          setOriginAddr(leg.start_address.replace(/^日本、,?\s*/, ''));
          setDestinationAddr(leg.end_address.replace(/^日本、,?\s*/, ''));

          const rkm = roundDistance(km, region);
          setRoundedKm(rkm);
          const regionCode  = regionMap[region];
          const vehicleCode = vehicleMap[vehicle];

          const { data, error } = await supabase
            .from('fare_rates')
            .select('fare_yen')
            .eq('region_code',  regionCode)
            .eq('vehicle_code', vehicleCode)
            .eq('upto_km',      rkm)
            .maybeSingle();

          if (error || !data) {
            alert('運賃データが見つかりません');
            return;
          }
          setFare(data.fare_yen);
        } else {
          alert('ルート取得エラー：' + status);
        }
      }
    );
  };

  return (
    <div>
      {/* 車種 / 地域 / 高速道路利用 */}
      <div style={{ marginBottom: 12 }}>
        <fieldset>
          <legend>車種</legend>
          {(['small','medium','large','trailer'] as const).map(v => (
            <label key={v} style={{ marginRight: 8 }}>
              <input
                type="radio"
                name="vehicle"
                value={v}
                checked={vehicle === v}
                onChange={() => setVehicle(v)}
              />
              {vehicleLabelMap[v]}
            </label>
          ))}
        </fieldset>
        <fieldset style={{ marginTop: 8 }}>
          <legend>管轄運輸局（届出）</legend>
          {(['北海道','東北','関東','北陸信越','中部','近畿','中国','四国','九州','沖縄'] as string[]).map(r => (
            <label key={r} style={{ marginRight: 8 }}>
              <input
                type="radio"
                name="region"
                value={r}
                checked={region === r}
                onChange={() => setRegion(r)}
              />
              {r}
            </label>
          ))}
        </fieldset>
        <div style={{ marginTop: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={useHighway}
              onChange={e => setUseHighway(e.target.checked)}
            />
            高速道路を利用しますか？（利用する場合、□にチェック）
          </label>
        </div>
      </div>

      {/* 地図表示 */}
      <div ref={mapRef} style={{ width: '100%', height: '400px' }} />

      {/* 計算ボタン */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button onClick={handleCalcFare} style={{ padding: '8px 12px' }}>
          標準的運賃の概算額を計算してみる
        </button>
      </div>

      {/* 計算結果 */}
      {fare != null && (
        <div
          style={{
            border: '1px solid #000',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            maxWidth: 600,
            fontSize: 14
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24 }}>
            基準運賃額
            <span style={{ marginLeft: '10mm', fontWeight: 'bold', fontSize: 28 }}>
              ¥{fare.toLocaleString()}
            </span>
            <small style={{ marginLeft: 8, fontSize: 12, color: '#555' }}>
              （高速道路利用料金及び消費税を含みません）
            </small>
          </h2>
          <dl style={{ margin: '12px 0', lineHeight: 1.5, overflow: 'hidden' }}>
            <dt style={{ float: 'left', clear: 'left', width: 120 }}>出発地の住所</dt>
            <dd style={{ marginLeft: 120 }}>{originAddr}</dd>

            <dt style={{ float: 'left', clear: 'left', width: 120 }}>到着地の住所</dt>
            <dd style={{ marginLeft: 120 }}>{destinationAddr}</dd>

            <dt style={{ float: 'left', clear: 'left', width: 120 }}>経路上の距離</dt>
            <dd style={{ marginLeft: 120 }}>{rawKm!.toFixed(0)}km</dd>

            <dt style={{ float: 'left', clear: 'left', width: 120 }}>運賃計算距離</dt>
            <dd style={{ marginLeft: 120 }}>{roundedKm}km</dd>

            <dt style={{ float: 'left', clear: 'left', width: 120 }}>高速道路利用</dt>
            <dd style={{ marginLeft: 120 }}>{useHighway ? '利用する' : '利用しない'}</dd>

            <dt style={{ float: 'left', clear: 'left', width: 120 }}>車　　　　種</dt>
            <dd style={{ marginLeft: 120 }}>{vehicleLabelMap[vehicle]}</dd>

            <dt style={{ float: 'left', clear: 'left', width: 120 }}>管轄の運輸局</dt>
            <dd style={{ marginLeft: 120 }}>{region}運輸局</dd>
          </dl>
        </div>
      )}

      {/* 注意書き */}
      <div
        style={{
          marginTop: 24,
          padding: '0 16px',
          fontSize: 12,
          lineHeight: 1.6,
          color: '#555',
          maxWidth: 600,
        }}
      >
        <p>●標準的運賃は、令和６年国土交通省告示第209号（2024/03/22）を踏まえ、距離制運賃が算出されます。</p>
        <p>●計算結果は概算距離に対する運賃額であり、別途輸送距離を正確に把握し、計算結果を検証してください。</p>
        <p>●地図からの算出距離と実際の走行距離に誤差が発生する場合があります。</p>
        <p>●地図データにより出発地の住所が取得できない場合は、近隣エリアを起点、終点として算出します。</p>
        <p>●割増、割引、積込・取卸料、待機時間料、燃料サーチャージなどの詳細計算サイトは、
          ７月頃の公開を予定しています。
        </p>
          <p>●北海道から本州方面を指定すると、フェリールートの距離が加算され、正確な計算ができません。</p>
            <p>　</p>
        <p>◆地図計算システムの公開主体</p>
        <p>　公益社団法人全日本トラック協会　</p>
        <p>◆地図計算システムに関するお問合せ先</p>
        <p>　日本ＰＭＩコンサルティング株式会社　お問合せ先：a@jta-r.jp</p>
        <p>　</p>
        <p style={{ marginTop: 12 }}>
          標準的運賃　地図計算システム公開　2025年5月
        </p>
      </div>
    </div>
  );
}
