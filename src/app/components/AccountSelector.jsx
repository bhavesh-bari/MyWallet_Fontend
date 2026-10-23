'use client';

import React from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';

export default function AccountSelector({
    accounts,
    loading,
    error,
    selectedAccount,
    onSelectAccount,
}) {
    if (loading) {
        return (
            <span className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading accounts...
            </span>
        );
    }

    if (error) {
        return (
            <span role="alert" className="px-4 py-2.5 text-xs text-rose-400">
                {error}
            </span>
        );
    }

    if (accounts.length === 0) {
        return (
            <span className="px-4 py-2.5 text-xs text-slate-400">
                No accounts found. Open an account to get started.
            </span>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            {accounts.map((acc) => (
                <button
                    key={acc.accountNumber}
                    onClick={() => onSelectAccount(acc.accountNumber)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${selectedAccount === acc.accountNumber
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                >
                    <CreditCard className="w-3.5 h-3.5" />
                    {acc.accountNumber} ({acc.type})
                </button>
            ))}
        </div>
    );
}