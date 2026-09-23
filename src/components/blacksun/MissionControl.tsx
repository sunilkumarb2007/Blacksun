import React, { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const MissionControl: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [timeStr, setTimeStr] = useState("10:35:29");
  const [dateStr, setDateStr] = useState("22 SEP 2026");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      const day = String(now.getDate()).padStart(2, "0");
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      setDateStr(`${day} ${month} ${year}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = (sec: number | null) => {
    if (sec === null || isNaN(sec)) return "--:--:--";
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const isWarning = telemetry.crisisLevel === "WARNING";
  const isCritical = telemetry.crisisLevel === "CRITICAL";
  const isConnected = telemetry.isConnected;

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-[#B5B3A7] pb-2">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
              MISSION CONTROL
            </h2>
            <span className="text-[9.5px] tracking-widest text-[#666661] uppercase font-semibold">
              REAL-TIME MONITORING • AUTONOMOUS RESPONSE • ZERO CLOUD
            </span>
          </div>
          <div className="text-[9px] tracking-widest text-[#8A887D] font-semibold mt-0.5 uppercase">
            {isConnected ? "HARDWARE ONLINE" : "HARDWARE OFFLINE"}
          </div>
        </div>

        {/* Date, Time, Uptime */}
        <div className="flex items-center gap-4 text-right text-[9.5px]">
          <div>
            <span className="text-[#8A887D] block">DATE</span>
            <span className="font-bold text-[#111111]">{dateStr}</span>
          </div>
          <div>
            <span className="text-[#8A887D] block">TIME</span>
            <span className="font-bold text-[#111111]">{timeStr}</span>
          </div>
          <div>
            <span className="text-[#8A887D] block">UPTIME</span>
            <span className="font-bold text-[#111111]">{formatUptime(telemetry.uptimeSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Content */}
      <div className="grid grid-cols-12 gap-4 pt-3 items-start flex-1">
        {/* Left Col: SYSTEM OPERATIONAL / OFFLINE */}
        <div className="col-span-5 flex flex-col justify-between h-full">
          <div>
            <h1 className="font-display font-black text-[28px] leading-[0.98] tracking-tight text-[#111111]">
              {isConnected ? (
                <>
                  SYSTEM<br />OPERATIONAL.
                </>
              ) : (
                <>
                  SYSTEM<br />OFFLINE.
                </>
              )}
            </h1>
            <div className="mt-2.5 text-[9.5px] leading-[1.4] tracking-wider text-[#333333] font-semibold">
              <div>BLACKSUN IS ON WATCH.</div>
              <div>{isConnected ? "DETECTING THREATS." : "WAITING FOR ESP32 CORE."}</div>
              <div>PROTECTING WHAT MATTERS.</div>
            </div>
          </div>
          {/* Accent Bar */}
          <div className={`mt-3.5 h-[3.5px] w-[75px] ${isConnected ? "bg-[#19D3C2]" : "bg-[#FFA133]"}`} />
        </div>

        {/* Middle Col: CRISIS LEVEL */}
        <div className="col-span-4 flex flex-col items-center justify-start text-center">
          <div className="text-[10px] tracking-[0.18em] text-[#666661] font-semibold uppercase">
            CRISIS LEVEL
          </div>

          <div
            className={`my-2 w-full max-w-[210px] px-4 py-2 flex items-center justify-center transition-all ${
              !isConnected
                ? "bg-[#9A9890] text-white shadow-sm"
                : isCritical
                ? "bg-[#FF4848] text-white shadow-sm"
                : isWarning
                ? "bg-[#FFA133] text-black shadow-sm"
                : "bg-[#2E7D32] text-white shadow-sm"
            }`}
          >
            <span className="font-display font-black text-[26px] tracking-wider leading-none">
              {!isConnected ? "OFFLINE" : telemetry.crisisLevel}
            </span>
          </div>

          <div className="text-[10.5px] leading-tight text-[#222222] font-semibold">
            {telemetry.crisisDescriptions.map((desc, idx) => (
              <div key={idx}>{desc}</div>
            ))}
          </div>
        </div>

        {/* Right Col: SURVIVAL MODE */}
        <div className="col-span-3 flex flex-col pl-4 border-l border-[#B5B3A7] h-full justify-between">
          <div>
            <div className="text-[10px] tracking-[0.18em] text-[#666661] font-semibold uppercase">
              SURVIVAL MODE
            </div>
            <div className="font-display font-extrabold text-[22px] tracking-tight text-[#111111] mt-2 mb-1">
              {telemetry.survivalMode}
            </div>
            {/* Green divider line */}
            <div className="h-[2px] w-[50px] bg-[#364E46] my-2" />
          </div>
          <div className="text-[9.5px] tracking-widest text-[#555555] font-semibold uppercase">
            {telemetry.survivalModeSubtext}
          </div>
        </div>
      </div>
    </div>
  );
};
