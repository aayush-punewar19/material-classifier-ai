/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FeatureKey,
  FEATURE_DEFINITIONS,
  FEATURE_KEYS,
  MaterialClass,
  MaterialProperties,
} from '../types/material';

interface RadarChartProps {
  currentProperties: MaterialProperties;
  predictedClass?: MaterialClass;
}

// Typical archetype normalized centroids (0 to 1) for visual comparison
const CLASS_ARCHETYPES: Record<MaterialClass, Record<FeatureKey, number>> = {
  Metal: {
    density: 0.65,
    tensileStrength: 0.35,
    hardness: 0.52,
    meltingPoint: 0.42,
    youngsModulus: 0.45,
    thermalConductivity: 0.45,
  },
  Polymer: {
    density: 0.08,
    tensileStrength: 0.03,
    hardness: 0.15,
    meltingPoint: 0.06,
    youngsModulus: 0.01,
    thermalConductivity: 0.001,
  },
  Ceramic: {
    density: 0.32,
    tensileStrength: 0.12,
    hardness: 0.82,
    meltingPoint: 0.68,
    youngsModulus: 0.72,
    thermalConductivity: 0.15,
  },
  Composite: {
    density: 0.12,
    tensileStrength: 0.55,
    hardness: 0.42,
    meltingPoint: 0.08,
    youngsModulus: 0.32,
    thermalConductivity: 0.02,
  },
};

export const RadarChart: React.FC<RadarChartProps> = ({
  currentProperties,
  predictedClass,
}) => {
  const size = 320;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = FEATURE_KEYS.length;

  // Normalize a feature value to [0.05, 0.98] for radial plotting
  const normalize = (key: FeatureKey, val: number): number => {
    const def = FEATURE_DEFINITIONS[key];
    const clamped = Math.max(def.min, Math.min(def.max, val));
    const ratio = (clamped - def.min) / (def.max - def.min);
    return 0.05 + ratio * 0.9;
  };

  // Convert (angle, r) to SVG (x, y)
  const getCoordinates = (index: number, valNorm: number) => {
    // Start from top (-PI / 2)
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const r = radius * valNorm;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Polygon points for current candidate material
  const currentPoints = FEATURE_KEYS.map((key, i) => {
    const norm = normalize(key, currentProperties[key]);
    const { x, y } = getCoordinates(i, norm);
    return `${x},${y}`;
  }).join(' ');

  // Polygon points for predicted class archetype (if predicted)
  const archetypePoints = predictedClass
    ? FEATURE_KEYS.map((key, i) => {
        const norm = CLASS_ARCHETYPES[predictedClass][key];
        const { x, y } = getCoordinates(i, norm);
        return `${x},${y}`;
      }).join(' ')
    : null;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[320px] h-auto overflow-visible"
        aria-label="Material Property Radar Spider Chart"
      >
        {/* Background Grid Rings */}
        {gridLevels.map((level, lvlIdx) => {
          const ringPoints = FEATURE_KEYS.map((_, i) => {
            const { x, y } = getCoordinates(i, level);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={`ring-${lvlIdx}`}
              points={ringPoints}
              fill={lvlIdx === gridLevels.length - 1 ? '#0e1726' : 'none'}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray={lvlIdx < gridLevels.length - 1 ? '3 3' : undefined}
            />
          );
        })}

        {/* Axis Spokes */}
        {FEATURE_KEYS.map((key, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={`axis-${key}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#273549"
              strokeWidth="1"
            />
          );
        })}

        {/* Archetype Overlay (Dashed Slate) */}
        {archetypePoints && (
          <polygon
            points={archetypePoints}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />
        )}

        {/* Current Candidate Material Polygon (Teal) */}
        <polygon
          points={currentPoints}
          fill="rgba(20, 184, 166, 0.22)"
          stroke="#14b8a6"
          strokeWidth="2.5"
          className="transition-all duration-300 ease-out"
        />

        {/* Vertex Dots */}
        {FEATURE_KEYS.map((key, i) => {
          const norm = normalize(key, currentProperties[key]);
          const { x, y } = getCoordinates(i, norm);
          return (
            <circle
              key={`dot-${key}`}
              cx={x}
              cy={y}
              r="4"
              className="fill-teal-300 stroke-slate-900 stroke-2 transition-all duration-300 ease-out"
            />
          );
        })}

        {/* Axis Labels */}
        {FEATURE_KEYS.map((key, i) => {
          const def = FEATURE_DEFINITIONS[key];
          const labelDist = 1.18;
          const { x, y } = getCoordinates(i, labelDist);

          // Alignment adjustments based on horizontal position
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (x > center + 15) textAnchor = 'start';
          if (x < center - 15) textAnchor = 'end';

          return (
            <g key={`label-${key}`}>
              <text
                x={x}
                y={y - 2}
                textAnchor={textAnchor}
                className="text-[10px] font-medium fill-slate-300 tracking-tight"
              >
                {def.label}
              </text>
              <text
                x={x}
                y={y + 9}
                textAnchor={textAnchor}
                className="text-[9px] font-mono fill-teal-400"
              >
                {currentProperties[key]} {def.unit}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Radar Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-teal-400 inline-block rounded" />
          <span className="text-slate-200">Current Material</span>
        </div>
        {predictedClass && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-slate-400 inline-block" />
            <span>{predictedClass} Archetype</span>
          </div>
        )}
      </div>
    </div>
  );
};
