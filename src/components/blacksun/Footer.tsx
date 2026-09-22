import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full h-[36px] bg-[#E8E7DF] border-t border-[#B5B3A7] px-6 flex items-center justify-between font-mono-tech text-[10px] text-[#555555] select-none z-30">
      {/* Left Slogan with Orange Accent Bar */}
      <div className="flex items-center gap-2 font-semibold">
        <span className="h-[2px] w-6 bg-[#FFA133]" />
        <span>NOT EVERY CRISIS HAS A NAME. BUT WE ARE READY FOR IT.</span>
      </div>

      {/* Right Brand Axiom with Orange Accent Bar */}
      <div className="flex items-center gap-2 font-bold tracking-wider text-[#333333]">
        <span>AUTONOMOUS</span>
        <span className="text-[#B5B3A7]">|</span>
        <span>RESILIENT</span>
        <span className="text-[#B5B3A7]">|</span>
        <span>CONTINUOUS</span>
        <span className="h-[2px] w-6 bg-[#FFA133]" />
      </div>
    </footer>
  );
};
