import React from "react";
import { useTelemetry } from "../context/TelemetryContext";

export const MotorHealthPage: React.FC = () => {
  const { telemetry } = useTelemetry();
  const isConnected = telemetry.isConnected;

  const stressIndicators = [
    {
      id: "thermal",
      name: "THERMAL STRESS",
      val: isConnected ? telemetry.thermalStress : 0,
      desc: "Stator winding thermal degradation risk",
      limit: "80%",
      status: !isConnected ? "OFFLINE" : telemetry.thermalStress > 80 ? "CRITICAL" : telemetry.thermalStress > 60 ? "WARNING" : "NORMAL",
      color: telemetry.thermalStress > 80 ? "#FF4848" : "#FFA133",
    },
    {
      id: "mechanical",
      name: "MECHANICAL STRESS",
      val: isConnected ? telemetry.mechanicalStress : 0,
      desc: "Bearing race & shaft resonance fatigue",
      limit: "75%",
      status: !isConnected ? "OFFLINE" : telemetry.mechanicalStress > 75 ? "CRITICAL" : telemetry.mechanicalStress > 50 ? "WARNING" : "NORMAL",
      color: telemetry.mechanicalStress > 75 ? "#FF4848" : "#FFA133",
    },
    {
      id: "electrical",
      name: "ELECTRICAL STRESS",
      val: isConnected ? telemetry.electricalStress : 0,
      desc: "BTS7960 junction inductive kick & amp draw",
      limit: "85%",
      status: !isConnected ? "OFFLINE" : telemetry.electricalStress > 85 ? "CRITICAL" : "NORMAL",
      color: telemetry.electricalStress > 85 ? "#FF4848" : "#456557",
    },
  ];

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">03</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              STATIONARY MOTOR DIAGNOSTICS & HEALTH CONSOLE
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            CONTINUOUS MECHANICAL, THERMAL & ELECTRICAL SAFETY SUPERVISION
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#5A686D] uppercase">HEALTH STATE:</span>
          <span
            className={`font-bold px-2 py-0.5 text-[11px] border ${
              !isConnected
                ? "border-[#9A9890] bg-[#9A9890] text-white"
                : telemetry.failureRisk > 80
                ? "border-[#FF4848] bg-[#FF4848] text-white"
                : telemetry.failureRisk > 40
                ? "border-[#FFA133] bg-[#FFA133] text-[#182226]"
                : "border-[#456557] bg-[#456557] text-white"
            }`}
          >
            {!isConnected ? "OFFLINE" : telemetry.failureRisk > 80 ? "CRITICAL" : telemetry.failureRisk > 50 ? "WARNING" : "NORMAL"}
          </span>
        </div>
      </div>

      {/* Row 1: Motor Visual Wireframe & Risk Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Wireframe Cross-section (7 cols) */}
        <div className="lg:col-span-7 border border-[#B5B3A7] bg-[#F4F3ED] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2 mb-2">
            <span className="font-bold text-[12px] text-[#182226] tracking-wider uppercase">
              STATOR & ROTOR THERMAL PROFILE
            </span>
            <span className="text-[10px] text-[#456557] font-bold">ISOMETRIC CROSS-SECTION</span>
          </div>

          <div className="h-44 flex items-center justify-center relative bg-[#FFFFFF] border border-[#B5B3A7]">
            <svg className="w-full max-h-[170px]" viewBox="0 0 240 120" fill="none">
              {/* Motor mount plate */}
              <rect x="30" y="98" width="180" height="10" rx="1" fill="#D8D6CC" stroke="#2C393E" strokeWidth="1.2" />
              <circle cx="45" cy="103" r="2.5" fill="#2C393E" />
              <circle cx="195" cy="103" r="2.5" fill="#2C393E" />

              {/* Stator Shell */}
              <rect x="50" y="24" width="140" height="74" rx="4" fill="#EFECE6" stroke="#2C393E" strokeWidth="1.4" />
              
              {/* Cooling ribs in gold */}
              {[62, 74, 86, 98, 110, 122, 134, 146, 158, 170].map((rx) => (
                <rect key={rx} x={rx} y="20" width="5" height="82" rx="1" fill="#E5A93C" stroke="#2C393E" strokeWidth="0.8" />
              ))}

              {/* Internal Windings (Highlight based on temp) */}
              <path
                d="M 60 32 L 180 32 L 180 90 L 60 90 Z"
                fill={isConnected && (telemetry.temperature ?? 0) > 35 ? "#FF484820" : "none"}
                stroke={isConnected && (telemetry.temperature ?? 0) > 35 ? "#FF4848" : "#2C393E"}
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />

              {/* Shaft */}
              <rect x="180" y="55" width="45" height="12" fill="#D8D6CC" stroke="#2C393E" strokeWidth="1.2" />
              <line x1="190" y1="61" x2="220" y2="61" stroke="#456557" strokeWidth="1.5" />

              {/* Bearing blocks */}
              <rect x="55" y="44" width="14" height="34" fill="#2C393E" stroke="#182226" strokeWidth="1" />
              <rect x="171" y="44" width="14" height="34" fill="#2C393E" stroke="#182226" strokeWidth="1" />

              {/* Sensor attachment annotations */}
              <circle cx="120" cy="20" r="4" fill="#FF4848" />
              <text x="128" y="16" fontSize="8" fill="#FF4848" fontFamily="monospace" fontWeight="bold">DS18B20 PROBE</text>

              <circle cx="55" cy="44" r="4" fill="#FFA133" />
              <text x="8" y="42" fontSize="8" fill="#D97706" fontFamily="monospace" fontWeight="bold">MPU6050</text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[9.5px] text-[#5A686D] pt-2 border-t border-[#B5B3A7]">
            <span>MOTOR MODEL: BTS-7960 DRIVE 12V HIGH-TORQUE BRUSHED</span>
            <span>BEARING CLASS: ABEC-5 DEEP GROOVE</span>
          </div>
        </div>

        {/* Diagnostic Overview (5 cols) */}
        <div className="lg:col-span-5 border border-[#B5B3A7] bg-[#F4F3ED] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2 mb-3">
              <span className="font-bold text-[12px] text-[#182226] tracking-wider uppercase">
                DIAGNOSTIC METRICS
              </span>
              <span className="text-[10px] text-[#456557] font-bold">HARDWARE FEED</span>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between py-1 border-b border-[#B5B3A7]/50">
                <span className="text-[#5A686D]">MOTOR VELOCITY</span>
                <span className="text-[#182226] font-bold">--</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#B5B3A7]/50">
                <span className="text-[#5A686D]">CURRENT (INA219)</span>
                <span className="text-[#182226] font-bold">
                  {isConnected && telemetry.current !== null ? `${telemetry.current.toFixed(2)} A` : "--"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#B5B3A7]/50">
                <span className="text-[#5A686D]">CORE TEMPERATURE</span>
                <span className="text-[#182226] font-bold">
                  {isConnected && telemetry.temperature !== null ? `${telemetry.temperature.toFixed(1)} °C` : "--"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#B5B3A7]/50">
                <span className="text-[#5A686D]">VIBRATION INTENSITY</span>
                <span className={`font-bold ${isVibAlert(telemetry.vibration) ? "text-[#FF4848]" : "text-[#456557]"}`}>
                  {isConnected && telemetry.vibration !== null
                    ? `${telemetry.vibration.toFixed(2)} g (${telemetry.vibration >= 3.0 ? "ALERT" : "NORMAL"})`
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#B5B3A7]/50">
                <span className="text-[#5A686D]">MOTOR PWM</span>
                <span className="text-[#182226] font-bold">
                  {isConnected ? (telemetry.motorOn ? `${telemetry.motorSpeed ?? 180} / 255` : "OFF") : "--"}
                </span>
              </div>
            </div>
          </div>

          {/* RISK INDEX Bar */}
          <div className="mt-4 pt-3 border-t border-[#B5B3A7]">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] font-bold text-[#182226] uppercase">RISK INDEX</span>
              <span className="text-[16px] font-display font-extrabold text-[#FF4848]">
                {isConnected ? telemetry.failureRisk : "--"} <span className="text-[11px] text-[#5A686D]">/ 100</span>
              </span>
            </div>
            <div className="h-4 border border-[#B5B3A7] bg-[#FFFFFF] p-[1px]">
              <div
                className="h-full bg-[#FF4848] transition-all duration-300"
                style={{ width: `${isConnected ? telemetry.failureRisk : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Failure Indicators & Stress Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stressIndicators.map((s) => (
          <div key={s.id} className="border border-[#B5B3A7] bg-[#F4F3ED] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#B5B3A7] mb-2">
                <span className="font-bold text-[11px] text-[#182226] uppercase">{s.name}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 ${
                    s.status === "CRITICAL"
                      ? "bg-[#FF4848] text-white"
                      : s.status === "WARNING"
                      ? "bg-[#FFA133] text-[#182226]"
                      : s.status === "OFFLINE"
                      ? "bg-[#9A9890] text-white"
                      : "bg-[#456557] text-white"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-[10px] text-[#5A686D] mb-3">{s.desc}</p>
            </div>

            <div>
              <div className="flex justify-between items-baseline text-[10px] mb-1">
                <span className="text-[#5A686D]">SAFE LIMIT: {s.limit}</span>
                <span className="text-[#182226] font-bold text-[14px]">
                  {isConnected ? `${s.val}%` : "--"}
                </span>
              </div>
              <div className="h-2.5 border border-[#B5B3A7] bg-[#FFFFFF] p-[1px]">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${s.val}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  function isVibAlert(v: number | null): boolean {
    return isConnected && v !== null && v >= 3.0;
  }
};
