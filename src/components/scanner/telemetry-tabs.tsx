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
    <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-slate-100 shadow-xs rounded-xl transition-colors">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
              <Database className="h-4 w-4 text-indigo-600 dark:text-sky-400" />
              Technical evidence & telemetry
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Live automated diagnostics collected from DNS, WHOIS, TLS, DOM sandbox, and threat feeds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans text-xs">
              Protocol: HTTP / HTTPS
            </Badge>
            <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans text-xs">
              Sandboxed
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="heuristics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-100 dark:bg-slate-800/90 p-1 border border-slate-200 dark:border-slate-700 rounded-lg">
            <TabsTrigger value="heuristics" className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1220] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-xs">
              Heuristics ({scan.heuristics.length})
            </TabsTrigger>
            <TabsTrigger value="sandbox" className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1220] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-xs flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              Sandbox preview
            </TabsTrigger>
            <TabsTrigger value="whois" className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1220] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-xs">
              WHOIS & age
            </TabsTrigger>
            <TabsTrigger value="ssl" className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1220] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-xs">
              SSL / TLS
            </TabsTrigger>
            <TabsTrigger value="redirects" className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1220] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-xs">
              Redirects ({scan.redirectChain.length})
            </TabsTrigger>
            <TabsTrigger value="feeds" className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1220] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-xs">
              Threat feeds
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
              <div className="text-xs text-slate-500 dark:text-slate-400 font-sans flex items-center justify-between">
                <span>Rule engine score contributions:</span>
                <span>Max penalty: 100 pts</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {scan.heuristics.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      item.status === 'failed'
                        ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20'
                        : item.status === 'warning'
                        ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20'
                        : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {item.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      {item.status === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      {item.status === 'passed' && (
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white font-sans">{item.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">{item.description}</div>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center font-mono text-xs">
                      {item.scoreImpact > 0 ? (
                        <span className="text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          +{item.scoreImpact} pts
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
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
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-slate-500 dark:text-slate-400">Domain age</span>
                  <Badge
                    variant="outline"
                    className={`${
                      scan.whois.domainAgeDays < 30
                        ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40'
                        : 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                    } text-xs font-sans`}
                  >
                    {scan.whois.domainAgeDays} days old
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
                  {scan.whois.domainAgeDays}{' '}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-sans">days active</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  {scan.whois.domainAgeDays < 30
                    ? '⚠️ Domains registered within the last 30 days account for over 85% of malicious credential-harvesting attacks.'
                    : '✓ Domain possesses an established historical age footprint.'}
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Target domain:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-medium">{scan.whois.domain}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Registrar:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-sans">{scan.whois.registrar}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Creation date:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{scan.whois.creationDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Expiry date:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{scan.whois.expiryDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Registrant country:</span>
                  <span className="text-indigo-600 dark:text-sky-400 font-sans font-medium">{scan.whois.registrantCountry}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: SSL / TLS */}
          <TabsContent value="ssl" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-slate-500 dark:text-slate-400">TLS status</span>
                  <Badge
                    variant="outline"
                    className={`${
                      scan.ssl.isValid
                        ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40'
                    } text-xs font-sans`}
                  >
                    {scan.ssl.isValid ? 'Valid certificate' : 'Missing / Insecure'}
                  </Badge>
                </div>
                <div className="text-base font-semibold text-slate-900 dark:text-white font-sans">
                  {scan.ssl.issuer}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Note: A valid padlock does not guarantee safety. Over 70% of phishing sites today use free automated SSL certificates (e.g. Let&apos;s Encrypt) to deceptively show a green padlock.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Valid from:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{scan.ssl.validFrom}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Valid until:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{scan.ssl.validTo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Days remaining:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-sans">{scan.ssl.daysRemaining} days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Self-signed:</span>
                  <span className={scan.ssl.isSelfSigned ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                    {scan.ssl.isSelfSigned ? 'Yes (Warning)' : 'No (Trusted CA)'}
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
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Real-time synchronization with industry threat databases:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scan.threatFeeds.map((feed, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border flex flex-col justify-between gap-2 ${
                    feed.detected
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white font-sans">{feed.source}</span>
                    <Badge
                      variant="outline"
                      className={`${
                        feed.detected
                          ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40'
                          : 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                      } text-xs font-sans`}
                    >
                      {feed.detected ? 'Detection' : 'Clean'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
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
