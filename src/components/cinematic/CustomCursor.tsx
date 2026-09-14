import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on non-touch desktop devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if hovering over interactive elements
      const isInteractive = Boolean(
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      );
      setIsHovered(isInteractive);

      // Check if hovering over map / 3D canvas
      const isTargetArea = Boolean(
        target.closest('.leaflet-container') ||
        target.closest('canvas') ||
        target.closest('.target-crosshair-area')
      );
      setIsTargeting(isTargetArea);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* Outer subtle follower ring (Section 66: gold ring, target cursor on map) */}
      <div
        className="fixed rounded-full transition-transform duration-100 ease-out border"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovered ? '36px' : isTargeting ? '30px' : '22px',
          height: isHovered ? '36px' : isTargeting ? '30px' : '22px',
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.82 : 1})`,
          borderColor: isTargeting ? 'rgba(198, 161, 91, 0.85)' : isHovered ? 'rgba(216, 184, 106, 0.9)' : 'rgba(198, 161, 91, 0.4)',
          backgroundColor: isHovered ? 'rgba(198, 161, 91, 0.12)' : 'transparent',
        }}
      >
        {isTargeting && (
          <>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#C6A15B]/70" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#C6A15B]/70" />
          </>
        )}
      </div>

      {/* Inner precise dot (Section 66: small ivory dot) */}
      <div
        className="fixed rounded-full transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '5px',
          height: '5px',
          transform: 'translate(-50%, -50%)',
          backgroundColor: isTargeting ? '#F0783C' : isHovered ? '#C6A15B' : '#F5F0E6',
          boxShadow: isHovered ? '0 0 8px rgba(198, 161, 91, 0.8)' : '0 0 4px rgba(245, 240, 230, 0.6)',
        }}
      />
    </div>
  );
};
