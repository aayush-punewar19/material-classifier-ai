/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { trainModels, TrainingPipelineResult } from './ml/classifier';
import { Header, TabKey } from './components/Header';
import { PredictTab } from './components/PredictTab';
import { ResultsTab } from './components/ResultsTab';
import { DatasetTab } from './components/DatasetTab';
import { AboutTab } from './components/AboutTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('predict');
  const [seed, setSeed] = useState<number>(42);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  // Train and memoize models based on seed
  const pipeline: TrainingPipelineResult = useMemo(() => {
    return trainModels(seed);
  }, [seed]);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setSeed((prev) => prev + 1);
      setIsRetraining(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950">
      {/* 3-Zone Sticky Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        bestModelType={pipeline.bestModelType}
        bestAccuracy={pipeline.bestModelEvaluation.accuracy}
        onRetrain={handleRetrain}
        isRetraining={isRetraining}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'predict' && <PredictTab pipeline={pipeline} />}
        {activeTab === 'results' && <ResultsTab pipeline={pipeline} />}
        {activeTab === 'dataset' && (
          <DatasetTab samples={pipeline.samples} onRegenerate={handleRetrain} />
        )}
        {activeTab === 'about' && <AboutTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-200">MaterialClassifier</span>
            <span className="mx-2 text-slate-600">·</span>
            <span>College Project: AI-Based Classification of Engineering Materials</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Synthetic Dataset (N=800)</span>
            <span className="text-slate-600">·</span>
            <span>Client-side ML (KNN & CART Tree)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
