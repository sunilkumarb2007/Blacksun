import React, { useState } from "react";
import { useTelemetry } from "../context/TelemetryContext";

type Timeframe = "1m" | "5m" | "15m" | "live";

export const LiveTelemetryPage: React.FC = () => {
  const { telemetry, settings } = useTelemetry();
  const [timeframe, setTimeframe] = useState<Timeframe>("live");

  const telemetryChannels = [
    {
      id: "temp",
      name: "TEMPERATURE (DS18B20)",
      val: telemetry.temperature.toFixed(1),
      unit: "°C",
      min: 34.1,
      max: 52.8,
      avg: 38.2,
      warnThreshold: `${settings.tempWarningThreshold}°C`,
      critThreshold: `${settings.tempCriticalThreshold}°C`,
      history: telemetry.tempHistory,
      color: "#FF4848",
      status: telemetry.tempStatus,
    },
    {
      id: "volt_curr",
      name: "BUS POWER & VOLTAGE (INA219)",
      val: `${telemetry.voltage.toFixed(1)} V / ${telemetry.current.toFixed(1)} A`,
      unit: `(${telemetry.power.toFixed(1)} W)`,
      min: 22.4,
      max: 44.8,
      avg: 25.1,
      warnThreshold: "26.0 W",
      critThreshold: "38.0 W",
      history: telemetry.powerHistory,
      color: "#456557",
      status: telemetry.powerCondition,
    },
    {
      id: "mot_curr",
      name: "MOTOR CURRENT (ACS712)",
      val: telemetry.motorCurrent.toFixed(2),
      unit: "A",
      min: 0.78,
      max: 3.24,
      avg: 0.88,
      warnThreshold: `${settings.currentWarningThreshold} A`,
      critThreshold: `${settings.currentCriticalThreshold} A`,
      history: telemetry.motorCurrentHistory,
      color: "#0284C7",
      status: telemetry.motorCurrentStatus,
    },
    {
      id: "vib",
      name: "VIBRATION SPECTRUM (MPU6050)",
      val: telemetry.vibration.toFixed(2),
      unit: "g",
      min: 0.02,
      max: 0.44,
      avg: 0.08,
      warnThreshold: `${settings.vibrationWarningThreshold} g`,
      critThreshold: `${settings.vibrationCriticalThreshold} g`,
      history: telemetry.vibrationHistory,
      color: "#FFA133",
      status: telemetry.vibrationStatus,
    },
    {
      id: "load",
      name: "SYSTEM & MOTOR LOAD",
      val: `${telemetry.motorLoad}`,
      unit: "%",
      min: 40,
      max: 98,
      avg: 74,
      warnThreshold: "80 %",
      critThreshold: "90 %",
      history: [68, 70, 72, 75, 78, 80, 81, telemetry.motorLoad],
      color: "#8B5CF6",
      status: telemetry.motorLoad > 85 ? "HIGH" : "NORMAL",
    },
    {
      id: "rf",
      name: "COMMUNICATION RSSI / LATENCY",
      val: `${telemetry.rssi} dBm / ${telemetry.latency} ms`,
      unit: telemetry.rfStatus,
      min: -75,
      max: -65,
      avg: -68,
      warnThreshold: "-85 dBm",
      critThreshold: "-92 dBm",
      history: [-68, -69, -68, -67, -68, -67, -68, telemetry.rssi],
      color: "#19D3C2",
      status: telemetry.rfStatus,
    },
  ];

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#B5B3A7] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">02</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              LIVE TELEMETRY & WAVEFORM INSTRUMENTATION
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            HIGH-PRECISION SENSOR CHANNELS • CONFIGURABLE SAFETY BOUNDARIES
          </p>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1 border border-[#B5B3A7] bg-[#F4F3ED] p-1">
          {(["1m", "5m", "15m", "live"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
                timeframe === tf
                  ? "bg-[#364E46] text-white"
                  : "text-[#5A686D] hover:text-[#182226]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 6 Real-time Instrumentation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {telemetryChannels.map((ch) => (
          <div
            key={ch.id}
            className="border border-[#B5B3A7] bg-[#F4F3ED] p-4 flex flex-col justify-between"
          >
            {/* Channel Header */}
            <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2 mb-3">
              <div>
                <div className="font-bold text-[12px] text-[#182226] tracking-wide">{ch.name}</div>
                <div className="text-[9.5px] text-[#5A686D]">
                  WARN: <span className="text-[#FFA133] font-semibold">{ch.warnThreshold}</span> | CRIT:{" "}
                  <span className="text-[#FF4848] font-semibold">{ch.critThreshold}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-display font-extrabold text-[22px] text-[#182226] tracking-tight">
                  {ch.val}
                </span>{" "}
                <span className="text-[11px] text-[#456557] font-bold">{ch.unit}</span>
              </div>
            </div>

            {/* SVG Waveform Chart */}
            <div className="h-28 w-full border border-[#B5B3A7] bg-[#FFFFFF] p-2 relative overflow-hidden my-2">
              {/* Threshold Lines */}
              <div className="absolute inset-x-0 top-6 border-b border-dashed border-[#FF4848]/60" />
              <div className="absolute inset-x-0 top-12 border-b border-dashed border-[#FFA133]/60" />

              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                {/* Reference Grid lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />

                {/* Simulated Curve */}
                <path
                  d={`M 0 50 Q 50 ${40 + Math.sin(Date.now() / 2000) * 10} 100 45 T 200 ${
                    35 + Math.cos(Date.now() / 2000) * 12
                  } T 300 40`}
                  fill="none"
                  stroke={ch.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="300" cy="40" r="3.5" fill={ch.color} />
              </svg>

              <div className="absolute bottom-1 right-2 text-[8.5px] text-[#5A686D]">
                WINDOW: {timeframe.toUpperCase()}
              </div>
            </div>

            {/* Min / Max / Avg Metrics Footer */}
            <div className="flex items-center justify-between text-[10px] text-[#5A686D] pt-2 border-t border-[#B5B3A7]">
              <div>MIN: <span className="text-[#182226] font-bold">{ch.min}</span></div>
              <div>MAX: <span className="text-[#182226] font-bold">{ch.max}</span></div>
              <div>AVG: <span className="text-[#182226] font-bold">{ch.avg}</span></div>
              <div className="flex items-center gap-1.5">
                STATUS:{" "}
                <span
                  className={`font-bold px-1.5 py-0.5 text-[9px] ${
                    ch.status === "CRITICAL" || ch.status === "HIGH" || ch.status === "ALERT"
                      ? "bg-[#FF4848] text-white"
                      : "bg-[#456557] text-white"
                  }`}
                >
                  {ch.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
