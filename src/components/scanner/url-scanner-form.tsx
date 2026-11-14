'use client';

import React, { useState } from 'react';
import { ShieldAlert, UploadCloud, ArrowRight, Globe } from 'lucide-react';
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
      setError('Please enter a target URL to scan.');
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
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <Tabs defaultValue="url" className="w-full">
        <div className="flex justify-between items-center mb-2 px-1">
          <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 rounded-lg h-9">
            <TabsTrigger
              value="url"
              className="text-xs font-sans font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-[#1e293b] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 shadow-xs cursor-pointer"
            >
              Enter a URL
            </TabsTrigger>
            <TabsTrigger
              value="qr"
              className="text-xs font-sans font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-[#1e293b] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 shadow-xs cursor-pointer"
            >
              QR upload (optional)
            </TabsTrigger>
          </TabsList>

          <span className="text-xs font-sans font-medium text-slate-700 dark:text-slate-300 hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            Protocol: HTTP / HTTPS
          </span>
        </div>

        {/* TAB 1: URL INPUT */}
        <TabsContent value="url" className="mt-0">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex flex-col sm:flex-row items-stretch border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1e293b] shadow-sm focus-within:border-indigo-600 dark:focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-sky-950 rounded-xl overflow-hidden transition-all">
              <div className="relative flex-1 flex items-center px-4 py-3">
                <Globe className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="https://example-portal-auth.com/login"
                  value={url}
                  autoComplete="off"
                  data-lpignore="true"
                  data-nordpass-ignore="true"
                  data-1p-ignore="true"
                  spellCheck={false}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-sm font-mono"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Scanning...' : 'Scan URL'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-sans mt-2 ml-1 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" /> {error}
              </p>
            )}
          </form>
        </TabsContent>

        {/* TAB 2: QR CODE UPLOADER */}
        <TabsContent value="qr" className="mt-0">
          <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-center space-y-3 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-sky-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                QR Code Analysis (Quishing defense)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Decodes physical stickers and deceptive PDF authentication prompts.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handleSelectSample('http://paypa1-security-verification.top/login.php', 'malicious')
              }
              className="text-xs font-sans font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Load sample QR target
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {/* QUICK PRESET CHIPS */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-sans text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Quick samples:</span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleSelectSample('http://testsafebrowsing.appspot.com/s/phishing.html', 'malicious')
            }
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer text-xs font-medium"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Phishing sample (10/93 VT)
          </button>

          <button
            type="button"
            onClick={() =>
              handleSelectSample('http://paypa1-security-verification.top/login.php', 'malicious')
            }
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer text-xs font-medium"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            PayPal spoof
          </button>

          <button
            type="button"
            onClick={() =>
              handleSelectSample('https://verification-test-domain.xyz', 'suspicious')
            }
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors cursor-pointer text-xs font-medium"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Test domain (suspicious)
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('https://youtube.com', 'safe')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer text-xs font-medium"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            YouTube (safe)
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('https://github.com/explore', 'safe')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer text-xs font-medium"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            GitHub (safe)
          </button>
        </div>
      </div>
    </div>
  );
}
