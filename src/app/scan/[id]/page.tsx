import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RiskMeter } from '@/components/scanner/risk-meter';
import { AIAnalystCard } from '@/components/scanner/ai-analyst-card';
import { TelemetryTabs } from '@/components/scanner/telemetry-tabs';
import { getScanRecordById } from '@/server/db/scan-service';
import { Terminal, ArrowLeft, Calendar, FileText } from 'lucide-react';

interface ScanDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ScanDetailPage({ params }: ScanDetailPageProps) {
  const { id } = await params;
  const scan = await getScanRecordById(id);

  if (!scan) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090d] text-[#e6edf3] selection:bg-[#388bfd]/30 selection:text-[#58a6ff] tactical-grid relative">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between font-mono text-xs text-[#8b949e]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>[ RETURN_TO_SCANNER ]</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
            <span>ARCHIVED_RECORD // PERMALINK_VERIFIED</span>
          </div>
        </div>

        {/* Target Telemetry Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3.5 rounded border border-white/[0.08] bg-[#0c1017] font-mono">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-white/[0.08] bg-[#161b22] text-[#58a6ff]">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
                <span>ARCHIVE_ID: {scan.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {scan.timestamp.slice(0, 19).replace('T', ' ')} UTC
                </span>
              </div>
              <div className="text-sm font-semibold text-white truncate max-w-xl">
                {scan.inputUrl}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="px-3 py-1.5 rounded border border-[#388bfd]/50 bg-[#388bfd] hover:bg-[#1f6feb] text-white font-bold text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <span>NEW_INVESTIGATION</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Executive Assessment Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <RiskMeter score={scan.riskScore} level={scan.riskLevel} />
          </div>
          <div className="lg:col-span-7">
            <AIAnalystCard
              analysis={scan.aiAnalysis}
              isMalicious={scan.riskLevel === 'MALICIOUS'}
            />
          </div>
        </div>

        {/* Technical Telemetry Inspector */}
        <TelemetryTabs scan={scan} />
      </main>

      <Footer />
    </div>
  );
}
