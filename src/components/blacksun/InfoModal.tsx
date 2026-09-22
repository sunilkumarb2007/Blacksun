import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const InfoModal: React.FC = () => {
  const { showInfoModal, setShowInfoModal } = useTelemetry();

  if (!showInfoModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-[#F4F3ED] border-2 border-[#B5B3A7] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl font-mono-tech">
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3 mb-4">
          <div>
            <h2 className="font-display font-extrabold text-[18px] tracking-wider text-[#182226]">
              BLACKSUN ARCHITECTURE & HARDWARE SPECIFICATION
            </h2>
            <div className="text-[10px] text-[#456557] font-bold tracking-widest uppercase">
              STATIONARY CRITICAL MOTOR PROTECTION SYSTEM • ZERO-CLOUD EDGE
            </div>
          </div>
          <button
            onClick={() => setShowInfoModal(false)}
            className="border border-[#B5B3A7] bg-[#E8E7DF] px-3 py-1 text-[11px] font-bold text-[#2C393E] hover:bg-[#2C393E] hover:text-white transition-colors"
          >
            CLOSE [ESC]
          </button>
        </div>

        <div className="space-y-4 text-[12px] text-[#182226] leading-relaxed">
          <div>
            <h3 className="font-bold text-[#182226] text-[13px] border-b border-[#B5B3A7] pb-1 mb-2 uppercase">
              1. Physical Hardware Stack
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[#2C393E]">
              <li><strong className="text-[#182226]">Microcontroller:</strong> ESP32 Dual-Core Xtensa 240MHz (Core 0 Telemetry / Core 1 Decision Loop)</li>
              <li><strong className="text-[#182226]">Thermal Sensing:</strong> DS18B20 1-Wire Digital Probe directly mounted on motor stator</li>
              <li><strong className="text-[#182226]">Inertial & Vibration:</strong> MPU6050 6-DOF IMU (Accelerometer peak RMS resonance detection)</li>
              <li><strong className="text-[#182226]">Bus Power Sensing:</strong> INA219 High-Side DC Voltage and Current Monitor via I2C</li>
              <li><strong className="text-[#182226]">Motor Armature Current:</strong> ACS712-20A Hall-Effect Linear Current Sensor</li>
              <li><strong className="text-[#182226]">RF Communication:</strong> NRF24L01+PA+LNA 2.4GHz Transceiver with Hardware Auto-ACK</li>
              <li><strong className="text-[#182226]">Actuation & Safety:</strong> BTS7960 43A Motor Driver, Optocoupled Safety Relay, 5V Turbo Fan, Buzzer, LEDs</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#182226] text-[13px] border-b border-[#B5B3A7] pb-1 mb-2 uppercase">
              2. Core Operational Philosophy
            </h3>
            <div className="font-display font-bold text-[14px] text-[#456557] py-1">
              DETECT → SENSE → THINK → ADAPT → SURVIVE
            </div>
            <p className="text-[#5A686D] text-[11.5px]">
              BLACKSUN autonomously monitors, predicts, and mitigates catastrophic failure in mission-critical stationary motors. If temperature surges, bearings vibrate beyond safety limits, or motor current spikes, BLACKSUN executes immediate deterministic protection without requiring any cloud connection.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#182226] text-[13px] border-b border-[#B5B3A7] pb-1 mb-2 uppercase">
              3. Communication Failsafe & Local Autonomy
            </h3>
            <div className="border border-[#B5B3A7] bg-[#E8E7DF] p-3 text-[10.5px] space-y-1 text-[#2C393E]">
              <div>• Transceiver: NRF24L01+ point-to-point wireless telemetry link</div>
              <div>• Packet Rate: 1 packet transmitted every 2 seconds with 32-byte binary payload</div>
              <div>• Failsafe Mode: If RF link drops (&gt;200ms timeout), system enters LOCAL AUTONOMY ACTIVE</div>
              <div>• Edge Preservation: Local safety control loop never ceases execution during network failures</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
