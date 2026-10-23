'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAuthSession } from '../lib/auth';
import {
    ShieldCheck,
    Mail,
    Lock,
    User as UserIcon,
    Phone,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    // --- Handle Authentication Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }
        if (!isLogin) {
            if (!formData.name) {
                setError('Name is required for registration.');
                return;
            }
            if (!formData.phone || !/^\+?[1-9]\d{7,14}$/.test(formData.phone.trim())) {
                setError('Enter a valid phone number (e.g. +919876543210).');
                return;
            }
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long.');
                return;
            }
        }

        setLoading(true);

        const endpoint = isLogin
            ? `${process.env.BACKEND_URI}/api/auth/login`
            : `${process.env.BACKEND_URI}/api/auth/register`;

        const payload = isLogin
            ? { email: formData.email.trim(), password: formData.password }
            : { name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim(), password: formData.password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || (isLogin ? 'Login failed. Check your credentials.' : 'Registration failed.'));
            }

            if (isLogin) {
                // AuthResponse matching: { accessToken, tokenType, expiresIn, user }
                saveAuthSession(data);

                const requestedPath = new URLSearchParams(window.location.search).get('next');
                const destination = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/';

                setSuccessMsg('Login successful! Redirecting to dashboard...');
                setTimeout(() => {
                    router.replace(destination);
                }, 1000);
            } else {
                // UserResponse returned on register
                setSuccessMsg('Registration successful! Please sign in.');
                setIsLogin(true);
                setFormData((prev) => ({ ...prev, password: '' }));
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl"
            >
                {/* Header Logo & Title */}
                <div className="text-center space-y-2 mb-6">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-xs text-slate-400">
                        {isLogin ? 'Sign in to access your secure banking portal' : 'Register for secure ledger management & instant transfers'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${isLogin ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${!isLogin ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Feedback Banners */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs font-medium"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <div>{error}</div>
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-medium"
                        >
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <div>{successMsg}</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {!isLogin && (
                        <>
                            {/* Full Name */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                        <UserIcon className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        maxLength={100}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Phone className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+919876543210"
                                        maxLength={16}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="name@example.com"
                                maxLength={254}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                maxLength={72}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                                required
                            />
                        </div>
                        {!isLogin && (
                            <p className="text-[11px] text-slate-500 mt-1">Must be 8–72 characters.</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm mt-2"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                            </>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
