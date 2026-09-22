import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import { PageId } from "../../types/telemetry";

interface NavItem {
  id: PageId;
  num: string;
  title: string | string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: "01", num: "01", title: "COMMAND CENTER" },
  { id: "02", num: "02", title: "LIVE TELEMETRY" },
  { id: "03", num: "03", title: "MOTOR HEALTH" },
  { id: "04", num: "04", title: "SURVIVAL ENGINE" },
  { id: "05", num: "05", title: "COMMUNICATION" },
  { id: "06", num: "06", title: "EVENT LOG" },
  { id: "07", num: "07", title: "SYSTEM ARCHITECTURE" },
  { id: "08", num: "08", title: "DATA & VALIDATION" },
  { id: "09", num: "09", title: "SETTINGS" },
];

export const Sidebar: React.FC = () => {
  const { activePage, navigatePage } = useTelemetry();

  return (
    <aside className="w-[195px] flex-shrink-0 flex flex-col justify-between bg-[#2C393E] border-r border-[#1E272B] select-none z-20 font-mono-tech">
      {/* Navigation List */}
      <div className="pt-2 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <div
              key={item.id}
              onClick={() => navigatePage(item.id)}
              className={`cursor-pointer group flex flex-col px-3 py-2 transition-colors ${
                isActive
                  ? "bg-[#3D4C52] border-l-2 border-[#19D3C2] text-white"
                  : "hover:bg-[#34444A] text-[#9EACB2] hover:text-white border-l-2 border-transparent"
              }`}
            >
              {/* Number */}
              <span
                className={`text-[9.5px] tracking-widest font-semibold mb-0.5 ${
                  isActive ? "text-[#19D3C2]" : "text-[#708288] group-hover:text-[#9EACB2]"
                }`}
              >
                {item.num}
              </span>
              {/* Title */}
              <div
                className={`font-display font-bold text-[12px] leading-tight tracking-tight uppercase ${
                  isActive ? "text-white" : "text-[#CAD4D8] group-hover:text-white"
                }`}
              >
                {Array.isArray(item.title) ? (
                  item.title.map((line, idx) => <div key={idx}>{line}</div>)
                ) : (
                  <div>{item.title}</div>
                )}
              </div>
              {/* Subtle divider line if inactive */}
              {!isActive && (
                <div className="mt-2 h-[1px] w-[88%] bg-[#36474D] opacity-70 group-hover:opacity-100" />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Block: // RELIABLE SYSTEMS SAFER TOMORROW */}
      <div className="m-2 p-3.5 border border-[#3A4B52] bg-[#253236] relative overflow-hidden select-none">
        <div className="relative z-10 font-display">
          <div className="font-mono-tech text-[13px] font-extrabold text-[#FFA133] tracking-wider mb-1">
            //
          </div>
          <div className="font-extrabold text-[13px] leading-[1.18] text-white tracking-wider uppercase">
            RELIABLE
          </div>
          <div className="font-extrabold text-[13px] leading-[1.18] text-white tracking-wider uppercase">
            SYSTEMS
          </div>
          <div className="font-extrabold text-[13px] leading-[1.18] text-white tracking-wider uppercase">
            SAFER
          </div>
          <div className="font-extrabold text-[13px] leading-[1.18] text-white tracking-wider uppercase">
            TOMORROW
          </div>
        </div>
      </div>
    </aside>
  );
};
