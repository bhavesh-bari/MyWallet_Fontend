'use client';

import React, { useState } from 'react';
import {
    Wallet,
    ShieldCheck,
    Lock,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Eye,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../lib/auth';

export default function CheckBalance() {
    const [account, setAccount] = useState('ACC109');
    const [pin, setPin] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [balanceResult, setBalanceResult] = useState(null);

    // --- Input Handlers ---
    const handleInitiateBalanceCheck = (e) => {
        e.preventDefault();
        setError(null);

        if (!account.trim()) {
            setError('Please provide an account number.');
            return;
        }

        // Open PIN verification modal
        setPin('');
        setIsPinModalOpen(true);
    };

    // --- API Call Execution ---
    const handleExecuteBalanceCheck = async (e) => {
        if (e) e.preventDefault();
        if (pin.length !== 4) {
            setError('PIN must be exactly 4 digits.');
            return;
        }

        setLoading(true);
        setError(null);
        setIsPinModalOpen(false);

        // DTO matching Balancerequest(String account, String pin)
        const payload = {
            account: account.trim(),
            pin: pin.trim()
        };

        try {
            const res = await fetch(`${process.env.BACKEND_URI}/account/balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch balance. Please check your account and PIN.');
            }

            setBalanceResult({
                account: account.trim(),
                balance: data, // BigDecimal response
                date: new Date()
            });
        } catch (err) {
            setError(err.message || 'An unexpected error occurred while fetching balance.');
        } finally {
            setLoading(false);
            setPin('');
        }
    };

    const handleReset = () => {
        setAccount('ACC109');
        setBalanceResult(null);
        setError(null);
        setPin('');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                        <ShieldCheck className="w-4 h-4" /> SECURE BALANCE INQUIRY
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Account Balance Portal</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Verify real-time account balances securely with encrypted PIN validation.
                    </p>
                </div>
            </div>

            {/* Main Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Form / Result View (Spans 2 columns) */}
                <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    {!balanceResult ? (
                        <form onSubmit={handleInitiateBalanceCheck} className="space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-600" /> Inquiry Details
                            </h2>

                            {/* Account Number */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Account Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={account}
                                        onChange={(e) => {
                                            setAccount(e.target.value);
                                            if (error) setError(null);
                                        }}
                                        placeholder="e.g. ACC109"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Inline Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-medium"
                                >
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <div>{error}</div>
                                </motion.div>
                            )}

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                <Eye className="w-4 h-4" /> Enter PIN to Check Balance
                            </button>
                        </form>
                    ) : (
                        /* Balance Result State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 py-2"
                        >
                            <div className="flex items-center gap-3 text-indigo-600">
                                <CheckCircle2 className="w-8 h-8 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Balance Retrieved Successfully</h3>
                                    <p className="text-xs text-slate-500">{new Date(balanceResult.date).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
                                <div className="flex justify-between border-b border-slate-200/80 pb-3">
                                    <span className="text-slate-500">Account Number</span>
                                    <span className="font-mono font-bold text-slate-800">{balanceResult.account}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-slate-600 text-sm font-medium">Available Balance</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        ₹{parseFloat(balanceResult.balance).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleReset}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Check Another Balance
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right Information Panel */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 text-xs text-slate-600">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-700" /> Security Notice
                    </h3>
                    <ul className="space-y-2.5 list-disc pl-4 leading-relaxed">
                        <li>
                            <strong className="text-slate-800">Encrypted Validation:</strong> Your account PIN is securely hashed and verified against our database.
                        </li>
                        <li>
                            <strong className="text-slate-800">Zero-Retention:</strong> Balance details are securely transmitted and never cached on public browsers.
                        </li>
                    </ul>
                </div>
            </div>

            {/* --- PIN Verification Modal --- */}
            <AnimatePresence>
                {isPinModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsPinModalOpen(false)}
                                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center space-y-2 mb-6">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Authorize Inquiry</h3>
                                <p className="text-xs text-slate-500">
                                    Enter your 4-digit PIN for account <span className="font-mono text-slate-800">{account}</span>.
                                </p>
                            </div>

                            {/* PIN Inputs / Display */}
                            <div className="space-y-4">
                                <div className="flex justify-center gap-3">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div
                                            key={index}
                                            className={`w-10 h-12 border-2 rounded-xl flex items-center justify-center text-lg font-bold transition ${pin[index]
                                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                                                : 'border-slate-200 bg-slate-50'
                                                }`}
                                        >
                                            {pin[index] ? '•' : ''}
                                        </div>
                                    ))}
                                </div>

                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 4-digit PIN"
                                    className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    autoFocus
                                />

                                <button
                                    onClick={handleExecuteBalanceCheck}
                                    disabled={pin.length !== 4 || loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-600/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                                        </>
                                    ) : (
                                        'Confirm & View Balance'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
