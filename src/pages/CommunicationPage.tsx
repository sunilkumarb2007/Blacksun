import React, { useState, useEffect } from "react";
import { useTelemetry } from "../context/TelemetryContext";

export const CommunicationPage: React.FC = () => {
  const { telemetry, triggerScenario } = useTelemetry();
  const [packetProgress, setPacketProgress] = useState(0);

  const isConnected = telemetry.isConnected && telemetry.rfStatus === "CONNECTED";

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setPacketProgress((prev) => (prev >= 100 ? 0 : prev + 3));
    }, 40);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">05</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              ESP-NOW WIRELESS TELEMETRY CONSOLE
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            2.4GHz ESP-NOW PEER-TO-PEER PROTOCOL • ESP32 #1 HARDWARE LINK • ZERO CLOUD
          </p>
        </div>

        <button
          onClick={() => triggerScenario(isConnected ? "RF_FAILURE" : "NORMAL")}
          className={`border px-3 py-1 text-[11px] font-bold uppercase transition-colors ${
            !isConnected
              ? "border-[#456557] bg-[#456557] text-white"
              : "border-[#FF4848] bg-[#FF4848] text-white"
          }`}
        >
          {!isConnected ? "RESTORE CARRIER LINK" : "SIMULATE CARRIER LOSS"}
        </button>
      </div>

      {/* Main Communication Visualization */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2">
          <span className="font-bold text-[12px] text-[#182226] uppercase tracking-wider">
            ESP-NOW POINT-TO-POINT TRANSCEIVER TOPOLOGY
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#5A686D]">LINK STATUS:</span>
            <span className={`font-bold ${!isConnected ? "text-[#FF4848]" : "text-[#456557]"}`}>
              {isConnected ? "CONNECTED" : "LOST"}
            </span>
          </div>
        </div>

        {/* Visual Tower to Tower Node Pipeline */}
        <div className="relative py-8 px-8 flex items-center justify-between border border-[#B5B3A7] bg-[#FFFFFF]">
          {/* Core Node */}
          <div className="flex flex-col items-center z-10">
            <div className="w-16 h-16 border-2 border-[#456557] bg-[#E8ECE7] flex flex-col items-center justify-center shadow-xs">
              <span className="text-[9px] text-[#456557] font-bold">NODE #01</span>
              <span className="text-[12px] text-[#182226] font-extrabold">CORE</span>
            </div>
            <span className="mt-2 text-[10px] text-[#182226] font-medium">ESP32 Core (Master)</span>
            <span className="text-[9px] text-[#5A686D]">Access Point: BLACKSUN_CORE</span>
          </div>

          {/* Animated Packet Stream Along Horizontal Line */}
          <div className="flex-1 mx-6 relative">
            <div
              className={`h-1.5 w-full ${
                !isConnected ? "bg-[#FF4848] border-dashed border-b" : "bg-[#456557]"
              }`}
            />

            {isConnected && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFA133] ring-4 ring-[#456557]/40 shadow-xs transition-transform duration-75"
                style={{ left: `${packetProgress}%` }}
              />
            )}

            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center -top-6 text-[10px] font-bold text-white tracking-widest uppercase bg-[#FF4848] px-2 py-0.5 border border-[#FF4848] mx-auto w-fit">
                LINK TIMEOUT • LOCAL AUTONOMY ACTIVE
              </div>
            )}
          </div>

          {/* Peripheral Node */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`w-16 h-16 border-2 flex flex-col items-center justify-center transition-all ${
                !isConnected
                  ? "border-[#FF4848] bg-[#FEE2E2] text-[#FF4848]"
                  : "border-[#456557] bg-[#E8ECE7] text-[#182226] shadow-xs"
              }`}
            >
              <span className="text-[9px] text-[#456557] font-bold">NODE #02</span>
              <span className="text-[12px] font-extrabold">CLIENT</span>
            </div>
            <span className="mt-2 text-[10px] text-[#182226] font-medium">Laptop / HMI (Browser)</span>
            <span className="text-[9px] text-[#5A686D]">ws://192.168.4.1:81</span>
          </div>
        </div>

        {/* 6 Key RF Communication Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">PACKETS SENT</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">
              {telemetry.packetCount !== null ? telemetry.packetCount : "--"}
            </div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">PACKETS LOST</div>
            <div className={`text-[18px] font-bold mt-1 ${telemetry.lostPackets ? "text-[#FF4848]" : "text-[#182226]"}`}>
              {telemetry.lostPackets !== null ? telemetry.lostPackets : "--"}
            </div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">ACK SUCCESS RATE</div>
            <div className="text-[18px] font-bold text-[#456557] mt-1">
              {telemetry.ackRate !== null ? `${telemetry.ackRate}%` : "--"}
            </div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">ROUND-TRIP LATENCY</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">
              {telemetry.latency !== null ? `${telemetry.latency} ms` : "--"}
            </div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">SIGNAL RSSI</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">
              {telemetry.rssi !== null ? `${telemetry.rssi} dBm` : "--"}
            </div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">UPTIME</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">
              {telemetry.uptimeSeconds !== null ? `${telemetry.uptimeSeconds}s` : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Telemetry Payload Inspector */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-4">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2 mb-3">
          <span className="font-bold text-[12px] text-[#182226] uppercase tracking-wider">
            ESP32 JSON TELEMETRY PAYLOAD SCHEMA
          </span>
          <span className="text-[10px] text-[#456557] font-bold">WEBSOCKET FRAME DEFINITION</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-[10px]">
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">FIELD</div>
            <div className="text-[#182226] font-bold">temperature</div>
            <div className="text-[9px] text-[#456557] font-semibold">{isConnected && telemetry.temperature !== null ? `${telemetry.temperature.toFixed(1)}°C` : "--"}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">FIELD</div>
            <div className="text-[#182226] font-bold">voltage / current</div>
            <div className="text-[9px] text-[#456557] font-semibold">{isConnected && telemetry.voltage !== null ? `${telemetry.voltage.toFixed(1)}V / ${telemetry.current?.toFixed(2)}A` : "--"}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">FIELD</div>
            <div className="text-[#182226] font-bold">vibration</div>
            <div className="text-[9px] text-[#456557] font-semibold">{isConnected && telemetry.vibration !== null ? `${telemetry.vibration.toFixed(2)}g` : "--"}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">FIELD</div>
            <div className="text-[#182226] font-bold">motorSpeed / motorOn</div>
            <div className="text-[9px] text-[#456557] font-semibold">{isConnected ? `${telemetry.motorOn ? "ON" : "OFF"} (${telemetry.motorSpeed ?? 0})` : "--"}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">FIELD</div>
            <div className="text-[#182226] font-bold">crisisLevel</div>
            <div className="text-[9px] text-[#456557] font-semibold">{isConnected ? telemetry.crisisLevel : "--"}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">FIELD</div>
            <div className="text-[#182226] font-bold">communication</div>
            <div className="text-[9px] text-[#456557] font-semibold">ESP-NOW</div>
          </div>
        </div>
      </div>
    </div>
  );
};
