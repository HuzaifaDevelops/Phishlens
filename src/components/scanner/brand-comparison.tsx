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
    <div className="p-4 rounded-xl border border-rose-500/20 bg-slate-950/70 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
            Brand Impersonation Differential Analysis
          </span>
        </div>
        <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-300 text-[10px] font-mono">
          High-Confidence Spoof Match
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real Brand Card */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="h-4 w-4" /> AUTHENTIC BRAND
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
              Verified
            </Badge>
          </div>
          <div className="text-sm font-bold text-white">{impersonatedBrand}</div>

          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-slate-500 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Official Host:
              </span>
              <span className="text-emerald-300 font-semibold">{realData.officialDomain}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Domain Age:
              </span>
              <span className="text-slate-200">{realData.ageYears}+ Years Active</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Lock className="h-3 w-3" /> SSL Security:
              </span>
              <span className="text-slate-200 truncate max-w-[150px]">{realData.sslIssuer}</span>
            </div>
          </div>
        </div>

        {/* Fake Imposter Card */}
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="h-4 w-4" /> DETECTED IMPOSTER
            </span>
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px]">
              Fraudulent
            </Badge>
          </div>
          <div className="text-sm font-bold text-rose-200 truncate">{fakeDomain}</div>

          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-slate-500 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Spoofed Host:
              </span>
              <span className="text-rose-400 font-bold underline decoration-rose-500">{fakeDomain}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Domain Age:
              </span>
              <span className="text-rose-400 font-bold">{fakeAgeDays} Days Old (High Risk)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Lock className="h-3 w-3" /> SSL Security:
              </span>
              <span className="text-rose-300 truncate max-w-[150px]">{fakeSsl}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
