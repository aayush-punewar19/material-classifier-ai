/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialClass, MaterialSample, MATERIAL_CLASSES } from '../types/material';
import { convertToCSV } from '../ml/dataset';
import { CLASS_METADATA } from './PredictTab';
import { Copy, Download, Check, Database, Filter } from 'lucide-react';

interface DatasetTabProps {
  samples: MaterialSample[];
  onRegenerate: () => void;
}

export const DatasetTab: React.FC<DatasetTabProps> = ({ samples, onRegenerate }) => {
  const [filterClass, setFilterClass] = useState<string>('All');
  const [copied, setCopied] = useState(false);
  const [displayCount, setDisplayCount] = useState<number>(15);

  const filteredSamples =
    filterClass === 'All'
      ? samples
      : samples.filter((s) => s.materialClass === filterClass);

  const rowsToShow = filteredSamples.slice(0, displayCount);

  const handleCopyCSV = async () => {
    const csv = convertToCSV(samples);
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = csv;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownloadCSV = () => {
    const csv = convertToCSV(samples);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'material_dataset_800.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Synthetic Engineering Dataset
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            800 synthetic rows (200 balanced instances per material family) generated with
            realistic empirical property intervals and stochastic boundary overlap.
          </p>
        </div>

        {/* Action Buttons: Copy CSV & Download CSV */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied CSV!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copy CSV</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MATERIAL_CLASSES.map((cls) => {
          const meta = CLASS_METADATA[cls];
          const classSamples = samples.filter((s) => s.materialClass === cls);
          const avgDensity = (
            classSamples.reduce((sum, s) => sum + s.density, 0) / (classSamples.length || 1)
          ).toFixed(2);
          const avgMelting = Math.round(
            classSamples.reduce((sum, s) => sum + s.meltingPoint, 0) / (classSamples.length || 1)
          );

          const Icon = meta.icon;

          return (
            <div
              key={cls}
              className="bg-[#10172a] border border-slate-800 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {cls}
                </span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {classSamples.length}
                </span>
                <span className="text-xs text-slate-400">instances (25%)</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                Avg: <span className="text-slate-300">{avgDensity} g/cm³</span> ·{' '}
                <span className="text-slate-300">{avgMelting} °C</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="bg-[#10172a] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* Table Controls Bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Showing first {rowsToShow.length} of {filteredSamples.length} samples
            </span>
          </div>

          {/* Filter & Count Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Classes (800)</option>
                {MATERIAL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c} (200)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>View:</span>
              <select
                value={displayCount}
                onChange={(e) => setDisplayCount(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none focus:border-teal-500"
              >
                <option value={15}>First 15 rows</option>
                <option value={50}>First 50 rows</option>
                <option value={100}>First 100 rows</option>
                <option value={800}>All 800 rows</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Class</th>
                <th className="py-3 px-4 font-semibold text-right">Density (g/cm³)</th>
                <th className="py-3 px-4 font-semibold text-right">Tensile (MPa)</th>
                <th className="py-3 px-4 font-semibold text-right">Hardness (HRC)</th>
                <th className="py-3 px-4 font-semibold text-right">Melting (°C)</th>
                <th className="py-3 px-4 font-semibold text-right">Modulus (GPa)</th>
                <th className="py-3 px-4 font-semibold text-right">Thermal Cond (W/mK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
              {rowsToShow.map((row) => {
                const meta = CLASS_METADATA[row.materialClass];
                return (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-normal">#{row.id}</td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${meta.bgBadge}`}>
                        {row.materialClass}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-white">{row.density.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right">{row.tensileStrength.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-right">{row.hardness.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-right">{row.meltingPoint.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-right">{row.youngsModulus.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right">{row.thermalConductivity.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="p-3 bg-slate-900/50 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Dataset normalized on 640 training rows (80%) and evaluated on 160 holdout test rows (20%).
          </span>
          <button
            onClick={onRegenerate}
            className="text-teal-400 hover:text-teal-300 text-xs underline cursor-pointer"
          >
            Regenerate Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
