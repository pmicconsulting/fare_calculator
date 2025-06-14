import React from "react";

type Props = {
  origin: string;
  setOrigin: (v: string) => void;
  embarkPort: string;
  setEmbarkPort: (v: string) => void;
  disembarkPort: string;
  setDisembarkPort: (v: string) => void;
  destination: string;
  setDestination: (v: string) => void;
  onFareResult: (addresses: {
    origin: string;
    embarkPort: string;
    disembarkPort: string;
    destination: string;
  }) => void;
};

export default function FerryForm({
  origin,
  setOrigin,
  embarkPort,
  setEmbarkPort,
  disembarkPort,
  setDisembarkPort,
  destination,
  setDestination,
  onFareResult,
}: Props) {
  const handleCalculate = () => {
    onFareResult({ origin, embarkPort, disembarkPort, destination });
  };

  return (
    <div>
      <InputRow label="出発地" placeholder="住所または市町村+事業所名を入力" value={origin} onChange={setOrigin} />
      <InputRow label="乗船港名" placeholder="港名を入力" value={embarkPort} onChange={setEmbarkPort} />
      <InputRow label="下船港名" placeholder="港名を入力" value={disembarkPort} onChange={setDisembarkPort} />
      <InputRow label="到着地" placeholder="住所または市町村+事業所名を入力" value={destination} onChange={setDestination} />
    </div>
  );
}

/* ----------------  共通の入力行コンポーネント ---------------- */
type RowProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange?: (v: string) => void;
};

function InputRow({ label, placeholder, value, onChange }: RowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      <span
        style={{
          minWidth: 90,
          background: "#8B5CF6", // 変更：パープルに変更
          color: "#fff",
          borderRadius: 6,
          textAlign: "center",
          padding: "10px 0",
          fontWeight: "bold",
          fontSize: 15,
          height: 20, // 変更：高さを25pxに調整
        }}
      >
        {label}
      </span>
      <input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        style={{
          marginLeft: 20,
          width: 350,
          height: 35, // 変更：高さを25pxに調整
          fontSize: 12,
          borderRadius: 6,
          border: "2px solid #bbb",
          padding: "0 12px",
        }}
      />
    </div>
  );
}
