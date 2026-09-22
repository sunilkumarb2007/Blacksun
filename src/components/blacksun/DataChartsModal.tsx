import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const DataChartsModal: React.FC = () => {
  const { showDataModal, setShowDataModal, telemetry } = useTelemetry();

  if (!showDataModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-[#F4F3ED] border-2 border-[#B5B3A7] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl font-mono-tech">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#B5B3A7] pb-3 mb-4">
          <div>
            <h2 className="font-display font-extrabold text-[18px] tracking-wider text-[#182226]">
              TELEMETRY WAVEFORM & HARMONIC ANALYSIS
            </h2>
            <div className="text-[10px] text-[#456557] font-bold tracking-widest uppercase">
              HIGH-PRECISION SENSOR HISTORY • 60-SEC ROLLING WINDOW
            </div>
          </div>
          <button
            onClick={() => setShowDataModal(false)}
            className="border border-[#B5B3A7] bg-[#E8E7DF] px-3 py-1 text-[11px] font-bold text-[#2C393E] hover:bg-[#2C393E] hover:text-white transition-colors"
          >
            CLOSE [ESC]
          </button>
        </div>

        {/* 3 Technical SVG Charts */}
        <div className="space-y-4">
          {/* Chart 1: Temperature */}
          <div className="border border-[#B5B3A7] p-3 bg-[#FFFFFF]">
            <div className="flex justify-between items-center mb-1.5 text-[11px]">
              <span className="font-bold text-[#182226]">1. TEMPERATURE (°C) — DS18B20</span>
              <span className="font-bold text-[#FF4848]">{telemetry.temperature.toFixed(1)} °C</span>
            </div>
            <svg className="w-full h-24 bg-[#E8E7DF] border border-[#B5B3A7]" viewBox="0 0 500 100">
              <line x1="0" y1="25" x2="500" y2="25" stroke="#D0CEBF" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#D0CEBF" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#D0CEBF" strokeDasharray="3 3" />
              <line x1="0" y1="30" x2="500" y2="30" stroke="#FF4848" strokeWidth="0.8" strokeDasharray="4 2" />
              <text x="6" y="24" fontSize="8" fill="#FF4848" fontFamily="monospace" fontWeight="bold">THRESHOLD 50°C</text>
              <path
                d="M 0 80 Q 80 75 160 70 T 300 55 T 420 40 L 500 35"
                fill="none"
                stroke="#FF4848"
                strokeWidth="2"
              />
              <circle cx="500" cy="35" r="3.5" fill="#FF4848" />
            </svg>
          </div>

          {/* Chart 2: Voltage & Current */}
          <div className="border border-[#B5B3A7] p-3 bg-[#FFFFFF]">
            <div className="flex justify-between items-center mb-1.5 text-[11px]">
              <span className="font-bold text-[#182226]">2. BUS VOLTAGE (V) & MOTOR CURRENT (A) — INA219 / ACS712</span>
              <div className="space-x-3">
                <span className="text-[#19D3C2] font-bold">{telemetry.voltage.toFixed(1)} V</span>
                <span className="text-[#38BDF8] font-bold">{telemetry.motorHealthCurrent.toFixed(2)} A</span>
              </div>
            </div>
            <svg className="w-full h-24 bg-[#E8E7DF] border border-[#B5B3A7]" viewBox="0 0 500 100">
              <line x1="0" y1="25" x2="500" y2="25" stroke="#D0CEBF" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#D0CEBF" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#D0CEBF" strokeDasharray="3 3" />
              <path
                d="M 0 35 L 70 34 L 140 36 L 210 35 L 280 37 L 350 35 L 420 36 L 500 35"
                fill="none"
                stroke="#456557"
                strokeWidth="1.8"
              />
              <path
                d="M 0 70 L 60 72 L 120 68 L 180 74 L 250 65 L 320 62 L 390 58 L 450 55 L 500 50"
                fill="none"
                stroke="#0284C7"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          {/* Chart 3: Vibration */}
          <div className="border border-[#B5B3A7] p-3 bg-[#FFFFFF]">
            <div className="flex justify-between items-center mb-1.5 text-[11px]">
              <span className="font-bold text-[#182226]">3. VIBRATION SPECTRUM (g) — MPU6050</span>
              <span className="font-bold text-[#FFA133]">{telemetry.vibration.toFixed(2)} g</span>
            </div>
            <svg className="w-full h-24 bg-[#E8E7DF] border border-[#B5B3A7]" viewBox="0 0 500 100">
              <line x1="0" y1="25" x2="500" y2="25" stroke="#D0CEBF" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#D0CEBF" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#D0CEBF" strokeDasharray="3 3" />
              <path
                d="M 0 50 L 50 50 L 70 42 L 90 58 L 110 44 L 130 54 L 150 48 L 220 50 L 250 30 L 270 70 L 290 20 L 310 75 L 330 35 L 350 60 L 380 50 L 440 38 L 470 62 L 500 45"
                fill="none"
                stroke="#FFA133"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#B5B3A7] flex justify-between items-center text-[10px] text-[#5A686D]">
          <span>HARDWARE: ESP32 • INA219 • DS18B20 • MPU6050 • ACS712</span>
          <span>BLACKSUN LOCAL TELEMETRY ENGINE</span>
        </div>
      </div>
    </div>
  );
};
