import React from "react";
import { useTelemetry } from "../context/TelemetryContext";

export const SurvivalEnginePage: React.FC = () => {
  const { telemetry } = useTelemetry();

  const stages = [
    {
      id: "DETECT",
      label: "1. DETECT",
      desc: "Hardware Interrupts & DMA Samples",
      active: true,
      data: "DS18B20 1-Wire, MPU6050 I2C (100Hz), INA219 (1kHz)",
    },
    {
      id: "SENSE",
      label: "2. SENSE",
      desc: "Noise Filtering & Trend Extraction",
      active: true,
      data: telemetry.temperatureRate !== null
        ? `Gradient: +${telemetry.temperatureRate.toFixed(1)}°C/min | RMS Vib: ${(telemetry.vibration ?? 0).toFixed(2)}g`
        : "Awaiting real hardware sensor stream (ws://192.168.4.1:81)",
    },
    {
      id: "THINK",
      label: "3. THINK",
      desc: "Multi-Sensor Correlation Engine",
      active: true,
      data: `${telemetry.crisisLevel} Classification • Confidence: ${telemetry.confidence}%`,
    },
    {
      id: "ADAPT",
      label: "4. ADAPT",
      desc: "Deterministic Rule Actuation",
      active: telemetry.crisisLevel !== "NORMAL",
      data: `Fan: ${telemetry.fan ? "ON" : "OFF"}, Relay: ${telemetry.relay ? "CLOSED" : "OPEN"}, Motor: ${
        telemetry.motor ? "RUN" : "HALT"
      }`,
    },
    {
      id: "SURVIVE",
      label: "5. SURVIVE",
      desc: "Failsafe Equilibrium Preserved",
      active: true,
      data: `Mode: ${telemetry.survivalMode} • Risk Index: ${telemetry.failureRisk}/100`,
    },
  ];

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-5 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">04</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              REAL-TIME SURVIVAL DECISION ENGINE
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            DETERMINISTIC EMBEDDED DECISION LOGIC PIPELINE • ZERO CLOUD INFERENCE
          </p>
        </div>

        <div className="border border-[#456557] bg-[#456557] px-3 py-1 text-[11px] font-bold text-white shadow-xs">
          DECISION: {telemetry.decision}
        </div>
      </div>

      {/* Five-Stage Horizontal Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((st) => (
          <div
            key={st.id}
            className={`border p-3 flex flex-col justify-between transition-all ${
              st.active
                ? "border-[#456557] bg-[#F4F3ED] shadow-xs"
                : "border-[#B5B3A7] bg-[#F4F3ED] opacity-60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[12px] text-[#182226]">{st.label}</span>
                <span className={`w-2 h-2 rounded-full ${st.active ? "bg-[#456557]" : "bg-[#B5B3A7]"}`} />
              </div>
              <div className="text-[10px] text-[#5A686D] font-medium leading-tight mb-2">
                {st.desc}
              </div>
            </div>
            <div className="text-[9.5px] text-[#456557] font-bold pt-2 border-t border-[#B5B3A7] truncate" title={st.data}>
              {st.data}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Multi-Stage Decision Tree */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2">
          <span className="font-bold text-[13px] text-[#182226] uppercase tracking-wider">
            DECISION TREE TRACE & REASONING PATH
          </span>
          <span className="text-[10px] text-[#5A686D]">EVALUATED EVERY 50ms ON ESP32 CORE 1</span>
        </div>

        {/* Tree Flow Representation */}
        <div className="space-y-3 text-[11px]">
          {/* Layer 1: Sensor Inputs */}
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[#182226] font-bold">1. RAW SENSOR INPUTS</span>
            <div className="flex flex-wrap gap-2 text-[10.5px]">
              <span className="px-2 py-0.5 bg-[#E8E7DF] text-[#182226] border border-[#B5B3A7] font-semibold">
                Temp: {telemetry.temperature !== null ? `${telemetry.temperature.toFixed(1)}°C` : "--"}
              </span>
              <span className="px-2 py-0.5 bg-[#E8E7DF] text-[#182226] border border-[#B5B3A7] font-semibold">
                Vib: {telemetry.vibration !== null ? `${telemetry.vibration.toFixed(2)}g` : "--"}
              </span>
              <span className="px-2 py-0.5 bg-[#E8E7DF] text-[#182226] border border-[#B5B3A7] font-semibold">
                Curr: {telemetry.current !== null ? `${telemetry.current.toFixed(2)}A` : "--"}
              </span>
              <span className="px-2 py-0.5 bg-[#E8E7DF] text-[#182226] border border-[#B5B3A7] font-semibold">
                Link: {telemetry.rfStatus}
              </span>
            </div>
          </div>

          <div className="text-center text-[#456557] font-bold text-[14px]">↓</div>

          {/* Layer 2: Correlation Analysis */}
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[#182226] font-bold">2. CORRELATION & THRESHOLD CHECK</span>
            <div className="space-y-1 text-right text-[10.5px]">
              {telemetry.reasons.map((r, i) => (
                <div key={i} className="text-[#182226] font-medium">
                  <span className="text-[#FFA133] mr-1.5 font-bold">●</span>
                  {r}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-[#456557] font-bold text-[14px]">↓</div>

          {/* Layer 3: Protective Actuator Command Execution */}
          <div className="border border-[#456557] bg-[#ECEFEA] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-[#5A686D] uppercase font-bold">3. EXECUTED SURVIVAL COMMAND</div>
              <div className="font-display font-black text-[18px] text-[#182226] tracking-wide uppercase mt-0.5">
                {telemetry.decision}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className={`px-2.5 py-1 border ${telemetry.fan ? "border-[#456557] bg-[#456557] text-white" : "border-[#B5B3A7] bg-[#F4F3ED] text-[#5A686D]"}`}>
                FAN: {telemetry.fan ? "ACTIVE (100%)" : "STANDBY"}
              </span>
              <span className={`px-2.5 py-1 border ${!telemetry.heater ? "border-[#456557] bg-[#456557] text-white" : "border-[#FF4848] bg-[#FF4848] text-white"}`}>
                HEATER: {telemetry.heater ? "POWERED" : "ISOLATED"}
              </span>
              <span className={`px-2.5 py-1 border ${telemetry.motor ? "border-[#456557] bg-[#456557] text-white" : "border-[#FF4848] bg-[#FF4848] text-white"}`}>
                MOTOR: {telemetry.motor ? "ENGAGED" : "SAFETY CUTOFF"}
              </span>
              <span className={`px-2.5 py-1 border ${telemetry.buzzer ? "border-[#FF4848] bg-[#FF4848] text-white" : "border-[#B5B3A7] bg-[#F4F3ED] text-[#5A686D]"}`}>
                ALARM: {telemetry.buzzer ? "TRIGGERED" : "SILENT"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
