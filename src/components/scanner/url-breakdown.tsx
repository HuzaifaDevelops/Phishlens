'use client';

import React from 'react';
import { Layers, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UrlBreakdownProps {
  url: string;
  isMalicious: boolean;
}

export function UrlBreakdown({ url, isMalicious }: UrlBreakdownProps) {
  let parsed: URL | null = null;
  try {
    parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
  } catch {
    parsed = null;
  }

  if (!parsed) return null;

  const protocol = parsed.protocol;
  const hostname = parsed.hostname;
  const pathname = parsed.pathname;
  const search = parsed.search;

  // Split hostname into parts
  const hostParts = hostname.split('.');
  const tld = hostParts.length > 1 ? `.${hostParts[hostParts.length - 1]}` : '';
  const domainCore = hostParts.length > 1 ? hostParts[hostParts.length - 2] : hostname;
  const subdomains = hostParts.slice(0, -2).join('.');

  const isHttp = protocol === 'http:';
  const isSuspiciousTld = ['.top', '.xyz', '.tk', '.ml', '.cc', '.buzz', '.cloud'].includes(tld);
  const isTyposquat = domainCore.includes('1') || domainCore.includes('0') || domainCore.includes('paypa');

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-slate-950/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Layers className="h-4 w-4" />
          <span>LEXICAL URL DECOMPOSITION</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">RFC 3986 Structure</span>
      </div>

      {/* Visual Chunk Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-lg bg-slate-900 border border-white/5 font-mono text-xs">
        {/* Protocol */}
        <span
          className={`px-2 py-1 rounded border ${
            isHttp
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
          title={isHttp ? 'Insecure plain HTTP protocol' : 'Encrypted HTTPS protocol'}
        >
          {protocol}//
        </span>

        {/* Subdomains */}
        {subdomains && (
          <span
            className="px-2 py-1 rounded border border-white/10 bg-white/5 text-slate-300"
            title="Subdomain hierarchy"
          >
            {subdomains}.
          </span>
        )}

        {/* Core Domain / Brand Target */}
        <span
          className={`px-2 py-1 rounded font-bold border ${
            isTyposquat
              ? 'border-rose-500/60 bg-rose-950/40 text-rose-300 animate-pulse'
              : 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
          }`}
          title={isTyposquat ? 'Potential typosquatting / homograph substitution' : 'Apex domain name'}
        >
          {domainCore}
        </span>

        {/* TLD */}
        <span
          className={`px-2 py-1 rounded border ${
            isSuspiciousTld
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-white/10 bg-white/5 text-slate-300'
          }`}
          title={isSuspiciousTld ? 'High-abuse Top-Level Domain' : 'Standard TLD'}
        >
          {tld}
        </span>

        {/* Path & Query */}
        {(pathname !== '/' || search) && (
          <span
            className={`px-2 py-1 rounded border ${
              pathname.includes('login') || pathname.includes('auth') || pathname.includes('verify')
                ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                : 'border-white/5 bg-slate-950 text-slate-400'
            }`}
            title="Endpoint path & query parameters"
          >
            {pathname}{search}
          </span>
        )}
      </div>

      {/* Lexical Observations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${isHttp ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          <span>Protocol: {isHttp ? 'Unencrypted (HTTP)' : 'Encrypted (HTTPS)'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${isTyposquat ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          <span>Heuristic: {isTyposquat ? 'Levenshtein Match' : 'Standard Lexical'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${isSuspiciousTld ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span>TLD Risk: {isSuspiciousTld ? 'Elevated Abuse Rate' : 'Standard'}</span>
        </div>
      </div>
    </div>
  );
}
