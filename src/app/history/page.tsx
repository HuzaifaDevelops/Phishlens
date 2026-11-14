import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getRecentScans } from '@/server/db/scan-service';
import { getSessionUser } from '@/server/auth/session';
import { Terminal, Shield, ArrowUpRight, ArrowLeft, Database, Clock, UserCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const sessionUser = await getSessionUser();
  const visitorId = cookieStore.get('phishlens_visitor_id')?.value;

  // If user is authenticated, query all scans tied to their account across all sessions
  // Otherwise, filter by their local browser visitorId
  const scans = sessionUser
    ? await getRecentScans(50, undefined, sessionUser.id)
    : visitorId
    ? await getRecentScans(50, visitorId)
    : [];

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
            <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-sky-400" />
            <span>Audit log records</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-1 font-sans">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Incident Registry
            </h1>
            {sessionUser && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <UserCheck className="h-3 w-3" />
                {sessionUser.name || sessionUser.email}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {sessionUser
              ? 'Synchronized incident registry for your authenticated account.'
              : 'Persistent records of your browser session investigations (up to 10 free scans without an account).'}
          </p>
        </div>

        {/* Scan Log Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] shadow-xs overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-sans">
            <span>Indexed investigations: {scans.length}</span>
            <span>{sessionUser ? 'Unlimited Account Tier' : 'Guest Tier (Max 10 Free Scans)'}</span>
          </div>

          {scans.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3 font-sans">
              <Clock className="h-8 w-8 text-indigo-600 dark:text-sky-400 mx-auto opacity-50" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No records found yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Scanned URLs will automatically persist here.
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 font-medium transition-colors"
              >
                Start first scan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {scans.map((scan) => {
                const isMal = scan.riskLevel === 'MALICIOUS';
                const isSusp = scan.riskLevel === 'SUSPICIOUS';

                return (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="group p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <div
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border shrink-0 font-sans ${
                          isMal
                            ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            : isSusp
                            ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                            : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {scan.riskScore} · {scan.riskLevel}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-medium font-mono text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors">
                          {scan.inputUrl}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-sans">
                          <span>{scan.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
                          {scan.aiAnalysis.impersonatedBrand && (
                            <>
                              <span>•</span>
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                Mimics {scan.aiAnalysis.impersonatedBrand}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0 text-xs text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-sky-400 font-sans font-medium transition-colors">
                      <span>View dossier</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
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
