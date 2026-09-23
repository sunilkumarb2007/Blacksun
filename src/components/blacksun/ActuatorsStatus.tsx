import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const ActuatorsStatus: React.FC = () => {
  const { telemetry, toggleActuator } = useTelemetry();

  const actuators = [
    {
      id: "heater",
      label: "Heater",
      isOn: telemetry.heaterOn,
      key: "heater" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v14m0 0a4 4 0 1 0 0 6 4 4 0 0 0 0-6Z" />
          <circle cx="12" cy="19" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "fan",
      label: "Fan",
      isOn: telemetry.fanOn,
      key: "fan" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path d="M12 9.5C12 5.5 15 4 15 4s-.5 4.5-3 5.5Z" fill="currentColor" />
          <path d="M14.5 12C18.5 12 20 15 20 15s-4.5-.5-5.5-3Z" fill="currentColor" />
          <path d="M12 14.5C12 18.5 9 20 9 20s.5-4.5 3-5.5Z" fill="currentColor" />
          <path d="M9.5 12C5.5 12 4 9 4 9s4.5.5 5.5 3Z" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "relay",
      label: "Relay (Load)",
      isOn: telemetry.relay,
      key: "relay" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" />
          <circle cx="17" cy="12" r="1.5" fill="currentColor" />
          <path d="M7 12l7-5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "motor",
      label: "Motor",
      isOn: telemetry.motorOn,
      key: "motor" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M9 16V8l3 5 3-5v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "buzzer",
      label: "Buzzer",
      isOn: telemetry.buzzerOn,
      key: "buzzer" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" strokeLinejoin="round" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "ledRed",
      label: "LED (Red)",
      isOn: telemetry.ledRed,
      key: "ledRed" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3.5" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
          <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
          <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
          <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Header Bar */}
      <div className="pb-2 border-b border-[#B5B3A7]">
        <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
          ACTUATORS STATUS
        </h2>
        <div className="text-[9px] tracking-widest text-[#666661] font-semibold mt-0.5 uppercase">
          HARDWARE FEEDBACK
        </div>
      </div>

      {/* Actuator Toggles List */}
      <div className="py-1 space-y-1.5">
        {actuators.map((act) => (
          <div
            key={act.id}
            onClick={() => toggleActuator(act.key)}
            className="flex items-center justify-between cursor-pointer group py-0.5"
            title={`Click to command ${act.label} via WebSocket`}
          >
            {/* Left Icon & Label */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 flex items-center justify-center text-[#111111]">
                {act.icon}
              </div>
              <span className="text-[12px] font-bold text-[#222222] group-hover:text-black transition-colors">
                {act.label}
              </span>
            </div>

            {/* Right Toggle Switch (Sage green when ON, gray when OFF) */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-4.5 rounded-full p-[2px] flex items-center transition-all ${
                  act.isOn
                    ? "bg-[#456557] justify-end"
                    : "bg-[#9A9890] justify-start"
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              </div>

              {/* Status Text */}
              <span
                className={`text-[10.5px] font-bold w-6 text-left ${
                  act.isOn ? "text-[#111111]" : "text-[#78766B]"
                }`}
              >
                {act.isOn ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="h-2" />
    </div>
  );
};
