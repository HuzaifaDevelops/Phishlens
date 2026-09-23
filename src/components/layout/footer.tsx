import React from 'react';
import { Terminal, Shield, Lock, FileCode } from 'lucide-react';
import Image from 'next/image';
import logo from "@/assets/logo.png"

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#07090d] text-[#8b949e] py-10 mt-16 font-mono text-xs">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <Image src={logo} alt='Phishlens' width={40} height={40}/> 
            </div>
            <p className="text-xs text-[#8b949e] max-w-md leading-relaxed font-sans">
              Tactical cybersecurity intelligence system combining deterministic rule heuristics,
              DNS/WHOIS/TLS handshake telemetry, and Explainable AI (XAI) synthesis to deconstruct
              phishing vectors in plain English.
            </p>
            <div className="flex items-center gap-4 text-[11px] pt-1 text-[#8b949e]">
              <span className="flex items-center gap-1 text-[#58a6ff]">
                <Lock className="h-3 w-3" /> SSRF Sandboxed
              </span>
              <span className="flex items-center gap-1 text-[#3fb950]">
                <Shield className="h-3 w-3" /> Zero-Trust Proxied
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              [ SPECIFICATIONS ]
            </div>
            <ul className="space-y-1.5 text-xs text-[#8b949e]">
              <li>Next.js 16 (App Router)</li>
              <li>Tailwind CSS v4 Engine</li>
              <li>MySQL Audit Persistence</li>
              <li>Heuristic Rule Matrix</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              [ SECURITY NOTICE ]
            </div>
            <div className="p-3 rounded border border-white/[0.08] bg-[#0c1017] text-[11px] leading-relaxed">
              Target inspections are executed through isolated DNS sandbox resolvers without
              disclosing client identity or executing untrusted client scripts.
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8b949e]">
          <div>
            &copy; {new Date().getFullYear()} PhishLens Intelligence. 6th Semester Web Technologies Capstone.
          </div>
          <div className="flex items-center gap-4">
            <span>SHA-256 VERIFIED</span>
            <span>SYSTEM RUNTIME: 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
