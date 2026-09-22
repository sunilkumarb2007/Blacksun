import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const SurvivalDecisionEngine: React.FC = () => {
  const { telemetry, navigatePage } = useTelemetry();

  const isTempHigh = telemetry.tempStatus !== "NORMAL";
  const isVibAlert = telemetry.vibrationStatus !== "NORMAL";
  const isPowerNormal = telemetry.powerCondition === "NORMAL";
  const isMotorCurrentNormal = telemetry.motorCurrentStatus === "NORMAL";
  const isRfConnected = telemetry.rfLinkStatus === "CONNECTED";

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Header Bar */}
      <div className="pb-2 border-b border-[#B5B3A7]">
        <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
          SURVIVAL DECISION ENGINE
        </h2>
        <div className="text-[9px] tracking-widest text-[#666661] font-semibold mt-0.5 uppercase">
          MULTI-SENSOR ANALYSIS
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-12 gap-3 pt-2 items-stretch flex-1">
        {/* Sensor Status Table */}
        <div className="col-span-7 space-y-1.5 text-[11px] justify-center flex flex-col">
          {/* TEMPERATURE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isTempHigh ? "bg-[#FF4848]" : "bg-[#3D6E5C]"}`} />
              <span className="font-bold text-[#111111]">TEMPERATURE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isTempHigh ? "text-[#FF4848]" : "text-[#3D6E5C]"}`}>
                {telemetry.tempStatus}
              </span>
              <span className={`font-bold w-3 text-center ${isTempHigh ? "text-[#FF4848]" : "text-[#3D6E5C]"}`}>
                {isTempHigh ? "!" : "✓"}
              </span>
            </div>
          </div>

          {/* POWER CONDITION */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPowerNormal ? "bg-[#3D6E5C]" : "bg-[#FF4848]"}`} />
              <span className="font-bold text-[#111111]">POWER CONDITION</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isPowerNormal ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {telemetry.powerCondition}
              </span>
              <span className={`font-bold w-3 text-center ${isPowerNormal ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {isPowerNormal ? "✓" : "!"}
              </span>
            </div>
          </div>

          {/* MOTOR CURRENT */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isMotorCurrentNormal ? "bg-[#3D6E5C]" : "bg-[#FF4848]"}`} />
              <span className="font-bold text-[#111111]">MOTOR CURRENT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isMotorCurrentNormal ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {telemetry.motorCurrentStatus}
              </span>
              <span className={`font-bold w-3 text-center ${isMotorCurrentNormal ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {isMotorCurrentNormal ? "✓" : "!"}
              </span>
            </div>
          </div>

          {/* VIBRATION (MPU6050) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isVibAlert ? "bg-[#FFA133]" : "bg-[#3D6E5C]"}`} />
              <span className="font-bold text-[#111111]">VIBRATION (MPU6050)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isVibAlert ? "text-[#FF8A24]" : "text-[#3D6E5C]"}`}>
                {telemetry.vibrationStatus}
              </span>
              <span className={`font-bold w-3 text-center ${isVibAlert ? "text-[#FF8A24]" : "text-[#3D6E5C]"}`}>
                {isVibAlert ? "!" : "✓"}
              </span>
            </div>
          </div>

          {/* RF LINK */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRfConnected ? "bg-[#2C5E4E]" : "bg-[#FF4848]"}`} />
              <span className="font-bold text-[#111111]">RF LINK</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isRfConnected ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {telemetry.rfLinkStatus}
              </span>
              <span className={`font-bold w-3 text-center ${isRfConnected ? "text-[#3D6E5C]" : "text-[#FF4848]"}`}>
                {isRfConnected ? "✓" : "!"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Decision Box */}
        <div
          onClick={() => navigatePage("04")}
          className="col-span-5 border border-[#B5B3A7] bg-[#EAE9E1] p-3 flex flex-col justify-between cursor-pointer group hover:border-[#111111] transition-colors"
          title="Click to view Decision Tree in Survival Engine"
        >
          <div>
            <div className="text-[9.5px] tracking-widest text-[#666661] font-semibold uppercase">
              DECISION
            </div>
            <div className="font-display font-black text-[16px] leading-snug tracking-tight text-[#111111] my-1 uppercase">
              {telemetry.decision}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#111111] mb-1">
              CONFIDENCE: {telemetry.confidence}%
            </div>
            {/* Sage Green Confidence Bar */}
            <div className="h-3 border border-[#B5B3A7] bg-[#DDDCD5] p-[1px] relative overflow-hidden">
              <div
                className="h-full bg-[#4E7A68] transition-all duration-300"
                style={{ width: `${telemetry.confidence}%` }}
              />
            </div>

            {/* Bottom Micro-Chain */}
            <div className="mt-2 text-[7.5px] tracking-wider text-[#666661] flex justify-between uppercase font-bold">
              <span>DETECT</span>
              <span>→</span>
              <span>SENSE</span>
              <span>→</span>
              <span>THINK</span>
              <span>→</span>
              <span>ADAPT</span>
              <span>→</span>
              <span className="text-[#364E46]">SURVIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
