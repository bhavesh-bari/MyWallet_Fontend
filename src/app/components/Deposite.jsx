'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  PlusCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../lib/auth';

export default function DepositMoney() {

  const [formData, setFormData] = useState({
    acc: 'ACC109',
    amount: '',
  });

  const [pin, setPin] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  // --- Generate Idempotency Key on Mount ---
  useEffect(() => {
    generateNewIdempotencyKey();
  }, []);

  const generateNewIdempotencyKey = () => {
    const newKey = typeof window !== 'undefined' && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `deposit-idempotency-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(newKey);
  };

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // Pre-submit validation before asking for PIN
  const handleInitiateDeposit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.acc) {
      setError('Please provide a target account number.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid deposit amount greater than zero.');
      return;
    }

    // Open PIN verification modal
    setPin('');
    setIsPinModalOpen(true);
  };

  // --- API Call Execution ---
  const handleExecuteDeposit = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsPinModalOpen(false);

    // Exact DTO matching Spring Boot record DepositRequest(acc, amount, pin)
    const payload = {
      acc: formData.acc.trim(),
      amount: parseFloat(formData.amount),
      pin: pin.trim()
    };

    try {
      const res = await fetch(`${process.env.BACKEND_URI}/account/deposite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Deposit failed. Please check details and try again.');
      }

      setResponse(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during deposit.');
    } finally {
      setLoading(false);
      setPin('');
    }
  };

  // Reset Form for Next Transaction
  const handleReset = () => {
    setFormData({ acc: 'ACC109', amount: '' });
    setResponse(null);
    setError(null);
    setPin('');
    generateNewIdempotencyKey();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
            <ShieldCheck className="w-4 h-4" /> SECURE FUND DEPOSIT
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Account Deposit Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Top up your account balances securely with real-time idempotency checks.
          </p>
        </div>

        {/* Technical Header Indicator: Displays Active Idempotency Key */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center gap-3 text-xs">
          <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-slate-400 block font-mono">Idempotency-Key:</span>
            <span className="text-slate-200 font-mono text-[11px] truncate max-w-[180px] block" title={idempotencyKey}>
              {idempotencyKey || 'Generating...'}
            </span>
          </div>
          <button
            onClick={generateNewIdempotencyKey}
            className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
            title="Generate New Idempotency Key"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Form / Success View (Spans 2 columns) */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          {!response ? (
            <form onSubmit={handleInitiateDeposit} className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" /> Deposit Details
              </h2>

              {/* Target Account Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Account Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="acc"
                    value={formData.acc}
                    onChange={handleInputChange}
                    placeholder="e.g. ACC109"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" /> Review & Enter PIN
              </button>
            </form>
          ) : (
            /* Success Response State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-2"
            >
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-8 h-8 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{response.message}</h3>
                  <p className="text-xs text-slate-500">{new Date(response.date).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Transaction Reference</span>
                  <span className="font-mono font-bold text-slate-800">{response.transactionRef}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Target Account</span>
                  <span className="font-mono text-slate-800">{response.senderAccount}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-slate-700">Amount Credited</span>
                  <span className="text-emerald-600">₹{parseFloat(response.amount).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Make Another Deposit
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Information Panel */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 text-xs text-slate-600">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700" /> Security & Features
          </h3>
          <ul className="space-y-2.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-slate-800">Instant Processing:</strong> Funds are credited immediately upon PIN verification.
            </li>
            <li>
              <strong className="text-slate-800">Secure PIN Validation:</strong> Authenticated securely via your encrypted account credentials.
            </li>
            <li>
              <strong className="text-slate-800">Idempotent Requests:</strong> Built-in safeguards protect against duplicate ledger entries on network retries.
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
                <h3 className="text-lg font-bold text-slate-900">Authorize Deposit</h3>
                <p className="text-xs text-slate-500">
                  Depositing <span className="font-bold text-slate-800">₹{formData.amount}</span> to account{' '}
                  <span className="font-mono text-slate-800">{formData.acc}</span>.
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
                  onClick={handleExecuteDeposit}
                  disabled={pin.length !== 4 || loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    'Confirm & Deposit'
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
