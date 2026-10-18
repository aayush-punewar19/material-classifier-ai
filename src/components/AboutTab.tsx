/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Brain, Shield, Sparkles, Boxes, Layers, AlertCircle, CheckCircle } from 'lucide-react';
import { MATERIAL_CLASSES } from '../types/material';
import { CLASS_METADATA } from './PredictTab';

export const AboutTab: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          About MaterialClassifier
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          College Project: "AI-Based Classification of Engineering Materials"
        </p>
      </div>

      {/* Educational Notice Banner */}
      <div className="p-4 bg-teal-950/30 border border-teal-500/30 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong className="text-teal-300">Academic & Educational Use Note: </strong>
          The 800 samples in this application are synthetically generated based on empirical
          engineering property intervals from material science literature (Callister, Ashby
          Material Selection charts). A controlled level of Gaussian jitter and boundary overlap
          has been introduced to simulate natural metallurgical variations, alloy grades, and
          realistic classification challenges.
        </div>
      </div>

      {/* The Problem */}
      <div className="bg-[#10172a] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            1. The Engineering Problem
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In mechanical, aerospace, and civil engineering design, selecting the right material
          family determines component durability, weight, cost, and safety. While classical
          methods rely on manual inspection of 2D Ashby charts (e.g., Strength vs. Density),
          real engineering components are constrained by multi-dimensional property trade-offs:
          density, elastic stiffness (Young's modulus), thermal limits, hardness, and thermal
          dissipation.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          This project demonstrates how automated machine learning classifiers can identify the
          underlying material family from raw mechanical and physical test data without destructive
          chemical assays.
        </p>
      </div>

      {/* The Method */}
      <div className="bg-[#10172a] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-teal-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            2. Machine Learning Methodology
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <span className="text-xs font-mono text-teal-400 font-semibold uppercase">
              Step 1: Normalization
            </span>
            <h3 className="text-sm font-semibold text-white">Z-Score Standardization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Features operate on wildly different numeric scales (e.g., Density ~ 1–8 vs.
              Melting Point ~ 2,500 °C). We compute mean $\mu$ and standard deviation $\sigma$
              on training data to normalize every variable into unit variance ($z = (x - \mu)/\sigma$).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <span className="text-xs font-mono text-teal-400 font-semibold uppercase">
              Step 2: KNN Model
            </span>
            <h3 className="text-sm font-semibold text-white">K-Nearest Neighbours (K=5)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Projects query properties into 6-dimensional normalized space and locates the 5
              closest Euclidean neighbors. Class probabilities are weighted inversely by distance
              ($w_i = 1 / d_i$).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <span className="text-xs font-mono text-teal-400 font-semibold uppercase">
              Step 3: Decision Tree
            </span>
            <h3 className="text-sm font-semibold text-white">CART Tree (Depth 5)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Greedily minimizes Gini Impurity ($1 - \sum p_i^2$) at each binary branch. It learns
              orthogonal threshold cutoffs (e.g., Melting Point &gt; 1,450 °C) to isolate material
              families.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
          <strong>Validation Strategy:</strong> Stratified 80% train (640 samples) and 20% test
          (160 samples) split. The better-performing model on test accuracy is selected
          automatically for user inference.
        </div>
      </div>

      {/* The 4 Material Families */}
      <div className="bg-[#10172a] border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white">
          3. The Four Engineering Material Families
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Metal */}
          <div className="p-4 rounded-lg bg-slate-900/70 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Metals & Alloys</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Characterized by metallic bonding with free electron seas, providing high electrical
              and thermal conductivity. Notable for high density (2.7–8.9 g/cm³), ductile failure
              modes, and moderate-to-high melting points. Examples: Steel, Aluminum, Titanium.
            </p>
          </div>

          {/* Polymer */}
          <div className="p-4 rounded-lg bg-slate-900/70 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Polymers & Plastics</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Long-chain organic macromolecules held together by covalent and weak secondary
              forces. Known for lightweight density (0.9–1.5 g/cm³), low thermal conductivity, and
              lower thermal resistance (melting/softening at 100–300 °C). Examples: Nylon, Polycarbonate, PTFE.
            </p>
          </div>

          {/* Ceramic */}
          <div className="p-4 rounded-lg bg-slate-900/70 border border-rose-500/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Ceramics & Glasses</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inorganic compounds formed between metallic and non-metallic elements with strong
              ionic/covalent bonds. Outstanding refractory melting points (1,500–3,000 °C), extreme
              hardness, and high stiffness, but inherently brittle. Examples: Alumina, Silicon Carbide, Zirconia.
            </p>
          </div>

          {/* Composite */}
          <div className="p-4 rounded-lg bg-slate-900/70 border border-teal-500/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Advanced Composites</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered multi-phase materials uniting high-strength reinforcement fibers (carbon,
              glass) within a polymer, ceramic, or metal matrix. They achieve unparalleled specific
              strength (tensile strength up to 3,000 MPa at density under 2.0 g/cm³). Examples: CFRP, GFRP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
