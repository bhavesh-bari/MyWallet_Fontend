'use client';

import React, { useState } from 'react';
import {
    CreditCard,
    ShieldCheck,
    Lock,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    PlusCircle,
    Wallet,
    Building,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders, getAuthenticatedUserId } from '../lib/auth';

export default function CreateAccount() {
    const [formData, setFormData] = useState({
        accountType: 'SAVINGS',
        balance: '',
        pin: '',
        confirmPin: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSelectAccountType = (type) => {
        setFormData((prev) => ({ ...prev, accountType: type }));
        if (error) setError(null);
    };

    // --- API Call Execution ---
    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setError(null);

        const balance = Number(formData.balance);
        if (!formData.balance || !Number.isFinite(balance) || balance < 0) {
            setError('Please enter a valid initial deposit balance.');
            return;
        }
        if (!/^\d{4}$/.test(formData.pin)) {
            setError('PIN must be exactly 4 digits.');
            return;
        }
        if (formData.pin !== formData.confirmPin) {
            setError('PIN and confirmation PIN do not match.');
            return;
        }

        const userId = getAuthenticatedUserId();
        if (!userId) {
            setError('Unable to identify your user account. Please sign in again.');
            return;
        }

        setLoading(true);

        // Exact DTO matching Spring Boot record CreateAccountRequest(balance, accountType, userId, pin)
        const payload = {
            balance,
            accountType: formData.accountType,
            userId,
            pin: formData.pin.trim()
        };

        try {
            const res = await fetch(`${process.env.BACKEND_URI}/account/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create account. Please verify your details.');
            }

            // AccountResponse matching: { accountType, accountNumber }
            setResponse({
                ...data,
                message: 'Account successfully registered and activated!'
            });
        } catch (err) {
            setError(err.message || 'An unexpected error occurred during account creation.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            accountType: 'SAVINGS',
            balance: '',
            pin: '',
            confirmPin: ''
        });
        setResponse(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
                <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                        <ShieldCheck className="w-4 h-4" /> LEDGER PROVISIONING
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Open New Bank Account</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Provision new savings or current accounts with secure PIN hashes and initial deposits.
                    </p>
                </div>
            </div>

            {/* Main Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Form / Success View (Spans 2 columns) */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                    {!response ? (
                        <form onSubmit={handleCreateAccount} className="space-y-5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-400" /> Account Parameters
                            </h2>

                            {/* Account Type Selector Cards */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Select Account Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { type: 'SAVINGS', label: 'Savings Account', desc: 'Standard liquidity & interest' },
                                        { type: 'CURRENT', label: 'Current Account', desc: 'High volume transactions' }
                                    ].map((item) => (
                                        <button
                                            key={item.type}
                                            type="button"
                                            onClick={() => handleSelectAccountType(item.type)}
                                            className={`p-4 rounded-2xl border text-left transition-all ${formData.accountType === item.type
                                                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                                }`}
                                        >
                                            <Building className={`w-5 h-5 mb-2 ${formData.accountType === item.type ? 'text-indigo-400' : 'text-slate-500'}`} />
                                            <div className="font-bold text-xs text-white">{item.label}</div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Initial Balance */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Initial Deposit Amount (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="balance"
                                        value={formData.balance}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PIN Setup */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Set 4-Digit Account PIN
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Lock className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        name="pin"
                                        value={formData.pin}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                                        placeholder="••••"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white tracking-widest font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Required to authorize future deposits, withdrawals, and transfers.</p>
                            </div>

                            {/* Confirm PIN */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Confirm 4-Digit Account PIN
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Lock className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        name="confirmPin"
                                        value={formData.confirmPin}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, '') }))}
                                        placeholder="••••"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white tracking-widest font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Inline Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs font-medium"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <div>{error}</div>
                                </motion.div>
                            )}

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Account...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4" /> Create Account <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Success Response State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 py-2"
                        >
                            <div className="flex items-center gap-3 text-emerald-400">
                                <CheckCircle2 className="w-8 h-8 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">{response.message}</h3>
                                    <p className="text-xs text-slate-400">Your account is ready for transactions.</p>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                                <div className="flex justify-between border-b border-slate-800/80 pb-3">
                                    <span className="text-slate-400">Assigned Account Number</span>
                                    <span className="font-mono font-bold text-indigo-400 text-sm">{response.accountNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/80 pb-3">
                                    <span className="text-slate-400">Account Classification</span>
                                    <span className="font-mono text-slate-200 font-semibold">{response.accountType}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-400">Status</span>
                                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                                </div>
                            </div>

                            <button
                                onClick={handleReset}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2 border border-slate-700"
                            >
                                <RefreshCw className="w-4 h-4" /> Open Another Account
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right Information Panel */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-4 text-xs text-slate-400 shadow-xl">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-indigo-400" /> Account Security
                    </h3>
                    <ul className="space-y-2.5 list-disc pl-4 leading-relaxed">
                        <li>
                            <strong className="text-slate-200">Unique Identifier:</strong> Each account receives a cryptographically safe alphanumeric number.
                        </li>
                        <li>
                            <strong className="text-slate-200">BCrypt PIN Encryption:</strong> Your 4-digit PIN is securely hashed using BCrypt before persistence.
                        </li>
                        <li>
                            <strong className="text-slate-200">Instant Activation:</strong> Accounts are immediately linked to your user profile and ready for deposits.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
