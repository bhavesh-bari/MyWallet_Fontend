'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, RefreshCw, X } from 'lucide-react';

export default function PinModal({
    isOpen,
    onClose,
    pin,
    setPin,
    pinError,
    onSubmit,
    loading,
    selectedAccount,
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-2 mb-6">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Authorize Balance Inquiry</h3>
                            <p className="text-xs text-slate-400">
                                Enter 4-digit PIN for account{' '}
                                <span className="font-mono font-bold text-indigo-300">{selectedAccount}</span>.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2, 3].map((index) => (
                                    <div
                                        key={index}
                                        className={`w-11 h-13 border-2 rounded-2xl flex items-center justify-center text-lg font-bold transition-all ${pin[index]
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-md shadow-indigo-500/20'
                                                : 'border-slate-800 bg-slate-950 text-slate-600'
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
                                className="w-full text-center tracking-widest text-lg font-mono py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                autoFocus
                            />

                            {pinError && (
                                <p className="text-xs text-rose-400 font-medium text-center">{pinError}</p>
                            )}

                            <button
                                onClick={onSubmit}
                                disabled={pin.length !== 4 || loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-2xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying PIN...
                                    </>
                                ) : (
                                    'Confirm & Reveal Balance'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}