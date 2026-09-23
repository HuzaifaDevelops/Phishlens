'use client';

import React, { useState } from 'react';
import { Terminal, QrCode, ArrowRight, ShieldAlert, UploadCloud, CornerDownLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface UrlScannerFormProps {
  onScan: (url: string, presetKey?: 'malicious' | 'suspicious' | 'safe') => void;
  isLoading: boolean;
}

export function UrlScannerForm({ onScan, isLoading }: UrlScannerFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('SPECIFY_TARGET: Please enter a target URL or IP.');
      return;
    }
    setError(null);
    onScan(url);
  };

  const handleSelectSample = (sampleUrl: string, key: 'malicious' | 'suspicious' | 'safe') => {
    setUrl(sampleUrl);
    setError(null);
    onScan(sampleUrl, key);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <Tabs defaultValue="url" className="w-full">
        <div className="flex justify-between items-center mb-2 px-1">
          <TabsList className="bg-[#0c1017] border border-white/[0.08] p-0.5 rounded h-8">
            <TabsTrigger value="url" className="text-xs font-mono px-3 py-1 data-[state=active]:bg-[#161b22] data-[state=active]:text-white">
              [ TARGET_URI ]
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs font-mono px-3 py-1 data-[state=active]:bg-[#161b22] data-[state=active]:text-white">
              [ QUISHING_QR ]
            </TabsTrigger>
          </TabsList>

          <span className="text-[11px] font-mono text-[#8b949e] hidden sm:inline">
            PROTOCOL_FILTER: HTTP / HTTPS / RFC-3986
          </span>
        </div>

        {/* TAB 1: URL INPUT */}
        <TabsContent value="url" className="mt-0">
          <form onSubmit={handleSubmit} className="relative">
            <div className="corner-crosshair relative flex flex-col sm:flex-row items-stretch border border-white/[0.12] bg-[#0c1017] shadow-xl focus-within:border-[#388bfd] transition-colors rounded">
              <div className="relative flex-1 flex items-center px-3.5 py-2.5">
                <span className="font-mono text-[#58a6ff] text-sm mr-2 font-bold select-none">&gt;</span>
                <input
                  type="text"
                  placeholder="https://example-portal-auth.com/login"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-transparent text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none text-sm font-mono"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-3 sm:py-0 border-t sm:border-t-0 sm:border-l border-white/[0.12] bg-[#161b22] hover:bg-[#21262d] text-white font-mono text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>INIT_SCAN</span>
                <CornerDownLeft className="h-3.5 w-3.5 text-[#58a6ff]" />
              </button>
            </div>
            {error && (
              <p className="text-xs text-[#f85149] font-mono mt-2 ml-1 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" /> {error}
              </p>
            )}
          </form>
        </TabsContent>

        {/* TAB 2: QR CODE UPLOADER */}
        <TabsContent value="qr" className="mt-0">
          <div className="p-6 rounded border border-dashed border-white/[0.12] bg-[#0c1017] text-center space-y-3 hover:border-white/20 transition-colors">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded border border-white/[0.08] bg-[#161b22] text-[#8b949e]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-white">
                EXTRACT_QR_PAYLOAD (QUISHING DEFENSE)
              </p>
              <p className="text-xs text-[#8b949e] mt-1 font-mono">
                Decodes physical stickers and deceptive PDF authentication QR matrixes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectSample('http://paypa1-security-verification.top/login.php', 'malicious')}
              className="text-xs font-mono border border-white/[0.12] bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] px-3 py-1.5 rounded cursor-pointer transition-colors"
            >
              [ Load Quishing Test Vector ]
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {/* QUICK PRESET CHIPS */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
        <span className="text-[#8b949e] text-[11px]">BENCHMARK_TARGETS:</span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleSelectSample('http://paypa1-security-verification.top/login.php', 'malicious')
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#f85149]/30 bg-[#f85149]/10 text-[#f85149] hover:bg-[#f85149]/20 transition-colors cursor-pointer text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#f85149]" />
            CRITICAL: PayPal Spoof
          </button>

          <button
            type="button"
            onClick={() =>
              handleSelectSample('https://verify-account-update2026.cloud/auth', 'suspicious')
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#d29922]/30 bg-[#d29922]/10 text-[#d29922] hover:bg-[#d29922]/20 transition-colors cursor-pointer text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#d29922]" />
            WARN: Fresh Cloud Domain
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('https://github.com/explore', 'safe')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#238636]/40 bg-[#238636]/10 text-[#3fb950] hover:bg-[#238636]/20 transition-colors cursor-pointer text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
            CLEAN: GitHub.com
          </button>
        </div>
      </div>
    </div>
  );
}
