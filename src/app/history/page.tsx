import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getRecentScans } from '@/server/db/scan-service';
import { Terminal, Shield, ArrowUpRight, ArrowLeft, Database, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const scans = await getRecentScans(50);

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
            <Database className="h-3.5 w-3.5 text-[#58a6ff]" />
            <span>MYSQL_AUDIT_LOGS // RECENT_SCANS</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-1 font-mono">
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
            Historical Incident Audit Registry
          </h1>
          <p className="text-xs text-[#8b949e]">
            Persistent database records of previous URL threat investigations, RFC diagnostics, and explainable verdicts.
          </p>
        </div>

        {/* Scan Log Table */}
        <div className="rounded border border-white/[0.08] bg-[#0c1017] overflow-hidden">
          <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between font-mono text-xs text-[#8b949e]">
            <span>INDEXED_ENTRIES: {scans.length}</span>
            <span>AUTO_PURGE_TTL: 30_DAYS</span>
          </div>

          {scans.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-[#8b949e] space-y-3">
              <Clock className="h-8 w-8 text-[#58a6ff] mx-auto opacity-50" />
              <p>NO_RECORDS_INDEXED_YET</p>
              <p className="text-[11px] text-[#484f58]">
                Scanned URLs will automatically persist here once the MySQL container is active.
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-3 py-1.5 rounded border border-[#388bfd]/50 bg-[#388bfd] text-white font-bold"
              >
                EXECUTE_FIRST_SCAN
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {scans.map((scan) => {
                const isMal = scan.riskLevel === 'MALICIOUS';
                const isSusp = scan.riskLevel === 'SUSPICIOUS';

                return (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="group p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#161b22]/50 transition-colors font-mono"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <div
                        className={`px-2 py-1 rounded text-xs font-bold border shrink-0 ${
                          isMal
                            ? 'border-[#f85149]/50 bg-[#f85149]/10 text-[#f85149]'
                            : isSusp
                            ? 'border-[#d29922]/50 bg-[#d29922]/10 text-[#d29922]'
                            : 'border-[#238636]/50 bg-[#238636]/10 text-[#3fb950]'
                        }`}
                      >
                        {scan.riskScore}/100 {scan.riskLevel}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-[#58a6ff] transition-colors truncate max-w-lg">
                          {scan.inputUrl}
                        </div>
                        <div className="text-[11px] text-[#8b949e] flex items-center gap-2 mt-0.5">
                          <span>{scan.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
                          {scan.aiAnalysis.impersonatedBrand && (
                            <>
                              <span>•</span>
                              <span className="text-[#f85149]">
                                Mimics {scan.aiAnalysis.impersonatedBrand}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs text-[#8b949e] group-hover:text-white transition-colors">
                      <span>INSPECT_DOSSIER</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#58a6ff]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
