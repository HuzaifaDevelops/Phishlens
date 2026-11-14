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
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-sans font-semibold text-slate-900 dark:text-slate-200">
          <Layers className="h-4 w-4 text-indigo-600 dark:text-sky-400" />
          <span>URL structure breakdown</span>
        </div>
        <span className="text-xs font-sans text-slate-500 dark:text-slate-400">Lexical analysis</span>
      </div>

      {/* Visual Chunk Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs">
        {/* Protocol */}
        <span
          className={`px-2 py-1 rounded border ${
            isHttp
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
          }`}
          title={isHttp ? 'Insecure plain HTTP protocol' : 'Encrypted HTTPS protocol'}
        >
          {protocol}//
        </span>

        {/* Subdomains */}
        {subdomains && (
          <span
            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
            title="Subdomain hierarchy"
          >
            {subdomains}.
          </span>
        )}

        {/* Core Domain / Brand Target */}
        <span
          className={`px-2 py-1 rounded font-bold border ${
            isTyposquat
              ? 'border-rose-400 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              : 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
          }`}
          title={isTyposquat ? 'Potential typosquatting / homograph substitution' : 'Apex domain name'}
        >
          {domainCore}
        </span>

        {/* TLD */}
        <span
          className={`px-2 py-1 rounded border ${
            isSuspiciousTld
              ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
              : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
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
                ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
            }`}
            title="Endpoint path & query parameters"
          >
            {pathname}{search}
          </span>
        )}
      </div>

      {/* Lexical Observations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isHttp ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <span>Protocol: {isHttp ? 'Unencrypted (HTTP)' : 'Encrypted (HTTPS)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isTyposquat ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <span>Pattern: {isTyposquat ? 'Spoof resemblance flagged' : 'Standard'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isSuspiciousTld ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span>TLD status: {isSuspiciousTld ? 'Elevated abuse rate' : 'Standard'}</span>
        </div>
      </div>
    </div>
  );
}
