import React, { useState } from 'react';
import { ArrivalSettings } from './SurchargeSubMenu/ArrivalSettings';
import { DepartureSettings } from './SurchargeSubMenu/DepartureSettings';

type Props = {
  value: any;
  onChange: (newValue: any) => void;
};

// 4つのタブに拡張
const MENU_LIST = [
  { key: "departure", label: "出発時", color: "#d9534f" },
  { key: "arrival", label: "到着時", color: "#9575cd" },
  { key: "fee", label: "料金", color: "#5bc0de" },
  { key: "surcharge", label: "割増", color: "#f0ad4e" },
] as const;

type MenuKey = typeof MENU_LIST[number]["key"];

const DetailedSettings: React.FC<Props> = ({ value, onChange }) => {
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("departure");

  // 料金セクションのレンダリング
  const renderFee = () => (
    <div>
      {/* 燃料サーチャージ */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          background: "#e3f2fd", 
          border: "1px solid #90caf9",
          padding: "8px 16px",
          fontWeight: "bold",
          marginBottom: 8
        }}>
          燃料サーチャージ
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          border: "1px solid #90caf9",
          padding: "8px 16px",
        }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              checked={!value.fuelSurchargeEnabled}
              onChange={() => onChange({ ...value, fuelSurchargeEnabled: false })}
            />{" "}
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={value.fuelSurchargeEnabled}
              onChange={() => onChange({ ...value, fuelSurchargeEnabled: true })}
            />{" "}
            適用する
          </label>
          {value.fuelSurchargeEnabled && (
            <div style={{ marginLeft: 16 }}>
              <input
                type="number"
                min={0}
                value={value.fuelSurchargeValue}
                onChange={e => onChange({ ...value, fuelSurchargeValue: e.target.value })}
                style={{ width: "80px", textAlign: "right", marginRight: 4 }}
              />
              <span>円</span>
            </div>
          )}
        </div>
      </div>

      {/* 利用運送手数料 */}
      <div>
        <div style={{ 
          background: "#e3f2fd", 
          border: "1px solid #90caf9",
          padding: "8px 16px",
          fontWeight: "bold",
          marginBottom: 8
        }}>
          利用運送手数料
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          border: "1px solid #90caf9",
          padding: "8px 16px",
        }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              checked={!value.forwardingFeeEnabled}
              onChange={() => onChange({ ...value, forwardingFeeEnabled: false })}
            />{" "}
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={value.forwardingFeeEnabled}
              onChange={() => onChange({ ...value, forwardingFeeEnabled: true })}
            />{" "}
            適用する
          </label>
          {value.forwardingFeeEnabled && (
            <div style={{ marginLeft: 16 }}>
              <input
                type="number"
                min={0}
                value={value.forwardingFeeValue}
                onChange={e => onChange({ ...value, forwardingFeeValue: e.target.value })}
                style={{ width: "80px", textAlign: "right", marginRight: 4 }}
              />
              <span>円</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 割増セクションのレンダリング
  const renderSurcharge = () => (
    <div>
      {/* 特殊車両割増 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          background: "#fff3e0", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
          fontWeight: "bold",
          marginBottom: 8
        }}>
          特殊車両割増
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
        }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              checked={!value.specialVehicleEnabled}
              onChange={() => onChange({ ...value, specialVehicleEnabled: false })}
            />{" "}
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={value.specialVehicleEnabled}
              onChange={() => onChange({ ...value, specialVehicleEnabled: true })}
            />{" "}
            適用する
          </label>
          {value.specialVehicleEnabled && (
            <div style={{ marginLeft: 16 }}>
              <input
                type="number"
                min={0}
                value={value.specialVehicleValue}
                onChange={e => onChange({ ...value, specialVehicleValue: e.target.value })}
                style={{ width: "80px", textAlign: "right", marginRight: 4 }}
              />
              <span>%</span>
            </div>
          )}
        </div>
      </div>

      {/* 休日割増 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          background: "#fff3e0", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
          fontWeight: "bold",
          marginBottom: 8
        }}>
          休日割増
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
        }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              checked={!value.holidaySurchargeEnabled}
              onChange={() => onChange({ ...value, holidaySurchargeEnabled: false })}
            />{" "}
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={value.holidaySurchargeEnabled}
              onChange={() => onChange({ ...value, holidaySurchargeEnabled: true })}
            />{" "}
            適用する
          </label>
          {value.holidaySurchargeEnabled && (
            <div style={{ marginLeft: 16 }}>
              <input
                type="number"
                min={0}
                value={value.holidaySurchargeValue}
                onChange={e => onChange({ ...value, holidaySurchargeValue: e.target.value })}
                style={{ width: "80px", textAlign: "right", marginRight: 4 }}
              />
              <span>%</span>
            </div>
          )}
        </div>
      </div>

      {/* 深夜・早朝割増 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          background: "#fff3e0", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
          fontWeight: "bold",
          marginBottom: 8
        }}>
          深夜・早朝割増
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
        }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              checked={!value.lateNightEarlyMorningEnabled}
              onChange={() => onChange({ ...value, lateNightEarlyMorningEnabled: false })}
            />{" "}
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={value.lateNightEarlyMorningEnabled}
              onChange={() => onChange({ ...value, lateNightEarlyMorningEnabled: true })}
            />{" "}
            適用する
          </label>
          {value.lateNightEarlyMorningEnabled && (
            <div style={{ marginLeft: 16 }}>
              <input
                type="number"
                min={0}
                value={value.lateNightEarlyMorningValue}
                onChange={e => onChange({ ...value, lateNightEarlyMorningValue: e.target.value })}
                style={{ width: "80px", textAlign: "right", marginRight: 4 }}
              />
              <span>%</span>
            </div>
          )}
        </div>
      </div>

      {/* 遅速割（納期前倒し） */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          background: "#fff3e0", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
          fontWeight: "bold",
          marginBottom: 8
        }}>
          遅速割（納期前倒し）
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
        }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              checked={!value.expeditedDeliveryEnabled}
              onChange={() => onChange({ ...value, expeditedDeliveryEnabled: false })}
            />{" "}
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={value.expeditedDeliveryEnabled}
              onChange={() => onChange({ ...value, expeditedDeliveryEnabled: true })}
            />{" "}
            適用する
          </label>
          {value.expeditedDeliveryEnabled && (
            <div style={{ marginLeft: 16 }}>
              <input
                type="number"
                min={0}
                value={value.expeditedDeliveryValue}
                onChange={e => onChange({ ...value, expeditedDeliveryValue: e.target.value })}
                style={{ width: "80px", textAlign: "right", marginRight: 4 }}
              />
              <span>%</span>
            </div>
          )}
        </div>
      </div>

      {/* 一般道利用割増 */}
      <div>
        <div style={{ 
          background: "#fff3e0", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
          fontWeight: "bold",
          marginBottom: 8
        }}>
          一般道利用割増
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          border: "1px solid #ffcc80",
          padding: "8px 16px",
        }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              checked={!value.generalRoadUseEnabled}
              onChange={() => onChange({ ...value, generalRoadUseEnabled: false })}
            />{" "}
            適用しない
          </label>
          <label>
            <input
              type="radio"
              checked={value.generalRoadUseEnabled}
              onChange={() => onChange({ ...value, generalRoadUseEnabled: true })}
            />{" "}
            適用する
          </label>
          {value.generalRoadUseEnabled && (
            <div style={{ marginLeft: 16 }}>
              <input
                type="number"
                min={0}
                value={value.generalRoadUseValue}
                onChange={e => onChange({ ...value, generalRoadUseValue: e.target.value })}
                style={{ width: "80px", textAlign: "right", marginRight: 4 }}
              />
              <span>%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* タブメニュー */}
      <div style={{ display: "flex", width: "100%", marginBottom: 16 }}>
        {MENU_LIST.map(menu => (
          <button
            key={menu.key}
            style={{
              backgroundColor: selectedMenu === menu.key ? menu.color : "#f5f5f5",
              color: selectedMenu === menu.key ? "white" : "#333",
              border: "none",
              padding: "12px 0",
              flex: 1,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold",
            }}
            onClick={() => setSelectedMenu(menu.key)}
          >
            {menu.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div style={{ padding: "16px 0" }}>
        {selectedMenu === "departure" && (
          <DepartureSettings
            waitingTimeEnabled={value.departureWaitingTimeEnabled}
            waitingTimeValue={value.departureWaitingTimeValue}
            loadingWorkEnabled={value.departureLoadingWorkEnabled}
            loadingWorkValue={value.departureLoadingWorkValue}
            loadingWorkType={value.departureLoadingWorkType}
            onWaitingTimeChange={(enabled, waitingValue) => {
              onChange({
                ...value,
                departureWaitingTimeEnabled: enabled,
                departureWaitingTimeValue: waitingValue,
              });
            }}
            onLoadingWorkChange={(enabled, loadingValue) => {
              onChange({
                ...value,
                departureLoadingWorkEnabled: enabled,
                departureLoadingWorkValue: loadingValue,
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
            onWaitingTimeChange={(enabled, waitingValue) => {
              onChange({
                ...value,
                arrivalWaitingTimeEnabled: enabled,
                arrivalWaitingTimeValue: waitingValue,
              });
            }}
            onUnloadingWorkChange={(enabled, unloadingValue) => {
              onChange({
                ...value,
                arrivalUnloadingWorkEnabled: enabled,
                arrivalUnloadingWorkValue: unloadingValue,
              });
            }}
          />
        )}
        {selectedMenu === "fee" && renderFee()}
        {selectedMenu === "surcharge" && renderSurcharge()}
      </div>
    </div>
  );
};

export default DetailedSettings;