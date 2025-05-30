// 仮の実装。実際はsupabaseやAPI呼び出し等で実装
export function useFareDatabase() {
  async function getFare({ vehicle, region, useHighway, distance, fareOption }: any) {
    // ここでDB問い合わせ
    // 仮運賃ロジック
    let base = 10000;
    if (vehicle === "large") base += 2000;
    if (region === "北海道") base += 1000;
    if (!useHighway) base -= 500;
    base += Math.round(Number(distance) * 10);
    if (fareOption === "not_apply") base -= 750; // 適用しない
    return { fare: base };
  }
  return { getFare };
}