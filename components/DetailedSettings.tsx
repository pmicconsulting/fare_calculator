import React, { useState } from "react";
import { DepartureSettings } from './SurchargeSubMenu/DepartureSettings';
import { ArrivalSettings } from './SurchargeSubMenu/ArrivalSettings';

type Props = {
  value: any;
  onChange: (newValue: any) => void;
};

const MENU_LIST = [
  { key: "departure", label: "出発時", color: "#e57373" },
  { key: "arrival", label: "到着時", color: "#9575cd" },
  { key: "cost", label: "料金", color: "#4fc3f7" },
  { key: "surcharge", label: "割増", color: "#ffb74d" },
] as const;

type MenuKey = typeof MENU_LIST[number]["key"];

const DetailedSettings: React.FC<Props> = ({ value, onChange }) => {
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("departure");

  return (
    <div>
      <div>
        {MENU_LIST.map(menu => (
          <button
            key={menu.key}
            onClick={() => setSelectedMenu(menu.key)}
            style={{
              background: selectedMenu === menu.key ? menu.color : "#fff",
              color: selectedMenu === menu.key ? "#fff" : menu.color,
            }}
          >
            {menu.label}
          </button>
        ))}
      </div>

      {selectedMenu === "departure" && (
        <DepartureSettings
          waitingTimeEnabled={value.departureWaitingTimeEnabled}
          waitingTimeValue={value.departureWaitingTimeValue}
          loadingWorkEnabled={value.departureLoadingWorkEnabled}
          loadingWorkValue={value.departureLoadingWorkValue}
          onWaitingTimeChange={(enabled, newValue) => {
            onChange({
              ...value,
              departureWaitingTimeEnabled: enabled,
              departureWaitingTimeValue: newValue,
            });
          }}
          onLoadingWorkChange={(enabled, newValue) => {
            onChange({
              ...value,
              departureLoadingWorkEnabled: enabled,
              departureLoadingWorkValue: newValue,
            });
          }}
        />
      )}

      {selectedMenu === "arrival" && (
        <ArrivalSettings
          waitingTimeEnabled={value.arrivalWaitingTimeEnabled}
          waitingTimeValue={value.arrivalWaitingTimeValue}
          unloadingWorkEnabled={value.arrivalUnloadingWorkEnabled}
          unloadingWorkValue={value.arrivalUnloadingWorkValue}
          onWaitingTimeChange={(enabled, newValue) => {
            onChange({
              ...value,
              arrivalWaitingTimeEnabled: enabled,
              arrivalWaitingTimeValue: newValue,
            });
          }}
          onUnloadingWorkChange={(enabled, newValue) => {
            onChange({
              ...value,
              arrivalUnloadingWorkEnabled: enabled,
              arrivalUnloadingWorkValue: newValue,
            });
          }}
        />
      )}
    </div>
  );
};

export default DetailedSettings;