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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1220] text-slate-900 dark:text-slate-200 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-sky-950 dark:selection:text-sky-300 relative transition-colors">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-sans">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-sky-400 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to scanner</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Archived record</span>
          </div>
        </div>

        {/* Target Telemetry Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] shadow-xs font-sans transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-sky-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Record ID: <span className="font-mono">{scan.id}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {scan.timestamp.slice(0, 19).replace('T', ' ')} UTC
                </span>
              </div>
              <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white truncate max-w-xl mt-0.5">
                {scan.inputUrl}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 font-medium text-xs font-sans transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>New scan</span>
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
