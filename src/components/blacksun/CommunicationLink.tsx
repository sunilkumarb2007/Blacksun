import React, { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const CommunicationLink: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [packetProgress, setPacketProgress] = useState(0);
  const [isReceiverHit, setIsReceiverHit] = useState(false);

  const isConnected = telemetry.isConnected && telemetry.rfStatus === "CONNECTED";

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setPacketProgress((prev) => {
        if (prev >= 100) {
          setIsReceiverHit(true);
          setTimeout(() => setIsReceiverHit(false), 200);
          return 0;
        }
        return prev + 3;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Header Bar */}
      <div className="flex items-start justify-between border-b border-[#B5B3A7] pb-2">
        <div>
          <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
            COMMUNICATION LINK
          </h2>
          <div className="text-[9.5px] tracking-widest text-[#555555] font-semibold mt-0.5">
            ESP-NOW <span className="mx-1 text-[#8A887D]">|</span> {isConnected ? "CONNECTED" : "LOST"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] tracking-widest text-[#8A887D] font-semibold uppercase">
            LATENCY
          </div>
          <div className="text-[14px] font-bold tracking-wider text-[#111111]">
            {telemetry.latency !== null ? `${telemetry.latency} ms` : "--"}
          </div>
        </div>
      </div>

      {/* Center Tower Visualization */}
      <div className="relative flex items-center justify-between px-6 py-2">
        {/* SENDER Tower (Core Node) */}
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-16 flex items-center justify-center">
            {/* Concentric Signal Arcs */}
            <svg
              className={`absolute top-0 w-12 h-10 overflow-visible transition-opacity ${
                !isConnected ? "opacity-20" : "opacity-90"
              }`}
              viewBox="0 0 48 30"
              fill="none"
              stroke="#111111"
              strokeWidth="1.4"
            >
              <path d="M 18 10 A 8 8 0 0 1 30 10" />
              <path d="M 14 6 A 14 14 0 0 1 34 6" opacity="0.75" />
              <path d="M 10 2 A 20 20 0 0 1 38 2" opacity="0.5" />
            </svg>

            {/* Lattice Mast Tower */}
            <svg
              className="w-8 h-12 mt-3"
              viewBox="0 0 32 48"
              fill="none"
              stroke="#111111"
              strokeWidth="1.3"
            >
              <line x1="16" y1="2" x2="16" y2="12" stroke="#111111" strokeWidth="1.6" />
              <line x1="16" y1="12" x2="6" y2="46" />
              <line x1="16" y1="12" x2="26" y2="46" />
              <line x1="13" y1="20" x2="19" y2="20" />
              <line x1="10" y1="30" x2="22" y2="30" />
              <line x1="7" y1="40" x2="25" y2="40" />
              <line x1="13" y1="20" x2="22" y2="30" />
              <line x1="19" y1="20" x2="10" y2="30" />
              <line x1="10" y1="30" x2="25" y2="40" />
              <line x1="22" y1="30" x2="7" y2="40" />
            </svg>
          </div>
          <div className="mt-1 text-center">
            <div className="font-bold text-[10px] text-[#111111] tracking-wider">ESP32 #1</div>
            <div className="text-[8.5px] text-[#666661] tracking-tight">(Core Node)</div>
          </div>
        </div>

        {/* Transmission Line with Nodes and Animated Packet */}
        <div className="relative flex-1 mx-3 -mt-4">
          <div
            className={`h-[1.5px] w-full transition-colors ${
              !isConnected ? "bg-[#FF4848] opacity-50 border-dashed" : "bg-[#456557]"
            }`}
          />

          {/* Right Arrowhead */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M 1 1 L 7 4 L 1 7"
                stroke={!isConnected ? "#FF4848" : "#456557"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Static Nodes along Line */}
          {isConnected && (
            <>
              <div className="absolute left-[20%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#456557]" />
              <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#456557]" />
              <div className="absolute left-[60%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#364E46] ring-2 ring-[#456557]/30" />
              <div className="absolute left-[80%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#456557]" />

              {/* Travelling Glowing Packet */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#19D3C2] ring-2 ring-[#456557] shadow-sm transition-transform duration-75"
                style={{ left: `${packetProgress}%` }}
              />
            </>
          )}

          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center -top-4 text-[9px] font-bold text-[#FF4848] tracking-widest uppercase">
              LINK LOST
            </div>
          )}
        </div>

        {/* RECEIVER Tower (Peripheral Node) */}
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-16 flex items-center justify-center">
            {/* Concentric Signal Arcs */}
            <svg
              className={`absolute top-0 w-12 h-10 overflow-visible transition-all ${
                !isConnected
                  ? "opacity-20"
                  : isReceiverHit
                  ? "opacity-100 scale-110"
                  : "opacity-90"
              }`}
              viewBox="0 0 48 30"
              fill="none"
              stroke={isReceiverHit ? "#19D3C2" : "#111111"}
              strokeWidth="1.4"
            >
              <path d="M 18 10 A 8 8 0 0 1 30 10" />
              <path d="M 14 6 A 14 14 0 0 1 34 6" opacity="0.75" />
              <path d="M 10 2 A 20 20 0 0 1 38 2" opacity="0.5" />
            </svg>

            {/* Lattice Mast */}
            <svg
              className={`w-8 h-12 mt-3 transition-colors ${
                isReceiverHit ? "stroke-[#19D3C2]" : "stroke-[#111111]"
              }`}
              viewBox="0 0 32 48"
              fill="none"
              strokeWidth="1.3"
            >
              <line x1="16" y1="2" x2="16" y2="12" strokeWidth="1.6" />
              <line x1="16" y1="12" x2="6" y2="46" />
              <line x1="16" y1="12" x2="26" y2="46" />
              <line x1="13" y1="20" x2="19" y2="20" />
              <line x1="10" y1="30" x2="22" y2="30" />
              <line x1="7" y1="40" x2="25" y2="40" />
              <line x1="13" y1="20" x2="22" y2="30" />
              <line x1="19" y1="20" x2="10" y2="30" />
              <line x1="10" y1="30" x2="25" y2="40" />
              <line x1="22" y1="30" x2="7" y2="40" />
            </svg>
          </div>
          <div className="mt-1 text-center">
            <div className="font-bold text-[10px] text-[#111111] tracking-wider">RECEIVER</div>
            <div className="text-[8.5px] text-[#666661] tracking-tight">(ESP-NOW Client)</div>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Line */}
      <div className="pt-2 border-t border-[#B5B3A7] flex items-center justify-between text-center text-[9.5px] tracking-wider text-[#333333] font-semibold">
        <span>PACKETS: {telemetry.packetCount !== null ? telemetry.packetCount : "--"}</span>
        <span className="text-[#8A887D]">|</span>
        <span>LOST: {telemetry.lostPackets !== null ? telemetry.lostPackets : "--"}</span>
        <span className="text-[#8A887D]">|</span>
        <span>RSSI: {telemetry.rssi !== null ? `${telemetry.rssi} dBm` : "--"}</span>
      </div>
    </div>
  );
};
