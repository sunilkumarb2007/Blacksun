import React, { useState } from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import { CrisisScenario } from "../../types/telemetry";

export const CrisisDemoBar: React.FC = () => {
  const { activeScenario, triggerScenario, resetToImageDefault, wsStatus, isConnected, reconnectWS } = useTelemetry();
  const [isOpen, setIsOpen] = useState(false);

  const scenarios: { id: CrisisScenario; label: string; desc: string }[] = [
    { id: "NORMAL", label: "00 NORMAL", desc: "Baseline steady-state operation (<28°C)" },
    { id: "THERMAL_EVENT", label: "01 THERMAL EVENT", desc: "Temperature climb & cooling overdrive (>35°C)" },
    { id: "MOTOR_VIBRATION", label: "02 MOTOR VIBRATION", desc: "Mechanical resonance & speed throttle (>=3.0g)" },
    { id: "MOTOR_OVERLOAD", label: "03 MOTOR OVERLOAD", desc: "Armature current spike & winding cutoff" },
    { id: "RF_FAILURE", label: "04 RF FAILURE", desc: "Carrier lost & local autonomy engaged" },
    { id: "FULL_CASCADE", label: "05 FULL CASCADE", desc: "Concurrent multi-sensor critical trip" },
  ];

  return (
    <div className="fixed bottom-11 right-6 z-40 font-mono-tech select-none">
      {isOpen ? (
        <div className="border border-[#B5B3A7] bg-[#F4F3ED] shadow-xl p-3.5 w-[300px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? "bg-[#2E7D32]" : "bg-[#FF4848] animate-pulse"
                }`}
              />
              <span className="text-[10px] font-bold tracking-wider text-[#182226] uppercase">
                HARDWARE & CRISIS CONTROL
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[12px] font-bold text-[#5A686D] hover:text-[#182226] px-1"
            >
              ✕
            </button>
          </div>

          {/* Connection Banner */}
          <div className="mb-2 p-1.5 bg-[#E8E7DF] border border-[#B5B3A7] text-[9.5px] flex items-center justify-between">
            <span className="text-[#5A686D]">
              {isConnected ? "WS STREAM ACTIVE" : "OFFLINE (ws://192.168.4.1:81)"}
            </span>
            {!isConnected && (
              <button
                onClick={reconnectWS}
                className="text-[9px] font-bold text-[#364E46] underline hover:text-black"
              >
                RECONNECT
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => triggerScenario(sc.id)}
                className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-all border flex flex-col ${
                  activeScenario === sc.id
                    ? "bg-[#364E46] text-white border-[#364E46] shadow-xs"
                    : "bg-[#FFFFFF] text-[#182226] border-[#B5B3A7] hover:border-[#364E46] hover:bg-[#F4F3ED]"
                }`}
              >
                <span>{sc.label}</span>
                <span className={`text-[8.5px] font-normal tracking-normal mt-0.5 ${activeScenario === sc.id ? "text-[#E8E7DF]" : "text-[#5A686D]"}`}>
                  {sc.desc}
                </span>
              </button>
            ))}

            <button
              onClick={resetToImageDefault}
              className="w-full text-center mt-2.5 px-2 py-1.5 text-[9.5px] font-bold tracking-wider bg-[#364E46] text-white border border-[#364E46] hover:bg-[#2C393E] transition-colors"
            >
              RESET TO NORMAL (25.4°C)
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="border border-[#B5B3A7] bg-[#F4F3ED] hover:bg-[#E8E7DF] transition-all px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#182226] shadow-md flex items-center gap-2"
          title="Open Hardware & Crisis Simulation Demo Panel"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[#2E7D32]" : "bg-[#FF4848]"
            }`}
          />
          <span>{isConnected ? "ESP32 LIVE" : "CRISIS DEMO"}</span>
          <span className="text-[#364E46]">▲</span>
        </button>
      )}
    </div>
  );
};
