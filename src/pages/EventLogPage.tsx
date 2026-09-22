import React, { useState } from "react";
import { useTelemetry } from "../context/TelemetryContext";

type FilterType = "ALL" | "INFO" | "WARNING" | "CRITICAL" | "COMMUNICATION" | "THERMAL" | "MOTOR" | "POWER";

export const EventLogPage: React.FC = () => {
  const { events, clearLogs } = useTelemetry();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter((evt) => {
    if (filter === "INFO" && evt.severity !== "INFO") return false;
    if (filter === "WARNING" && evt.severity !== "WARNING") return false;
    if (filter === "CRITICAL" && evt.severity !== "CRITICAL") return false;
    if (["COMMUNICATION", "THERMAL", "MOTOR", "POWER"].includes(filter) && evt.category !== filter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.details.toLowerCase().includes(q) ||
        evt.timestamp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const rows = [
      ["TIMESTAMP", "CATEGORY", "SEVERITY", "TITLE", "DETAILS"],
      ...events.map((e) => [e.timestamp, e.category, e.severity, `"${e.title}"`, `"${e.details}"`]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `blacksun_event_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono-tech select-none bg-[#E8E7DF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#B5B3A7] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#456557]">06</span>
            <h1 className="font-display font-black text-[20px] text-[#182226] tracking-wider uppercase">
              CHRONOLOGICAL AUDIT & EVENT LOG CONSOLE
            </h1>
          </div>
          <p className="text-[11px] text-[#5A686D]">
            PERSISTENT SYSTEM & SENSOR AUDIT TRAIL • HIGH-RESOLUTION TIMESTAMPS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="border border-[#B5B3A7] bg-[#364E46] px-3 py-1 text-[10.5px] font-bold text-white hover:bg-[#2C393E] transition-colors"
          >
            EXPORT CSV
          </button>
          <button
            onClick={clearLogs}
            className="border border-[#B5B3A7] bg-[#F4F3ED] px-3 py-1 text-[10.5px] font-bold text-[#2C393E] hover:bg-[#E8E7DF] transition-colors"
          >
            CLEAR LOGS
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#B5B3A7] bg-[#F4F3ED] p-3">
        <div className="flex flex-wrap items-center gap-1">
          {(["ALL", "INFO", "WARNING", "CRITICAL", "COMMUNICATION", "THERMAL", "MOTOR", "POWER"] as FilterType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-[9.5px] font-bold uppercase transition-colors border ${
                  filter === f
                    ? "bg-[#364E46] text-white border-[#364E46]"
                    : "border-transparent text-[#5A686D] hover:text-[#182226]"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search event logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1 text-[11px] bg-[#FFFFFF] border border-[#B5B3A7] text-[#182226] placeholder-[#8A979B] focus:outline-none focus:border-[#456557]"
          />
        </div>
      </div>

      {/* Event Stream Table */}
      <div className="border border-[#B5B3A7] bg-[#F4F3ED] divide-y divide-[#B5B3A7]">
        <div className="grid grid-cols-12 px-4 py-2 bg-[#E8E7DF] text-[10px] font-bold text-[#5A686D] uppercase">
          <div className="col-span-2">TIMESTAMP</div>
          <div className="col-span-2">CATEGORY</div>
          <div className="col-span-2">SEVERITY</div>
          <div className="col-span-6">EVENT & EXPLANATION</div>
        </div>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-[#B5B3A7]/60">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-[#5A686D] text-[12px]">
              NO MATCHING SYSTEM EVENTS FOUND
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-[#EAECE6] transition-colors text-[11px]"
              >
                {/* Timestamp */}
                <div className="col-span-2 text-[#5A686D] font-semibold">{evt.timestamp}</div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="text-[9.5px] px-2 py-0.5 border border-[#B5B3A7] bg-[#FFFFFF] text-[#182226] font-medium">
                    {evt.category}
                  </span>
                </div>

                {/* Severity Badge */}
                <div className="col-span-2">
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 border ${
                      evt.severity === "CRITICAL"
                        ? "border-[#FF4848] bg-[#FF4848] text-white"
                        : evt.severity === "WARNING"
                        ? "border-[#FFA133] bg-[#FFA133] text-[#182226]"
                        : "border-[#456557] bg-[#456557] text-white"
                    }`}
                  >
                    {evt.severity}
                  </span>
                </div>

                {/* Title and Explanation */}
                <div className="col-span-6">
                  <span className="font-bold text-[#182226] mr-2">{evt.title}</span>
                  <span className="text-[#5A686D]">{evt.details}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
