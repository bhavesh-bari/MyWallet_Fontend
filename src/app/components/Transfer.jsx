'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../lib/auth';

export default function TransferMoney() {

  const [formData, setFormData] = useState({
    sender: '',
    reciver: '',
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
      : `idempotency-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(newKey);
  };

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // Pre-submit validation before asking for PIN
  const handleInitiateTransfer = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.sender || !formData.reciver) {
      setError('Please provide both sender and receiver account numbers.');
      return;
    }
    if (formData.sender.trim() === formData.reciver.trim()) {
      setError('Sender and receiver accounts cannot be the same.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid transfer amount greater than zero.');
      return;
    }

    // Open PIN verification modal
    setPin('');
    setIsPinModalOpen(true);
  };

  // --- API Call Execution ---
  const handleExecuteTransfer = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsPinModalOpen(false);

    // Exact DTO matching Spring Boot record TransferRequest(sender, amount, reciver, pin)
    const payload = {
      sender: formData.sender.trim(),
      amount: parseFloat(formData.amount),
      reciver: formData.reciver.trim(),
      pin: pin.trim()
    };

    try {
      const res = await fetch(`${process.env.BACKEND_URI}/account/transfer`, {
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
        throw new Error(data.message || 'Transfer failed. Please check details and try again.');
      }

      setResponse(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during transfer.');
    } finally {
      setLoading(false);
      setPin('');
    }
  };

  // Reset Form for Next Transaction
  const handleReset = () => {
    setFormData({ sender: 'ACC109', reciver: '', amount: '' });
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
            <ShieldCheck className="w-4 h-4" /> SECURE WIRE TRANSFER
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Fund Transfer Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Execute real-time transfers with instant concurrency lock & idempotency guarantee.
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
        <div className="md:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          {!response ? (
            <form onSubmit={handleInitiateTransfer} className="space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Transaction Details
              </h2>

              {/* Sender Account */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Sender Account
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="sender"
                    value={formData.sender}
                    onChange={handleInputChange}
                    placeholder="e.g. ACC109"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Receiver Account */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Receiver Account Number
                </label>
                <input
                  type="text"
                  name="reciver"
                  value={formData.reciver}
                  onChange={handleInputChange}
                  placeholder="e.g. ACC412"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 outline-none transition"
                  required
                />
              </div>

              {/* Transfer Amount */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Amount (₹)
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
                    className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-semibold text-lg focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Inline Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs font-medium"
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
                <Send className="w-4 h-4" /> Review & Enter PIN
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
                  <p className="text-xs text-slate-400">{new Date(response.date).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Transaction Reference</span>
                  <span className="font-mono font-bold text-slate-200">{response.transactionRef}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Sender Account</span>
                  <span className="font-mono text-slate-200">{response.senderAccount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Receiver Account</span>
                  <span className="font-mono text-slate-200">{response.receiverAccount}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-slate-300">Amount Transferred</span>
                  <span className="text-emerald-400">₹{parseFloat(response.amount).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Make Another Transfer
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Information Panel */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4 text-xs text-slate-400">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-300" /> Backend Protections
          </h3>
          <ul className="space-y-2.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-slate-200">ReentrantLocking:</strong> Orders account locks deterministically based on account numbers to avoid deadlocks.
            </li>
            <li>
              <strong className="text-slate-200">Atomic Transactions:</strong> Uses Spring <code className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">TransactionTemplate</code> for money movements.
            </li>
            <li>
              <strong className="text-slate-200">BCrypt PIN Verification:</strong> Your 4-digit PIN is verified securely before balances change.
            </li>
            <li>
              <strong className="text-slate-200">Idempotent Requests:</strong> Retrying with the same key returns the existing transaction response without double-debiting.
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
              className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-slate-100"
            >
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-300 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Authorize Transfer</h3>
                <p className="text-xs text-slate-400">
                  Transferring                   <span className="font-bold text-slate-100">₹{formData.amount}</span> from{' '}
                  <span className="font-mono text-slate-100">{formData.sender}</span> to{' '}
                  <span className="font-mono text-slate-100">{formData.reciver}</span>.
                </p>
              </div>

              {/* PIN Inputs / Display */}
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-10 h-12 border-2 rounded-xl flex items-center justify-center text-lg font-bold transition ${pin[index]
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                        : 'border-slate-700 bg-slate-950'
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
                  className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-950 text-slate-100 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />

                <button
                  onClick={handleExecuteTransfer}
                  disabled={pin.length !== 4 || loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
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
