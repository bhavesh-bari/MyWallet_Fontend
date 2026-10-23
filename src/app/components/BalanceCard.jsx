'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Wallet,
    Eye,
    EyeOff,
    Lock,
    RefreshCw,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    History,
} from 'lucide-react';

export default function BalanceCard({
    activeAccountData,
    activeBalanceState,
    selectedAccount,
    onToggleBalance,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-slate-800/80 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between"
        >
            <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shadow-inner">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                            {activeAccountData.type} ACCOUNT
                        </span>
                        <span className="text-xs font-mono text-indigo-300 font-semibold">
                            {activeAccountData.accountNumber}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onToggleBalance}
                    disabled={activeBalanceState.loading || !selectedAccount}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/80 text-xs font-semibold transition shadow-sm disabled:opacity-50"
                    title={activeBalanceState.visible ? 'Hide Balance' : 'Secure Balance Inquiry'}
                >
                    {activeBalanceState.loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : activeBalanceState.visible ? (
                        <>
                            <EyeOff className="w-4 h-4 text-slate-400" /> Hide Balance
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4 text-indigo-400" /> View Balance (PIN)
                        </>
                    )}
                </button>
            </div>

            {/* Amount */}
            <div className="my-8 z-10">
                <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                    Available Liquidity <Lock className="w-3 h-3 text-indigo-400" />
                </p>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                    {activeBalanceState.visible && activeBalanceState.amount !== null ? (
                        <>
                            <span className="text-indigo-400 mr-1">{activeAccountData.currency}</span>
                            {Number(activeBalanceState.amount).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                            })}
                        </>
                    ) : (
                        <span className="text-slate-500 tracking-widest">••••••••••</span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10 pt-5 border-t border-slate-800/80">
                <Link
                    href="/deposit"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-bold transition shadow-sm"
                >
                    <ArrowDownLeft className="w-4 h-4" /> Deposit
                </Link>
                <Link
                    href="/withdraw"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-bold transition shadow-sm"
                >
                    <ArrowUpRight className="w-4 h-4" /> Withdraw
                </Link>
                <Link
                    href="/transfer"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-2xl text-xs font-bold transition shadow-sm"
                >
                    <ArrowRightLeft className="w-4 h-4" /> Transfer
                </Link>
                <Link
                    href="/history"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-2xl text-xs font-bold transition shadow-sm"
                >
                    <History className="w-4 h-4" /> History
                </Link>
            </div>
        </motion.div>
    );
}