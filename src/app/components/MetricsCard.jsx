'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, TrendingUp, PlusCircle } from 'lucide-react';

export default function MetricsCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-xl"
        >
            <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" /> Core Backend Metrics
                </h3>
                <p className="text-xs text-slate-400 mt-1">Live Spring Boot Backend Controls</p>
            </div>

            <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-inner">
                    <div>
                        <span className="text-slate-400 block font-semibold">Concurrency Lock</span>
                        <span className="text-emerald-400 font-mono font-bold">ReentrantLock Active</span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-inner">
                    <div>
                        <span className="text-slate-400 block font-semibold">Idempotency Layer</span>
                        <span className="text-amber-400 font-mono font-bold">UUID Filter Ready</span>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-inner">
                    <div>
                        <span className="text-slate-400 block font-semibold">Database Isolation</span>
                        <span className="text-indigo-400 font-mono font-bold">TransactionTemplate</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>
            </div>

            <Link
                href="/account/create"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25"
            >
                <PlusCircle className="w-4 h-4" /> Open Additional Account
            </Link>
        </motion.div>
    );
}