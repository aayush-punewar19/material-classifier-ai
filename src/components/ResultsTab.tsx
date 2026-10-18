/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrainingPipelineResult } from '../ml/classifier';
import { MaterialClass, MATERIAL_CLASSES } from '../types/material';
import { Award, BarChart3, Grid3X3, CheckCircle, Info } from 'lucide-react';

interface ResultsTabProps {
  pipeline: TrainingPipelineResult;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({ pipeline }) => {
  const [activeModelForMatrix, setActiveModelForMatrix] = useState<'best' | 'KNN' | 'DecisionTree'>('best');

  const { knnEvaluation, dtEvaluation, bestModelType } = pipeline;

  const currentEval =
    activeModelForMatrix === 'best'
      ? pipeline.bestModelEvaluation
      : activeModelForMatrix === 'KNN'
      ? knnEvaluation
      : dtEvaluation;

  const matrix = currentEval.confusionMatrix.matrix;
  const maxMatrixCell = Math.max(...matrix.map((row) => Math.max(...row)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Model Comparison & Test Evaluation
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Empirical evaluation on 160 unseen test samples (20% holdout split) comparing
          K-Nearest Neighbours against a Depth-5 Decision Tree.
        </p>
      </div>

      {/* Accuracy KPI Cards & Best Model Winner Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* KNN Card */}
        <div
          className={`bg-[#10172a] border rounded-xl p-5 relative overflow-hidden transition-all ${
            bestModelType === 'KNN'
              ? 'border-teal-500/60 ring-1 ring-teal-500/20'
              : 'border-slate-800'
          }`}
        >
          {bestModelType === 'KNN' && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Selected Best Model</span>
            </div>
          )}

          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Instance-Based Learning
          </div>
          <div className="text-lg font-bold text-white mt-1">
            K-Nearest Neighbours (K=5)
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
              {knnEvaluation.accuracy}%
            </span>
            <span className="text-xs text-slate-400">Test Accuracy</span>
          </div>

          <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
            {knnEvaluation.explanation}
          </p>
        </div>

        {/* Decision Tree Card */}
        <div
          className={`bg-[#10172a] border rounded-xl p-5 relative overflow-hidden transition-all ${
            bestModelType === 'DecisionTree'
              ? 'border-teal-500/60 ring-1 ring-teal-500/20'
              : 'border-slate-800'
          }`}
        >
          {bestModelType === 'DecisionTree' && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Selected Best Model</span>
            </div>
          )}

          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Tree-Based Partitioning
          </div>
          <div className="text-lg font-bold text-white mt-1">
            Decision Tree (Depth 5)
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
              {dtEvaluation.accuracy}%
            </span>
            <span className="text-xs text-slate-400">Test Accuracy</span>
          </div>

          <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
            {dtEvaluation.explanation}
          </p>
        </div>
      </div>

      {/* Section 1: Accuracy & F1-Score Bar Chart Comparison */}
      <div className="bg-[#10172a] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Model Performance Comparison
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Overall Accuracy & Per-Class F1-Scores (%)
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="mt-6 space-y-6">
          {/* Overall Accuracy Bar Comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>Overall Accuracy</span>
              <span className="text-slate-400">
                KNN: <strong className="text-white font-mono">{knnEvaluation.accuracy}%</strong> ·
                Tree: <strong className="text-white font-mono">{dtEvaluation.accuracy}%</strong>
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="w-20 text-xs font-mono text-slate-400 shrink-0">KNN</span>
                <div className="h-4 flex-1 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-teal-400 transition-all duration-500 rounded-sm"
                    style={{ width: `${knnEvaluation.accuracy}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-white tabular-nums w-12 text-right">
                  {knnEvaluation.accuracy}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-20 text-xs font-mono text-slate-400 shrink-0">Dec. Tree</span>
                <div className="h-4 flex-1 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-600 transition-all duration-500 rounded-sm"
                    style={{ width: `${dtEvaluation.accuracy}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-white tabular-nums w-12 text-right">
                  {dtEvaluation.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Per-Class F1-Score Breakdown */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Per-Class F1-Score Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MATERIAL_CLASSES.map((cls) => {
                const knnF1 = knnEvaluation.perClass[cls]?.f1Score ?? 0;
                const dtF1 = dtEvaluation.perClass[cls]?.f1Score ?? 0;

                return (
                  <div key={cls} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="text-xs font-medium text-white">{cls}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>KNN:</span>
                        <span className="text-teal-300 tabular-nums">{knnF1}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-400"
                          style={{ width: `${knnF1}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span>Tree:</span>
                        <span className="text-cyan-400 tabular-nums">{dtF1}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-600"
                          style={{ width: `${dtF1}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanatory sentence */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Comparative Summary: </strong>
              {bestModelType === 'KNN'
                ? `K-Nearest Neighbours outperformed Decision Tree by ${(knnEvaluation.accuracy - dtEvaluation.accuracy).toFixed(1)}% because smooth Euclidean distance metrics better preserve diagonal trade-offs in materials science property space than orthogonal axis-aligned decision cuts.`
                : `Decision Tree achieved higher accuracy by establishing sharp threshold boundaries that cleanly isolate extreme material properties like ceramic melting points.`}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: 4x4 Confusion Matrix with Heatmap Intensity */}
      <div className="bg-[#10172a] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-teal-400" />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Confusion Matrix (4 × 4)
              </h2>
              <span className="text-xs text-slate-400">
                Evaluation on 160 test samples (40 per actual class)
              </span>
            </div>
          </div>

          {/* Matrix Model Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveModelForMatrix('best')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeModelForMatrix === 'best'
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Best ({bestModelType})
            </button>
            <button
              onClick={() => setActiveModelForMatrix('KNN')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeModelForMatrix === 'KNN'
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              KNN
            </button>
            <button
              onClick={() => setActiveModelForMatrix('DecisionTree')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeModelForMatrix === 'DecisionTree'
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Decision Tree
            </button>
          </div>
        </div>

        {/* Matrix Visualization */}
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[500px] max-w-2xl mx-auto">
            {/* Top Column Header (Predicted Class) */}
            <div className="text-center text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
              Predicted Class →
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
              {/* Empty Top-Left Cell */}
              <div className="p-2 text-slate-500 text-[11px] flex items-center justify-center font-sans">
                Actual ↓
              </div>

              {/* Column Labels */}
              {MATERIAL_CLASSES.map((cls) => (
                <div
                  key={`col-${cls}`}
                  className="p-2 text-slate-200 font-semibold bg-slate-900/60 rounded border border-slate-800"
                >
                  {cls}
                </div>
              ))}

              {/* Matrix Rows */}
              {MATERIAL_CLASSES.map((actualClass, rowIdx) => (
                <React.Fragment key={`row-${actualClass}`}>
                  {/* Row Label (Actual) */}
                  <div className="p-2 text-slate-200 font-semibold bg-slate-900/60 rounded border border-slate-800 flex items-center justify-center">
                    {actualClass}
                  </div>

                  {/* 4 Cells */}
                  {MATERIAL_CLASSES.map((predictedClass, colIdx) => {
                    const count = matrix[rowIdx][colIdx];
                    const isDiagonal = rowIdx === colIdx;
                    const intensity = maxMatrixCell > 0 ? count / maxMatrixCell : 0;

                    // Color ramp: slate for zero/off-diagonals, teal/emerald for true positives
                    let bgStyle = 'bg-slate-900/50 border-slate-800 text-slate-500';
                    if (isDiagonal && count > 0) {
                      bgStyle =
                        intensity > 0.8
                          ? 'bg-teal-500/80 border-teal-400 text-slate-950 font-bold'
                          : intensity > 0.5
                          ? 'bg-teal-600/60 border-teal-500 text-white font-bold'
                          : 'bg-teal-700/40 border-teal-600 text-teal-200';
                    } else if (!isDiagonal && count > 0) {
                      bgStyle = 'bg-rose-950/40 border-rose-800/60 text-rose-300 font-semibold';
                    }

                    return (
                      <div
                        key={`cell-${rowIdx}-${colIdx}`}
                        className={`p-3.5 rounded border flex flex-col items-center justify-center transition-all ${bgStyle}`}
                        title={`Actual: ${actualClass}, Predicted: ${predictedClass} (${count} samples)`}
                      >
                        <span className="text-base sm:text-lg tabular-nums">
                          {count}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {((count / 40) * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Matrix Legend */}
            <div className="flex items-center justify-between text-xs text-slate-400 mt-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-teal-500/80 rounded border border-teal-400" />
                <span>Correct Predictions (True Positives)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-950/40 rounded border border-rose-800/60" />
                <span>Misclassifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-English explanation sentence for the confusion matrix */}
        <div className="mt-6 p-3.5 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Confusion Matrix Interpretation: </strong>
            Polymers and Ceramics exhibit near-perfect diagonal classification because their density (0.9–1.5 vs 2.2–6.0 g/cm³) and melting temperatures (100–300 vs 1,500–3,000 °C) never intersect, while occasional minor confusion occurs between high-strength Composites and light Metals due to overlapping modulus ranges (45–210 vs 20–230 GPa).
          </p>
        </div>
      </div>
    </div>
  );
};
