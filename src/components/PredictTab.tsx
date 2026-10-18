/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FeatureKey,
  FEATURE_DEFINITIONS,
  FEATURE_KEYS,
  MaterialClass,
  MaterialProperties,
  PredictionResult,
} from '../types/material';
import { PRESET_MATERIALS } from '../ml/dataset';
import { classifyMaterial, TrainingPipelineResult } from '../ml/classifier';
import { RadarChart } from './RadarChart';
import {
  Shield,
  Layers,
  Sparkles,
  Boxes,
  Zap,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PredictTabProps {
  pipeline: TrainingPipelineResult;
}

// Visual color tokens & icons per material class
export const CLASS_METADATA: Record<
  MaterialClass,
  {
    color: string;
    bgBadge: string;
    border: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Metal: {
    color: 'text-amber-400',
    bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    border: 'border-amber-500/40',
    description: 'Crystalline structure bound by delocalized metallic electrons.',
    icon: Shield,
  },
  Polymer: {
    color: 'text-emerald-400',
    bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-500/40',
    description: 'Long chain macromolecules with covalent and secondary bonding.',
    icon: Boxes,
  },
  Ceramic: {
    color: 'text-rose-400',
    bgBadge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    border: 'border-rose-500/40',
    description: 'Inorganic non-metallic compounds with ionic/covalent bonds.',
    icon: Sparkles,
  },
  Composite: {
    color: 'text-teal-400',
    bgBadge: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    border: 'border-teal-500/40',
    description: 'Multi-phase engineered combinations of fibers and matrices.',
    icon: Layers,
  },
};

export const PredictTab: React.FC<PredictTabProps> = ({ pipeline }) => {
  // Initial default: Steel values
  const [properties, setProperties] = useState<MaterialProperties>({
    density: 7.85,
    tensileStrength: 600,
    hardness: 50,
    meltingPoint: 1450,
    youngsModulus: 200,
    thermalConductivity: 50,
  });

  const [activePreset, setActivePreset] = useState<string>('Steel');
  const [modelChoice, setModelChoice] = useState<'Best' | 'KNN' | 'DecisionTree'>('Best');
  const [errors, setErrors] = useState<Partial<Record<FeatureKey, string>>>({});

  // Compute prediction immediately on load and on state update
  const currentModelOverride = modelChoice === 'Best' ? undefined : modelChoice;
  const prediction: PredictionResult = classifyMaterial(
    properties,
    pipeline,
    currentModelOverride
  );

  const handleInputChange = (key: FeatureKey, rawValue: string) => {
    setActivePreset(''); // clear active preset tag if user manually tweaks
    const def = FEATURE_DEFINITIONS[key];
    const num = parseFloat(rawValue);

    if (isNaN(num)) {
      setErrors((prev) => ({ ...prev, [key]: 'Enter a valid number' }));
      return;
    }

    if (num < def.min || num > def.max) {
      setErrors((prev) => ({
        ...prev,
        [key]: `Valid range: ${def.min} - ${def.max} ${def.unit}`,
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }

    setProperties((prev) => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleSliderChange = (key: FeatureKey, val: number) => {
    setActivePreset('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setProperties((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const applyPreset = (presetName: string) => {
    const found = PRESET_MATERIALS.find((p) => p.name === presetName);
    if (found) {
      setProperties({ ...found.properties });
      setActivePreset(presetName);
      setErrors({});
    }
  };

  const PredictedIcon = CLASS_METADATA[prediction.predictedClass].icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Classify Engineering Material
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Input physical and mechanical characteristics to evaluate whether the material
            aligns with Metal, Polymer, Ceramic, or Composite families.
          </p>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <span className="text-xs text-slate-400 px-2 font-mono">Classifier:</span>
          {(['Best', 'KNN', 'DecisionTree'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModelChoice(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                modelChoice === m
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {m === 'Best' ? `Auto Best (${pipeline.bestModelType})` : m === 'KNN' ? 'KNN (K=5)' : 'Tree (D=5)'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick-Fill Presets Bar */}
      <div className="bg-[#10172a] border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Zap className="w-4 h-4 text-teal-400" />
            <span>Quick-Fill Archetypes:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_MATERIALS.map((preset) => {
              const isSelected = activePreset === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.name)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap border ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={`${preset.name}: ${preset.description}`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (Sliders/Inputs) vs Right Prediction Card & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 6 Property Parameter Inputs (7 cols on lg) */}
        <div className="lg:col-span-7 bg-[#10172a] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Material Parameters
              </h2>
            </div>
            <span className="text-xs text-slate-400">6 Normalized Variables</span>
          </div>

          <div className="space-y-5">
            {FEATURE_KEYS.map((key) => {
              const def = FEATURE_DEFINITIONS[key];
              const val = properties[key];
              const error = errors[key];

              return (
                <div key={key} className="space-y-1.5">
                  {/* Label, Description & Input Box */}
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <label
                        htmlFor={`input-${key}`}
                        className="text-xs sm:text-sm font-medium text-slate-200 cursor-pointer"
                      >
                        {def.label}
                      </label>
                      <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                        ({def.unit})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        id={`input-${key}`}
                        type="number"
                        step={def.step}
                        min={def.min}
                        max={def.max}
                        value={val}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={`w-28 px-2.5 py-1 text-sm font-mono tabular-nums text-right bg-slate-900 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                          error
                            ? 'border-rose-500 text-rose-300 focus:ring-rose-500'
                            : 'border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500'
                        }`}
                      />
                      <span className="text-xs font-mono text-slate-400 w-12 text-left">
                        {def.unit}
                      </span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="pt-1">
                    <input
                      type="range"
                      min={def.min}
                      max={def.max}
                      step={def.step}
                      value={isNaN(val) ? def.min : Math.min(def.max, Math.max(def.min, val))}
                      onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                      <span>{def.min}</span>
                      <span className="text-slate-400">{def.description}</span>
                      <span>{def.max}</span>
                    </div>
                  </div>

                  {/* Inline Error Message */}
                  {error && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Prediction Result & Radar Comparison (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Prediction Card */}
          <div
            className={`bg-[#10172a] border ${
              CLASS_METADATA[prediction.predictedClass].border
            } rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300`}
          >
            {/* Top Tag & Confidence */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Classification Result
              </span>
              <span className="text-xs font-mono text-slate-400">
                via {prediction.modelUsed}
              </span>
            </div>

            {/* Giant Family Title */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    CLASS_METADATA[prediction.predictedClass].bgBadge
                  }`}
                >
                  <PredictedIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {prediction.predictedClass}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {CLASS_METADATA[prediction.predictedClass].description}
                  </div>
                </div>
              </div>

              {/* Confidence Badge */}
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-400 tabular-nums">
                  {prediction.confidence}%
                </div>
                <div className="text-[11px] font-mono text-slate-400">Confidence</div>
              </div>
            </div>

            {/* Plain-English Scientific Reasoning */}
            <div className="mt-5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <span className="font-semibold text-teal-300">Analysis: </span>
                  {prediction.reasoning}
                </div>
              </div>

              {/* Bullet insights if available */}
              {prediction.featureInsights.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                  {prediction.featureInsights.map((insight) => (
                    <div
                      key={insight.feature}
                      className="text-[11px] text-slate-300 flex items-center justify-between"
                    >
                      <span className="text-slate-400">
                        {insight.label}:{' '}
                        <strong className="text-white font-mono">
                          {insight.value} {insight.unit}
                        </strong>
                      </span>
                      <span className="text-teal-400/90 italic text-right truncate max-w-[200px]">
                        {insight.comparison}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Probabilities Breakdown Bars */}
            <div className="mt-5 space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Class Probability Distribution
              </div>

              {(['Metal', 'Polymer', 'Ceramic', 'Composite'] as MaterialClass[]).map(
                (cls) => {
                  const prob = prediction.probabilities[cls] || 0;
                  const pct = Math.round(prob * 100);
                  const isWinner = cls === prediction.predictedClass;

                  return (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span
                          className={`font-medium ${
                            isWinner ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {cls}
                        </span>
                        <span className="font-mono tabular-nums text-slate-300">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isWinner
                              ? 'bg-gradient-to-r from-teal-500 to-teal-400'
                              : 'bg-slate-700'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Spider / Radar Comparison Chart Box */}
          <div className="bg-[#10172a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Property Envelope Radar
              </span>
              <span className="text-[11px] font-mono text-teal-400">
                vs {prediction.predictedClass} Envelope
              </span>
            </div>

            <RadarChart
              currentProperties={properties}
              predictedClass={prediction.predictedClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
