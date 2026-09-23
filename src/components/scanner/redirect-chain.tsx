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
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Detected Hops: {hops.length}</span>
        <span>
          {hops.length > 1
            ? '⚠️ Link uses redirection (Shortener or Obfuscation)'
            : '✓ Direct connection without hops'}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {hops.map((hop, index) => {
          const isFinal = index === hops.length - 1;
          const isRedirect = hop.statusCode >= 300 && hop.statusCode < 400;

          return (
            <div key={hop.hopNumber} className="relative flex flex-col">
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isFinal
                    ? 'border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold border ${
                      isFinal
                        ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                        : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    #{hop.hopNumber}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate">
                        {hop.domain}
                      </span>
                      {isFinal && (
                        <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-[10px]">
                          Final Destination
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate font-mono mt-0.5">
                      {hop.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono text-xs">
                  {hop.ip && (
                    <span className="hidden md:inline-flex items-center gap-1 text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-white/5">
                      <Server className="h-3 w-3 text-slate-500" />
                      {hop.ip}
                    </span>
                  )}

                  <Badge
                    variant="outline"
                    className={`${
                      isRedirect
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    HTTP {hop.statusCode} {isRedirect ? 'Redirect' : 'OK'}
                  </Badge>
                </div>
              </div>

              {!isFinal && (
                <div className="flex justify-center my-1 text-slate-600">
                  <CornerDownRight className="h-4 w-4 animate-bounce text-cyan-500/70" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
