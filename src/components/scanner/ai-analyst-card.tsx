'use client';

import React from 'react';
import { AIAnalysis } from '@/lib/types';
import { ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';

interface AIAnalystCardProps {
  analysis: AIAnalysis;
  isMalicious: boolean;
}

export function AIAnalystCard({ analysis, isMalicious }: AIAnalystCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs h-full flex flex-col justify-between space-y-4 font-sans transition-colors">
      {/* Dossier Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-sky-400" />
          <span className="font-semibold text-slate-900 dark:text-white">
            Analysis & Verdict
          </span>
          {analysis.engine === 'gemini' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-sky-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-2.5 w-2.5 text-indigo-600 dark:text-sky-400" />
              Google Gemini
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Forensic Engine
            </span>
          )}
        </div>
        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xs">
          <span>AI Assisted</span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{analysis.confidenceScore}% Confidence</span>
        </div>
      </div>

      {/* Target Impersonation Intercept Callout */}
      {analysis.impersonatedBrand && (
        <div className="p-3.5 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
          <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-900 dark:text-rose-200">Brand impersonation detected: </span>
            <span>
              This target attempts to mimic{' '}
              <strong className="text-rose-900 dark:text-rose-200 underline font-bold">
                {analysis.impersonatedBrand}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Plain English Assessment */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Forensic reasoning
        </div>
        <p className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          {analysis.verdictSummary}
        </p>
      </div>

      {/* Identified Tactical Indicators */}
      {analysis.threatTactics.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Observed risk factors ({analysis.threatTactics.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.threatTactics.map((tactic, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">•</span>
                <span>{tactic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action */}
      <div className="p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-semibold text-xs">
          <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-sky-400" />
          <span>Recommended action</span>
        </div>
        <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed font-sans text-xs">
          {analysis.recommendedAction}
        </p>
      </div>
    </div>
  );
}
