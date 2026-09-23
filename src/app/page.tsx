'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { UrlScannerForm } from '@/components/scanner/url-scanner-form';
import { RiskMeter } from '@/components/scanner/risk-meter';
import { AIAnalystCard } from '@/components/scanner/ai-analyst-card';
import { TelemetryTabs } from '@/components/scanner/telemetry-tabs';
import { MOCK_SCANS } from '@/lib/mock-data';
import { ScanResult } from '@/lib/types';
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
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Investigation query rejected by security controls.');
        // Fallback to preset if available so user is never stuck
        if (presetKey && MOCK_SCANS[presetKey]) {
          setCurrentScan({ ...MOCK_SCANS[presetKey], inputUrl: url });
        }
        return;
      }

      setCurrentScan(data);
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
    <div className="min-h-screen flex flex-col bg-[#07090d] text-[#e6edf3] selection:bg-[#388bfd]/30 selection:text-[#58a6ff] tactical-grid relative">
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* HERO OPERATIONS SECTION */}
        <section className="relative pt-12 pb-8 md:pt-16 md:pb-12 border-b border-white/[0.06]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-5">
            {/* Tactical Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/[0.12] bg-[#0c1017] text-[#8b949e] text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
              <span className="text-[#c9d1d9] font-bold">OPERATIONAL_STATION // XAI_URL_DIAGNOSTICS</span>
            </div>

            {/* Authoritative Space Grotesk Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-4xl mx-auto font-heading leading-tight">
              Deconstruct Phishing Schemes with{' '}
              <span className="text-[#58a6ff] underline decoration-[#388bfd]/50">
                Explainable Intelligence
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm md:text-base text-[#8b949e] max-w-2xl mx-auto leading-relaxed font-sans">
              Replace opaque blocklists with transparent forensic reasoning. PhishLens evaluates DNS,
              WHOIS, TLS certificates, and HTTP redirection chains to explain security verdicts in plain English.
            </p>

            {/* URL Input Form */}
            <div className="pt-2 max-w-3xl mx-auto">
              <UrlScannerForm onScan={handleStartScan} isLoading={isScanning} />
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="max-w-2xl mx-auto p-3.5 rounded border border-[#f85149]/40 bg-[#f85149]/10 text-left flex items-start gap-2.5 font-mono text-xs text-[#f85149]">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase">SECURITY_INSPECTION_ALERT</div>
                  <div className="text-[#e6edf3] text-xs font-sans mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ACTIVE SCANNING STATE */}
        {isScanning && (
          <section className="container mx-auto max-w-2xl px-4 py-12 text-center space-y-4">
            <div className="p-6 rounded border border-[#388bfd]/30 bg-[#0c1017] shadow-2xl font-mono text-xs space-y-4">
              <div className="flex items-center justify-center gap-2 text-[#58a6ff]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-bold uppercase">DIAGNOSTIC_PROBE_ACTIVE</span>
              </div>
              <div className="text-sm font-bold text-white truncate max-w-md mx-auto">
                {targetUrl}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#8b949e] text-left pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] animate-pulse" />
                  <span>DNS & SSRF Resolution</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
                  <span>TLS X.509 Handshake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d29922] animate-pulse" />
                  <span>ICANN RDAP Age Query</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a371f7] animate-pulse" />
                  <span>Heuristics & AI Synthesis</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* INCIDENT DOSSIER / SCAN RESULTS */}
        {currentScan && !isScanning && (
          <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
            {/* Target Telemetry Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3.5 rounded border border-white/[0.08] bg-[#0c1017] font-mono">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-white/[0.08] bg-[#161b22] text-[#58a6ff]">
                  <Terminal className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
                    <span>TARGET_RECORD:</span>
                    <span>{currentScan.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
                  </div>
                  <div className="text-sm font-semibold text-white truncate max-w-xl">
                    {currentScan.inputUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded border border-white/[0.08] bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-[#3fb950]" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>COPY_URI</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded border border-white/[0.08] bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="h-3 w-3" />
                  <span>EXPORT_DOSSIER</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScan(null)}
                  className="px-3 py-1.5 rounded border border-[#388bfd]/50 bg-[#388bfd] hover:bg-[#1f6feb] text-white font-bold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>NEW_TARGET</span>
                </button>
              </div>
            </div>

            {/* 2-Column Executive Assessment Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Calibrated Threat Index */}
              <div className="lg:col-span-5">
                <RiskMeter score={currentScan.riskScore} level={currentScan.riskLevel} />
              </div>

              {/* Right Column: AI Intelligence Briefing Dossier */}
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
