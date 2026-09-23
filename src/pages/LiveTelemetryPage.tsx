import React, { useState } from "react";
import { useTelemetry } from "../context/TelemetryContext";

type Timeframe = "1m" | "5m" | "15m" | "live";

export const LiveTelemetryPage: React.FC = () => {
  const { telemetry, settings } = useTelemetry();
  const [timeframe, setTimeframe] = useState<Timeframe>("live");

  const hasData = telemetry.temperature !== null;

  const telemetryChannels = [
    {
      id: "temp",
      name: "TEMPERATURE (DS18B20)",
      val: hasData ? `${telemetry.temperature!.toFixed(1)} °C` : "--",
      unit: "DS18B20",
      warnThreshold: `${settings.tempWarningThreshold.toFixed(1)}°C (29°C)`,
      critThreshold: `${settings.tempCriticalThreshold.toFixed(1)}°C (35°C)`,
      history: telemetry.tempHistory,
      color: "#FF4848",
      status: !hasData ? "OFFLINE" : (telemetry.temperature ?? 0) >= 35 ? "CRITICAL" : (telemetry.temperature ?? 0) >= 29 ? "WARNING" : "NORMAL",
    },
    {
      id: "volt",
      name: "BUS VOLTAGE (INA219)",
      val: hasData && telemetry.voltage !== null ? `${telemetry.voltage.toFixed(1)} V` : "--",
      unit: "INA219",
      warnThreshold: "11.2 V",
      critThreshold: "10.5 V",
      history: telemetry.voltageHistory,
      color: "#456557",
      status: !hasData ? "OFFLINE" : telemetry.powerCondition,
    },
    {
      id: "power_curr",
      name: "BUS POWER & CURRENT (INA219)",
      val: hasData && (telemetry.powerW !== null || telemetry.power !== null) && (telemetry.currentA !== null || telemetry.current !== null)
        ? `${(telemetry.powerW ?? telemetry.power ?? 0).toFixed(1)} W / ${(telemetry.currentA ?? telemetry.current ?? 0).toFixed(2)} A`
        : "--",
      unit: "INA219",
      warnThreshold: "26.0 W",
      critThreshold: "38.0 W",
      history: telemetry.powerHistory,
      color: "#0284C7",
      status: !hasData ? "OFFLINE" : (telemetry.power ?? 0) > 38 ? "CRITICAL" : "NORMAL",
    },
    {
      id: "vib",
      name: "VIBRATION SPECTRUM (MPU6050)",
      val: hasData && telemetry.vibration !== null ? `${telemetry.vibration.toFixed(2)} g` : "--",
      unit: "MPU6050",
      warnThreshold: `${settings.vibrationWarningThreshold.toFixed(1)} g (3.0g)`,
      critThreshold: `${settings.vibrationCriticalThreshold.toFixed(1)} g (5.0g)`,
      history: telemetry.vibrationHistory,
      color: "#FFA133",
      status: !hasData ? "OFFLINE" : (telemetry.vibration ?? 0) >= 3.0 ? "ALERT" : "NORMAL",
    },
    {
      id: "motor_pwm",
      name: "MOTOR PWM & SPEED (INA219 / BTS7960)",
      val: hasData ? (telemetry.motorOn ? `ON (${telemetry.motorSpeed ?? 180} PWM)` : "OFF") : "--",
      unit: "PWM 0-255",
      warnThreshold: "220 PWM",
      critThreshold: "255 PWM",
      history: telemetry.motorCurrentHistory,
      color: "#8B5CF6",
      status: !hasData ? "OFFLINE" : telemetry.motorOn ? "RUNNING" : "HALTED",
    },
    {
      id: "comm",
      name: telemetry.mode === "REAL" ? "COMMUNICATION & WIFI RSSI" : "DEMO COMMUNICATION SPECTRUM",
      val: telemetry.wifiRSSI !== null ? `${telemetry.wifiRSSI} dBm` : "--",
      unit: telemetry.mode === "REAL" ? "WIFI RSSI" : "DEMO RSSI",
      warnThreshold: "RSSI <-75 dBm",
      critThreshold: "CARRIER DROP",
      history: telemetry.wifiRssiHistory.length > 0 ? telemetry.wifiRssiHistory : telemetry.wsLatencyHistory,
      color: "#19D3C2",
      status: telemetry.mode === "REAL" ? "CONNECTED" : "DEMO",
    },
  ];

  const renderWaveform = (data: number[], color: string) => {
    const width = 300;
    const height = 80;

    if (!data || data.length < 2) {
      return (
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          <line x1="0" y1="20" x2="300" y2="20" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="0" y1="40" x2="300" y2="40" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="0" y1="40" x2="300" y2="40" stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        </svg>
      );
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = 68 - ((val - min) / range) * 52;
        return `${x},${y}`;
      })
      .join(" ");

    const lastVal = data[data.length - 1];
    const lastY = 68 - ((lastVal - min) / range) * 52;

    return (
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        {/* Reference Grid lines */}
        <line x1="0" y1="20" x2="300" y2="20" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="0" y1="40" x2="300" y2="40" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="0" y1="60" x2="300" y2="60" stroke="#E2DFD2" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* Real Dynamic Telemetry Polyline */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx={width} cy={lastY} r="3.5" fill={color} />
      </svg>
    );
  };

  const getStats = (data: number[]) => {
    if (!data || data.length === 0) return { min: "--", max: "--", avg: "--" };
    const min = Math.min(...data).toFixed(1);
    const max = Math.max(...data).toFixed(1);
    const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1);
    return { min, max, avg };
  };

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
          <p className="text-[11px] text-[#5A686D]">
            {telemetry.mode === "REAL"
              ? "REAL HARDWARE SENSOR STREAMS • ZERO CLOUD WEBSOCKET TELEMETRY"
              : "DETERMINISTIC 500MS SIMULATED STREAM • ALTERNATING HARDWARE SCENARIOS"}
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
        {telemetryChannels.map((ch) => {
          const stats = getStats(ch.history);
          return (
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

              {/* Real SVG Waveform Chart */}
              <div className="h-28 w-full border border-[#B5B3A7] bg-[#FFFFFF] p-2 relative overflow-hidden my-2">
                {/* Threshold Lines */}
                <div className="absolute inset-x-0 top-6 border-b border-dashed border-[#FF4848]/60" />
                <div className="absolute inset-x-0 top-12 border-b border-dashed border-[#FFA133]/60" />

                {renderWaveform(ch.history, ch.color)}

                <div className="absolute bottom-1 right-2 text-[8.5px] text-[#5A686D]">
                  SAMPLES: {ch.history.length} | {timeframe.toUpperCase()}
                </div>
              </div>

              {/* Min / Max / Avg Metrics Footer */}
              <div className="flex items-center justify-between text-[10px] text-[#5A686D] pt-2 border-t border-[#B5B3A7]">
                <div>MIN: <span className="text-[#182226] font-bold">{stats.min}</span></div>
                <div>MAX: <span className="text-[#182226] font-bold">{stats.max}</span></div>
                <div>AVG: <span className="text-[#182226] font-bold">{stats.avg}</span></div>
                <div className="flex items-center gap-1.5">
                  STATUS:{" "}
                  <span
                    className={`font-bold px-1.5 py-0.5 text-[9px] ${
                      ch.status === "CRITICAL" || ch.status === "ALERT"
                        ? "bg-[#FF4848] text-white"
                        : ch.status === "WARNING"
                        ? "bg-[#FFA133] text-[#111111]"
                        : ch.status === "OFFLINE"
                        ? "bg-[#9A9890] text-white"
                        : "bg-[#456557] text-white"
                    }`}
                  >
                    {ch.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
