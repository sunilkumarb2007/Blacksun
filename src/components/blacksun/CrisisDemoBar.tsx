import React, { useState } from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import { CrisisScenario } from "../../types/telemetry";

export const CrisisDemoBar: React.FC = () => {
  const { activeScenario, triggerScenario, resetToImageDefault } = useTelemetry();
  const [isOpen, setIsOpen] = useState(false);

  const scenarios: { id: CrisisScenario; label: string; desc: string }[] = [
    { id: "NORMAL", label: "00 NORMAL", desc: "Baseline steady-state operation" },
    { id: "THERMAL_EVENT", label: "01 THERMAL EVENT", desc: "Temperature climb & cooling overdrive" },
    { id: "MOTOR_VIBRATION", label: "02 MOTOR VIBRATION", desc: "Mechanical resonance & speed throttle" },
    { id: "MOTOR_OVERLOAD", label: "03 MOTOR OVERLOAD", desc: "Current spike & winding cutoff" },
    { id: "RF_FAILURE", label: "04 RF FAILURE", desc: "Carrier lost & local autonomy engaged" },
    { id: "FULL_CASCADE", label: "05 FULL CASCADE", desc: "Concurrent multi-sensor critical trip" },
  ];

  return (
    <div className="fixed bottom-11 right-6 z-40 font-mono-tech select-none">
      {isOpen ? (
        <div className="border border-[#1F2937] bg-[#0E151D] shadow-[0_4px_24px_rgba(0,0,0,0.8)] p-3.5 w-[285px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-beacon" />
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                CRISIS DEMO CONTROL
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[12px] font-bold text-[#64748B] hover:text-white px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => triggerScenario(sc.id)}
                className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-all border flex flex-col ${
                  activeScenario === sc.id
                    ? "bg-[#162B32] text-[#2DD4BF] border-[#2DD4BF] shadow-[0_0_8px_rgba(45,212,191,0.2)]"
                    : "bg-[#121922] text-[#94A3B8] border-[#1F2937] hover:border-[#2DD4BF]/50 hover:text-white"
                }`}
              >
                <span>{sc.label}</span>
                <span className="text-[8.5px] font-normal text-[#64748B] tracking-normal mt-0.5">
                  {sc.desc}
                </span>
              </button>
            ))}

            <button
              onClick={resetToImageDefault}
              className="w-full text-center mt-2.5 px-2 py-1.5 text-[9.5px] font-bold tracking-wider bg-[#2DD4BF] text-[#0C1014] border border-[#2DD4BF] hover:bg-[#20B2AA] transition-colors"
            >
              RESET TO REFERENCE IMAGE
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="border border-[#1F2937] bg-[#0E151D]/90 backdrop-blur-xs hover:border-[#2DD4BF] hover:text-white transition-all px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#CBD5E1] shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center gap-2"
          title="Open Crisis Simulation Demo Panel"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-beacon" />
          <span>CRISIS DEMO</span>
          <span className="text-[#2DD4BF]">▲</span>
        </button>
      )}
    </div>
  );
};
