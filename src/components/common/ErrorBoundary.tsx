/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { School, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MIN 1 Paser CBT ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('min1paser_cbt_db');
      sessionStorage.clear();
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07101e] flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <School className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              MIN 1 Paser CBT System
            </h2>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sistem mendeteksi kendala inisialisasi antarmuka. Anda dapat memuat ulang sistem sekarang.</span>
            </div>
            {this.state.error && (
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-rose-300 text-left font-mono overflow-x-auto max-h-32 custom-scrollbar">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Sistem CBT</span>
            </button>
            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Madrasah Digital Assessment System</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
