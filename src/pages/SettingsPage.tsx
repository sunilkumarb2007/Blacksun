import React, { useState } from "react";
import { useTelemetry } from "../context/TelemetryContext";
import { SystemSettings } from "../types/telemetry";

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettingsToDefault,
    addLogEvent,
    wsIp,
    wsUrl,
    wsStatus,
    autoConnect,
    setWsIp,
    setAutoConnect,
    connectWS,
  } = useTelemetry();
  const [formState, setFormState] = useState<SystemSettings>({ ...settings });
  const [ipInput, setIpInput] = useState(wsIp);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleConnect = () => {
    const target = ipInput.trim();
    if (target) {
      setWsIp(target, true);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
        2,
        "0"
      )}:${String(now.getSeconds()).padStart(2, "0")}`;
      addLogEvent({
        timestamp: timeStr,
        category: "COMMUNICATION",
        severity: "INFO",
        title: "ESP32 TARGET IP UPDATED",
        details: `Connecting to ws://${target}:81`,
      });
    }
  };

  const handleChange = (key: keyof SystemSettings, val: number) => {
    setFormState((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSave = () => {
    updateSettings(formState);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
      2,
      "0"
    )}:${String(now.getSeconds()).padStart(2, "0")}`;
    addLogEvent({
      timestamp: timeStr,
      category: "SYSTEM",
      severity: "INFO",
      title: "SETTINGS SAVED & PERSISTED",
      details: `Thresholds updated in local non-volatile storage. TempCrit: ${formState.tempCriticalThreshold}°C.`,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleResetConfirm = () => {
    resetSettingsToDefault();
    setFormState({ ...settings });
    setShowConfirmModal(false);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
      2,
      "0"
    )}:${String(now.getSeconds()).padStart(2, "0")}`;
    addLogEvent({
      timestamp: timeStr,
      category: "SYSTEM",
      severity: "INFO",
      title: "SETTINGS RESET TO FACTORY DEFAULTS",
      details: "Hardware baseline parameters restored.",
    });
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">09</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              EMBEDDED THRESHOLDS & FIRMWARE SETTINGS
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            PERSISTED LOCALLY IN STORAGE • DETERMINISTIC RULE CEILINGS
          </p>
        </div>

        {saveToast && (
          <div className="border border-[#456557] bg-[#456557] text-white px-3 py-1 text-[11px] font-bold shadow-xs">
            ✓ SETTINGS SAVED & APPLIED
          </div>
        )}
      </div>

      {/* ESP32 WebSocket Hardware Connection Configuration */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-6 space-y-4 max-w-4xl">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2">
          <div className="text-[12px] font-bold text-[#182226] uppercase tracking-wider">
            BLACKSUN CORE IP & WEBSOCKET
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#5A686D] font-bold uppercase">MODE:</span>
              <span
                className={`px-2 py-0.5 text-[9.5px] font-bold uppercase ${
                  telemetry.mode === "REAL"
                    ? "bg-[#2E7D32] text-white"
                    : "bg-[#FFA133] text-[#182226]"
                }`}
              >
                {telemetry.mode === "REAL" ? "REAL HARDWARE" : "DEMO SIMULATION"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#5A686D] font-bold uppercase">WEBSOCKET:</span>
              <span
                className={`px-2.5 py-0.5 text-[9.5px] font-bold uppercase ${
                  wsStatus === "connected"
                    ? "bg-[#2E7D32] text-white"
                    : wsStatus === "connecting"
                    ? "bg-[#FFA133] text-[#182226]"
                    : "bg-[#FF4848] text-white"
                }`}
              >
                {wsStatus === "connected"
                  ? "CONNECTED"
                  : wsStatus === "connecting"
                  ? "CONNECTING"
                  : wsStatus === "error"
                  ? "ERROR"
                  : "DISCONNECTED"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* IP Input */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block uppercase">
              BLACKSUN CORE IP
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ipInput}
                placeholder="192.168.43.120"
                onChange={(e) => setIpInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] font-mono-tech focus:outline-none focus:border-[#456557]"
              />
              <button
                type="button"
                onClick={handleConnect}
                className="border border-[#364E46] bg-[#364E46] text-white px-4 py-2 text-[11px] font-bold hover:bg-[#2C393E] transition-colors uppercase"
              >
                CONNECT
              </button>
            </div>
            <span className="text-[9.5px] text-[#5A686D]">
              Assigned by phone hotspot DHCP server.
            </span>
          </div>

          {/* Connection URL Display */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block uppercase">
              CONNECTION URL
            </label>
            <div className="px-3 py-2 bg-[#E8E7DF] border border-[#B5B3A7] text-[#182226] text-[11.5px] font-bold truncate">
              {wsUrl}
            </div>
            <span className="text-[9.5px] text-[#5A686D]">Direct browser WebSocket on Port 81</span>
          </div>

          {/* Auto Connect Toggle */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block uppercase">
              AUTO CONNECT
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoConnect(!autoConnect)}
                className={`px-3 py-2 text-[11px] font-bold border transition-colors ${
                  autoConnect
                    ? "bg-[#456557] text-white border-[#456557]"
                    : "bg-[#FFFFFF] text-[#78766B] border-[#B5B3A7]"
                }`}
              >
                {autoConnect ? "[ ON ]" : "[ OFF ]"}
              </button>
              <span className="text-[9.5px] text-[#5A686D]">
                {autoConnect ? "Auto connects on load" : "Manual only"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-6 space-y-6 max-w-4xl">
        <div className="text-[12px] font-bold text-[#182226] uppercase tracking-wider border-b border-[#B5B3A7] pb-2">
          SAFETY TRIGGER BOUNDARIES
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Temperature Warning */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              TEMPERATURE WARNING THRESHOLD (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={formState.tempWarningThreshold}
              onChange={(e) => handleChange("tempWarningThreshold", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Triggers proactive cooling fan & log entry.</span>
          </div>

          {/* Temperature Critical */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              TEMPERATURE CRITICAL THRESHOLD (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={formState.tempCriticalThreshold}
              onChange={(e) => handleChange("tempCriticalThreshold", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Forces cartridge heater cutoff and protective shutdown.</span>
          </div>

          {/* Vibration Warning */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              VIBRATION WARNING BOUNDARY (g)
            </label>
            <input
              type="number"
              step="0.01"
              value={formState.vibrationWarningThreshold}
              onChange={(e) => handleChange("vibrationWarningThreshold", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Triggers harmonic stress warning.</span>
          </div>

          {/* Vibration Critical */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              VIBRATION CRITICAL BOUNDARY (g)
            </label>
            <input
              type="number"
              step="0.01"
              value={formState.vibrationCriticalThreshold}
              onChange={(e) => handleChange("vibrationCriticalThreshold", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Initiates motor RPM damping or halt.</span>
          </div>

          {/* Current Warning */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              MOTOR CURRENT WARNING CEILING (A)
            </label>
            <input
              type="number"
              step="0.1"
              value={formState.currentWarningThreshold}
              onChange={(e) => handleChange("currentWarningThreshold", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Warns of elevated electrical load.</span>
          </div>

          {/* Current Critical */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              MOTOR CURRENT CRITICAL CEILING (A)
            </label>
            <input
              type="number"
              step="0.1"
              value={formState.currentCriticalThreshold}
              onChange={(e) => handleChange("currentCriticalThreshold", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Trips relay to protect BTS7960 and motor coil.</span>
          </div>

          {/* RF Timeout */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              RF PACKET TIMEOUT (ms)
            </label>
            <input
              type="number"
              step="50"
              value={formState.rfTimeoutMs}
              onChange={(e) => handleChange("rfTimeoutMs", parseInt(e.target.value) || 200)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Triggers Local Autonomy fallback mode.</span>
          </div>

          {/* Telemetry Refresh */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#182226] font-semibold block">
              TELEMETRY REFRESH CYCLE (ms)
            </label>
            <input
              type="number"
              step="100"
              value={formState.telemetryRateMs}
              onChange={(e) => handleChange("telemetryRateMs", parseInt(e.target.value) || 1000)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] text-[12px] focus:outline-none focus:border-[#456557]"
            />
            <span className="text-[9.5px] text-[#5A686D]">Main background loop execution frequency.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#B5B3A7]">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="border border-[#B5B3A7] bg-[#F4F3ED] text-[#FF4848] px-4 py-2 text-[11px] font-bold hover:bg-[#FF4848] hover:text-white transition-colors uppercase"
          >
            RESET TO DEFAULTS
          </button>

          <button
            onClick={handleSave}
            className="border border-[#364E46] bg-[#364E46] text-white px-6 py-2 text-[11px] font-bold hover:bg-[#2C393E] transition-colors uppercase shadow-xs"
          >
            SAVE SETTINGS
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="border-2 border-[#FF4848] bg-[#F4F3ED] p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="font-bold text-[14px] text-[#182226] uppercase">CONFIRM FACTORY RESET</div>
            <p className="text-[11px] text-[#5A686D]">
              Are you sure you want to reset all safety thresholds to original factory defaults? All persisted overrides in local storage will be cleared.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1 border border-[#B5B3A7] bg-[#E8E7DF] text-[#2C393E] text-[11px] hover:bg-[#2C393E] hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-3 py-1 bg-[#FF4848] text-white text-[11px] font-bold hover:bg-[#DC2626]"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
