'use client';

import React from 'react';
import { RedirectHop } from '@/lib/types';
import { ArrowRight, Globe, CornerDownRight, Server, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RedirectChainProps {
  hops: RedirectHop[];
}

export function RedirectChain({ hops }: RedirectChainProps) {
  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Detected hops: {hops.length}</span>
        <span>
          {hops.length > 1
            ? '⚠️ Link uses redirection (Shortener or Obfuscation)'
            : '✓ Direct connection without hops'}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {hops.map((hop, index) => {
          const isFinal = index === hops.length - 1;
          const isRedirect = hop.statusCode >= 300 && hop.statusCode < 400;

          return (
            <div key={hop.hopNumber} className="relative flex flex-col">
              <div
                className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isFinal
                    ? 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold border ${
                      isFinal
                        ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    #{hop.hopNumber}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate font-sans">
                        {hop.domain}
                      </span>
                      {isFinal && (
                        <Badge variant="outline" className="border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-sans">
                          Final destination
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
                      {hop.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center text-xs">
                  {hop.ip && (
                    <span className="hidden md:inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 font-mono text-xs">
                      <Server className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                      {hop.ip}
                    </span>
                  )}

                  <Badge
                    variant="outline"
                    className={`${
                      isRedirect
                        ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    } text-xs font-sans`}
                  >
                    HTTP {hop.statusCode} {isRedirect ? 'Redirect' : 'OK'}
                  </Badge>
                </div>
              </div>

              {!isFinal && (
                <div className="flex justify-center my-0.5 text-slate-400 dark:text-slate-600">
                  <CornerDownRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
