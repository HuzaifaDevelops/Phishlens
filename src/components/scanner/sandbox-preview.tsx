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
    <div className="rounded-xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Browser Chrome Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="text-[11px] font-mono text-slate-400 ml-2">Headless Chromium Sandbox</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-mono"
          >
            Zero-Trust Isolation
          </Badge>
          <span className="text-[10px] font-mono text-slate-500">JS/Cookies Blocked</span>
        </div>
      </div>

      {/* Simulated Address Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-white/5 flex items-center gap-2 font-mono text-xs">
        {isMalicious ? (
          <Unlock className="h-3.5 w-3.5 text-rose-400 shrink-0" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        )}
        <span className="text-slate-300 truncate">{url}</span>
      </div>

      {/* Simulated Sandbox Page Viewport */}
      <div className="relative min-h-[220px] bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Isolated Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
          <span className="text-7xl font-extrabold font-mono uppercase text-white tracking-widest -rotate-12">
            SANDBOXED
          </span>
        </div>

        {isMalicious ? (
          <div className="relative z-10 max-w-md space-y-3 p-4 rounded-xl border border-rose-500/30 bg-slate-950/90 shadow-xl">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Deceptive Credential Form Captured</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target page renders a fake {brand || 'account'} authentication portal requesting:
              <br />
              <span className="font-mono text-rose-300 bg-rose-950/50 px-1 rounded">
                &lt;input type=&quot;email&quot;&gt;
              </span>{' '}
              and{' '}
              <span className="font-mono text-rose-300 bg-rose-950/50 px-1 rounded">
                &lt;input type=&quot;password&quot;&gt;
              </span>
            </p>
            <div className="pt-1 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-2">
              <Terminal className="h-3 w-3 text-cyan-400" />
              <span>DOM Elements: 14 | Form Actions: External Endpoint</span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-md space-y-2 p-4 rounded-xl border border-emerald-500/20 bg-slate-950/90 shadow-xl">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
              <Shield className="h-4 w-4" />
              <span>Authentic Web Service Verified</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Page matches verified enterprise signature. No malicious inline payloads or deceptive
              overlay frames discovered.
            </p>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Render engine: Chromium 128 (Secure Sandbox Mode)
        </span>
        <span>Screen: 1280x800 @ 1x</span>
      </div>
    </div>
  );
}
