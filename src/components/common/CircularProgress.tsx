import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  strokeColor?: string;
  textColor?: string;
  fontSize?: string;
  showPercentSymbol?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 96,
  strokeWidth = 8,
  trackColor = '#2B2B2B',
  strokeColor = '#000000',
  textColor = '#000000',
  fontSize = 'text-xl font-bold',
  showPercentSymbol = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className={`absolute flex items-baseline justify-center ${textColor}`}>
        <span className={fontSize}>{percentage}</span>
        {showPercentSymbol && <span className="text-xs ml-0.5 font-bold">%</span>}
      </div>
    </div>
  );
};
