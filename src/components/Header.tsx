/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, Cpu, Layers } from 'lucide-react';

export type TabKey = 'predict' | 'results' | 'dataset' | 'about';

interface HeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  bestModelType: 'KNN' | 'DecisionTree';
  bestAccuracy: number;
  onRetrain: () => void;
  isRetraining: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  bestModelType,
  bestAccuracy,
  onRetrain,
  isRetraining,
}) => {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'predict', label: 'Predict' },
    { key: 'results', label: 'Results' },
    { key: 'dataset', label: 'Dataset' },
    { key: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap block">
              Material<span className="text-teal-400">Classifier</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:block leading-none">
              Engineering Materials ML
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line tabs) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (Retrain Dataset & Models) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border border-slate-800 bg-slate-900/80 px-3 py-1.5 rounded-lg">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>Active:</span>
            <span className="text-white font-medium">{bestModelType}</span>
            <span className="font-mono text-teal-400 tabular-nums">
              ({bestAccuracy}%)
            </span>
          </div>

          <button
            onClick={onRetrain}
            disabled={isRetraining}
            title="Generate fresh synthetic samples and retrain both models"
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-teal-400 ${
                isRetraining ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Re-seed Data</span>
            <span className="sm:hidden">Re-seed</span>
          </button>
        </div>
      </div>
    </header>
  );
};
