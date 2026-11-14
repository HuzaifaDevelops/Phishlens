'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X, Building2, Calendar, Lock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BrandComparisonProps {
  impersonatedBrand: string;
  fakeDomain: string;
  fakeAgeDays: number;
  fakeSsl: string;
}

export function BrandComparison({
  impersonatedBrand,
  fakeDomain,
  fakeAgeDays,
  fakeSsl,
}: BrandComparisonProps) {
  // Preset data for recognized brands
  const brandData: Record<
    string,
    { officialDomain: string; ageYears: number; sslIssuer: string; status: string }
  > = {
    'PayPal Inc.': {
      officialDomain: 'paypal.com',
      ageYears: 26,
      sslIssuer: 'DigiCert High Assurance EV TLS CA-1',
      status: 'Authentic Financial Institution',
    },
    'Generic Cloud / Email Provider': {
      officialDomain: 'microsoft.com / google.com',
      ageYears: 28,
      sslIssuer: 'Enterprise Corporate CA',
      status: 'Verified Cloud Infrastructure',
    },
  };

  const realData = brandData[impersonatedBrand] || {
    officialDomain: 'official-brand.com',
    ageYears: 15,
    sslIssuer: 'Enterprise EV TLS CA',
    status: 'Verified Official Domain',
  };

  return (
    <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-slate-900 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-white font-sans">
            Brand impersonation differential analysis
          </span>
        </div>
        <Badge variant="outline" className="border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-sans">
          High confidence spoof match
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real Brand Card */}
        <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-sans">
              <ShieldCheck className="h-4 w-4" /> Authentic brand
            </span>
            <Badge className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs font-sans">
              Verified
            </Badge>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white font-sans">{impersonatedBrand}</div>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                <Globe className="h-3 w-3" /> Official host:
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 font-mono font-medium">{realData.officialDomain}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                <Calendar className="h-3 w-3" /> Domain age:
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-sans">{realData.ageYears}+ years active</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                <Lock className="h-3 w-3" /> SSL certificate:
              </span>
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px] font-sans">{realData.sslIssuer}</span>
            </div>
          </div>
        </div>

        {/* Fake Imposter Card */}
        <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-rose-950/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 font-sans">
              <ShieldAlert className="h-4 w-4" /> Detected imposter
            </span>
            <Badge className="bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-xs font-sans">
              Deceptive
            </Badge>
          </div>
          <div className="text-sm font-semibold text-rose-700 dark:text-rose-200 truncate font-mono">{fakeDomain}</div>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                <Globe className="h-3 w-3" /> Spoofed host:
              </span>
              <span className="text-rose-700 dark:text-rose-300 font-mono font-medium">{fakeDomain}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                <Calendar className="h-3 w-3" /> Domain age:
              </span>
              <span className="text-rose-700 dark:text-rose-300 font-sans">{fakeAgeDays} days old (High Risk)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                <Lock className="h-3 w-3" /> SSL certificate:
              </span>
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px] font-sans">{fakeSsl}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
