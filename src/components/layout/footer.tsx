import React from 'react';
import { Shield, Lock } from 'lucide-react';
import Image from 'next/image';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] text-slate-500 dark:text-slate-400 py-10 mt-16 font-sans text-xs transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Image src={logo} alt="PhishLens" width={36} height={36} className="rounded" />
              <span className="font-semibold text-slate-900 dark:text-white text-sm">PhishLens</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Automated heuristic telemetry, DNS/WHOIS/TLS handshake analysis, and Explainable AI
              synthesis to deconstruct phishing vectors in plain English.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-sky-400" /> SSRF Sandboxed
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Isolated Resolvers
              </span>
            </div>
          </div>

          {/* Col 2: Security Notice (Specifications block cut as requested) */}
          <div className="md:col-span-2 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white text-xs">Security notice</div>
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Target inspections are executed through isolated DNS sandbox resolvers without
              disclosing client identity or executing untrusted client scripts.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            PhishLens — Web Technologies Capstone. Built with Next.js 16, Tailwind CSS, MySQL &amp; Prisma.
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} PhishLens
          </div>
        </div>
      </div>
    </footer>
  );
}
