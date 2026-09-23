import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const MotorHealth: React.FC = () => {
  const { telemetry, navigatePage } = useTelemetry();
  const isConnected = telemetry.isConnected;

  const isVibAlert = isConnected && telemetry.vibration !== null && telemetry.vibration >= 3.0;

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#B5B3A7]">
        <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
          MOTOR HEALTH
        </h2>
        <div className="flex items-center gap-1.5 text-[10px] tracking-wider font-bold text-[#111111]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? "bg-[#FF4848] animate-beacon" : "bg-[#9A9890]"
            }`}
          />
          <span>{isConnected ? "LIVE" : "OFFLINE"}</span>
        </div>
      </div>

      {/* Main Body: Motor Graphic + Metrics */}
      <div className="grid grid-cols-12 gap-3 py-1 items-center flex-1">
        {/* Left Col: High-Fidelity Motor Vector Graphic */}
        <div
          onClick={() => navigatePage("03")}
          className="col-span-6 flex items-center justify-center p-1 cursor-pointer group"
          title="Click to open Deep Motor Diagnostics"
        >
          <svg
            className="w-full max-h-[110px] overflow-visible group-hover:scale-105 transition-transform"
            viewBox="0 0 170 115"
            fill="none"
          >
            {/* Base Footing Plate */}
            <path d="M 28 88 L 132 88 L 140 98 L 20 98 Z" fill="#24333A" stroke="#1E2A30" strokeWidth="1.5" />
            <circle cx="34" cy="94" r="2.5" fill="#CBA145" />
            <circle cx="126" cy="94" r="2.5" fill="#CBA145" />

            {/* Rear Fan Housing Cowl */}
            <path d="M 45 28 C 30 32 24 45 24 60 C 24 75 30 86 45 90 Z" fill="#1C272C" stroke="#151E22" strokeWidth="1.5" />
            <line x1="28" y1="50" x2="42" y2="50" stroke="#3D5058" strokeWidth="1" />
            <line x1="26" y1="60" x2="44" y2="60" stroke="#3D5058" strokeWidth="1" />
            <line x1="28" y1="70" x2="42" y2="70" stroke="#3D5058" strokeWidth="1" />

            {/* Main Motor Cylindrical Body */}
            <rect x="45" y="25" width="75" height="65" rx="3" fill="#27373F" stroke="#1D2A30" strokeWidth="1.5" />

            {/* Gold/Amber Longitudinal Cooling Fins on Stator */}
            <rect x="52" y="27" width="4" height="61" fill="#CCA04A" />
            <rect x="63" y="27" width="4" height="61" fill="#D4A84D" />
            <rect x="74" y="27" width="4" height="61" fill="#CCA04A" />
            <rect x="85" y="27" width="4" height="61" fill="#D4A84D" />
            <rect x="96" y="27" width="4" height="61" fill="#CCA04A" />
            <rect x="107" y="27" width="4" height="61" fill="#D4A84D" />

            {/* Terminal Junction Box on top */}
            <path d="M 68 15 L 102 15 L 108 25 L 62 25 Z" fill="#1E2B31" stroke="#141E22" strokeWidth="1.5" />
            <rect x="74" y="17" width="22" height="6" rx="1" fill="#2F424B" />

            {/* Front End Bell Shield */}
            <path d="M 120 25 L 132 35 L 132 82 L 120 90 Z" fill="#1E292F" stroke="#151D22" strokeWidth="1.5" />
            <circle cx="132" cy="58" r="10" fill="#2E414A" stroke="#1A252A" />

            {/* Output Shaft & Keyway */}
            <rect x="132" y="53" width="26" height="11" fill="#8898A1" stroke="#485961" strokeWidth="1.2" />
            <rect x="140" y="53" width="14" height="3" fill="#FF4848" />
          </svg>
        </div>

        {/* Right Col: Metrics */}
        <div className="col-span-6 space-y-1 text-[11.5px] leading-tight pl-2 border-l border-[#B5B3A7]">
          <div className="flex items-center justify-between">
            <span className="text-[#666661]">RPM</span>
            <span className="text-[#111111] font-bold text-[13px]">--</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#666661]">CURRENT (INA219)</span>
            <span className="text-[#111111] font-bold text-[13px]">
              {isConnected && telemetry.current !== null ? `${telemetry.current.toFixed(2)} A` : "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#666661]">Temperature</span>
            <span className="text-[#111111] font-bold text-[13px]">
              {isConnected && telemetry.temperature !== null ? `${telemetry.temperature.toFixed(1)} °C` : "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#666661]">Vibration</span>
            <span
              className={`font-bold text-[13px] ${
                isVibAlert ? "text-[#FF4848]" : "text-[#2E7D32]"
              }`}
            >
              {isConnected && telemetry.vibration !== null
                ? telemetry.vibration >= 3.0
                  ? "VIBRATION ALERT"
                  : "NORMAL"
                : "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#666661]">Motor State</span>
            <span className="text-[#111111] font-bold text-[13px]">
              {isConnected
                ? telemetry.motorOn
                  ? `ON (${telemetry.motorSpeed ?? 180} PWM)`
                  : "OFF"
                : "--"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Failure Risk Bar */}
      <div className="pt-2 border-t border-[#B5B3A7]">
        <div className="flex items-center justify-between mb-1 text-[10px] font-semibold text-[#666661]">
          <span>FAILURE RISK</span>
          <span className="text-[#FF4848] font-bold">
            {isConnected ? `${telemetry.failureRisk} / 100` : "--"}
          </span>
        </div>
        <div className="w-full h-2 bg-[#DDDCD3] border border-[#B5B3A7] overflow-hidden p-[0.5px]">
          <div
            className="h-full bg-[#FF4848] transition-all duration-300"
            style={{ width: `${isConnected ? telemetry.failureRisk : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};
