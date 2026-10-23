'use client';

import React from 'react';
import Link from 'next/link';
import { History, CheckCircle2, XCircle } from 'lucide-react';

export default function RecentTransactionsTable({ transactions, loading, error }) {
    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-400" /> Recent Transactions
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Real-time audit log of deposits, withdrawals, and transfers.
                    </p>
                </div>
                <Link
                    href="/history"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                    View Full History →
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                            <th className="py-3.5 px-4">Timestamp</th>
                            <th className="py-3.5 px-4">Ref Code</th>
                            <th className="py-3.5 px-4">Type</th>
                            <th className="py-3.5 px-4">Account</th>
                            <th className="py-3.5 px-4">Amount</th>
                            <th className="py-3.5 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-400">Loading recent transactions...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="6" role="alert" className="py-8 text-center text-rose-400">{error}</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-400">No recent transactions for this account.</td>
                            </tr>
                        ) : (
                            transactions.map((tx, index) => {
                                const amount = Number(tx.amount);
                                const type = tx.type || tx.transactionType || 'TRANSACTION';
                                const status = tx.status || '';

                                return (
                                    <tr key={tx.id ?? tx.transactionRef ?? index} className="hover:bg-slate-800/40 transition">
                                        <td className="py-4 px-4 text-slate-400">
                                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '---'}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-slate-200">{tx.transactionRef || '---'}</td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${type === 'DEPOSIT'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : type === 'WITHDRAW' || type === 'WITHDRAWAL'
                                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                    }`}
                                            >
                                                {type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">{tx.source || tx.account || '—'}</td>
                                        <td
                                            className={`py-4 px-4 font-bold ${type === 'DEPOSIT' ? 'text-emerald-400' : 'text-slate-200'
                                                }`}
                                        >
                                            {Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : '—'}
                                        </td>
                                        <td className="py-4 px-4">
                                            {status === 'SUCCESS' || status === 'SUCCESED' ? (
                                                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> {status}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                                                    <XCircle className="w-3.5 h-3.5" /> {status || 'UNKNOWN'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}