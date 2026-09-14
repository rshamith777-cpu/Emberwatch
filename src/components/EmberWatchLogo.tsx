import React from 'react';

interface EmberWatchLogoProps {
  className?: string;
  size?: number;
  variant?: 'gold' | 'ivory' | 'monochrome';
}

export const EmberWatchLogo: React.FC<EmberWatchLogoProps> = ({
  className = '',
  size = 36,
  variant = 'gold'
}) => {
  const primaryStroke =
    variant === 'gold'
      ? '#C6A15B'
      : variant === 'ivory'
      ? '#F2EBDD'
      : '#A9A394';

  const secondaryStroke =
    variant === 'gold'
      ? '#E1C47A'
      : variant === 'ivory'
      ? '#F2EBDD'
      : '#E5E7EB';

  const emberFill =
    variant === 'monochrome'
      ? '#F2EBDD'
      : '#F0783C';

  const emberGlow =
    variant === 'monochrome'
      ? 'rgba(242, 235, 221, 0.4)'
      : 'rgba(240, 120, 60, 0.7)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="EmberWatch Orbital Insignia"
    >
      <defs>
        {/* Subtle radial glow around ember core */}
        <radialGradient id="emberGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={emberFill} stopOpacity="1" />
          <stop offset="60%" stopColor="#D85B35" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#70261F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="goldRingGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={primaryStroke} stopOpacity="0.3" />
          <stop offset="40%" stopColor={secondaryStroke} stopOpacity="0.95" />
          <stop offset="85%" stopColor={primaryStroke} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#070809" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* 1. Outer Planetary Coordinate Rim */}
      <circle
        cx="24"
        cy="24"
        r="21.5"
        stroke={primaryStroke}
        strokeWidth="1"
        strokeOpacity="0.2"
        strokeDasharray="2 3"
      />

      {/* 2. Elliptical Satellite Orbit Ring tilted at 28 deg */}
      <ellipse
        cx="24"
        cy="24"
        rx="20"
        ry="10.5"
        transform="rotate(-28 24 24)"
        stroke="url(#goldRingGrad)"
        strokeWidth="1.35"
        strokeLinecap="round"
      />

      {/* 3. Subtle E Geometry centered inside the orbital sphere */}
      {/* Precision architectural 'E' made with clean coordinate lines */}
      <path
        d="M17 16.5H29.5M17 16.5V31.5M17 31.5H29.5M17 24H26.5"
        stroke={secondaryStroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center axis tick mark */}
      <line
        x1="24"
        y1="9.5"
        x2="24"
        y2="12.5"
        stroke={primaryStroke}
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <line
        x1="24"
        y1="35.5"
        x2="24"
        y2="38.5"
        stroke={primaryStroke}
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* 4. Thermal Ember Observation Point on the Orbit */}
      {/* Outer halo */}
      <circle
        cx="37"
        cy="15"
        r="4.5"
        fill={emberGlow}
        className="animate-pulse"
      />
      {/* Core thermal particle */}
      <circle
        cx="37"
        cy="15"
        r="2"
        fill={emberFill}
      />
    </svg>
  );
};
