'use client';

import { Html, useProgress } from '@react-three/drei';

export default function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 relative">
          {/* Animated loading circle */}
          <svg
            className="animate-spin"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#4FC3F7"
              strokeWidth="8"
              fill="none"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * progress) / 100}
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#7C4DFF"
              strokeWidth="4"
              fill="none"
              strokeDasharray="219.8"
              strokeDashoffset={219.8 - (219.8 * progress) / 100}
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>

          {/* Progress text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-1">
            Loading IsoFlux
          </p>
          <p className="text-gray-400 text-sm">
            Initializing geometric space...
          </p>
        </div>
      </div>
    </Html>
  );
}
