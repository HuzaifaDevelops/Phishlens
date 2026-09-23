'use client';

import React from 'react';
import { RiskLevel } from '@/lib/types';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
}

export function RiskMeter({ score, level }: RiskMeterProps) {
  const config = {
    SAFE: {
      color: 'text-[#3fb950]',
      borderColor: 'border-[#238636]/40',
      bgColor: 'bg-[#238636]/10',
      strokeColor: '#3fb950',
      code: 'VERIFIED_BENIGN // ZERO_MATCH',
      label: 'STATUS: BENIGN / VERIFIED',
      icon: CheckCircle2,
      summary: 'Domain telemetry matches verified enterprise infrastructure.',
    },
    SUSPICIOUS: {
      color: 'text-[#d29922]',
      borderColor: 'border-[#d29922]/40',
      bgColor: 'bg-[#d29922]/10',
      strokeColor: '#d29922',
      code: 'ANOMALY_FLAGGED // ELEVATED_RISK',
      label: 'STATUS: SUSPICIOUS / CAUTION',
      icon: AlertTriangle,
      summary: 'Multiple heuristic anomalies detected: young age & generic urgency.',
    },
    MALICIOUS: {
      color: 'text-[#f85149]',
      borderColor: 'border-[#f85149]/50',
      bgColor: 'bg-[#f85149]/10',
      strokeColor: '#f85149',
      code: 'CRITICAL_THREAT // HARVEST_ACTIVE',
      label: 'STATUS: CRITICAL / MALICIOUS PHISHING',
      icon: AlertOctagon,
      summary: 'Active credential spoofing signature detected across threat feeds.',
    },
  }[level];

  const Icon = config.icon;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="corner-crosshair p-6 flex flex-col items-center justify-between h-full bg-[#0c1017] border border-white/[0.08] rounded">
      {/* Header Stamp */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-white/[0.06] font-mono text-[11px] text-[#8b949e]">
        <span>INSTRUMENT // THREAT_INDEX</span>
        <span className="text-[#c9d1d9]">{config.code}</span>
      </div>

      {/* Main Gauge Visual */}
      <div className="relative my-6 flex items-center justify-center">
        {/* Calibrated Circular Arc */}
        <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 140 140">
          {/* Background Rail */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#161b22"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Ticks Pattern */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeDasharray="2 6"
            fill="transparent"
          />
          {/* Active Metric Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={config.strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="square"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center justify-center font-mono">
          <div className="text-3xl font-bold tracking-tighter text-white">
            {score}
            <span className="text-xs font-normal text-[#8b949e]">/100</span>
          </div>
          <span className="text-[10px] tracking-widest uppercase text-[#8b949e] mt-0.5">
            CALIBRATED
          </span>
        </div>
      </div>

      {/* Verdict Strip */}
      <div className="w-full space-y-3 font-mono text-center">
        <div className={`p-2 rounded border ${config.borderColor} ${config.bgColor} flex items-center justify-center gap-2`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
        </div>
        <p className="text-xs text-[#8b949e] font-sans leading-relaxed text-left">
          {config.summary}
        </p>

        {/* Micro Scale Bar */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-[#8b949e]">
          <div className={`py-1 border ${score <= 30 ? 'border-[#238636] text-[#3fb950] font-bold' : 'border-white/[0.06]'}`}>
            0-30 BENIGN
          </div>
          <div className={`py-1 border ${score > 30 && score < 70 ? 'border-[#d29922] text-[#d29922] font-bold' : 'border-white/[0.06]'}`}>
            31-69 WARN
          </div>
          <div className={`py-1 border ${score >= 70 ? 'border-[#f85149] text-[#f85149] font-bold' : 'border-white/[0.06]'}`}>
            70-100 CRIT
          </div>
        </div>
      </div>
    </div>
  );
}
