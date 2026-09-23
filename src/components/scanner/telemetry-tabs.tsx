'use client';

import React from 'react';
import { ScanResult } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RedirectChain } from './redirect-chain';
import { UrlBreakdown } from './url-breakdown';
import { BrandComparison } from './brand-comparison';
import { SandboxPreview } from './sandbox-preview';
import {
  ShieldAlert,
  Calendar,
  Lock,
  Globe,
  Database,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Radio,
  Eye,
  Layers,
} from 'lucide-react';

interface TelemetryTabsProps {
  scan: ScanResult;
}

export function TelemetryTabs({ scan }: TelemetryTabsProps) {
  const isMalicious = scan.riskLevel === 'MALICIOUS';

  return (
    <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-2xl">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              Technical Telemetry & Evidence Inspector
            </CardTitle>
            <p className="text-xs text-slate-400">
              Live automated diagnostics collected from DNS, WHOIS, TLS, DOM Sandbox, and Threat DBs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-[10px]">
              RFC-compliant Probes
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
              Zero-Trust Isolated
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="heuristics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-950/70 p-1 border border-white/5 rounded-xl">
            <TabsTrigger value="heuristics" className="text-xs font-mono">
              Heuristics ({scan.heuristics.length})
            </TabsTrigger>
            <TabsTrigger value="sandbox" className="text-xs font-mono flex items-center gap-1">
              <Eye className="h-3 w-3 text-cyan-400" />
              Sandbox View
            </TabsTrigger>
            <TabsTrigger value="whois" className="text-xs font-mono">
              WHOIS & Age
            </TabsTrigger>
            <TabsTrigger value="ssl" className="text-xs font-mono">
              SSL / TLS
            </TabsTrigger>
            <TabsTrigger value="redirects" className="text-xs font-mono">
              Redirects ({scan.redirectChain.length})
            </TabsTrigger>
            <TabsTrigger value="feeds" className="text-xs font-mono">
              Threat Feeds
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: HEURISTICS BREAKDOWN & URL DECOMPOSITION */}
          <TabsContent value="heuristics" className="mt-4 space-y-4">
            {/* Interactive URL lexical breakdown */}
            <UrlBreakdown url={scan.finalUrl || scan.inputUrl} isMalicious={isMalicious} />

            {/* Impersonation Differential if detected */}
            {scan.aiAnalysis.impersonatedBrand && (
              <BrandComparison
                impersonatedBrand={scan.aiAnalysis.impersonatedBrand}
                fakeDomain={scan.whois.domain}
                fakeAgeDays={scan.whois.domainAgeDays}
                fakeSsl={scan.ssl.issuer}
              />
            )}

            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>Rule Engine Score Contributions:</span>
                <span>Max Penalty: 100 pts</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {scan.heuristics.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      item.status === 'failed'
                        ? 'border-rose-500/30 bg-rose-950/10'
                        : item.status === 'warning'
                        ? 'border-amber-500/30 bg-amber-950/10'
                        : 'border-emerald-500/20 bg-emerald-950/10'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {item.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      {item.status === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      {item.status === 'passed' && (
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-white">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.description}</div>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center font-mono text-xs">
                      {item.scoreImpact > 0 ? (
                        <span className="text-rose-400 font-bold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/20">
                          +{item.scoreImpact} pts
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                          0 pts (Clean)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: SANDBOX VIEW (HEADLESS BROWSER SCREENSHOT) */}
          <TabsContent value="sandbox" className="mt-4">
            <SandboxPreview
              url={scan.finalUrl || scan.inputUrl}
              isMalicious={isMalicious}
              brand={scan.aiAnalysis.impersonatedBrand}
            />
          </TabsContent>

          {/* TAB 3: WHOIS & DOMAIN AGE */}
          <TabsContent value="whois" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Domain Age</span>
                  <Badge
                    variant="outline"
                    className={`${
                      scan.whois.domainAgeDays < 30
                        ? 'border-rose-500/30 text-rose-400 bg-rose-950/20'
                        : 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                    }`}
                  >
                    {scan.whois.domainAgeDays} Days Old
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {scan.whois.domainAgeDays}{' '}
                  <span className="text-sm font-normal text-slate-400">days active</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {scan.whois.domainAgeDays < 30
                    ? '⚠️ Domains registered within the last 30 days account for over 85% of malicious credential-harvesting attacks.'
                    : '✓ Domain possesses an established historical age footprint.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/50 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Target Domain:</span>
                  <span className="text-white font-semibold">{scan.whois.domain}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Registrar:</span>
                  <span className="text-slate-200">{scan.whois.registrar}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Creation Date:</span>
                  <span className="text-slate-200">{scan.whois.creationDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Expiry Date:</span>
                  <span className="text-slate-200">{scan.whois.expiryDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Registrant Country:</span>
                  <span className="text-cyan-400 font-bold">{scan.whois.registrantCountry}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: SSL / TLS */}
          <TabsContent value="ssl" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">TLS Status</span>
                  <Badge
                    variant="outline"
                    className={`${
                      scan.ssl.isValid
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                        : 'border-rose-500/30 text-rose-400 bg-rose-950/20'
                    }`}
                  >
                    {scan.ssl.isValid ? 'Valid Certificate' : 'Missing / Insecure'}
                  </Badge>
                </div>
                <div className="text-lg font-semibold text-white">
                  {scan.ssl.issuer}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Note: A valid padlock does not guarantee safety. Over 70% of phishing sites today use free automated SSL certificates (e.g. Let&apos;s Encrypt) to deceptively show a green padlock.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/50 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Valid From:</span>
                  <span className="text-slate-200">{scan.ssl.validFrom}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Valid Until:</span>
                  <span className="text-slate-200">{scan.ssl.validTo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Days Remaining:</span>
                  <span className="text-slate-200">{scan.ssl.daysRemaining} days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Self-Signed:</span>
                  <span className={scan.ssl.isSelfSigned ? 'text-rose-400' : 'text-emerald-400'}>
                    {scan.ssl.isSelfSigned ? 'YES (Warning)' : 'NO (Trusted CA)'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: REDIRECT CHAIN */}
          <TabsContent value="redirects" className="mt-4">
            <RedirectChain hops={scan.redirectChain} />
          </TabsContent>

          {/* TAB 6: THREAT FEEDS */}
          <TabsContent value="feeds" className="mt-4 space-y-3">
            <div className="text-xs text-slate-400 font-mono">
              Real-time synchronization with industry threat databases:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scan.threatFeeds.map((feed, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                    feed.detected
                      ? 'border-rose-500/30 bg-rose-950/10'
                      : 'border-white/5 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{feed.source}</span>
                    <Badge
                      variant="outline"
                      className={`${
                        feed.detected
                          ? 'border-rose-500/30 text-rose-400 bg-rose-950/30'
                          : 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                      } text-[10px] font-mono`}
                    >
                      {feed.detected ? 'DETECTION' : 'CLEAN'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {feed.details}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
