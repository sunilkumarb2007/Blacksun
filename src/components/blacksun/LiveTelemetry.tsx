import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const LiveTelemetry: React.FC = () => {
  const { telemetry } = useTelemetry();
  const isConnected = telemetry.isConnected;

  const renderSparkline = (data: number[], color: string, height = 28) => {
    const width = 120;
    if (!data || data.length < 2) {
      return (
        <svg className="w-full h-7 overflow-visible opacity-30" viewBox={`0 0 ${width} ${height}`}>
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg className="w-full h-7 overflow-visible opacity-80" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Header Bar */}
      <div className="flex items-start justify-between pb-2 border-b border-[#B5B3A7]">
        <div>
          <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
            LIVE TELEMETRY
          </h2>
          <div className="text-[9px] tracking-widest text-[#555555] font-semibold mt-0.5 uppercase">
            SENSORS ({isConnected ? "STREAMING" : "WAITING FOR CORE"})
          </div>
        </div>
        <div className="text-[9.5px] tracking-widest text-[#78766B] font-semibold uppercase">
          {isConnected ? `UPDATED ${telemetry.lastUpdatedSec} SEC AGO` : "OFFLINE"}
        </div>
      </div>

      {/* 6 Sensor Columns with thin vertical dividers */}
      <div className="grid grid-cols-6 divide-x divide-[#B5B3A7] h-full items-stretch pt-2">
        {/* 1. TEMPERATURE (DS18B20) */}
        <div className="relative flex flex-col items-center justify-between px-2 text-center group">
          <div className="h-7 flex items-center justify-center text-[#FF8A24] z-10">
            <svg width="20" height="24" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m0 0a5 5 0 1 0 0 6 5 5 0 0 0 0-6Z" />
              <circle cx="12" cy="23" r="2.5" fill="currentColor" />
            </svg>
          </div>

          <div className="my-1 z-10">
            <div className="font-display font-black text-[22px] leading-tight text-[#111111] tracking-tight">
              {isConnected && telemetry.temperature !== null ? `${telemetry.temperature.toFixed(1)} °C` : "--"}
            </div>
            <div className="text-[9.5px] font-bold text-[#FF4848] tracking-tight">
              {isConnected && telemetry.temperatureRate !== null
                ? `↑ ${telemetry.temperatureRate >= 0 ? "+" : ""}${telemetry.temperatureRate.toFixed(1)} °C/min`
                : "--"}
            </div>
          </div>

          {/* Sparkline */}
          <div className="w-full my-1 z-10">
            {renderSparkline(telemetry.tempHistory, "#FF8A24")}
          </div>

          <div className="text-[9px] leading-[1.25] tracking-tight text-[#333333] uppercase font-bold z-10">
            <div>TEMPERATURE</div>
            <div className="text-[#666661]">(DS18B20)</div>
          </div>
        </div>

        {/* 2. VOLTAGE (INA219) */}
        <div className="relative flex flex-col items-center justify-between px-2 text-center group">
          <div className="h-7 flex items-center justify-center text-[#3D6E5C] z-10">
            <svg width="18" height="24" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2L6 16h8l-2 14 10-16h-8l2-12Z" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="my-1 z-10">
            <div className="font-display font-black text-[22px] leading-tight text-[#111111] tracking-tight">
              {isConnected && telemetry.voltage !== null ? `${telemetry.voltage.toFixed(1)} V` : "--"}
            </div>
            <div className="h-3.5 text-[9px] text-[#666661]">
              {isConnected ? "DC BUS" : "--"}
            </div>
          </div>

          <div className="w-full my-1 z-10">
            {renderSparkline(telemetry.voltageHistory, "#3D6E5C")}
          </div>

          <div className="text-[9px] leading-[1.25] tracking-tight text-[#333333] uppercase font-bold z-10">
            <div>VOLTAGE</div>
            <div className="text-[#666661]">(INA219)</div>
          </div>
        </div>

        {/* 3. CURRENT (INA219) */}
        <div className="relative flex flex-col items-center justify-between px-2 text-center group">
          <div className="h-7 flex items-center justify-center text-[#FF8A24] z-10">
            <svg width="24" height="20" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h8l3-8 5 16 4-10 2 4h8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="my-1 z-10">
            <div className="font-display font-black text-[22px] leading-tight text-[#111111] tracking-tight">
              {isConnected && telemetry.current !== null ? `${telemetry.current.toFixed(2)} A` : "--"}
            </div>
            <div className="h-3.5 text-[9px] text-[#666661]">
              {isConnected ? "TOTAL DRAW" : "--"}
            </div>
          </div>

          <div className="w-full my-1 z-10">
            {renderSparkline(telemetry.currentHistory, "#FF8A24")}
          </div>

          <div className="text-[9px] leading-[1.25] tracking-tight text-[#333333] uppercase font-bold z-10">
            <div>CURRENT</div>
            <div className="text-[#666661]">(INA219)</div>
          </div>
        </div>

        {/* 4. POWER (INA219) */}
        <div className="relative flex flex-col items-center justify-between px-2 text-center group">
          <div className="h-7 flex items-center justify-center text-[#3D6E5C] z-10">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="18" width="3" height="7" rx="0.5" fill="currentColor" />
              <rect x="9" y="13" width="3" height="12" rx="0.5" fill="currentColor" />
              <rect x="15" y="8" width="3" height="17" rx="0.5" fill="currentColor" />
              <rect x="21" y="3" width="3" height="22" rx="0.5" fill="currentColor" />
            </svg>
          </div>

          <div className="my-1 z-10">
            <div className="font-display font-black text-[22px] leading-tight text-[#111111] tracking-tight">
              {isConnected && telemetry.power !== null ? `${telemetry.power.toFixed(1)} W` : "--"}
            </div>
            <div className="h-3.5 text-[9px] text-[#666661]">
              {isConnected ? "SYSTEM BUS" : "--"}
            </div>
          </div>

          <div className="w-full my-1 z-10">
            {renderSparkline(telemetry.powerHistory, "#3D6E5C")}
          </div>

          <div className="text-[9px] leading-[1.25] tracking-tight text-[#333333] uppercase font-bold z-10">
            <div>POWER</div>
            <div className="text-[#666661]">(INA219)</div>
          </div>
        </div>

        {/* 5. MOTOR (PWM) */}
        <div className="relative flex flex-col items-center justify-between px-2 text-center group">
          <div className="h-7 flex items-center justify-center text-[#19D3C2] z-10">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="#111111" strokeWidth="2">
              <circle cx="14" cy="14" r="10" />
              <path d="M10 14h8m-4-4v8" strokeLinecap="round" />
            </svg>
          </div>

          <div className="my-1 z-10">
            <div className="font-display font-black text-[22px] leading-tight text-[#111111] tracking-tight">
              {isConnected && telemetry.motorSpeed !== null ? `${telemetry.motorSpeed}` : "--"}
            </div>
            <div className="h-3.5 text-[9px] font-bold text-[#364E46]">
              {isConnected ? (telemetry.motorOn ? "MOTOR RUNNING" : "MOTOR OFF") : "--"}
            </div>
          </div>

          <div className="w-full my-1 z-10">
            {renderSparkline(telemetry.motorCurrentHistory, "#19D3C2")}
          </div>

          <div className="text-[9px] leading-[1.25] tracking-tight text-[#333333] uppercase font-bold z-10">
            <div>MOTOR SPEED</div>
            <div className="text-[#666661]">(PWM 0-255)</div>
          </div>
        </div>

        {/* 6. VIBRATION (MPU6050) */}
        <div className="relative flex flex-col items-center justify-between px-2 text-center group">
          <div className="h-7 flex items-center justify-center text-[#3D6E5C] z-10">
            <svg width="24" height="20" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12 L6 12 L9 6 L13 18 L17 6 L21 18 L24 8 L27 12 L30 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="my-1 z-10">
            <div className="font-display font-black text-[22px] leading-tight text-[#111111] tracking-tight">
              {isConnected && telemetry.vibration !== null ? `${telemetry.vibration.toFixed(2)} g` : "--"}
            </div>
            <div
              className={`h-3.5 text-[9px] font-bold ${
                isConnected && telemetry.vibration !== null && telemetry.vibration >= 3.0
                  ? "text-[#FF4848]"
                  : "text-[#3D6E5C]"
              }`}
            >
              {isConnected && telemetry.vibration !== null
                ? telemetry.vibration >= 3.0
                  ? "VIBRATION ALERT"
                  : "NORMAL"
                : "--"}
            </div>
          </div>

          <div className="w-full my-1 z-10">
            {renderSparkline(telemetry.vibrationHistory, "#3D6E5C")}
          </div>

          <div className="text-[9px] leading-[1.25] tracking-tight text-[#333333] uppercase font-bold z-10">
            <div>VIBRATION</div>
            <div className="text-[#666661]">(MPU6050)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
