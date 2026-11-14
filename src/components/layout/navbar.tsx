'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Terminal, Database, Sun, Moon, LogIn, LogOut, User, Sparkles, AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { apiClient } from '@/lib/visitor';
import { AuthModal } from '../auth/auth-modal';

interface UserSession {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
}

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [scansUsed, setScansUsed] = useState<number>(0);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const fetchSession = async () => {
    try {
      const res = await apiClient.get('/api/auth/me', { validateStatus: () => true });
      if (res.status === 200 && res.data) {
        if (res.data.authenticated && res.data.user) {
          setUser(res.data.user);
          setIsUnlimited(true);
        } else {
          setUser(null);
          setIsUnlimited(false);
          setScansUsed(res.data.scansUsed || 0);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSession();

    // Listen for custom trigger to open auth modal (e.g. from page.tsx when limit reached)
    const handleOpenAuth = (e: any) => {
      setAuthModalTab(e?.detail?.tab || 'signup');
      setIsAuthModalOpen(true);
    };

    const handleRefreshQuota = () => {
      fetchSession();
    };

    window.addEventListener('phishlens:open-auth', handleOpenAuth);
    window.addEventListener('phishlens:refresh-quota', handleRefreshQuota);

    return () => {
      window.removeEventListener('phishlens:open-auth', handleOpenAuth);
      window.removeEventListener('phishlens:refresh-quota', handleRefreshQuota);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-sky-400 group-hover:bg-indigo-100 dark:group-hover:bg-slate-700 transition-colors">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Phish<span className="text-indigo-600 dark:text-sky-400">Lens</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 font-sans">
            <Link
              href="/"
              className="hover:text-indigo-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-sky-400" />
              <span>Scanner</span>
            </Link>
            <Link
              href="/history"
              className="hover:text-indigo-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5"
            >
              <Database className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-sky-400" />
              <span>Incidents</span>
            </Link>
          </nav>

          {/* Right Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Scan Quota Badge */}
            {mounted && (
              isUnlimited ? (
                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 text-xs font-sans text-indigo-700 dark:text-sky-300 font-medium">
                  <Sparkles className="h-3 w-3 text-indigo-600 dark:text-sky-400" />
                  <span>Unlimited</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-sans font-medium transition-colors cursor-pointer ${
                    scansUsed >= 10
                      ? 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {scansUsed >= 10 ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                      <span>Free Limit Reached (10/10)</span>
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>Free Scans: {scansUsed} / 10</span>
                    </>
                  )}
                </button>
              )
            )}

            {/* User Session Profile or Auth Button */}
            {mounted && (
              user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-sans font-medium text-slate-700 dark:text-slate-200">
                    <User className="h-3.5 w-3.5 text-indigo-600 dark:text-sky-400" />
                    <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Log Out"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 text-xs font-medium font-sans transition-colors cursor-pointer shadow-xs"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
              )
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {mounted ? (
                resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )
              ) : (
                <span className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onSuccess={fetchSession}
      />
    </>
  );
}
