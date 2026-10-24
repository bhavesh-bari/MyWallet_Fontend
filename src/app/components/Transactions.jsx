'use client';

import React, { useEffect, useState } from 'react';
import {
    History,
    ShieldCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import AccountSelector from './AccountSelector';
import { getAuthHeaders, getAuthenticatedUserId } from '../lib/auth';

export default function TransactionHistory() {
    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [accountsError, setAccountsError] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [page, setPage] = useState(0);
    const [historyPage, setHistoryPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchAccounts = async () => {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                setAccountsError('Unable to identify your user account. Please sign in again.');
                setAccountsLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${process.env.BACKEND_URI}/account/allaccounts?id=${encodeURIComponent(userId)}`,
                    {
                        method: 'GET',
                        headers: getAuthHeaders(),
                        signal: controller.signal,
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to load your accounts.');
                }
                if (!Array.isArray(data)) {
                    throw new Error('The accounts response was not in the expected format.');
                }

                const fetchedAccounts = data.map((account) => ({
                    accountNumber: account.accountNumber,
                    type: account.accountType,
                }));

                setAccounts(fetchedAccounts);
                setSelectedAccount((currentAccount) =>
                    fetchedAccounts.some((account) => account.accountNumber === currentAccount)
                        ? currentAccount
                        : fetchedAccounts[0]?.accountNumber || ''
                );
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setAccountsError(err.message || 'Failed to load your accounts.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setAccountsLoading(false);
                }
            }
        };

        fetchAccounts();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }

        const controller = new AbortController();
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            setHistoryPage(null);

            try {
                const params = new URLSearchParams({
                    account: selectedAccount,
                    page: String(page),
                    size: '10',
                });
                const response = await fetch(
                    `${process.env.BACKEND_URI}/transaction/history?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: getAuthHeaders(),
                        signal: controller.signal,
                    }
                );
                const responseText = await response.text();
                let data = null;

                if (responseText) {
                    try {
                        data = JSON.parse(responseText);
                    } catch {
                        if (response.ok) {
                            throw new Error('The transaction history response was not valid JSON.');
                        }
                    }
                }

                if (!response.ok) {
                    throw new Error(data?.message || `Failed to fetch transaction history (${response.status}).`);
                }
                if (!Array.isArray(data?.content) || !Number.isInteger(data.totalPages)) {
                    throw new Error('The transaction history response was not in the expected format.');
                }

                setHistoryPage(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Failed to fetch transaction history.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchHistory();
        return () => controller.abort();
    }, [page, selectedAccount]);

    const handleSelectAccount = (accountNumber) => {
        setSelectedAccount(accountNumber);
        setPage(0);
    };

    const transactions = historyPage?.content || [];
    const totalPages = historyPage?.totalPages || 0;

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'DEPOSIT':
                return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
            case 'WITHDRAWAL':
            case 'WITHDRAW':
                return <ArrowUpRight className="w-4 h-4 text-amber-600" />;
            case 'TRANSFER':
            default:
                return <ArrowRightLeft className="w-4 h-4 text-indigo-600" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'SUCCESS':
            case 'SUCCESED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> {status}
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-[11px] font-semibold">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                );
            case 'FAILED':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full text-[11px] font-semibold">
                        <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                );
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                        <ShieldCheck className="w-4 h-4" /> LEDGER AUDIT TRAIL
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Review past deposits, withdrawals, and wire transfers securely.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Select account
                </label>
                <AccountSelector
                    accounts={accounts}
                    loading={accountsLoading}
                    error={accountsError}
                    selectedAccount={selectedAccount}
                    onSelectAccount={handleSelectAccount}
                />
            </div>

            {/* Transactions Table View */}
            {selectedAccount && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-600" /> Results for Account: <span className="font-mono">{selectedAccount}</span>
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">
                            {historyPage?.totalElements ?? 0} records found
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-800">
                                    <th className="py-3.5 px-6">Type</th>
                                    <th className="py-3.5 px-6">Reference</th>
                                    <th className="py-3.5 px-6">Source/Account</th>
                                    <th className="py-3.5 px-6">Timestamp</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 text-xs font-medium text-slate-300">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            <span className="inline-flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin" /> Loading transaction history...
                                            </span>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" role="alert" className="py-8 text-center text-rose-600">
                                            {error}
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            No transaction history available for this account.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                                            <td className="py-4 px-6 flex items-center gap-2 font-bold text-slate-100">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                {tx.type}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-slate-300">{tx.transactionRef}</td>
                                            <td className="py-4 px-6 font-mono text-slate-300">{tx.source}</td>
                                            <td className="py-4 px-6 text-slate-400">
                                                {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '---'}
                                            </td>
                                            <td className="py-4 px-6">{getStatusBadge(tx.status)}</td>
                                            <td className={`py-4 px-6 text-right font-bold text-sm ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                                {tx.type === 'DEPOSIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {historyPage && totalPages > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
                            <span className="text-xs text-slate-400">
                                Page {historyPage.number + 1} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                                    disabled={loading || historyPage.first}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={loading || historyPage.last}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
