// 地域と車種のマッピング（DBと一致させること！）
export const regionMap: Record<string, string> = {
  "北海道": "HOKKAIDO",
  "東北": "TOHOKU",
  "関東": "KANTO",
  "北陸信越": "HOKURIKU_SHINETSU",
  "中部": "CHUBU",
  "近畿": "KINKI",
  "中国": "CHUGOKU",
  "四国": "SHIKOKU",
  "九州": "KYUSHU",
  "沖縄": "OKINAWA"
};

export const vehicleMap: Record<string, string> = {
  small: "SMALL",
  medium: "MEDIUM",
  large: "LARGE",
  trailer: "TRAILER"
};

// 日本語ラベル
export const vehicleLabel: Record<string, string> = {
  small: "小型車(2t)",
  medium: "中型車(4t)",
  large: "大型車(10t)",
  trailer: "トレーラ(20t)"
};