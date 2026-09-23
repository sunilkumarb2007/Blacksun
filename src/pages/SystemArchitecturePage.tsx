import React, { useState } from "react";
import { useTelemetry } from "../context/TelemetryContext";

interface ArchComponent {
  id: string;
  name: string;
  category: "SENSOR" | "PROCESSOR" | "ACTUATOR" | "COMMUNICATION" | "TARGET";
  pins: string;
  purpose: string;
  liveMetric: string;
}

export const SystemArchitecturePage: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [selectedComp, setSelectedComp] = useState<ArchComponent | null>(null);

  const components: ArchComponent[] = [
    {
      id: "ds18b20",
      name: "DS18B20 Temperature Sensor",
      category: "SENSOR",
      pins: "GPIO 4 (1-Wire Bus with 4.7kΩ Pullup)",
      purpose: "Precision digital temperature monitoring directly on motor stator housing.",
      liveMetric: telemetry.temperature !== null ? `${telemetry.temperature.toFixed(1)} °C (+${telemetry.temperatureRate ?? 0} °C/min)` : "--",
    },
    {
      id: "mpu6050",
      name: "MPU-6050 6-DOF IMU",
      category: "SENSOR",
      pins: "I2C SDA: GPIO 21, SCL: GPIO 22",
      purpose: "Harmonic mechanical resonance & vibration peak acceleration detection.",
      liveMetric: telemetry.vibration !== null ? `${telemetry.vibration.toFixed(2)} g (${telemetry.vibrationAlert})` : "--",
    },
    {
      id: "ina219",
      name: "INA219 High-Side Power Sensor",
      category: "SENSOR",
      pins: "I2C SDA: GPIO 21, SCL: GPIO 22 (Addr 0x40)",
      purpose: "Total 12V bus voltage and system-wide current draw calculation.",
      liveMetric: telemetry.voltage !== null ? `${telemetry.voltage.toFixed(1)} V / ${telemetry.current?.toFixed(2)} A (${telemetry.power?.toFixed(1)} W)` : "--",
    },
    {
      id: "acs712",
      name: "ACS712-20A Hall Current Sensor",
      category: "SENSOR",
      pins: "ADC1_CH4 (GPIO 32, Analog)",
      purpose: "Isolated motor armature current monitoring to detect stall and over-torque.",
      liveMetric: telemetry.current !== null ? `${telemetry.current.toFixed(2)} A (INA219)` : "--",
    },
    {
      id: "esp32",
      name: "ESP32-WROOM-32D Core Module",
      category: "PROCESSOR",
      pins: "Dual Core Xtensa 240MHz • 520KB SRAM",
      purpose: "Runs Core 0 Telemetry & NRF24 protocol; Core 1 Real-time Survival Decision Loop.",
      liveMetric: `Active State: ${telemetry.crisisLevel} • Mode: ${telemetry.survivalMode}`,
    },
    {
      id: "bts7960",
      name: "BTS7960 43A Motor Driver",
      category: "ACTUATOR",
      pins: "PWM: GPIO 25, 26, EN: GPIO 27",
      purpose: "H-Bridge motor speed regulation, soft-start, and rapid emergency braking.",
      liveMetric: telemetry.motor ? "ACTIVE (1480 RPM)" : "SAFETY CUTOFF",
    },
    {
      id: "relay",
      name: "Optocoupled Safety Relay",
      category: "ACTUATOR",
      pins: "GPIO 14 (Active LOW)",
      purpose: "Galvanic disconnect isolating motor from power rail in catastrophic surge.",
      liveMetric: telemetry.relay ? "CLOSED (CONNECTED)" : "OPEN (DISCONNECTED)",
    },
    {
      id: "fan",
      name: "5V Forced Cooling Turbo Fan",
      category: "ACTUATOR",
      pins: "GPIO 13 via MOSFET Driver",
      purpose: "Forced convection airflow across stator fins during thermal alerts.",
      liveMetric: telemetry.fan ? "100% DUTY CYCLE" : "OFF",
    },
    {
      id: "buzzer",
      name: "Piezo Acoustic Warning Buzzer",
      category: "ACTUATOR",
      pins: "GPIO 12 (LEDC Frequency Generator)",
      purpose: "Local audible acoustic alarm alerting on-site engineers.",
      liveMetric: telemetry.buzzer ? "PULSING ALARM" : "SILENT",
    },
    {
      id: "nrf24",
      name: "NRF24L01+PA+LNA 2.4GHz RF",
      category: "COMMUNICATION",
      pins: "SPI: MOSI 23, MISO 19, SCK 18, CSN 5, CE 17",
      purpose: "Point-to-point wireless transmission of telemetry to peripheral control room.",
      liveMetric: `${telemetry.rfStatus} (${telemetry.packetCount} packets, ${telemetry.latency}ms)`,
    },
  ];

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">07</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              HARDWARE & FIRMWARE SYSTEM ARCHITECTURE
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            SCHEMATIC BLOCK DIAGRAM • PIN INTERCONNECTS & SIGNAL FLOW
          </p>
        </div>

        <div className="text-[10px] text-[#456557] font-bold border border-[#B5B3A7] bg-[#F4F3ED] px-2.5 py-1">
          INTERACTIVE COMPONENT INSPECTOR
        </div>
      </div>

      {/* Main Architecture Diagram Canvas */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] p-6 space-y-6">
        <div className="text-[11px] font-bold text-[#182226] uppercase tracking-wider mb-2">
          SYSTEM TOPOLOGY & BUS INTERCONNECT
        </div>

        {/* 4 Architectural Rows */}
        <div className="space-y-4">
          {/* Row 1: Sensors */}
          <div>
            <div className="text-[9.5px] font-bold text-[#5A686D] uppercase mb-1.5">
              INPUT TIER: SENSORY HARDWARE
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {components.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComp(c)}
                  className={`p-3 border cursor-pointer transition-all ${
                    selectedComp?.id === c.id
                      ? "border-2 border-[#456557] bg-[#ECEFEA] shadow-xs"
                      : "border border-[#B5B3A7] bg-[#FFFFFF] hover:border-[#456557]"
                  }`}
                >
                  <div className="text-[9px] text-[#456557] font-bold">{c.category}</div>
                  <div className="text-[11px] text-[#182226] font-bold truncate mt-0.5">{c.name}</div>
                  <div className="text-[9.5px] text-[#5A686D] mt-1 truncate">{c.liveMetric}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center text-[#456557] font-bold text-[14px]">↓ (I2C / 1-Wire / ADC Busses)</div>

          {/* Row 2: Central Processing Unit (ESP32) */}
          <div className="max-w-xl mx-auto">
            <div
              onClick={() => setSelectedComp(components[4])}
              className={`p-4 border text-center cursor-pointer transition-all ${
                selectedComp?.id === "esp32"
                  ? "border-2 border-[#456557] bg-[#ECEFEA] shadow-xs"
                  : "border-2 border-[#456557]/60 bg-[#FFFFFF] hover:border-[#456557]"
              }`}
            >
              <div className="text-[9px] text-[#456557] font-bold uppercase">EDGE PROCESSING TIER</div>
              <div className="text-[15px] font-display font-black text-[#182226] mt-0.5">
                ESP32 DUAL-CORE SOC + SURVIVAL ENGINE
              </div>
              <div className="text-[10px] text-[#5A686D] mt-1">
                Core 0: Telemetry Buffer & RF Stack | Core 1: Deterministic Decision Logic (50ms)
              </div>
            </div>
          </div>

          <div className="flex justify-center text-[#456557] font-bold text-[14px]">↓ (GPIO / PWM / Optocouplers)</div>

          {/* Row 3: Actuators & Protection */}
          <div>
            <div className="text-[9.5px] font-bold text-[#5A686D] uppercase mb-1.5">
              OUTPUT TIER: ISOLATION & ACTUATION
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {components.slice(5, 9).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComp(c)}
                  className={`p-3 border cursor-pointer transition-all ${
                    selectedComp?.id === c.id
                      ? "border-2 border-[#456557] bg-[#ECEFEA] shadow-xs"
                      : "border border-[#B5B3A7] bg-[#FFFFFF] hover:border-[#456557]"
                  }`}
                >
                  <div className="text-[9px] text-[#456557] font-bold">{c.category}</div>
                  <div className="text-[11px] text-[#182226] font-bold truncate mt-0.5">{c.name}</div>
                  <div className="text-[9.5px] text-[#5A686D] mt-1 truncate">{c.liveMetric}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Component Inspector Panel */}
      {selectedComp && (
        <div className="border-2 border-[#456557] bg-[#F4F3ED] p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-2 mb-2">
            <span className="font-bold text-[13px] text-[#182226] uppercase">{selectedComp.name}</span>
            <button
              onClick={() => setSelectedComp(null)}
              className="text-[#5A686D] hover:text-[#182226] text-[12px] font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
            <div>
              <span className="text-[#5A686D] block uppercase text-[9.5px]">PIN ASSIGNMENT:</span>
              <span className="text-[#182226] font-bold">{selectedComp.pins}</span>
            </div>
            <div>
              <span className="text-[#5A686D] block uppercase text-[9.5px]">PURPOSE & ROLE:</span>
              <span className="text-[#5A686D]">{selectedComp.purpose}</span>
            </div>
            <div>
              <span className="text-[#5A686D] block uppercase text-[9.5px]">LIVE READING / STATE:</span>
              <span className="text-[#456557] font-bold">{selectedComp.liveMetric}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
