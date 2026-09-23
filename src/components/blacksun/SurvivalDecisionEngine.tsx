import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const SurvivalDecisionEngine: React.FC = () => {
  const { telemetry, navigatePage } = useTelemetry();
  const isReal = telemetry.mode === "REAL";
  const isConnected = telemetry.temperature !== null;

  const isTempCritical = telemetry.tempStatus === "CRITICAL";
  const isTempWarning = telemetry.tempStatus === "HIGH";
  const isTempHigh = isTempCritical || isTempWarning;

  const isVibAlert = telemetry.vibrationStatus !== "NORMAL";
  const isPowerNormal = isConnected && telemetry.powerCondition === "NORMAL";
  const isMotorRunning = isConnected && telemetry.motorOn;
  const isRfConnected = isReal && telemetry.rfLinkStatus === "CONNECTED";

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Header Bar */}
      <div className="pb-2 border-b border-[#B5B3A7]">
        <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
          SURVIVAL DECISION ENGINE
        </h2>
        <div className="text-[9px] tracking-widest text-[#666661] font-semibold mt-0.5 uppercase">
          {isReal ? "MULTI-SENSOR HARDWARE ANALYSIS" : "DETERMINISTIC SIMULATION ANALYSIS"}
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-12 gap-3 pt-2 items-stretch flex-1">
        {/* Sensor Status Table */}
        <div className="col-span-7 space-y-1.5 text-[11px] justify-center flex flex-col">
          {/* TEMPERATURE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !isConnected
                    ? "bg-[#9A9890]"
                    : isTempCritical
                    ? "bg-[#FF4848]"
                    : isTempWarning
                    ? "bg-[#FFA133]"
                    : "bg-[#3D6E5C]"
                }`}
              />
              <span className="font-bold text-[#111111]">TEMPERATURE</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold ${
                  !isConnected
                    ? "text-[#78766B]"
                    : isTempCritical
                    ? "text-[#FF4848]"
                    : isTempWarning
                    ? "text-[#FF8A24]"
                    : "text-[#3D6E5C]"
                }`}
              >
                {!isConnected ? "--" : isTempCritical ? "CRITICAL" : isTempWarning ? "WARNING" : "NORMAL"}
              </span>
              <span
                className={`font-bold w-3 text-center ${
                  !isConnected ? "text-[#78766B]" : isTempHigh ? "text-[#FF4848]" : "text-[#3D6E5C]"
                }`}
              >
                {!isConnected ? "--" : isTempHigh ? "!" : "✓"}
              </span>
            </div>
          </div>

          {/* POWER CONDITION */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !isConnected ? "bg-[#9A9890]" : isPowerNormal ? "bg-[#3D6E5C]" : "bg-[#FF4848]"
                }`}
              />
              <span className="font-bold text-[#111111]">POWER CONDITION</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${!isConnected ? "text-[#78766B]" : isPowerNormal ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {!isConnected ? "--" : isPowerNormal ? "NORMAL" : "ALERT"}
              </span>
              <span className={`font-bold w-3 text-center ${!isConnected ? "text-[#78766B]" : isPowerNormal ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {!isConnected ? "--" : isPowerNormal ? "✓" : "!"}
              </span>
            </div>
          </div>

          {/* MOTOR STATE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !isConnected ? "bg-[#9A9890]" : isMotorRunning ? "bg-[#3D6E5C]" : "bg-[#FF4848]"
                }`}
              />
              <span className="font-bold text-[#111111]">MOTOR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${!isConnected ? "text-[#78766B]" : isMotorRunning ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {!isConnected ? "--" : isMotorRunning ? "RUNNING" : "OFF"}
              </span>
              <span className={`font-bold w-3 text-center ${!isConnected ? "text-[#78766B]" : isMotorRunning ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {!isConnected ? "--" : isMotorRunning ? "✓" : "!"}
              </span>
            </div>
          </div>

          {/* VIBRATION (MPU6050) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !isConnected ? "bg-[#9A9890]" : isVibAlert ? "bg-[#FFA133]" : "bg-[#3D6E5C]"
                }`}
              />
              <span className="font-bold text-[#111111]">VIBRATION (MPU6050)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${!isConnected ? "text-[#78766B]" : isVibAlert ? "text-[#FF8A24]" : "text-[#3D6E5C]"}`}>
                {!isConnected ? "--" : isVibAlert ? "ALERT" : "NORMAL"}
              </span>
              <span className={`font-bold w-3 text-center ${!isConnected ? "text-[#78766B]" : isVibAlert ? "text-[#FF8A24]" : "text-[#3D6E5C]"}`}>
                {!isConnected ? "--" : isVibAlert ? "!" : "✓"}
              </span>
            </div>
          </div>

          {/* COMMUNICATION (ESP-NOW) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRfConnected ? "bg-[#3D6E5C]" : !isReal ? "bg-[#FFA133]" : "bg-[#FF4848]"
                }`}
              />
              <span className="font-bold text-[#111111]">COMMUNICATION</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isRfConnected ? "text-[#3D6E5C]" : !isReal ? "text-[#FFA133]" : "text-[#FF4848]"}`}>
                {isRfConnected ? "CONNECTED" : !isReal ? "DEMO" : "LOST"}
              </span>
              <span className={`font-bold w-3 text-center ${isRfConnected ? "text-[#3D6E5C]" : !isReal ? "text-[#FFA133]" : "text-[#FF4848]"}`}>
                {isRfConnected ? "✓" : !isReal ? "~" : "!"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: DECISION BOX */}
        <div className="col-span-5 flex flex-col justify-between pl-3 border-l border-[#B5B3A7]">
          <div>
            <div className="text-[9.5px] tracking-widest text-[#666661] uppercase font-semibold">
              DECISION
            </div>

            {/* Recessed Decision Box with Hazard Stripes */}
            <div className="hazard-stripes border border-[#B5B3A7] p-2 mt-1 mb-2">
              <div className="font-display font-black text-[13px] leading-tight text-[#111111] uppercase tracking-wide">
                {telemetry.decision}
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#555555]">
                <span>CONFIDENCE</span>
                <span>{isConnected ? `${telemetry.confidence || (isTempHigh ? 92 : 98)}%` : "--"}</span>
              </div>
              <div className="w-full h-1.5 bg-[#DDDCD3] border border-[#B5B3A7]">
                <div
                  className="h-full bg-[#364E46] transition-all duration-300"
                  style={{ width: `${isConnected ? telemetry.confidence || (isTempHigh ? 92 : 98) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Micro-chain Link to Page 04 */}
          <div
            onClick={() => navigatePage("04")}
            className="cursor-pointer text-[8px] tracking-wider text-[#78766B] font-semibold flex items-center gap-1 hover:text-[#111111] transition-colors"
          >
            <span>DETECT</span>
            <span>→</span>
            <span>SENSE</span>
            <span>→</span>
            <span>THINK</span>
            <span>→</span>
            <span>ADAPT</span>
            <span>→</span>
            <span className="font-bold text-[#364E46]">SURVIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
