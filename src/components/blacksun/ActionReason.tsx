import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export const ActionReason: React.FC = () => {
  const { telemetry } = useTelemetry();

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#F4F3ED] select-none font-mono-tech">
      {/* Header Bar */}
      <div className="pb-2 border-b border-[#B5B3A7]">
        <h2 className="font-display font-black text-[15px] tracking-wider text-[#111111]">
          WHY THIS ACTION?
        </h2>
        <div className="h-2" />
      </div>

      {/* Reasons Checklist with Dark Checkmarks */}
      <div className="py-1 space-y-1.5 text-[11px] text-[#222222]">
        {telemetry.reasons.map((reason, idx) => (
          <div key={idx} className="flex items-baseline gap-2">
            <span className="font-black text-[#111111]">✓</span>
            <span className="font-medium text-[#222222]">{reason}</span>
          </div>
        ))}
      </div>

      {/* Recessed Amber-Orange Warning Box with Left Accent Bar */}
      <div className="mt-2 border-l-4 border-[#FFA133] bg-[#EAE9E1] py-2 px-3 space-y-1">
        <div className="text-[9.5px] italic text-[#555555]">
          {telemetry.subNote}
        </div>
        <div className="text-[10px] tracking-[0.14em] font-bold text-[#111111] uppercase">
          {telemetry.footerTag}
        </div>
      </div>
    </div>
  );
};
