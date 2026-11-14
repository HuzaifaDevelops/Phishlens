'use client';

import React from 'react';
import { Eye, Shield, Lock, Unlock, AlertTriangle, Terminal, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SandboxPreviewProps {
  url: string;
  isMalicious: boolean;
  brand?: string;
}

export function SandboxPreview({ url, isMalicious, brand }: SandboxPreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
      {/* Browser Chrome Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs font-sans text-slate-600 dark:text-slate-400 ml-2">Headless browser sandbox</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-sans"
          >
            Isolated execution
          </Badge>
          <span className="text-xs font-sans text-slate-500 dark:text-slate-400 hidden sm:inline">Scripts blocked</span>
        </div>
      </div>

      {/* Address Bar */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 font-mono text-xs">
        {isMalicious ? (
          <Unlock className="h-3.5 w-3.5 text-rose-500 shrink-0" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        )}
        <span className="text-slate-700 dark:text-slate-300 truncate">{url}</span>
      </div>

      {/* Viewport */}
      <div className="relative min-h-[200px] bg-slate-50/60 dark:bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center">
        {isMalicious ? (
          <div className="relative z-10 max-w-md space-y-3 p-5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-950 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm font-sans">
              <AlertTriangle className="h-4 w-4" />
              <span>Deceptive credential form captured</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              Target page renders a deceptive {brand || 'account'} authentication portal requesting:
              <br />
              <span className="font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1 rounded border border-rose-200 dark:border-rose-900">
                &lt;input type=&quot;email&quot;&gt;
              </span>{' '}
              and{' '}
              <span className="font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1 rounded border border-rose-200 dark:border-rose-900">
                &lt;input type=&quot;password&quot;&gt;
              </span>
            </p>
            <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 font-sans flex items-center justify-center gap-2">
              <span>DOM elements: 14 | Form actions: External endpoint</span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-md space-y-2 p-5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-950 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm font-sans">
              <Shield className="h-4 w-4" />
              <span>Authentic web service verified</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              Page matches verified legitimate signature. No malicious inline payloads or deceptive
              overlay frames discovered.
            </p>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-sans text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Render engine: Headless Chromium Sandbox
        </span>
        <span className="font-mono text-xs text-slate-500">1280x800</span>
      </div>
    </div>
  );
}
