import React, { useState, useEffect } from "react";
import { useTelemetry } from "../context/TelemetryContext";

export const CommunicationPage: React.FC = () => {
  const { telemetry, triggerScenario } = useTelemetry();
  const [packetProgress, setPacketProgress] = useState(0);

  useEffect(() => {
    if (telemetry.rfStatus === "LOST") return;

    const interval = setInterval(() => {
      setPacketProgress((prev) => (prev >= 100 ? 0 : prev + 3));
    }, 40);

    return () => clearInterval(interval);
  }, [telemetry.rfStatus]);

  const isLost = telemetry.rfStatus === "LOST";

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">05</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              NRF24L01+ WIRELESS TELEMETRY CONSOLE
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            2.4GHz GFSK PACKET LINK • HARDWARE AUTO-ACK • CRC16 INTEGRITY
          </p>
        </div>

        <button
          onClick={() => triggerScenario(isLost ? "NORMAL" : "RF_FAILURE")}
          className={`border px-3 py-1 text-[11px] font-bold uppercase transition-colors ${
            isLost
              ? "border-[#456557] bg-[#456557] text-white"
              : "border-[#FF4848] bg-[#FF4848] text-white"
          }`}
        >
          {isLost ? "RESTORE RF CARRIER" : "SIMULATE RF CARRIER LOSS"}
        </button>
      </div>

      {/* Main Communication Visualization */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2">
          <span className="font-bold text-[12px] text-[#182226] uppercase tracking-wider">
            POINT-TO-POINT TRANSCEIVER TOPOLOGY
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#5A686D]">LINK STATUS:</span>
            <span className={`font-bold ${isLost ? "text-[#FF4848]" : "text-[#456557]"}`}>
              {telemetry.rfStatus}
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
            <span className="text-[9px] text-[#5A686D]">TX Power: +20dBm</span>
          </div>

          {/* Animated Packet Stream Along Horizontal Line */}
          <div className="flex-1 mx-6 relative">
            <div
              className={`h-1.5 w-full ${
                isLost ? "bg-[#FF4848] border-dashed border-b" : "bg-[#456557]"
              }`}
            />

            {!isLost && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFA133] ring-4 ring-[#456557]/40 shadow-xs transition-transform duration-75"
                style={{ left: `${packetProgress}%` }}
              />
            )}

            {isLost && (
              <div className="absolute inset-0 flex items-center justify-center -top-6 text-[10px] font-bold text-white tracking-widest uppercase bg-[#FF4848] px-2 py-0.5 border border-[#FF4848] mx-auto w-fit">
                LINK TIMEOUT • LOCAL AUTONOMY ACTIVE
              </div>
            )}
          </div>

          {/* Peripheral Node */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`w-16 h-16 border-2 flex flex-col items-center justify-center transition-all ${
                isLost
                  ? "border-[#FF4848] bg-[#FEE2E2] text-[#FF4848]"
                  : "border-[#456557] bg-[#E8ECE7] text-[#182226] shadow-xs"
              }`}
            >
              <span className="text-[9px] text-[#456557] font-bold">NODE #02</span>
              <span className="text-[12px] font-extrabold">PERIPHERAL</span>
            </div>
            <span className="mt-2 text-[10px] text-[#182226] font-medium">ESP32 Node (Client)</span>
            <span className="text-[9px] text-[#5A686D]">RX Sensitivity: -95dBm</span>
          </div>
        </div>

        {/* 6 Key RF Communication Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">PACKETS SENT</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">{telemetry.packetCount}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">PACKETS LOST</div>
            <div className={`text-[18px] font-bold mt-1 ${telemetry.lostPackets > 0 ? "text-[#FF4848]" : "text-[#182226]"}`}>
              {telemetry.lostPackets}
            </div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">ACK SUCCESS RATE</div>
            <div className="text-[18px] font-bold text-[#456557] mt-1">{telemetry.ackRate}%</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">ROUND-TRIP LATENCY</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">
              {isLost ? "--" : `${telemetry.latency} ms`}
            </div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">SIGNAL RSSI</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">{telemetry.rssi} dBm</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-3">
            <div className="text-[9px] text-[#5A686D] uppercase">LAST ACK RECEIVED</div>
            <div className="text-[18px] font-bold text-[#182226] mt-1">{telemetry.lastAckTime}</div>
          </div>
        </div>
      </div>

      {/* Binary Packet Structure Inspector */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-4">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2 mb-3">
          <span className="font-bold text-[12px] text-[#182226] uppercase tracking-wider">
            32-BYTE NRF24 BINARY PAYLOAD SCHEMA
          </span>
          <span className="text-[10px] text-[#456557] font-bold">STRUCTURE DEFINITION</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-[10px]">
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">BYTE 0-1</div>
            <div className="text-[#182226] font-bold">NODE_ID</div>
            <div className="text-[9px] text-[#456557] font-semibold">0x01 (Core)</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">BYTE 2-5</div>
            <div className="text-[#182226] font-bold">SEQ_NUM</div>
            <div className="text-[9px] text-[#456557] font-semibold">{telemetry.packetCount}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">BYTE 6</div>
            <div className="text-[#182226] font-bold">CRISIS_STATE</div>
            <div className="text-[9px] text-[#456557] font-semibold">{telemetry.crisisLevel}</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">BYTE 7-10</div>
            <div className="text-[#182226] font-bold">TEMP_FLOAT</div>
            <div className="text-[9px] text-[#456557] font-semibold">{telemetry.temperature.toFixed(1)}°C</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">BYTE 11-14</div>
            <div className="text-[#182226] font-bold">MOTOR_CURRENT</div>
            <div className="text-[9px] text-[#456557] font-semibold">{telemetry.motorHealthCurrent.toFixed(2)}A</div>
          </div>
          <div className="border border-[#B5B3A7] bg-[#FFFFFF] p-2">
            <div className="text-[#5A686D]">BYTE 30-31</div>
            <div className="text-[#182226] font-bold">CRC16_CCITT</div>
            <div className="text-[9px] text-[#456557] font-semibold">0x7F2A (PASS)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
