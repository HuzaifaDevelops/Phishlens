'use client';

import React from 'react';
import { AIAnalysis } from '@/lib/types';
import { Terminal, ShieldAlert, CheckCircle, Cpu, AlertTriangle } from 'lucide-react';

interface AIAnalystCardProps {
  analysis: AIAnalysis;
  isMalicious: boolean;
}

export function AIAnalystCard({ analysis, isMalicious }: AIAnalystCardProps) {
  return (
    <div className="corner-crosshair p-6 bg-[#0c1017] border border-white/[0.08] rounded h-full flex flex-col justify-between space-y-4">
      {/* Dossier Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06] font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#58a6ff]" />
          <span className="font-bold text-white tracking-wide">
            EXPLAINABLE_AI_BRIEFING // INCIDENT_DOSSIER
          </span>
        </div>
        <div className="text-[#8b949e] flex items-center gap-2">
          <span>MODEL: GEMINI_XAI_V2</span>
          <span>•</span>
          <span className="text-[#3fb950] font-semibold">CONF: {analysis.confidenceScore}%</span>
        </div>
      </div>

      {/* Target Impersonation Intercept Callout */}
      {analysis.impersonatedBrand && (
        <div className="p-3 border border-[#f85149]/40 bg-[#f85149]/10 rounded flex items-start gap-2.5 font-mono text-xs">
          <ShieldAlert className="h-4 w-4 text-[#f85149] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#f85149] uppercase">TARGET_IMPERSONATION_INTERCEPT: </span>
            <span className="text-[#e6edf3]">
              Active deception detected mimicking{' '}
              <strong className="text-white underline decoration-[#f85149] font-bold">
                {analysis.impersonatedBrand}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Plain English Assessment */}
      <div className="space-y-1.5">
        <div className="font-mono text-[11px] text-[#8b949e] uppercase tracking-wider">
          // SYNTHESIS & BEHAVIORAL REASONING
        </div>
        <p className="p-3.5 rounded bg-[#161b22]/70 border border-white/[0.06] text-sm text-[#c9d1d9] leading-relaxed font-sans">
          {analysis.verdictSummary}
        </p>
      </div>

      {/* Identified Tactical Indicators */}
      {analysis.threatTactics.length > 0 && (
        <div className="space-y-2">
          <div className="font-mono text-[11px] text-[#8b949e] uppercase tracking-wider">
            // FORENSIC_INDICATORS_TRIGGERED ({analysis.threatTactics.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.threatTactics.map((tactic, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded bg-[#07090d] border border-white/[0.05] text-xs text-[#8b949e] font-mono"
              >
                <span className="text-[#f85149] font-bold">#0{idx + 1}</span>
                <span className="text-[#c9d1d9]">{tactic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescribed Countermeasure */}
      <div className="p-3 rounded border border-[#388bfd]/30 bg-[#388bfd]/10 font-mono text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-[#58a6ff] font-bold text-[11px]">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>PRESCRIBED_OPERATOR_ACTION</span>
        </div>
        <p className="text-[#c9d1d9] leading-relaxed font-sans text-xs">
          {analysis.recommendedAction}
        </p>
      </div>
    </div>
  );
}
