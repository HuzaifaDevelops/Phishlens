'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { UrlScannerForm } from '@/components/scanner/url-scanner-form';
import { RiskMeter } from '@/components/scanner/risk-meter';
import { AIAnalystCard } from '@/components/scanner/ai-analyst-card';
import { TelemetryTabs } from '@/components/scanner/telemetry-tabs';
import { MOCK_SCANS } from '@/lib/mock-data';
import { ScanResult } from '@/lib/types';
import { apiClient, getVisitorId } from '@/lib/visitor';
import {
  Terminal,
  Copy,
  Check,
  RefreshCw,
  FileDown,
  ShieldAlert,
  Loader2,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize and sync visitor session cookie on page load
  useEffect(() => {
    getVisitorId();
  }, []);

  // Trigger real backend scanning flow
  const handleStartScan = async (
    url: string,
    presetKey?: 'malicious' | 'suspicious' | 'safe'
  ) => {
    setTargetUrl(url);
    setIsScanning(true);
    setCurrentScan(null);
    setErrorMessage(null);

    try {
      const res = await apiClient.post('/api/scan', { url }, { validateStatus: () => true });

      if (res.status !== 200) {
        setErrorMessage(res.data?.message || 'Investigation query rejected by security controls.');
        if (res.data?.error === 'AUTH_REQUIRED') {
          // Trigger Auth Modal immediately on free scan limit exhaustion
          window.dispatchEvent(
            new CustomEvent('phishlens:open-auth', { detail: { tab: 'signup' } })
          );
        } else if (presetKey && MOCK_SCANS[presetKey]) {
          setCurrentScan({ ...MOCK_SCANS[presetKey], inputUrl: url });
        }
        return;
      }

      setCurrentScan(res.data);
      window.dispatchEvent(new CustomEvent('phishlens:refresh-quota'));
    } catch {
      if (presetKey && MOCK_SCANS[presetKey]) {
        setCurrentScan({ ...MOCK_SCANS[presetKey], inputUrl: url });
      } else {
        setErrorMessage('NETWORK_ERROR: Unable to communicate with live inspection daemon.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyLink = () => {
    if (currentScan) {
      navigator.clipboard.writeText(currentScan.inputUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1220] text-slate-900 dark:text-slate-200 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-sky-950 dark:selection:text-sky-300 relative transition-colors">
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-10 md:pt-16 md:pb-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1726] transition-colors">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-4">
            {/* Modern Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto font-sans leading-tight">
              PhishLens, know if a link is safe before you click it.
            </h1>

            {/* Subheading */}
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
              Checks DNS, WHOIS, TLS, redirects, and VirusTotal, then explains the verdict in plain English.
            </p>

            {/* URL Input Form */}
            <div className="pt-3 max-w-3xl mx-auto">
              <UrlScannerForm onScan={handleStartScan} isLoading={isScanning} />
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="max-w-2xl mx-auto p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-left flex items-start gap-3 font-sans text-xs text-rose-800 dark:text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div>
                  <div className="font-semibold text-rose-900 dark:text-rose-200">Security Alert</div>
                  <div className="text-rose-700 dark:text-rose-300 text-xs mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ACTIVE SCANNING STATE */}
        {isScanning && (
          <section className="container mx-auto max-w-2xl px-4 py-12 text-center space-y-4">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] shadow-sm font-sans text-xs space-y-4">
              <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-sky-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-semibold text-sm">Investigating target URL...</span>
              </div>
              <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white truncate max-w-md mx-auto">
                {targetUrl}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 text-left pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>DNS & SSRF Resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-sky-400 animate-pulse" />
                  <span>TLS X.509 Handshake</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>ICANN RDAP Age Query</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  <span>Heuristics & VirusTotal Check</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* INCIDENT DOSSIER / SCAN RESULTS */}
        {currentScan && !isScanning && (
          <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
            {/* Target Telemetry Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] shadow-xs font-sans transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-sky-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Target scanned</span>
                    <span>•</span>
                    <span>{currentScan.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
                  </div>
                  <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white truncate max-w-xl mt-0.5">
                    {currentScan.inputUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium font-sans transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium font-sans transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScan(null)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 font-medium text-xs font-sans transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>New scan</span>
                </button>
              </div>
            </div>

            {/* 2-Column Executive Assessment Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Risk Meter */}
              <div className="lg:col-span-5">
                <RiskMeter score={currentScan.riskScore} level={currentScan.riskLevel} />
              </div>

              {/* Right Column: AI Analysis Card */}
              <div className="lg:col-span-7">
                <AIAnalystCard
                  analysis={currentScan.aiAnalysis}
                  isMalicious={currentScan.riskLevel === 'MALICIOUS'}
                />
              </div>
            </div>

            {/* Deep Technical Telemetry Inspector */}
            <TelemetryTabs scan={currentScan} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
