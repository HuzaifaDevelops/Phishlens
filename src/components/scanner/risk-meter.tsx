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
      color: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      strokeColor: '#059669',
      riskTier: 'Low Risk',
      label: 'Safe — Verified',
      icon: CheckCircle2,
      summary: 'Domain telemetry matches verified legitimate enterprise infrastructure.',
    },
    SUSPICIOUS: {
      color: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800/60',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      strokeColor: '#d97706',
      riskTier: 'Elevated Risk',
      label: 'Suspicious — Caution',
      icon: AlertTriangle,
      summary: 'Multiple heuristic anomalies detected: young domain age and suspicious lexical patterns.',
    },
    MALICIOUS: {
      color: 'text-rose-700 dark:text-rose-400',
      borderColor: 'border-rose-200 dark:border-rose-800/60',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      strokeColor: '#e11d48',
      riskTier: 'High Risk',
      label: 'Malicious — Phishing',
      icon: AlertOctagon,
      summary: 'Active credential spoofing or deceptive signature detected across threat intelligence feeds.',
    },
  }[level];

  const Icon = config.icon;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 flex flex-col items-center justify-between h-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs font-sans transition-colors">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Threat Assessment</span>
        <span className={`font-semibold ${config.color}`}>{config.riskTier}</span>
      </div>

      {/* Main Gauge Visual */}
      <div className="relative my-6 flex items-center justify-center">
        <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 140 140">
          {/* Background Rail */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="9"
            fill="transparent"
            className="stroke-slate-100 dark:stroke-slate-700/60"
          />
          {/* Active Metric Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={config.strokeColor}
            strokeWidth="9"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center justify-center">
          <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            {score}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            score / 100
          </span>
        </div>
      </div>

      {/* Verdict Strip */}
      <div className="w-full space-y-3 text-center">
        <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} flex items-center justify-center gap-2`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed text-left">
          {config.summary}
        </p>

        {/* Micro Scale Bar */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 text-xs font-medium">
          <div className={`py-1.5 px-2 rounded-md border text-center transition-colors ${score <= 30 ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'}`}>
            0-30 Safe
          </div>
          <div className={`py-1.5 px-2 rounded-md border text-center transition-colors ${score > 30 && score < 70 ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'}`}>
            31-69 Caution
          </div>
          <div className={`py-1.5 px-2 rounded-md border text-center transition-colors ${score >= 70 ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'}`}>
            70-100 Danger
          </div>
        </div>
      </div>
    </div>
  );
}
