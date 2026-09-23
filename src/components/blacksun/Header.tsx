import React, { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const Header: React.FC = () => {
  const {
    activePage,
    navigatePage,
    setShowDataModal,
    setShowInfoModal,
    resetToImageDefault,
    isConnected,
    wsStatus,
    reconnectWS,
    telemetry,
    wsIp,
    wsUrl,
  } = useTelemetry();

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

  return (
    <header className="w-full h-[54px] bg-[#E8E7DF] border-b border-[#B5B3A7] px-4 flex items-center justify-between select-none z-30 font-mono-tech">
      {/* Brand & Philosophy */}
      <div className="flex items-center gap-5">
        <div
          onClick={() => {
            navigatePage("01");
            resetToImageDefault();
          }}
          className="cursor-pointer flex items-baseline font-display font-black tracking-tight text-[22px] leading-none text-[#111111]"
        >
          BLACKSUN<span className="font-bold text-[20px] text-[#111111] ml-[1px]">*</span>
        </div>

        <div className="hidden sm:flex flex-col">
          <span className="text-[10px] tracking-[0.2em] font-semibold text-[#555555] uppercase">
            AUTONOMOUS SURVIVAL SYSTEM
          </span>
          <div className="flex items-center gap-1.5 text-[8.5px] tracking-wider text-[#78766B] font-medium">
            <span className="cursor-pointer hover:text-[#111111]" onClick={() => navigatePage("04")}>DETECT</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[#111111]" onClick={() => navigatePage("04")}>SENSE</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[#111111]" onClick={() => navigatePage("04")}>THINK</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[#111111]" onClick={() => navigatePage("04")}>ADAPT</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[#111111] font-bold text-[#364E46]" onClick={() => navigatePage("04")}>SURVIVE</span>
          </div>
        </div>
      </div>

      {/* Center Slogan Tag */}
      <div className="hidden xl:flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#333333]">
        <span className="text-[#FFA133] font-black">//</span>
        <span>A SAFER TOMORROW</span>
      </div>

      {/* Right Controls & Clock */}
      <div className="flex items-center gap-4">
        {/* Date & Time */}
        <div className="hidden md:block text-right leading-tight">
          <div className="text-[9px] text-[#78766B] font-semibold tracking-wider">{dateStr}</div>
          <div className="text-[13px] font-bold text-[#111111]">{timeStr}</div>
        </div>

        {/* System Online / Demo Status Pill */}
        <div
          onClick={reconnectWS}
          className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#B5B3A7] text-[10px] cursor-pointer"
          title={telemetry.mode === "REAL" ? `Connected to ${wsUrl}` : `Demo mode active. Click to reconnect to ${wsUrl}`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              telemetry.mode === "REAL"
                ? "bg-[#2E7D32]"
                : wsStatus === "connecting"
                ? "bg-[#FFA133] animate-ping"
                : "bg-[#FFA133]"
            }`}
          />
          <div>
            <div
              className={`font-bold tracking-wider ${
                telemetry.mode === "REAL" ? "text-[#2E4640]" : "text-[#FFA133]"
              }`}
            >
              {telemetry.mode === "REAL"
                ? "SYSTEM ONLINE"
                : wsStatus === "connecting"
                ? "CONNECTING (DEMO)"
                : "DEMO MODE"}
            </div>
            <div className="text-[8.5px] text-[#78766B]">
              {telemetry.mode === "REAL"
                ? `ESP32 CONNECTED • REAL DATA`
                : `SIMULATED DATA (${wsIp}:81)`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigatePage("01")}
            className={`px-3.5 py-1 text-[10.5px] font-bold tracking-wider transition-colors ${
              activePage === "01"
                ? "bg-[#364E46] text-white border border-[#364E46]"
                : "bg-[#F4F3ED] text-[#222222] border border-[#757368] hover:bg-[#EAE9E1]"
            }`}
          >
            HOME
          </button>

          <button
            onClick={() => setShowInfoModal(true)}
            className="border border-[#757368] bg-[#F4F3ED] text-[#222222] hover:bg-[#EAE9E1] transition-colors px-3.5 py-1 text-[10.5px] font-bold tracking-wider"
          >
            INFO
          </button>

          <button
            onClick={() => setShowDataModal(true)}
            className="border border-[#757368] bg-[#F4F3ED] text-[#222222] hover:bg-[#EAE9E1] transition-colors px-3.5 py-1 text-[10.5px] font-bold tracking-wider"
          >
            DATA
          </button>
        </div>
      </div>
    </header>
  );
};
