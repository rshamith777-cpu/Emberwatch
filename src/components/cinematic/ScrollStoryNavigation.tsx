import React from 'react';

interface ScrollStoryNavigationProps {
  currentSection: number; // 0 to 5
  scrollProgress: number; // 0.00 to 1.00
  onJumpToSection: (sectionIndex: number) => void;
}

const SECTIONS = [
  { id: 0, label: 'OBSERVE', sub: 'ORBITAL SIGNAL' },
  { id: 1, label: 'DETECT', sub: 'DBSCAN CLUSTERS' },
  { id: 2, label: 'UNDERSTAND', sub: 'WEATHER FUSION' },
  { id: 3, label: 'PROJECT', sub: 'THREAT VECTOR' },
  { id: 4, label: 'PROTECT', sub: 'EXPOSURE BUFFERS' },
  { id: 5, label: 'COMMAND', sub: 'OPERATIONS CENTER' }
];

export const ScrollStoryNavigation: React.FC<ScrollStoryNavigationProps> = ({
  currentSection,
  scrollProgress,
  onJumpToSection
}) => {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-6 pointer-events-auto select-none">
      {/* Background Track Line */}
      <div className="absolute right-[5px] top-2 bottom-2 w-[1px] bg-white/10" />

      {/* Dynamic Active Indicator Fill */}
      <div
        className="absolute right-[5px] top-2 w-[2px] bg-gradient-to-b from-[#C6A15B] to-[#D85B35] transition-all duration-300 shadow-[0_0_8px_rgba(198,161,91,0.5)]"
        style={{
          height: `${Math.min(100, Math.max(0, scrollProgress * 100))}%`
        }}
      />

      {SECTIONS.map((sec) => {
        const isActive = currentSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onJumpToSection(sec.id)}
            className="group flex items-center gap-3.5 cursor-pointer text-right transition-all duration-200"
          >
            <div className="flex flex-col items-end">
              <span
                className={`font-mono-tech text-[10px] tracking-[0.22em] uppercase transition-colors duration-200 ${
                  isActive
                    ? 'text-[#C6A15B] font-bold'
                    : 'text-[#858078] group-hover:text-[#F5F0E6]'
                }`}
              >
                0{sec.id + 1} {sec.label}
              </span>
              {isActive && (
                <span className="font-mono-tech text-[8px] text-[#D8B86A] tracking-[0.18em] uppercase font-semibold">
                  {sec.sub}
                </span>
              )}
            </div>

            {/* Indicator Dot */}
            <div
              className={`relative z-10 rounded-full transition-all duration-300 ${
                isActive
                  ? 'h-3 w-3 bg-[#C6A15B] ring-4 ring-[#C6A15B]/25 shadow-[0_0_10px_rgba(198,161,91,0.7)]'
                  : 'h-2 w-2 bg-[#171D24] border border-white/20 group-hover:border-[#F5F0E6]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
