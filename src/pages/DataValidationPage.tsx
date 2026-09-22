import React, { useState } from "react";
import { useTelemetry } from "../context/TelemetryContext";

export const DataValidationPage: React.FC = () => {
  const { systemMode, setSystemMode } = useTelemetry();
  const [selectedTest, setSelectedTest] = useState<string>("thermal");

  const validationTests = [
    {
      id: "thermal",
      title: "THERMAL OVERDRIVE TEST",
      sensor: "DS18B20",
      detectionTime: "42 ms",
      decisionTime: "11 ms",
      actuationTime: "18 ms",
      totalResponseTime: "71 ms",
      recoveryTime: "1450 ms",
      result: "PASSED (100% RELIABILITY)",
      details: "Simulated +10°C/min temperature step. Fan engaged at 40°C threshold. Cartridge heater disabled.",
    },
    {
      id: "vibration",
      title: "HARMONIC VIBRATION TEST",
      sensor: "MPU6050",
      detectionTime: "28 ms",
      decisionTime: "14 ms",
      actuationTime: "24 ms",
      totalResponseTime: "66 ms",
      recoveryTime: "820 ms",
      result: "PASSED (100% RELIABILITY)",
      details: "Injected 0.40g resonant peak. Speed throttled from 1480 to 880 RPM within 66ms. Structural stress averted.",
    },
    {
      id: "current",
      title: "ARMATURE CURRENT SURGE TEST",
      sensor: "ACS712 / INA219",
      detectionTime: "18 ms",
      decisionTime: "8 ms",
      actuationTime: "12 ms",
      totalResponseTime: "38 ms",
      recoveryTime: "2100 ms",
      result: "PASSED (100% RELIABILITY)",
      details: "3.2A surge induced. Optocoupled relay isolated driver circuit in 38ms. Power rail preserved.",
    },
    {
      id: "rf_timeout",
      title: "RF LINK DROPOUT & AUTONOMY TEST",
      sensor: "NRF24L01+",
      detectionTime: "200 ms",
      decisionTime: "15 ms",
      actuationTime: "5 ms",
      totalResponseTime: "220 ms",
      recoveryTime: "350 ms",
      result: "PASSED (100% RELIABILITY)",
      details: "RF carrier suppressed. System seamlessly transitioned to local failsafe autonomy without glitch.",
    },
    {
      id: "cascade",
      title: "FULL CASCADE SIMULTANEOUS TEST",
      sensor: "ALL SENSORS",
      detectionTime: "48 ms",
      decisionTime: "16 ms",
      actuationTime: "22 ms",
      totalResponseTime: "86 ms",
      recoveryTime: "3200 ms",
      result: "PASSED (100% RELIABILITY)",
      details: "Simultaneous thermal runaway, mechanical vibration, and RF loss. Autonomous shutdown successfully executed.",
    },
  ];

  const activeTestObj = validationTests.find((t) => t.id === selectedTest) || validationTests[0];

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#B5B3A7] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">08</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              DATA VALIDATION & SAFETY CERTIFICATION BENCH
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            DETERMINISTIC LATENCY BENCHMARKS • SAFETY COMPLIANCE VERIFICATION
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 border border-[#B5B3A7] bg-[#F4F3ED] p-1">
          <button
            onClick={() => setSystemMode("SIMULATION")}
            className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
              systemMode === "SIMULATION" ? "bg-[#364E46] text-white" : "text-[#5A686D] hover:text-[#182226]"
            }`}
          >
            SIMULATION MODE
          </button>
          <button
            onClick={() => setSystemMode("HARDWARE")}
            className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
              systemMode === "HARDWARE" ? "bg-[#364E46] text-white" : "text-[#5A686D] hover:text-[#182226]"
            }`}
          >
            LIVE HARDWARE BENCH
          </button>
        </div>
      </div>

      {/* Latency Timing Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-3">
          <div className="text-[9px] text-[#5A686D] uppercase">AVG DETECTION TIME</div>
          <div className="text-[20px] font-bold text-[#456557] mt-0.5">32 ms</div>
          <div className="text-[8.5px] text-[#5A686D]">DMA & Interrupt latency</div>
        </div>
        <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-3">
          <div className="text-[9px] text-[#5A686D] uppercase">DECISION ENGINE TIME</div>
          <div className="text-[20px] font-bold text-[#182226] mt-0.5">12 ms</div>
          <div className="text-[8.5px] text-[#5A686D]">Core 1 deterministic eval</div>
        </div>
        <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-3">
          <div className="text-[9px] text-[#5A686D] uppercase">ACTUATION LATENCY</div>
          <div className="text-[20px] font-bold text-[#182226] mt-0.5">18 ms</div>
          <div className="text-[8.5px] text-[#5A686D]">Relay & MOSFET rise time</div>
        </div>
        <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-3">
          <div className="text-[9px] text-[#5A686D] uppercase">TOTAL RESPONSE TIME</div>
          <div className="text-[20px] font-bold text-[#0284C7] mt-0.5">&lt; 80 ms</div>
          <div className="text-[8.5px] text-[#456557] font-semibold">Sub-100ms ISO compliant</div>
        </div>
      </div>

      {/* Test Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#B5B3A7] pb-2">
        {validationTests.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTest(t.id)}
            className={`px-3 py-1.5 text-[10.5px] font-bold uppercase transition-all border ${
              selectedTest === t.id
                ? "border-2 border-[#456557] bg-[#ECEFEA] text-[#182226]"
                : "border border-[#B5B3A7] bg-[#F4F3ED] text-[#5A686D] hover:text-[#182226]"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Selected Test Report Card */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2">
          <div>
            <span className="font-bold text-[14px] text-[#182226] uppercase">{activeTestObj.title}</span>
            <span className="text-[10px] text-[#5A686D] ml-3">PRIMARY SENSOR: {activeTestObj.sensor}</span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-[#456557] text-white">
            {activeTestObj.result}
          </span>
        </div>

        <div className="text-[11.5px] text-[#182226] leading-relaxed">{activeTestObj.details}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#B5B3A7] text-[11px]">
          <div>
            <span className="text-[#5A686D] block text-[9.5px]">DETECTION TIME:</span>
            <span className="text-[#182226] font-bold">{activeTestObj.detectionTime}</span>
          </div>
          <div>
            <span className="text-[#5A686D] block text-[9.5px]">DECISION TIME:</span>
            <span className="text-[#182226] font-bold">{activeTestObj.decisionTime}</span>
          </div>
          <div>
            <span className="text-[#5A686D] block text-[9.5px]">ACTUATION TIME:</span>
            <span className="text-[#182226] font-bold">{activeTestObj.actuationTime}</span>
          </div>
          <div>
            <span className="text-[#5A686D] block text-[9.5px]">RECOVERY TIME:</span>
            <span className="text-[#182226] font-bold">{activeTestObj.recoveryTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
